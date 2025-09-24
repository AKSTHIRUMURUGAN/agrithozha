"use client";
import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const VegetableProductionCard = ({ data, loading, datasetType = "vegetableProduction" }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [metric, setMetric] = useState("production");
  const [yearRange, setYearRange] = useState("all");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by state for vegetable production data
    if (datasetType === "vegetableProduction") {
      return data.filter(item => {
        const state = item.state__ut_name || item.state || item.states___uts || "";
        return state.toLowerCase().includes(filter.toLowerCase());
      });
    }
    
    // Default filtering for other datasets
    return data.filter(item => {
      const commodity = item.commodity || item.crop || "";
      return commodity.toLowerCase().includes(filter.toLowerCase());
    });
  }, [data, filter, datasetType]);

  // Get unique states for filter options
  const filterOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (datasetType === "vegetableProduction") {
      const unique = [...new Set(data.map(item => item.state__ut_name || item.state || item.states___uts).filter(Boolean))];
      return unique.slice(0, 10);
    }
    
    // Default for other datasets
    const unique = [...new Set(data.map(item => item.commodity || item.crop).filter(Boolean))];
    return unique.slice(0, 10);
  }, [data, datasetType]);

  // Get available years
  const availableYears = useMemo(() => {
    if (!data || data.length === 0) return [];
    const years = [...new Set(data.map(item => item._year || item.year).filter(Boolean))];
    return years.sort();
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    if (datasetType === "vegetableProduction") {
      // Process vegetable production data with year-specific fields
      return filteredData.map(item => {
        const state = item.state__ut_name || item.state || item.states___uts || "Unknown";
        
        // Calculate totals across all years and vegetables
        let total_area = 0;
        let total_production = 0;
        const years = new Set();
        
        // Extract year-specific data (2009-10 to 2014-15)
        const yearPatterns = ['2009_10', '2010_11', '2011_12', '2012_13', '2013_14', '2014_15'];
        
        yearPatterns.forEach(yearPattern => {
          // Check for total area and production fields
          const areaField = `total_area_${yearPattern}`;
          const productionField = `total_production_${yearPattern}`;
          
          if (item[areaField] && item[areaField] !== "NA" && item[areaField] !== "0") {
            total_area += parseFloat(item[areaField]) || 0;
            years.add(yearPattern.replace('_', '-'));
          }
          
          if (item[productionField] && item[productionField] !== "NA" && item[productionField] !== "0") {
            total_production += parseFloat(item[productionField]) || 0;
          }
        });
        
        return {
          state: state,
          total_area: total_area,
          total_production: total_production,
          years: years.size,
          productivity: total_production / (total_area || 1)
        };
      })
      .filter(item => item.total_production > 0) // Only include states with data
      .sort((a, b) => b.total_production - a.total_production)
      .slice(0, 15); // Top 15 states
    }
    
    // Default processing for other datasets
    return filteredData.slice(0, 10).map((item, index) => ({
      name: item.commodity || item.crop || `Item ${index + 1}`,
      area: parseFloat(item.area_ || item.area || 0),
      production: parseFloat(item.production_ || item.production || 0),
      value: parseFloat(item.production_ || item.production || 0)
    }));
  }, [filteredData, datasetType]);

  // Get year-wise data for line/area charts
  const yearWiseData = useMemo(() => {
    if (datasetType !== "vegetableProduction" || !filteredData.length) return [];
    
    const yearPatterns = ['2009_10', '2010_11', '2011_12', '2012_13', '2013_14', '2014_15'];
    const yearData = {};
    
    yearPatterns.forEach(yearPattern => {
      const year = yearPattern.replace('_', '-');
      yearData[year] = {
        year: year,
        total_area: 0,
        total_production: 0,
        count: 0
      };
      
      filteredData.forEach(item => {
        const areaField = `total_area_${yearPattern}`;
        const productionField = `total_production_${yearPattern}`;
        
        if (item[areaField] && item[areaField] !== "NA" && item[areaField] !== "0") {
          yearData[year].total_area += parseFloat(item[areaField]) || 0;
        }
        
        if (item[productionField] && item[productionField] !== "NA" && item[productionField] !== "0") {
          yearData[year].total_production += parseFloat(item[productionField]) || 0;
        }
      });
      
      yearData[year].productivity = yearData[year].total_production / (yearData[year].total_area || 1);
    });
    
    return Object.values(yearData)
      .filter(item => item.total_production > 0) // Only include years with data
      .sort((a, b) => a.year.localeCompare(b.year));
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
            {datasetType === "vegetableProduction" ? "🥬 Vegetable Production" : "🌱 Production Data"}
          </h3>
          <p className="text-sm text-gray-600">
            {datasetType === "vegetableProduction" 
              ? "State-wise area & production of vegetables (2009-15)"
              : "Production trends and area analysis"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {datasetType === "vegetableProduction" && (
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
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All States ({data?.length || 0})
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
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={datasetType === "vegetableProduction" ? "state" : "name"} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey={getMetricData().dataKey} 
                  fill={getMetricData().color} 
                  name={getMetricData().name} 
                />
              </BarChart>
            ) : chartType === "line" ? (
              <LineChart data={datasetType === "vegetableProduction" ? yearWiseData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={datasetType === "vegetableProduction" ? "year" : "name"} />
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
              <AreaChart data={datasetType === "vegetableProduction" ? yearWiseData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={datasetType === "vegetableProduction" ? "year" : "name"} />
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
              <div className="text-gray-400 text-4xl mb-2">🥬</div>
              <p className="text-gray-500">No vegetable production data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {chartData.length}
            </div>
            <div className="text-xs text-green-600">States</div>
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

export default VegetableProductionCard;
