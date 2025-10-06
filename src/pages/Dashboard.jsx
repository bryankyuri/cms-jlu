import React, { useState, useContext, useEffect } from "react";
import { FiUsers, FiEye, FiClock, FiArrowUp, FiArrowDown, FiWifi, FiWifiOff } from "react-icons/fi";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from "../context/AppContext";
import googleAnalytics from "../services/googleAnalytics";

// Register Chart.js components
Chart.register(...registerables);

// World map GeoJSON
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const Dashboard = () => {
  const [period, setPeriod] = useState("last30days");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isMobile } = useContext(AppContext);
  
  // Fetch analytics data from backend
  const fetchAnalyticsData = async (selectedPeriod = period) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await googleAnalytics.getAnalyticsData(selectedPeriod);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
      
      if (err.message.includes('Authentication required')) {
        toast.error('Please log in to view analytics data');
      } else {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('cms_auth_token');
    setIsAuthenticated(!!token);
  }, []);

  // Load data on component mount and period change
  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalyticsData();
    } else {
      setIsLoading(false);
      setError('Authentication required');
    }
  }, [period, isAuthenticated]);

  // Refresh data
  const refresh = () => {
    fetchAnalyticsData();
  };

  // Clear cache
  const clearCache = async () => {
    try {
      const success = await googleAnalytics.clearCache();
      if (success) {
        toast.success('Cache cleared successfully');
        refresh();
      } else {
        toast.error('Failed to clear cache');
      }
    } catch (err) {
      toast.error('Failed to clear cache');
    }
  };

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  // Handle refresh
  const handleRefresh = () => {
    toast.info('Refreshing analytics data...');
    refresh();
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error && analyticsData?.isFallback) {
      toast.error(`Analytics Error: ${error}. Using fallback data.`);
    }
  }, [error, analyticsData?.isFallback]);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
        <span className="ml-4 text-gray-600">Loading analytics data...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view analytics data.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Analytics Data</h2>
          <p className="text-gray-600">Unable to load analytics data at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="lg:text-[40px] text-[36px] text-black font-bold">
            ANALYTICS DASHBOARD
          </h1>
          {analyticsData?.isFallback && (
            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              {/* <FiWifiOff size={16} /> */}
              not connected
            </div>
          )}
          {!analyticsData?.isFallback && (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <FiWifi size={16} />
              Live Data
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-md transition-colors"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={clearCache}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
          >
            Clear Cache
          </button>
          <select 
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 3 Months</option>
            <option value="lastYear">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard 
          title="Visitors"
          value={analyticsData?.visitors?.toLocaleString() || '0'}
          change="12.5"
          positive={true}
          icon={<FiUsers className="text-2xl" />}
          showComparison={!analyticsData?.isFallback && analyticsData?.visitors > 0}
        />
        <SummaryCard 
          title="Page Views"
          value={analyticsData?.pageViews?.toLocaleString() || '0'}
          change="8.2"
          positive={true}
          icon={<FiEye className="text-2xl" />}
          showComparison={!analyticsData?.isFallback && analyticsData?.pageViews > 0}
        />
        <SummaryCard 
          title="Avg. Session Time"
          value={analyticsData?.avgSessionDuration || '0s'}
          change="3.1"
          positive={true}
          icon={<FiClock className="text-2xl" />}
          showComparison={!analyticsData?.isFallback && analyticsData?.avgSessionDuration !== '0s'}
        />
        <SummaryCard 
          title="Bounce Rate"
          value={analyticsData?.bounceRate || '0%'}
          change="2.4"
          positive={false}
          icon={<FiArrowUp className="text-2xl" />}
          showComparison={!analyticsData?.isFallback && analyticsData?.bounceRate !== '0%'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Visitor Trends</h2>
          <div className="h-80 flex items-center justify-center text-gray-500">
            {analyticsData?.dailyVisitors?.length > 0 ? (
              <Line 
                data={{
                  labels: analyticsData.dailyVisitors.map(d => d.date),
                  datasets: [{
                    label: 'Visitors',
                    data: analyticsData.dailyVisitors.map(d => d.visitors),
                    borderColor: '#000',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    tension: 0.3,
                    fill: true
                  }]
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            ) : (
              <p>Chart data will appear here when analytics are connected</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Traffic Sources</h2>
          <div className="space-y-3">
            {analyticsData?.trafficSources?.slice(0, 5).map((source, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{source.source}</span>
                <span className="text-sm font-medium">{source.sessions}</span>
              </div>
            )) || <p className="text-gray-500 text-center">No traffic source data</p>}
          </div>
        </div>
      </div>

      {/* Top Pages and Simple Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Most Visited Pages</h2>
          <div className="space-y-3">
            {analyticsData?.topPages?.map((page, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="text-sm font-medium text-gray-900">{page.path}</div>
                </div>
                <div className="text-sm text-gray-600">{page.views} views</div>
              </div>
            )) || <p className="text-gray-500 text-center">No page data available</p>}
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Analytics Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Data Period:</span>
              <span className="font-medium">{analyticsData?.period || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">
                {analyticsData?.lastUpdated 
                  ? new Date(analyticsData.lastUpdated).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Source:</span>
              <span className={`font-medium ${analyticsData?.isFallback ? 'text-yellow-600' : 'text-green-600'}`}>
                {analyticsData?.isFallback ? 'Fallback Data' : 'Live Analytics'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Sessions:</span>
              <span className="font-medium">{analyticsData?.sessions?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary card component for analytics metrics
const SummaryCard = ({ title, value, change, positive, icon, showComparison = true }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
      {showComparison && (
        <div className={`flex items-center mt-4 text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {positive ? (
            <FiArrowUp className="mr-1" />
          ) : (
            <FiArrowDown className="mr-1" />
          )}
          <span>{change}%</span>
          <span className="ml-1 text-gray-500">vs previous period</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
