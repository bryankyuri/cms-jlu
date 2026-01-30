// Base API URL configuration
const API_BASE_URL = process.env.NODE_ENV !== 'production' 
  ? 'http://127.0.0.1:8000/api'
  : 'http://127.0.0.1:8000/api';

// Storage base URL for media files
const STORAGE_BASE_URL = process.env.NODE_ENV !== 'production' 
  ? 'http://127.0.0.1:8000/storage'
  : 'http://127.0.0.1:8000/storage';

// Convert API returned URLs to use correct base URL
const convertApiUrl = (url) => {
  if (!url) return null;
  
  // If it's already using the correct base URL, return as is
  if (url.includes(STORAGE_BASE_URL)) {
    return url;
  }
  
  // Extract the path after '/storage/'
  const storagePathMatch = url.match(/\/storage\/(.+)$/);
  if (storagePathMatch) {
    return `${STORAGE_BASE_URL}/${storagePathMatch[1]}`;
  }
  
  return url;
};

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('cms_auth_token');
};

// Set auth token to localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('cms_auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('cms_auth_token');
  localStorage.removeItem('cms_user');
};

// Set user data to localStorage
export const setUserData = (user) => {
  localStorage.setItem('cms_user', JSON.stringify(user));
};

// Get user data from localStorage
export const getUserData = () => {
  const userData = localStorage.getItem('cms_user');
  return userData ? JSON.parse(userData) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle unauthorized responses (but not for login endpoint)
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Clear invalid token
        removeAuthToken();
        
        // Show notification if toast is available
        if (window.showToast) {
          window.showToast('Session expired. Please log in again.', 'error');
        }
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        
        throw new Error('Unauthorized - Token expired');
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  // Login user
  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }
    
    return response;
  },

  // Logout user
  logout: async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
      window.location.href = '/login';
    }
  },

  // Get current user info
  me: async () => {
    return await apiRequest('/auth/me');
  },

  // Refresh token
  refresh: async () => {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
    });
    
    if (response.success && response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  },

  // Forgot password
  forgotPassword: async (data) => {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reset password
  resetPassword: async (data) => {
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Media API functions
export const mediaAPI = {
  // Get all media files with optional filters
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/media?${queryString}` : '/media';
    
    return await apiRequest(url);
  },

  // Upload new media file (general - routes to specific methods)
  upload: async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata.alt_text) {
      formData.append('alt_text', metadata.alt_text);
    }
    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    return await apiRequest('/media/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it for FormData
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      }
    });
  },

  // Upload multiple images
  uploadImages: async (files, metadata = {}) => {
    const results = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata.alt_text) {
        formData.append('alt_text', metadata.alt_text || file.name);
      }
      if (metadata.description) {
        formData.append('description', metadata.description || `Uploaded ${new Date().toLocaleDateString()}`);
      }

      try {
        const result = await apiRequest('/media/upload-image', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
          }
        });
        results.push({ success: true, data: result, file: file.name });
      } catch (error) {
        results.push({ success: false, error: error.message, file: file.name });
      }
    }
    
    return results;
  },

  // Upload single video with optional poster
  uploadVideo: async (videoFile, posterFile = null, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', videoFile);
    
    if (posterFile) {
      formData.append('poster', posterFile);
    }
    
    if (metadata.alt_text) {
      formData.append('alt_text', metadata.alt_text);
    }
    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    return await apiRequest('/media/upload-video', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      }
    });
  },

  // Update media metadata
  update: async (id, data) => {
    return await apiRequest(`/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update video poster
  updateVideoPoster: async (mediaId, posterFile) => {
    const formData = new FormData();
    formData.append('poster', posterFile);

    return await apiRequest(`/media/${mediaId}/update-poster`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      }
    });
  },

  // Delete media file
  delete: async (id) => {
    return await apiRequest(`/media/${id}`, {
      method: 'DELETE',
    });
  },

  // Get media file URL for serving
  getFileUrl: (filename) => {
    return `${API_BASE_URL}/media/serve/${filename}`;
  },

  // Get direct storage URL (faster for public files)
  getDirectUrl: (path) => {
    // In production, use the storage URL from env
    if (process.env.NODE_ENV !== 'production') {
      return `${STORAGE_BASE_URL}/${path}`;
    }
    // In development, construct from API base URL
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/storage/${path}`;
  }
};

// Works API functions
export const worksAPI = {
  // Get all works with filtering (now always uses POST /works/list)
  getAll: async (params = {}) => {
    // Always use POST request to /works/list for all filtering
    return await apiRequest('/works/list', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Get single work by ID
  get: async (id) => {
    return await apiRequest(`/works/${id}`);
  },

  // Create new work
  create: async (workData) => {
    return await apiRequest('/works', {
      method: 'POST',
      body: JSON.stringify(workData),
    });
  },

  // Update existing work
  update: async (id, workData) => {
    return await apiRequest(`/works/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workData),
    });
  },

  // Save changes to existing work (optimized for incremental updates)
  saveChanges: async (id, workData) => {
    return await apiRequest(`/works/${id}/save-changes`, {
      method: 'PATCH',
      body: JSON.stringify(workData),
    });
  },

  // Delete work
  delete: async (id) => {
    return await apiRequest(`/works/${id}`, {
      method: 'DELETE',
    });
  },

  // Publish work
  publish: async (id) => {
    return await apiRequest(`/works/${id}/publish`, {
      method: 'PATCH',
    });
  },

  // Unpublish work
  unpublish: async (id) => {
    return await apiRequest(`/works/${id}/unpublish`, {
      method: 'PATCH',
    });
  },

  // Save as draft
  saveDraft: async (id, workData) => {
    return await apiRequest(`/works/${id}/draft`, {
      method: 'PATCH',
      body: JSON.stringify(workData),
    });
  },

  // Create work as draft
  createDraft: async (workData) => {
    const draftData = { ...workData, status: 'draft' };
    return await apiRequest('/works', {
      method: 'POST',
      body: JSON.stringify(draftData),
    });
  },

  // Create and publish work
  createAndPublish: async (workData) => {
    const publishData = { ...workData, status: 'published' };
    return await apiRequest('/works', {
      method: 'POST',
      body: JSON.stringify(publishData),
    });
  },

  // Reorder works
  reorder: async (worksData) => {
    return await apiRequest('/works/reorder', {
      method: 'POST',
      body: JSON.stringify(worksData),
    });
  }
};

