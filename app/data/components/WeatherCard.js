"use client";
import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const WeatherCard = ({ data, loading }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("area");
  const [metric, setMetric] = useState("temperature");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by region or state
    return data.filter(item => {
      const region = item.state || item.district_name || item.region || "";
      return region.toLowerCase().includes(filter.toLowerCase());
    });
  }, [data, filter]);

  // Get unique regions for filter options
  const regions = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.state || item.district_name || item.region).filter(Boolean))];
    return unique.slice(0, 8); // Limit to 8 for UI
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    // Group by year and calculate averages
    const grouped = filteredData.reduce((acc, item) => {
      const year = item._year || item.year || new Date().getFullYear();
      
      if (!acc[year]) {
        acc[year] = {
          year: year,
          temperature: 0,
          rainfall: 0,
          humidity: 0,
          count: 0
        };
      }
      
      // Map different possible field names to standard metrics
      acc[year].temperature += parseFloat(item.temperature || item.temp || item.avg_temp || 0);
      acc[year].rainfall += parseFloat(item.rainfall || item.precipitation || item.rain || 0);
      acc[year].humidity += parseFloat(item.humidity || item.hum || item.relative_humidity || 0);
      acc[year].count += 1;
      
      return acc;
    }, {});
    
    return Object.values(grouped)
      .map(item => ({
        ...item,
        temperature: item.temperature / item.count,
        rainfall: item.rainfall / item.count,
        humidity: item.humidity / item.count
      }))
      .sort((a, b) => a.year - b.year)
      .slice(-10); // Last 10 years
  }, [filteredData]);

  const getMetricData = () => {
    switch (metric) {
      case "temperature":
        return { dataKey: "temperature", color: "#ef4444", name: "Temperature (°C)" };
      case "rainfall":
        return { dataKey: "rainfall", color: "#3b82f6", name: "Rainfall (mm)" };
      case "humidity":
        return { dataKey: "humidity", color: "#10b981", name: "Humidity (%)" };
      default:
        return { dataKey: "temperature", color: "#ef4444", name: "Temperature (°C)" };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🌤️ Weather & Climate Data
          </h3>
          <p className="text-sm text-gray-600">Climate trends and weather patterns</p>
        </div>
        <div className="flex gap-2">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="temperature">Temperature</option>
            <option value="rainfall">Rainfall</option>
            <option value="humidity">Humidity</option>
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="area">Area Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Regions ({data?.length || 0})
          </button>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setFilter(region)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === region
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey={getMetricData().dataKey}
                  stroke={getMetricData().color}
                  fill={getMetricData().color}
                  fillOpacity={0.3}
                  name={getMetricData().name}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey={getMetricData().dataKey}
                  stroke={getMetricData().color}
                  strokeWidth={3}
                  name={getMetricData().name}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">🌡️</div>
              <p className="text-gray-500">No weather data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {chartData.length}
            </div>
            <div className="text-xs text-blue-600">Years</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {chartData.reduce((sum, item) => sum + item.temperature, 0) / chartData.length}
            </div>
            <div className="text-xs text-red-600">Avg Temp (°C)</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {chartData.reduce((sum, item) => sum + item.rainfall, 0) / chartData.length}
            </div>
            <div className="text-xs text-blue-600">Avg Rainfall (mm)</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {chartData.reduce((sum, item) => sum + item.humidity, 0) / chartData.length}
            </div>
            <div className="text-xs text-green-600">Avg Humidity (%)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
