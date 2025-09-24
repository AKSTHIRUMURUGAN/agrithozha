"use client";
import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const DisasterDamageCard = ({ data, loading, datasetType = "disasterDamage" }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [metric, setMetric] = useState("lives_lost");
  const [timeRange, setTimeRange] = useState("yearly");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by year for disaster damage data
    if (datasetType === "disasterDamage") {
      return data.filter(item => {
        const year = item._year || item.year || "";
        return year.toString().includes(filter);
      });
    }
    
    // Default filtering for other datasets
    return data.filter(item => {
      const commodity = item.commodity || item.crop || "";
      return commodity.toLowerCase().includes(filter.toLowerCase());
    });
  }, [data, filter, datasetType]);

  // Get unique years for filter options
  const filterOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (datasetType === "disasterDamage") {
      const years = [...new Set(data.map(item => item._year || item.year).filter(Boolean))];
      return years.sort((a, b) => b - a).slice(0, 10); // Latest 10 years
    }
    
    // Default for other datasets
    const unique = [...new Set(data.map(item => item.commodity || item.crop).filter(Boolean))];
    return unique.slice(0, 10);
  }, [data, datasetType]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    if (datasetType === "disasterDamage") {
      // Group by year for disaster damage data
      const grouped = filteredData.reduce((acc, item) => {
        const year = item._year || item.year || new Date().getFullYear();
        
        if (!acc[year]) {
          acc[year] = {
            year: year,
            lives_lost: 0,
            cattle_lost: 0,
            houses_damaged: 0,
            cropped_areas_affected: 0,
            count: 0
          };
        }
        
        acc[year].lives_lost += parseFloat(item.lives_lost_in_nos_ || 0);
        acc[year].cattle_lost += parseFloat(item.cattle_lost_in_nos_ || 0);
        acc[year].houses_damaged += parseFloat(item.house_damaged_in_nos_ || 0);
        acc[year].cropped_areas_affected += parseFloat(item.cropped_areas_affected_in_lakh_ha_ || 0);
        acc[year].count += 1;
        
        return acc;
      }, {});
      
      return Object.values(grouped)
        .sort((a, b) => a.year - b.year)
        .slice(-10); // Last 10 years
    }
    
    // Default processing for other datasets
    return filteredData.slice(0, 10).map((item, index) => ({
      name: item.commodity || item.crop || `Item ${index + 1}`,
      value: parseFloat(item.production || item.area || 0)
    }));
  }, [filteredData, datasetType]);

  // Get disaster type breakdown
  const disasterBreakdown = useMemo(() => {
    if (datasetType !== "disasterDamage" || !filteredData.length) return [];
    
    const disasters = ["flood", "cyclone", "landslide"];
    return disasters.map(disaster => {
      const disasterData = filteredData.filter(item => 
        (item.disaster_type || "").toLowerCase().includes(disaster) ||
        (item.type || "").toLowerCase().includes(disaster)
      );
      
      return {
        disaster: disaster.charAt(0).toUpperCase() + disaster.slice(1),
        lives_lost: disasterData.reduce((sum, item) => sum + parseFloat(item.lives_lost_in_nos_ || 0), 0),
        cattle_lost: disasterData.reduce((sum, item) => sum + parseFloat(item.cattle_lost_in_nos_ || 0), 0),
        houses_damaged: disasterData.reduce((sum, item) => sum + parseFloat(item.house_damaged_in_nos_ || 0), 0),
        cropped_areas_affected: disasterData.reduce((sum, item) => sum + parseFloat(item.cropped_areas_affected_in_lakh_ha_ || 0), 0)
      };
    });
  }, [filteredData, datasetType]);

  const getMetricData = () => {
    switch (metric) {
      case "lives_lost":
        return { dataKey: "lives_lost", color: "#dc2626", name: "Lives Lost" };
      case "cattle_lost":
        return { dataKey: "cattle_lost", color: "#ea580c", name: "Cattle Lost" };
      case "houses_damaged":
        return { dataKey: "houses_damaged", color: "#d97706", name: "Houses Damaged" };
      case "cropped_areas_affected":
        return { dataKey: "cropped_areas_affected", color: "#16a34a", name: "Crop Area Affected (Lakh Ha)" };
      default:
        return { dataKey: "lives_lost", color: "#dc2626", name: "Lives Lost" };
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
            {datasetType === "disasterDamage" ? "🌪️ Disaster Damage" : "📊 Damage Data"}
          </h3>
          <p className="text-sm text-gray-600">
            {datasetType === "disasterDamage" 
              ? "Year-wise damage due to floods, cyclones, landslides"
              : "Damage analysis and impact assessment"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {datasetType === "disasterDamage" && (
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="lives_lost">Lives Lost</option>
              <option value="cattle_lost">Cattle Lost</option>
              <option value="houses_damaged">Houses Damaged</option>
              <option value="cropped_areas_affected">Crop Area Affected</option>
            </select>
          )}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
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
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Years ({data?.length || 0})
          </button>
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === option
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey={getMetricData().dataKey} 
                  fill={getMetricData().color} 
                  name={getMetricData().name} 
                />
              </BarChart>
            ) : chartType === "line" ? (
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
            ) : (
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
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">🌪️</div>
              <p className="text-gray-500">No disaster damage data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Disaster Breakdown */}
      {datasetType === "disasterDamage" && disasterBreakdown.length > 0 && (
        <div className="mt-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Disaster Type Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {disasterBreakdown.map((disaster, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-800 mb-2">{disaster.disaster}</div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Lives: {disaster.lives_lost}</div>
                  <div>Cattle: {disaster.cattle_lost}</div>
                  <div>Houses: {disaster.houses_damaged}</div>
                  <div>Crops: {disaster.cropped_areas_affected.toFixed(1)}L Ha</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {chartData.length}
            </div>
            <div className="text-xs text-red-600">Years</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {chartData.reduce((sum, item) => sum + (item.lives_lost || 0), 0)}
            </div>
            <div className="text-xs text-orange-600">Total Lives Lost</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {chartData.reduce((sum, item) => sum + (item.cattle_lost || 0), 0)}
            </div>
            <div className="text-xs text-yellow-600">Total Cattle Lost</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {chartData.reduce((sum, item) => sum + (item.cropped_areas_affected || 0), 0).toFixed(1)}
            </div>
            <div className="text-xs text-green-600">Crop Area (L Ha)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterDamageCard;
