// Base API URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://staging-api.parallelstudio.asia/api'
  : 'http://127.0.0.1:8000/api';

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
      // Handle unauthorized responses
      if (response.status === 401) {
        removeAuthToken();
        window.location.href = '/login';
        return;
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

  // Upload new media file
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

  // Update media metadata
  update: async (id, data) => {
    return await apiRequest(`/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
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
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/storage/${path}`;
  }
};

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