// Video Banner API
export const videoBannerAPI = {
  // Get all video banners
  getAll: async () => {
    return await apiRequest('/video-banners');
  },

  // Get single video banner by ID
  get: async (id) => {
    return await apiRequest(`/video-banners/${id}`);
  },

  // Create new video banner
  create: async (bannerData) => {
    return await apiRequest('/video-banners', {
      method: 'POST',
      body: JSON.stringify(bannerData),
    });
  },

  // Update existing video banner
  update: async (id, bannerData) => {
    return await apiRequest(`/video-banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bannerData),
    });
  },

  // Delete video banner
  delete: async (id) => {
    return await apiRequest(`/video-banners/${id}`, {
      method: 'DELETE',
    });
  },

  // Reorder video banners
  reorder: async (bannersData) => {
    return await apiRequest('/video-banners/reorder', {
      method: 'POST',
      body: JSON.stringify(bannersData),
    });
  }
};

// Showreel API
export const showreelAPI = {
  // Get all showreels
  getAll: async () => {
    return await apiRequest('/showreels');
  },

  // Get single showreel by ID
  get: async (id) => {
    return await apiRequest(`/showreels/${id}`);
  },

  // Create new showreel
  create: async (showreelData) => {
    return await apiRequest('/showreels', {
      method: 'POST',
      body: JSON.stringify(showreelData),
    });
  },

  // Update existing showreel
  update: async (id, showreelData) => {
    return await apiRequest(`/showreels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(showreelData),
    });
  },

  // Delete showreel
  delete: async (id) => {
    return await apiRequest(`/showreels/${id}`, {
      method: 'DELETE',
    });
  },

  // Reorder showreels
  reorder: async (showreelsData) => {
    return await apiRequest('/showreels/reorder', {
      method: 'POST',
      body: JSON.stringify(showreelsData),
    });
  }
};

// Analytics API functions
export { analyticsApi } from './analytics';

// Legacy functions for backward compatibility
export const fetchData = async (endpoint) => {
  return await apiRequest(endpoint);
};

export const postData = async (endpoint, data) => {
  return await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Contact Submissions API
export const contactSubmissionsApi = {
  // Get all contact submissions with filters, search, sorting, and pagination
  getAll: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams();
      
      // Add all filter parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          searchParams.append(key, params[key]);
        }
      });

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/contact-submissions?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      throw error;
    }
  },

  // Get a specific contact submission
  getById: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/contact-submissions/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching contact submission:', error);
      throw error;
    }
  },

  // Update a contact submission
  update: async (id, data) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/contact-submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating contact submission:', error);
      throw error;
    }
  },

  // Delete a contact submission
  delete: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/contact-submissions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting contact submission:', error);
      throw error;
    }
  },

  // Bulk actions
  bulkAction: async (action, submissionIds, options = {}) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/contact-submissions/bulk-action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action,
          submission_ids: submissionIds,
          ...options
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw error;
    }
  },
};

// FAQ API
export const faqAPI = {
  // Get all FAQs with filters
  getAll: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams();
      
      // Add all filter parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          searchParams.append(key, params[key]);
        }
      });

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faqs?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  },

  // Get single FAQ
  getById: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      throw error;
    }
  },

  // Create new FAQ
  create: async (faqData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faqs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(faqData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      throw error;
    }
  },

  // Update FAQ
  update: async (id, faqData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(faqData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      throw error;
    }
  },

  // Delete FAQ
  delete: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      throw error;
    }
  },

  // Reorder FAQs
  reorder: async (faqsData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faqs/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(faqsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reordering FAQs:', error);
      throw error;
    }
  },
};

// FAQ Groups API
export const faqGroupAPI = {
  // Get all FAQ groups with filters
  getAll: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams();
      
      // Add all filter parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          searchParams.append(key, params[key]);
        }
      });

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faq-groups?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching FAQ groups:', error);
      throw error;
    }
  },

  // Get single FAQ group
  getById: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faq-groups/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching FAQ group:', error);
      throw error;
    }
  },

  // Create new FAQ group
  create: async (groupData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faq-groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating FAQ group:', error);
      throw error;
    }
  },

  // Update FAQ group
  update: async (id, groupData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faq-groups/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating FAQ group:', error);
      throw error;
    }
  },

  // Delete FAQ group
  delete: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faq-groups/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Return the error message from backend for deletion validation
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting FAQ group:', error);
      throw error;
    }
  },

  // Reorder FAQ groups
  reorder: async (groupsData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/faq-groups/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(groupsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reordering FAQ groups:', error);
      throw error;
    }
  },
};

// Helper function to get media files (for backward compatibility)
export const getMediaFiles = async (params = {}) => {
  return await mediaAPI.getAll(params);
};