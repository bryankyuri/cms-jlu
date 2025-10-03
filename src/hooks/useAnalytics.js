import { useState, useEffect, useCallback } from 'react';
import analyticsAPI from '../api/analytics';

// Custom hook for analytics data management
export const useAnalytics = (period = 'last30days') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async (selectedPeriod = period) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await analyticsAPI.getDashboardData(selectedPeriod);
      setData(result);
      setRetryCount(0);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
      
      // Fallback to mock data if API fails
      if (retryCount === 0) {
        setData(getMockAnalyticsData(selectedPeriod));
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [period, retryCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(period);
  }, [fetchData, period]);

  const changePeriod = useCallback((newPeriod) => {
    fetchData(newPeriod);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    changePeriod,
    isUsingMockData: retryCount > 0
  };
};

// Real-time analytics hook
export const useRealTimeAnalytics = (refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRealTimeData = useCallback(async () => {
    try {
      const result = await analyticsAPI.getRealTimeData();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Real-time analytics error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealTimeData();
    
    const interval = setInterval(fetchRealTimeData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchRealTimeData, refreshInterval]);

  return { data, loading, error };
};

// Mock data fallback
function getMockAnalyticsData(period) {
  const baseData = {
    summary: {
      visitors: {
        value: "N/A",
        change: 0,
        positive: true
      },
      pageViews: {
        value: "N/A",
        change: 0,
        positive: true
      },
      avgSessionTime: {
        value: "N/A",
        change: 0,
        positive: false
      },
      bounceRate: {
        value: "N/A",
        change: 0,
        positive: true
      }
    },
    visitorChart: {
      labels: ["1 May", "5 May", "10 May", "15 May", "20 May", "25 May", "30 May"],
      datasets: [
        {
          label: "Visitors",
          data: [5200, 6100, 4800, 7900, 9200, 8400, 10200],
          borderColor: "#000000",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          tension: 0.4
        }
      ]
    },
    deviceChart: {
      labels: ["Desktop", "Mobile", "Tablet"],
      datasets: [
        {
          data: [58, 35, 7],
          backgroundColor: ["#000000", "#666666", "#cccccc"],
          borderWidth: 0
        }
      ]
    },
    topPages: [
      { url: "/works/pillow-walk-aldo", title: "PILLOW WALK - ALDO", views: 14322, avgTime: "3:21" },
      { url: "/works/tokopedia-ramadan", title: "TOKOPEDIA - RAMADAN 2024", views: 9876, avgTime: "2:45" },
      { url: "/works/trust-in-gold", title: "TRUST IN GOLD - UBS GOLD", views: 8721, avgTime: "2:12" },
      { url: "/works/speak-to-me-sociolla", title: "SPEAK TO ME - SOCIOLLA", views: 7654, avgTime: "1:58" },
      { url: "/about", title: "About Page", views: 5433, avgTime: "2:37" }
    ],
    locationData: [
      { city: "Jakarta", country: "Indonesia", visitors: 5430, coordinates: [106.8456, -6.2088] },
      { city: "Singapore", country: "Singapore", visitors: 3210, coordinates: [103.8198, 1.3521] },
      { city: "New York", country: "USA", visitors: 2870, coordinates: [-74.0060, 40.7128] },
      { city: "London", country: "UK", visitors: 2450, coordinates: [-0.1278, 51.5074] },
      { city: "Tokyo", country: "Japan", visitors: 1980, coordinates: [139.6917, 35.6895] },
      { city: "Sydney", country: "Australia", visitors: 1740, coordinates: [151.2093, -33.8688] },
      { city: "Berlin", country: "Germany", visitors: 1690, coordinates: [13.4050, 52.5200] }
    ]
  };

  // Adjust data based on period
  switch (period) {
    case 'last7days':
      baseData.summary.visitors.value = Math.floor(baseData.summary.visitors.value * 0.25);
      baseData.summary.pageViews.value = Math.floor(baseData.summary.pageViews.value * 0.25);
      break;
    case 'last90days':
      baseData.summary.visitors.value = Math.floor(baseData.summary.visitors.value * 3);
      baseData.summary.pageViews.value = Math.floor(baseData.summary.pageViews.value * 3);
      break;
    case 'lastYear':
      baseData.summary.visitors.value = Math.floor(baseData.summary.visitors.value * 12);
      baseData.summary.pageViews.value = Math.floor(baseData.summary.pageViews.value * 12);
      break;
  }

  return baseData;
}