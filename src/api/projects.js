// Base API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('cms_auth_token');
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Get all projects (CMS)
 */
export const getProjects = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';
    
    return await apiRequest(endpoint);
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single project by UUID
 */
export const getProject = async (uuid) => {
  try {
    return await apiRequest(`/projects/${uuid}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new project
 */
export const createProject = async (projectData) => {
  try {
    return await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Update a project
 */
export const updateProject = async (uuid, projectData) => {
  try {
    return await apiRequest(`/projects/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Publish a project
 */
export const publishProject = async (uuid) => {
  try {
    return await apiRequest(`/projects/${uuid}/publish`, {
      method: 'POST',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Unpublish a project (set to draft)
 */
export const unpublishProject = async (uuid) => {
  try {
    return await apiRequest(`/projects/${uuid}/unpublish`, {
      method: 'POST',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Reorder projects
 */
export const reorderProjects = async (projects) => {
  try {
    return await apiRequest('/projects/reorder', {
      method: 'POST',
      body: JSON.stringify({ projects }),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get public projects (for frontsite)
 */
export const getPublicProjects = async () => {
  try {
    return await apiRequest('/public/projects');
  } catch (error) {
    throw error;
  }
};
