"use client";
import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const FertilizerCard = ({ data, loading, datasetType = "fertilizerProduction" }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("line");
  const [timeRange, setTimeRange] = useState("yearly");
  const [metric, setMetric] = useState("quantity");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by product for fertilizer production data
    if (datasetType === "fertilizerProduction") {
      return data.filter(item => {
        const product = item.product || "";
        return product.toLowerCase().includes(filter.toLowerCase());
      });
    }
    
    // Default filtering for other datasets
    return data.filter(item => {
      const commodity = item.commodity || item.crop || item.fertilizer_type || "";
      return commodity.toLowerCase().includes(filter.toLowerCase());
    });
  }, [data, filter, datasetType]);

  // Get unique filter options based on dataset type
  const filterOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (datasetType === "fertilizerProduction") {
      const unique = [...new Set(data.map(item => item.product).filter(Boolean))];
      return unique.slice(0, 8);
    }
    
    // Default for other datasets
    const unique = [...new Set(data.map(item => item.commodity || item.crop || item.fertilizer_type).filter(Boolean))];
    return unique.slice(0, 8);
  }, [data, datasetType]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    if (datasetType === "fertilizerProduction") {
      // Group by year and month for fertilizer production
      const grouped = filteredData.reduce((acc, item) => {
        const year = item._year || item.year || new Date().getFullYear();
        const month = item.month || 1;
        const key = timeRange === "yearly" ? year : `${year}-${month}`;
        
        if (!acc[key]) {
          acc[key] = {
            period: key,
            quantity: 0,
            n_content: 0,
            p_content: 0,
            k_content: 0,
            count: 0
          };
        }
        
        acc[key].quantity += parseFloat(item.quantity_in_000_mts_ || 0);
        acc[key].n_content += parseFloat(item._n_in_000_mts_ || 0);
        acc[key].p_content += parseFloat(item._p_in_000_mts_ || 0);
        acc[key].k_content += parseFloat(item.k_in_000_mts_ || 0);
        acc[key].count += 1;
        
        return acc;
      }, {});
      
      return Object.values(grouped)
        .sort((a, b) => a.period.localeCompare(b.period))
        .slice(-12);
    }
    
    // Default processing for other datasets
    const grouped = filteredData.reduce((acc, item) => {
      const year = item._year || item.year || new Date().getFullYear();
      const key = timeRange === "yearly" ? year : `${year}-${item.month || 1}`;
      
      if (!acc[key]) {
        acc[key] = {
          period: key,
          total_production: 0,
          total_price: 0,
          count: 0,
          min_price: 0,
          max_price: 0
        };
      }
      
      acc[key].total_production += parseFloat(item.production || 0);
      acc[key].total_price += parseFloat(item.min_price || item.max_price || 0);
      acc[key].count += 1;
      acc[key].min_price = Math.min(acc[key].min_price || Infinity, parseFloat(item.min_price || 0));
      acc[key].max_price = Math.max(acc[key].max_price || 0, parseFloat(item.max_price || 0));
      
      return acc;
    }, {});
    
    return Object.values(grouped)
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-12);
  }, [filteredData, timeRange, datasetType]);

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
            {datasetType === "fertilizerProduction" ? "🌱 Fertilizer Production" : "🌱 Fertilizer & Production Data"}
          </h3>
          <p className="text-sm text-gray-600">
            {datasetType === "fertilizerProduction" 
              ? "Product-wise & month-wise fertilizer production with NPK breakdown"
              : "Production trends and price analysis"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {datasetType === "fertilizerProduction" && (
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="quantity">Quantity (000 MT)</option>
              <option value="n_content">N Content</option>
              <option value="p_content">P Content</option>
              <option value="k_content">K Content</option>
            </select>
          )}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
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
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey={datasetType === "fertilizerProduction" ? metric : "total_production"} 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  name={datasetType === "fertilizerProduction" 
                    ? (metric === "quantity" ? "Quantity (000 MT)" : metric.replace("_", " ").toUpperCase())
                    : "Production"
                  }
                />
                {datasetType !== "fertilizerProduction" && (
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="total_price" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Price"
                  />
                )}
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey={datasetType === "fertilizerProduction" ? metric : "total_production"} 
                  fill="#22c55e" 
                  name={datasetType === "fertilizerProduction" 
                    ? (metric === "quantity" ? "Quantity (000 MT)" : metric.replace("_", " ").toUpperCase())
                    : "Production"
                  } 
                />
                {datasetType !== "fertilizerProduction" && (
                  <Bar dataKey="total_price" fill="#f59e0b" name="Price" />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">📈</div>
              <p className="text-gray-500">No data available</p>
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
            <div className="text-xs text-green-600">Periods</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {chartData.reduce((sum, item) => sum + item.total_production, 0).toFixed(0)}
            </div>
            <div className="text-xs text-blue-600">Total Production</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {chartData.reduce((sum, item) => sum + item.total_price, 0).toFixed(0)}
            </div>
            <div className="text-xs text-yellow-600">Total Price</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {(chartData.reduce((sum, item) => sum + item.total_production, 0) / chartData.length).toFixed(0)}
            </div>
            <div className="text-xs text-purple-600">Avg Production</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerCard;
