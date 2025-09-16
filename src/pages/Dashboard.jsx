import React, { useState, useEffect, useContext } from "react";
import { FiUsers, FiEye, FiClock, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from "../context/AppContext";

// Register Chart.js components
Chart.register(...registerables);

// World map GeoJSON
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const Dashboard = () => {
  const [period, setPeriod] = useState("last30days");
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const { isMobile } = useContext(AppContext); // Get the isMobile value from context

  useEffect(() => {
    // Simulate loading analytics data
    setIsLoading(true);
    fetchAnalyticsData(period)
      .then(data => {
        setAnalyticsData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching analytics data:", error);
        toast.error("Failed to load analytics data");
        setIsLoading(false);
      });
  }, [period]);

  // Mock function to simulate API call to Google Analytics
  // In a real implementation, this would be a call to your backend API
  const fetchAnalyticsData = async (timePeriod) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data structure similar to what you'd get from GA
    return {
      summary: {
        visitors: {
          value: 24879,
          change: 12.5,
          positive: true
        },
        pageViews: {
          value: 67432,
          change: 8.3,
          positive: true
        },
        avgSessionTime: {
          value: "2:45",
          change: -5.2,
          positive: false
        },
        bounceRate: {
          value: "32.4%",
          change: -3.1,
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
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="lg:text-[40px] text-[36px] text-black font-bold">
          ANALYTICS DASHBOARD
        </h1>
        
        <div className="mt-4 md:mt-0">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
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
          value={analyticsData.summary.visitors.value.toLocaleString()}
          change={analyticsData.summary.visitors.change}
          positive={analyticsData.summary.visitors.positive}
          icon={<FiUsers className="text-2xl" />}
        />
        <SummaryCard 
          title="Page Views"
          value={analyticsData.summary.pageViews.value.toLocaleString()}
          change={analyticsData.summary.pageViews.change}
          positive={analyticsData.summary.pageViews.positive}
          icon={<FiEye className="text-2xl" />}
        />
        <SummaryCard 
          title="Avg. Session Time"
          value={analyticsData.summary.avgSessionTime.value}
          change={analyticsData.summary.avgSessionTime.change}
          positive={analyticsData.summary.avgSessionTime.positive}
          icon={<FiClock className="text-2xl" />}
        />
        <SummaryCard 
          title="Bounce Rate"
          value={analyticsData.summary.bounceRate.value}
          change={analyticsData.summary.bounceRate.change}
          positive={analyticsData.summary.bounceRate.positive}
          icon={<FiArrowUp className="text-2xl" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Visitor Trends</h2>
          <div className="h-80">
            <Line 
              data={analyticsData.visitorChart}
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
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Device Breakdown</h2>
          <div className="h-80 flex items-center justify-center">
            <Doughnut 
              data={analyticsData.deviceChart}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                cutout: '70%'
              }}
            />
          </div>
        </div>
      </div>

      {/* Map, Location Table and Top Pages Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Distribution Map */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Visitor Locations</h2>
          
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-500">Top visitor cities worldwide</p>
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              Total from {analyticsData.locationData.reduce((sum, loc) => sum + loc.visitors, 0).toLocaleString()} locations
            </div>
          </div>
          
          {/* Adjust height based on mobile status */}
          <div className={`${isMobile ? 'h-[250px]' : 'h-[400px]'}`}>
            <ComposableMap
              width={isMobile ? 400 : 800}
              height={isMobile ? 250 : 400}
              projectionConfig={{
                scale: isMobile ? 90 : 110,        // Further reduce scale on mobile
                center: [30, 5],
                rotation: [-10, 0, 0]
              }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#EAEAEC"
                      stroke="#D6D6DA"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: "#F5F5F5" },
                        pressed: { outline: "none" }
                      }}
                    />
                  ))
                }
              </Geographies>
              {analyticsData.locationData.map(({ city, coordinates, visitors }) => (
                <Marker key={city} coordinates={coordinates}>
                  <circle 
                    r={Math.log(visitors) * 0.8} 
                    fill="#000" 
                    stroke="#fff" 
                    strokeWidth={0.5}
                    opacity={0.8}
                  />
                  <text
                    textAnchor="middle"
                    y={-10}
                    style={{
                      fontFamily: "system-ui",
                      fill: "#000",
                      fontSize: "8px",
                      fontWeight: 500,
                      pointerEvents: "none"
                    }}
                  >
                    {city}
                  </text>
                </Marker>
              ))}
            </ComposableMap>
          </div>
        </div>

        {/* Visitor Location Table - now separated */}
        <div className="bg-white p-6 rounded-lg shadow lg:row-span-1">
          <h2 className="text-lg font-semibold mb-4">Top Visitor Locations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-gray-500">City</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Country</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500">Visitors</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analyticsData.locationData.map((location, index) => {
                  const totalVisitors = analyticsData.locationData.reduce((sum, loc) => sum + loc.visitors, 0);
                  const percentage = ((location.visitors / totalVisitors) * 100).toFixed(1);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{location.city}</td>
                      <td className="px-3 py-2 text-gray-500">{location.country}</td>
                      <td className="px-3 py-2 text-right">{location.visitors.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Visited Pages */}
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Most Visited Pages</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analyticsData.topPages.map((page, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-black">{page.title}</div>
                      <div className="text-xs text-gray-500">{page.url}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{page.views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{page.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary card component for analytics metrics
const SummaryCard = ({ title, value, change, positive, icon }) => {
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
      <div className={`flex items-center mt-4 text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {positive ? (
          <FiArrowUp className="mr-1" />
        ) : (
          <FiArrowDown className="mr-1" />
        )}
        <span>{change}%</span>
        <span className="ml-1 text-gray-500">vs previous period</span>
      </div>
    </div>
  );
};

export default Dashboard;
