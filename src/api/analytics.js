// Analytics API service
const API_BASE_URL = process.env.NODE_ENV !== 'production' 
  ? import.meta.env.VITE_REACT_APP_API_URL
  : 'http://127.0.0.1:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('cms_auth_token');
};

// Generic API request function for analytics
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
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('Analytics API Error:', error);
    throw error;
  }
};

export const analyticsApi = {
  // Get dashboard analytics data
  getDashboardData: async (period = 'last30days') => {
    return await apiRequest('/analytics/dashboard', {
      method: 'POST',
      body: JSON.stringify({ period }),
    });
  },

  // Get real-time analytics
  getRealTimeData: async () => {
    return await apiRequest('/analytics/realtime');
  },

  // Get page analytics
  getPageAnalytics: async (pagePath, period = 'last30days') => {
    return await apiRequest('/analytics/page', {
      method: 'POST',
      body: JSON.stringify({ pagePath, period }),
    });
  },

  // Get audience insights
  getAudienceInsights: async (period = 'last30days') => {
    return await apiRequest('/analytics/audience', {
      method: 'POST',
      body: JSON.stringify({ period }),
    });
  },

  // Get traffic sources
  getTrafficSources: async (period = 'last30days') => {
    return await apiRequest('/analytics/traffic-sources', {
      method: 'POST',
      body: JSON.stringify({ period }),
    });
  },

  // Get conversion data
  getConversions: async (period = 'last30days') => {
    return await apiRequest('/analytics/conversions', {
      method: 'POST',
      body: JSON.stringify({ period }),
    });
  }
};