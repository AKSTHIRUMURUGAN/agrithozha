"use client";
import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

const CropProductionCard = ({ data, loading, datasetType = "cropProduction" }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [metric, setMetric] = useState("production");
  const [groupBy, setGroupBy] = useState("state");
  const [season, setSeason] = useState("all");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by state, district, or crop for crop production data
    if (datasetType === "cropProduction") {
      return data.filter(item => {
        const state = item.state_name || item.state || "";
        const district = item.district_name || item.district || "";
        const crop = item.crop || "";
        const searchTerm = filter.toLowerCase();
        
        return state.toLowerCase().includes(searchTerm) ||
               district.toLowerCase().includes(searchTerm) ||
               crop.toLowerCase().includes(searchTerm);
      });
    }
    
    // Default filtering for other datasets
    return data.filter(item => {
      const commodity = item.commodity || item.crop || "";
      return commodity.toLowerCase().includes(filter.toLowerCase());
    });
  }, [data, filter, datasetType]);

  // Get unique filter options based on groupBy
  const filterOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (datasetType === "cropProduction") {
      const field = groupBy === "state" ? "state_name" : 
                   groupBy === "district" ? "district_name" : 
                   groupBy === "crop" ? "crop" : "state_name";
      
      const unique = [...new Set(data.map(item => item[field]).filter(Boolean))];
      return unique.slice(0, 10);
    }
    
    // Default for other datasets
    const unique = [...new Set(data.map(item => item.commodity || item.crop).filter(Boolean))];
    return unique.slice(0, 10);
  }, [data, datasetType, groupBy]);

  // Get unique states
  const states = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.state_name || item.state).filter(Boolean))];
    return unique.slice(0, 20);
  }, [data]);

  // Get unique districts
  const districts = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.district_name || item.district).filter(Boolean))];
    return unique.slice(0, 20);
  }, [data]);

  // Get unique crops
  const crops = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.crop).filter(Boolean))];
    return unique.slice(0, 20);
  }, [data]);

  // Get unique seasons
  const seasons = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.season).filter(Boolean))];
    return unique;
  }, [data]);

  // Get available years
  const availableYears = useMemo(() => {
    if (!data || data.length === 0) return [];
    const years = [...new Set(data.map(item => item.crop_year || item.year).filter(Boolean))];
    return years.sort((a, b) => b - a); // Latest first
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    if (datasetType === "cropProduction") {
      // Apply season filter
      let seasonFilteredData = filteredData;
      if (season !== "all") {
        seasonFilteredData = filteredData.filter(item => item.season === season);
      }
      
      // Group data based on selected groupBy option
      const grouped = seasonFilteredData.reduce((acc, item) => {
        const key = groupBy === "state" ? (item.state_name || item.state || "Unknown") :
                   groupBy === "district" ? (item.district_name || item.district || "Unknown") :
                   groupBy === "crop" ? (item.crop || "Unknown") :
                   (item.state_name || item.state || "Unknown");
        
        if (!acc[key]) {
          acc[key] = {
            name: key,
            total_area: 0,
            total_production: 0,
            count: 0,
            years: new Set(),
            seasons: new Set(),
            crops: new Set()
          };
        }
        
        const area = parseFloat(item.area_ || item.area || 0);
        const production = parseFloat(item.production_ || item.production || 0);
        const year = item.crop_year || item.year || new Date().getFullYear();
        
        acc[key].total_area += area;
        acc[key].total_production += production;
        acc[key].count += 1;
        acc[key].years.add(year);
        acc[key].seasons.add(item.season || "Unknown");
        acc[key].crops.add(item.crop || "Unknown");
        
        return acc;
      }, {});
      
      // Calculate productivity and other metrics
      Object.values(grouped).forEach(item => {
        item.productivity = item.total_production / (item.total_area || 1);
        item.years_count = item.years.size;
        item.seasons_count = item.seasons.size;
        item.crops_count = item.crops.size;
      });
      
      return Object.values(grouped)
        .sort((a, b) => b.total_production - a.total_production)
        .slice(0, 15); // Top 15 items
    }
    
    // Default processing for other datasets
    return filteredData.slice(0, 10).map((item, index) => ({
      name: item.commodity || item.crop || `Item ${index + 1}`,
      area: parseFloat(item.area || 0),
      production: parseFloat(item.production || 0),
      value: parseFloat(item.production || 0)
    }));
  }, [filteredData, datasetType, groupBy, season]);

  // Get year-wise trend data
  const yearWiseData = useMemo(() => {
    if (datasetType !== "cropProduction" || !filteredData.length) return [];
    
    const grouped = filteredData.reduce((acc, item) => {
      const year = item.crop_year || item.year || new Date().getFullYear();
      
      if (!acc[year]) {
        acc[year] = {
          year: year,
          total_area: 0,
          total_production: 0,
          count: 0,
          seasons: new Set(),
          crops: new Set()
        };
      }
      
      const area = parseFloat(item.area_ || item.area || 0);
      const production = parseFloat(item.production_ || item.production || 0);
      
      acc[year].total_area += area;
      acc[year].total_production += production;
      acc[year].count += 1;
      acc[year].seasons.add(item.season || "Unknown");
      acc[year].crops.add(item.crop || "Unknown");
      
      return acc;
    }, {});
    
    // Calculate productivity and other metrics
    Object.values(grouped).forEach(item => {
      item.productivity = item.total_production / (item.total_area || 1);
      item.seasons_count = item.seasons.size;
      item.crops_count = item.crops.size;
    });
    
    return Object.values(grouped)
      .sort((a, b) => a.year - b.year)
      .slice(-10); // Last 10 years
  }, [filteredData, datasetType]);

  // Get season-wise breakdown
  const seasonBreakdown = useMemo(() => {
    if (datasetType !== "cropProduction" || !filteredData.length) return [];
    
    const grouped = filteredData.reduce((acc, item) => {
      const seasonName = item.season || "Unknown";
      
      if (!acc[seasonName]) {
        acc[seasonName] = {
          season: seasonName,
          total_area: 0,
          total_production: 0,
          count: 0,
          crops: new Set()
        };
      }
      
      const area = parseFloat(item.area_ || item.area || 0);
      const production = parseFloat(item.production_ || item.production || 0);
      
      acc[seasonName].total_area += area;
      acc[seasonName].total_production += production;
      acc[seasonName].count += 1;
      acc[seasonName].crops.add(item.crop || "Unknown");
      
      return acc;
    }, {});
    
    // Calculate productivity
    Object.values(grouped).forEach(item => {
      item.productivity = item.total_production / (item.total_area || 1);
      item.crops_count = item.crops.size;
    });
    
    return Object.values(grouped)
      .sort((a, b) => b.total_production - a.total_production);
  }, [filteredData, datasetType]);

  const getMetricData = () => {
    switch (metric) {
      case "production":
        return { dataKey: "total_production", color: "#22c55e", name: "Production (Tonnes)" };
      case "area":
        return { dataKey: "total_area", color: "#3b82f6", name: "Area (Hectares)" };
      case "productivity":
        return { dataKey: "productivity", color: "#f59e0b", name: "Productivity (T/Ha)" };
      default:
        return { dataKey: "total_production", color: "#22c55e", name: "Production (Tonnes)" };
    }
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

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
            {datasetType === "cropProduction" ? "🌾 Crop Production" : "🌱 Production Data"}
          </h3>
          <p className="text-sm text-gray-600">
            {datasetType === "cropProduction" 
              ? "District-wise, season-wise crop production statistics (from 1997)"
              : "Crop production analysis and trends"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {datasetType === "cropProduction" && (
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="production">Production (Tonnes)</option>
              <option value="area">Area (Hectares)</option>
              <option value="productivity">Productivity (T/Ha)</option>
            </select>
          )}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({data?.length || 0})
          </button>
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === option
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        
        {datasetType === "cropProduction" && (
          <div className="flex flex-wrap gap-2">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="state">Group by State</option>
              <option value="district">Group by District</option>
              <option value="crop">Group by Crop</option>
            </select>
            
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Seasons</option>
              {seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, getMetricData().name]} />
                <Bar 
                  dataKey={getMetricData().dataKey} 
                  fill={getMetricData().color} 
                  name={getMetricData().name} 
                />
              </BarChart>
            ) : chartType === "line" ? (
              <LineChart data={datasetType === "cropProduction" ? yearWiseData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={datasetType === "cropProduction" ? "year" : "name"} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, getMetricData().name]} />
                <Line 
                  type="monotone" 
                  dataKey={getMetricData().dataKey}
                  stroke={getMetricData().color}
                  strokeWidth={3}
                  name={getMetricData().name}
                />
              </LineChart>
            ) : chartType === "area" ? (
              <AreaChart data={datasetType === "cropProduction" ? yearWiseData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={datasetType === "cropProduction" ? "year" : "name"} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, getMetricData().name]} />
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
              <PieChart>
                <Pie
                  data={chartData.slice(0, 8)}
                  dataKey={getMetricData().dataKey}
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                >
                  {chartData.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, getMetricData().name]} />
              </PieChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">🌾</div>
              <p className="text-gray-500">No crop production data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Season Breakdown */}
      {datasetType === "cropProduction" && seasonBreakdown.length > 0 && (
        <div className="mt-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Season-wise Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {seasonBreakdown.map((season, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-800 mb-2">{season.season}</div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Area: {season.total_area.toFixed(0)} Ha</div>
                  <div>Production: {season.total_production.toFixed(0)} T</div>
                  <div>Productivity: {season.productivity.toFixed(1)} T/Ha</div>
                  <div>Crops: {season.crops_count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {chartData.length}
            </div>
            <div className="text-xs text-green-600">Items</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {chartData.reduce((sum, item) => sum + (item.total_area || item.area || 0), 0).toFixed(0)}
            </div>
            <div className="text-xs text-blue-600">Total Area (Ha)</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {chartData.reduce((sum, item) => sum + (item.total_production || item.production || 0), 0).toFixed(0)}
            </div>
            <div className="text-xs text-purple-600">Total Production (T)</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {(chartData.reduce((sum, item) => sum + (item.total_production || item.production || 0), 0) / 
                chartData.reduce((sum, item) => sum + (item.total_area || item.area || 1), 0)).toFixed(1)}
            </div>
            <div className="text-xs text-yellow-600">Avg Productivity</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropProductionCard;
