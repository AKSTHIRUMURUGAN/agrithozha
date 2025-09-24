"use client";
import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, ScatterChart, Scatter } from "recharts";

const YieldIndexCard = ({ data, loading, datasetType = "yieldIndex" }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("line");
  const [metric, setMetric] = useState("index");
  const [yearRange, setYearRange] = useState("all");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by crop for yield index data
    if (datasetType === "yieldIndex") {
      return data.filter(item => {
        const crop = item.crop || "";
        return crop.toLowerCase().includes(filter.toLowerCase());
      });
    }
    
    // Default filtering for other datasets
    return data.filter(item => {
      const commodity = item.commodity || item.crop || "";
      return commodity.toLowerCase().includes(filter.toLowerCase());
    });
  }, [data, filter, datasetType]);

  // Get unique crops for filter options
  const filterOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (datasetType === "yieldIndex") {
      const unique = [...new Set(data.map(item => item.crop).filter(Boolean))];
      return unique.slice(0, 10);
    }
    
    // Default for other datasets
    const unique = [...new Set(data.map(item => item.commodity || item.crop).filter(Boolean))];
    return unique.slice(0, 10);
  }, [data, datasetType]);

  // Get available years
  const availableYears = useMemo(() => {
    if (!data || data.length === 0) return [];
    const years = ['2007_08', '2008_09', '2009_10', '2010_11', '2011_12', '2012_13', '2013_14', '2014_15', '2015_16'];
    return years;
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    if (datasetType === "yieldIndex") {
      // Process yield index data
      return filteredData.map(item => {
        const crop = item.crop || "Unknown";
        const weights = parseFloat(item.weights || 0);
        
        // Calculate year-wise data
        const yearData = {};
        availableYears.forEach(yearPattern => {
          const yieldField = `yield___${yearPattern}`;
          const indexField = `index___${yearPattern}`;
          
          if (item[yieldField] && item[yieldField] !== "NA" && item[yieldField] !== "0") {
            yearData[yearPattern] = {
              year: yearPattern.replace('___', '-'),
              yield: parseFloat(item[yieldField]) || 0,
              index: parseFloat(item[indexField]) || 0
            };
          }
        });
        
        // Calculate averages and trends
        const years = Object.keys(yearData);
        const avgYield = years.reduce((sum, year) => sum + yearData[year].yield, 0) / years.length;
        const avgIndex = years.reduce((sum, year) => sum + yearData[year].index, 0) / years.length;
        
        // Calculate trend (simple linear regression slope)
        const trend = years.length > 1 ? 
          (yearData[years[years.length - 1]].index - yearData[years[0]].index) / years.length : 0;
        
        return {
          crop: crop,
          weights: weights,
          avg_yield: avgYield,
          avg_index: avgIndex,
          trend: trend,
          years_count: years.length,
          year_data: yearData
        };
      })
      .sort((a, b) => b.avg_index - a.avg_index)
      .slice(0, 15); // Top 15 crops
    }
    
    // Default processing for other datasets
    return filteredData.slice(0, 10).map((item, index) => ({
      name: item.commodity || item.crop || `Item ${index + 1}`,
      value: parseFloat(item.index || item.yield || 0)
    }));
  }, [filteredData, datasetType, availableYears]);

  // Get year-wise trend data for line/area charts
  const yearWiseData = useMemo(() => {
    if (datasetType !== "yieldIndex" || !filteredData.length) return [];
    
    const yearData = {};
    
    availableYears.forEach(yearPattern => {
      const year = yearPattern.replace('___', '-');
      yearData[year] = {
        year: year,
        total_yield: 0,
        total_index: 0,
        weighted_index: 0,
        total_weights: 0,
        count: 0
      };
      
      filteredData.forEach(item => {
        const yieldField = `yield___${yearPattern}`;
        const indexField = `index___${yearPattern}`;
        const weights = parseFloat(item.weights || 0);
        
        if (item[yieldField] && item[yieldField] !== "NA" && item[yieldField] !== "0") {
          const yieldValue = parseFloat(item[yieldField]) || 0;
          const indexValue = parseFloat(item[indexField]) || 0;
          
          yearData[year].total_yield += yieldValue;
          yearData[year].total_index += indexValue;
          yearData[year].weighted_index += indexValue * weights;
          yearData[year].total_weights += weights;
          yearData[year].count += 1;
        }
      });
      
      // Calculate weighted average index
      yearData[year].avg_index = yearData[year].total_weights > 0 ? 
        yearData[year].weighted_index / yearData[year].total_weights : 
        yearData[year].total_index / (yearData[year].count || 1);
      yearData[year].avg_yield = yearData[year].total_yield / (yearData[year].count || 1);
    });
    
    return Object.values(yearData)
      .filter(item => item.count > 0) // Only include years with data
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [filteredData, datasetType, availableYears]);

  // Get crop performance comparison
  const cropPerformance = useMemo(() => {
    if (datasetType !== "yieldIndex" || !filteredData.length) return [];
    
    return filteredData.map(item => {
      const crop = item.crop || "Unknown";
      const weights = parseFloat(item.weights || 0);
      
      // Get first and last year data for comparison
      const firstYear = availableYears[0];
      const lastYear = availableYears[availableYears.length - 1];
      
      const firstIndex = parseFloat(item[`index___${firstYear}`]) || 0;
      const lastIndex = parseFloat(item[`index___${lastYear}`]) || 0;
      
      const growth = lastIndex - firstIndex;
      const growthRate = firstIndex > 0 ? (growth / firstIndex) * 100 : 0;
      
      return {
        crop: crop,
        weights: weights,
        first_index: firstIndex,
        last_index: lastIndex,
        growth: growth,
        growth_rate: growthRate,
        performance: growthRate > 0 ? "positive" : growthRate < 0 ? "negative" : "stable"
      };
    })
    .sort((a, b) => b.growth_rate - a.growth_rate);
  }, [filteredData, datasetType, availableYears]);

  const getMetricData = () => {
    switch (metric) {
      case "yield":
        return { dataKey: "avg_yield", color: "#22c55e", name: "Yield (T/Ha)" };
      case "index":
        return { dataKey: "avg_index", color: "#3b82f6", name: "Index" };
      case "trend":
        return { dataKey: "trend", color: "#f59e0b", name: "Trend" };
      default:
        return { dataKey: "avg_index", color: "#3b82f6", name: "Index" };
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
            {datasetType === "yieldIndex" ? "📈 Yield Index" : "📊 Index Data"}
          </h3>
          <p className="text-sm text-gray-600">
            {datasetType === "yieldIndex" 
              ? "Index numbers of yield of principal crops (2007-16)"
              : "Yield index analysis and trends"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {datasetType === "yieldIndex" && (
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="index">Index</option>
              <option value="yield">Yield (T/Ha)</option>
              <option value="trend">Trend</option>
            </select>
          )}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
            <option value="scatter">Scatter Plot</option>
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
            All Crops ({data?.length || 0})
          </button>
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === option
                  ? "bg-blue-600 text-white"
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
            {chartType === "line" ? (
              <LineChart data={datasetType === "yieldIndex" ? yearWiseData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={datasetType === "yieldIndex" ? "year" : "crop"} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, getMetricData().name]} />
                <Line 
                  type="monotone" 
                  dataKey={datasetType === "yieldIndex" ? "avg_index" : getMetricData().dataKey}
                  stroke={getMetricData().color}
                  strokeWidth={3}
                  name={getMetricData().name}
                />
              </LineChart>
            ) : chartType === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="crop" 
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
            ) : chartType === "area" ? (
              <AreaChart data={datasetType === "yieldIndex" ? yearWiseData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={datasetType === "yieldIndex" ? "year" : "crop"} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, getMetricData().name]} />
                <Area 
                  type="monotone" 
                  dataKey={datasetType === "yieldIndex" ? "avg_index" : getMetricData().dataKey}
                  stroke={getMetricData().color}
                  fill={getMetricData().color}
                  fillOpacity={0.3}
                  name={getMetricData().name}
                />
              </AreaChart>
            ) : (
              <ScatterChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crop" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, getMetricData().name]} />
                <Scatter 
                  dataKey={getMetricData().dataKey}
                  fill={getMetricData().color}
                  name={getMetricData().name}
                />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">📈</div>
              <p className="text-gray-500">No yield index data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Crop Performance */}
      {datasetType === "yieldIndex" && cropPerformance.length > 0 && (
        <div className="mt-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Crop Performance (2007-16)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cropPerformance.slice(0, 6).map((crop, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                crop.performance === "positive" ? "bg-green-50" :
                crop.performance === "negative" ? "bg-red-50" : "bg-gray-50"
              }`}>
                <div className="text-sm font-medium text-gray-800 mb-2">{crop.crop}</div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Growth Rate: {crop.growth_rate.toFixed(1)}%</div>
                  <div>First Index: {crop.first_index.toFixed(1)}</div>
                  <div>Last Index: {crop.last_index.toFixed(1)}</div>
                  <div className={`font-medium ${
                    crop.performance === "positive" ? "text-green-600" :
                    crop.performance === "negative" ? "text-red-600" : "text-gray-600"
                  }`}>
                    {crop.performance.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {chartData.length}
            </div>
            <div className="text-xs text-blue-600">Crops</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(chartData.reduce((sum, item) => sum + (item.avg_index || 0), 0) / chartData.length).toFixed(1)}
            </div>
            <div className="text-xs text-green-600">Avg Index</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...chartData.map(item => item.avg_index || 0)).toFixed(1)}
            </div>
            <div className="text-xs text-purple-600">Max Index</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {cropPerformance.filter(crop => crop.performance === "positive").length}
            </div>
            <div className="text-xs text-yellow-600">Growing Crops</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YieldIndexCard;
