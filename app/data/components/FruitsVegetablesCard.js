"use client";
import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

const FruitsVegetablesCard = ({ data, loading, datasetType = "fruitsVegetables" }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [metric, setMetric] = useState("production");
  const [category, setCategory] = useState("all");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by country for fruits & vegetables data
    if (datasetType === "fruitsVegetables") {
      return data.filter(item => {
        const country = item.country || "";
        return country.toLowerCase().includes(filter.toLowerCase());
      });
    }
    
    // Default filtering for other datasets
    return data.filter(item => {
      const commodity = item.commodity || item.crop || "";
      return commodity.toLowerCase().includes(filter.toLowerCase());
    });
  }, [data, filter, datasetType]);

  // Get unique countries for filter options
  const filterOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (datasetType === "fruitsVegetables") {
      const unique = [...new Set(data.map(item => item.country).filter(Boolean))];
      return unique.slice(0, 10);
    }
    
    // Default for other datasets
    const unique = [...new Set(data.map(item => item.commodity || item.crop).filter(Boolean))];
    return unique.slice(0, 10);
  }, [data, datasetType]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.category).filter(Boolean))];
    return unique;
  }, [data]);

  // Get available years
  const availableYears = useMemo(() => {
    if (!data || data.length === 0) return [];
    const years = ['2009_10', '2010_11', '2011_12', '2012_13'];
    return years;
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    if (datasetType === "fruitsVegetables") {
      // Process fruits & vegetables data
      return filteredData.map(item => {
        const country = item.country || "Unknown";
        
        // Calculate totals across all years
        let total_area = 0;
        let total_production = 0;
        let total_productivity = 0;
        const years = new Set();
        
        // Extract year-specific data
        availableYears.forEach(yearPattern => {
          const areaField = `area_in_hectare__${yearPattern}`;
          const productionField = `production_in_tonnes__${yearPattern}`;
          const productivityField = `productivity_in_tonnes_hectare__${yearPattern}`;
          
          if (item[areaField] && item[areaField] !== "NA" && item[areaField] !== "0") {
            total_area += parseFloat(item[areaField]) || 0;
            years.add(yearPattern.replace('_', '-'));
          }
          
          if (item[productionField] && item[productionField] !== "NA" && item[productionField] !== "0") {
            total_production += parseFloat(item[productionField]) || 0;
          }
          
          if (item[productivityField] && item[productivityField] !== "NA" && item[productivityField] !== "0") {
            total_productivity += parseFloat(item[productivityField]) || 0;
          }
        });
        
        return {
          country: country,
          category: item.category || "Unknown",
          total_area: total_area,
          total_production: total_production,
          avg_productivity: total_productivity / years.size || 0,
          years: years.size,
          productivity: total_production / (total_area || 1)
        };
      })
      .filter(item => item.total_production > 0) // Only include countries with data
      .sort((a, b) => b.total_production - a.total_production)
      .slice(0, 15); // Top 15 countries
    }
    
    // Default processing for other datasets
    return filteredData.slice(0, 10).map((item, index) => ({
      name: item.commodity || item.crop || `Item ${index + 1}`,
      area: parseFloat(item.area || 0),
      production: parseFloat(item.production || 0),
      value: parseFloat(item.production || 0)
    }));
  }, [filteredData, datasetType, availableYears]);

  // Get year-wise data for line/area charts
  const yearWiseData = useMemo(() => {
    if (datasetType !== "fruitsVegetables" || !filteredData.length) return [];
    
    const yearData = {};
    
    availableYears.forEach(yearPattern => {
      const year = yearPattern.replace('_', '-');
      yearData[year] = {
        year: year,
        total_area: 0,
        total_production: 0,
        total_productivity: 0,
        count: 0
      };
      
      filteredData.forEach(item => {
        const areaField = `area_in_hectare__${yearPattern}`;
        const productionField = `production_in_tonnes__${yearPattern}`;
        const productivityField = `productivity_in_tonnes_hectare__${yearPattern}`;
        
        if (item[areaField] && item[areaField] !== "NA" && item[areaField] !== "0") {
          yearData[year].total_area += parseFloat(item[areaField]) || 0;
        }
        
        if (item[productionField] && item[productionField] !== "NA" && item[productionField] !== "0") {
          yearData[year].total_production += parseFloat(item[productionField]) || 0;
        }
        
        if (item[productivityField] && item[productivityField] !== "NA" && item[productivityField] !== "0") {
          yearData[year].total_productivity += parseFloat(item[productivityField]) || 0;
        }
      });
      
      yearData[year].avg_productivity = yearData[year].total_productivity / (yearData[year].count || 1);
    });
    
    return Object.values(yearData)
      .filter(item => item.total_production > 0) // Only include years with data
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [filteredData, datasetType, availableYears]);

  // Get category breakdown
  const categoryBreakdown = useMemo(() => {
    if (datasetType !== "fruitsVegetables" || !filteredData.length) return [];
    
    const categories = [...new Set(filteredData.map(item => item.category).filter(Boolean))];
    
    return categories.map(cat => {
      const categoryData = filteredData.filter(item => item.category === cat);
      
      return {
        category: cat,
        countries: categoryData.length,
        total_area: categoryData.reduce((sum, item) => {
          let area = 0;
          availableYears.forEach(yearPattern => {
            const areaField = `area_in_hectare__${yearPattern}`;
            if (item[areaField] && item[areaField] !== "NA" && item[areaField] !== "0") {
              area += parseFloat(item[areaField]) || 0;
            }
          });
          return sum + area;
        }, 0),
        total_production: categoryData.reduce((sum, item) => {
          let production = 0;
          availableYears.forEach(yearPattern => {
            const productionField = `production_in_tonnes__${yearPattern}`;
            if (item[productionField] && item[productionField] !== "NA" && item[productionField] !== "0") {
              production += parseFloat(item[productionField]) || 0;
            }
          });
          return sum + production;
        }, 0)
      };
    });
  }, [filteredData, datasetType, availableYears]);

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
            {datasetType === "fruitsVegetables" ? "🍎 Fruits & Vegetables" : "🌱 Production Data"}
          </h3>
          <p className="text-sm text-gray-600">
            {datasetType === "fruitsVegetables" 
              ? "Major fruits & vegetables producing countries (2009-13)"
              : "International production analysis"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {datasetType === "fruitsVegetables" && (
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
            All Countries ({data?.length || 0})
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
        
        {datasetType === "fruitsVegetables" && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("all")}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                category === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
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
                  dataKey={datasetType === "fruitsVegetables" ? "country" : "name"} 
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
              <LineChart data={datasetType === "fruitsVegetables" ? yearWiseData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={datasetType === "fruitsVegetables" ? "year" : "name"} />
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
            ) : chartType === "area" ? (
              <AreaChart data={datasetType === "fruitsVegetables" ? yearWiseData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={datasetType === "fruitsVegetables" ? "year" : "name"} />
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
              <PieChart>
                <Pie
                  data={chartData.slice(0, 8)}
                  dataKey={getMetricData().dataKey}
                  nameKey={datasetType === "fruitsVegetables" ? "country" : "name"}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ country, name, percentage }) => `${country || name} ${percentage}%`}
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
              <div className="text-gray-400 text-4xl mb-2">🍎</div>
              <p className="text-gray-500">No fruits & vegetables data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {datasetType === "fruitsVegetables" && categoryBreakdown.length > 0 && (
        <div className="mt-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryBreakdown.map((cat, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-800 mb-2">{cat.category}</div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Countries: {cat.countries}</div>
                  <div>Area: {cat.total_area.toFixed(0)} Ha</div>
                  <div>Production: {cat.total_production.toFixed(0)} T</div>
                  <div>Productivity: {(cat.total_production / (cat.total_area || 1)).toFixed(1)} T/Ha</div>
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
            <div className="text-xs text-green-600">Countries</div>
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

export default FruitsVegetablesCard;
