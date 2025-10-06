// Google Analytics API service - Backend Integration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? import.meta.env.VITE_REACT_APP_API_URL
  : 'http://127.0.0.1:8000/api';
class GoogleAnalyticsService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication token from localStorage
  getAuthToken() {
    return localStorage.getItem('cms_auth_token');
  }

  // Get analytics data from Laravel backend
  async getAnalyticsData(period = 'last30days') {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseURL}/analytics/dashboard?period=${period}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch analytics data');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      
      // Return fallback data on error
      return this.getFallbackData();
    }
  }

  // Clear analytics cache
  async clearCache() {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseURL}/analytics/clear-cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  // Fallback data when API fails
  getFallbackData() {
    return {
      visitors: 'N/A',
      pageViews: 'N/A',
      sessions: 'N/A',
      bounceRate: 'N/A',
      avgSessionDuration: 'N/A',
      topPages: [
        { path: '/', views: 'N/A' },
        { path: '/about', views: 'N/A' },
        { path: '/services', views: 'N/A' },
        { path: '/contact', views: 'N/A' },
        { path: '/portfolio', views: 'N/A' }
      ],
      trafficSources: [
        { source: 'google', sessions: 'N/A' },
        { source: 'direct', sessions: 'N/A' },
        { source: 'facebook', sessions: 'N/A' },
        { source: 'twitter', sessions: 'N/A' }
      ],
      dailyVisitors: [],
      period: 'fallback',
      lastUpdated: new Date().toISOString(),
      isFallback: true
    };
  }
}

// Export singleton instance
export default new GoogleAnalyticsService();