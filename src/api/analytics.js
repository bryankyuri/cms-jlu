// Analytics API service - simplified approach for frontend
import { analyticsAPI as mainAnalyticsAPI } from './index';

class AnalyticsAPI {
  // Get dashboard analytics data
  async getDashboardData(period = 'last30days') {
    try {
      return await mainAnalyticsAPI.getDashboardData(period);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Get real-time analytics
  async getRealTimeData() {
    try {
      return await mainAnalyticsAPI.getRealTimeData();
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      throw error;
    }
  }

  // Get page analytics
  async getPageAnalytics(pagePath, period = 'last30days') {
    try {
      return await mainAnalyticsAPI.getPageAnalytics(pagePath, period);
    } catch (error) {
      console.error('Error fetching page analytics:', error);
      throw error;
    }
  }

  // Get audience insights
  async getAudienceInsights(period = 'last30days') {
    try {
      return await mainAnalyticsAPI.getAudienceInsights(period);
    } catch (error) {
      console.error('Error fetching audience insights:', error);
      throw error;
    }
  }
}

export default new AnalyticsAPI();