"use client";
import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, ScatterChart, Scatter } from "recharts";

const VarietyPricesCard = ({ data, loading, datasetType = "varietyPrices" }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [priceType, setPriceType] = useState("modal");
  const [groupBy, setGroupBy] = useState("commodity");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by commodity, variety, or state for variety prices data
    if (datasetType === "varietyPrices") {
      return data.filter(item => {
        const commodity = item.Commodity || item.commodity || "";
        const variety = item.Variety || item.variety || "";
        const state = item.State || item.state || "";
        const searchTerm = filter.toLowerCase();
        
        return commodity.toLowerCase().includes(searchTerm) ||
               variety.toLowerCase().includes(searchTerm) ||
               state.toLowerCase().includes(searchTerm);
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
    
    if (datasetType === "varietyPrices") {
      const field = groupBy === "commodity" ? "Commodity" : 
                   groupBy === "variety" ? "Variety" : 
                   groupBy === "state" ? "State" : "Commodity";
      
      const unique = [...new Set(data.map(item => item[field]).filter(Boolean))];
      return unique.slice(0, 10);
    }
    
    // Default for other datasets
    const unique = [...new Set(data.map(item => item.commodity || item.crop).filter(Boolean))];
    return unique.slice(0, 10);
  }, [data, datasetType, groupBy]);

  // Get unique states for state filter
  const states = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.State || item.state).filter(Boolean))];
    return unique.slice(0, 15);
  }, [data]);

  // Get unique commodities
  const commodities = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.Commodity || item.commodity).filter(Boolean))];
    return unique.slice(0, 15);
  }, [data]);

  // Get unique varieties
  const varieties = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.Variety || item.variety).filter(Boolean))];
    return unique.slice(0, 15);
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    if (datasetType === "varietyPrices") {
      // Group data based on selected groupBy option
      const grouped = filteredData.reduce((acc, item) => {
        const key = groupBy === "commodity" ? (item.Commodity || item.commodity || "Unknown") :
                   groupBy === "variety" ? (item.Variety || item.variety || "Unknown") :
                   groupBy === "state" ? (item.State || item.state || "Unknown") :
                   (item.Commodity || item.commodity || "Unknown");
        
        if (!acc[key]) {
          acc[key] = {
            name: key,
            min_price: 0,
            max_price: 0,
            modal_price: 0,
            count: 0,
            total_min: 0,
            total_max: 0,
            total_modal: 0
          };
        }
        
        const minPrice = parseFloat(item.Min_Price || item.min_price || 0);
        const maxPrice = parseFloat(item.Max_Price || item.max_price || 0);
        const modalPrice = parseFloat(item.Modal_Price || item.modal_price || 0);
        
        acc[key].total_min += minPrice;
        acc[key].total_max += maxPrice;
        acc[key].total_modal += modalPrice;
        acc[key].count += 1;
        
        // Update min/max for the group
        acc[key].min_price = Math.min(acc[key].min_price || Infinity, minPrice);
        acc[key].max_price = Math.max(acc[key].max_price || 0, maxPrice);
        
        return acc;
      }, {});
      
      // Calculate averages
      Object.values(grouped).forEach(item => {
        item.avg_min = item.total_min / item.count;
        item.avg_max = item.total_max / item.count;
        item.avg_modal = item.total_modal / item.count;
        item.price_range = item.max_price - item.min_price;
      });
      
      return Object.values(grouped)
        .sort((a, b) => b.avg_modal - a.avg_modal)
        .slice(0, 15); // Top 15 items
    }
    
    // Default processing for other datasets
    return filteredData.slice(0, 10).map((item, index) => ({
      name: item.commodity || item.crop || `Item ${index + 1}`,
      min_price: parseFloat(item.min_price || 0),
      max_price: parseFloat(item.max_price || 0),
      modal_price: parseFloat(item.modal_price || 0)
    }));
  }, [filteredData, datasetType, groupBy]);

  // Get price trend data over time
  const trendData = useMemo(() => {
    if (datasetType !== "varietyPrices" || !filteredData.length) return [];
    
    // Group by arrival date
    const grouped = filteredData.reduce((acc, item) => {
      const date = item.Arrival_Date || item.arrival_date || new Date().toISOString().split('T')[0];
      const dateKey = date.split('/').reverse().join('-'); // Convert DD/MM/YYYY to YYYY-MM-DD
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          min_price: 0,
          max_price: 0,
          modal_price: 0,
          count: 0,
          total_min: 0,
          total_max: 0,
          total_modal: 0
        };
      }
      
      const minPrice = parseFloat(item.Min_Price || item.min_price || 0);
      const maxPrice = parseFloat(item.Max_Price || item.max_price || 0);
      const modalPrice = parseFloat(item.Modal_Price || item.modal_price || 0);
      
      acc[dateKey].total_min += minPrice;
      acc[dateKey].total_max += maxPrice;
      acc[dateKey].total_modal += modalPrice;
      acc[dateKey].count += 1;
      
      return acc;
    }, {});
    
    // Calculate averages and sort by date
    return Object.values(grouped)
      .map(item => ({
        ...item,
        avg_min: item.total_min / item.count,
        avg_max: item.total_max / item.count,
        avg_modal: item.total_modal / item.count
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days
  }, [filteredData, datasetType]);

  const getPriceData = () => {
    switch (priceType) {
      case "min":
        return { dataKey: "avg_min", color: "#22c55e", name: "Min Price (₹)" };
      case "max":
        return { dataKey: "avg_max", color: "#ef4444", name: "Max Price (₹)" };
      case "modal":
        return { dataKey: "avg_modal", color: "#3b82f6", name: "Modal Price (₹)" };
      case "range":
        return { dataKey: "price_range", color: "#f59e0b", name: "Price Range (₹)" };
      default:
        return { dataKey: "avg_modal", color: "#3b82f6", name: "Modal Price (₹)" };
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
            {datasetType === "varietyPrices" ? "💰 Variety Prices" : "📊 Price Data"}
          </h3>
          <p className="text-sm text-gray-600">
            {datasetType === "varietyPrices" 
              ? "Variety-wise daily market prices across different markets"
              : "Price analysis and market trends"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {datasetType === "varietyPrices" && (
            <select
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="modal">Modal Price</option>
              <option value="min">Min Price</option>
              <option value="max">Max Price</option>
              <option value="range">Price Range</option>
            </select>
          )}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="scatter">Scatter Plot</option>
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
                ? "bg-blue-600 text-white"
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
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        
        {datasetType === "varietyPrices" && (
          <div className="flex flex-wrap gap-2">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="commodity">Group by Commodity</option>
              <option value="variety">Group by Variety</option>
              <option value="state">Group by State</option>
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
                <Tooltip formatter={(value, name) => [value, getPriceData().name]} />
                <Bar 
                  dataKey={getPriceData().dataKey} 
                  fill={getPriceData().color} 
                  name={getPriceData().name} 
                />
              </BarChart>
            ) : chartType === "line" ? (
              <LineChart data={datasetType === "varietyPrices" ? trendData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={datasetType === "varietyPrices" ? "date" : "name"} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, getPriceData().name]} />
                <Line 
                  type="monotone" 
                  dataKey={getPriceData().dataKey}
                  stroke={getPriceData().color}
                  strokeWidth={3}
                  name={getPriceData().name}
                />
              </LineChart>
            ) : chartType === "area" ? (
              <AreaChart data={datasetType === "varietyPrices" ? trendData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={datasetType === "varietyPrices" ? "date" : "name"} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, getPriceData().name]} />
                <Area 
                  type="monotone" 
                  dataKey={getPriceData().dataKey}
                  stroke={getPriceData().color}
                  fill={getPriceData().color}
                  fillOpacity={0.3}
                  name={getPriceData().name}
                />
              </AreaChart>
            ) : (
              <ScatterChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, getPriceData().name]} />
                <Scatter 
                  dataKey={getPriceData().dataKey}
                  fill={getPriceData().color}
                  name={getPriceData().name}
                />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">💰</div>
              <p className="text-gray-500">No variety prices data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Market Summary */}
      {datasetType === "varietyPrices" && (
        <div className="mt-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Market Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-800 mb-2">States</div>
              <div className="text-xs text-gray-600">{states.length} states covered</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-800 mb-2">Commodities</div>
              <div className="text-xs text-gray-600">{commodities.length} commodities tracked</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-800 mb-2">Varieties</div>
              <div className="text-xs text-gray-600">{varieties.length} varieties available</div>
            </div>
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
            <div className="text-xs text-blue-600">Items</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.min(...chartData.map(item => item.avg_min || item.min_price || 0)).toFixed(0)}
            </div>
            <div className="text-xs text-green-600">Min Price (₹)</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {Math.max(...chartData.map(item => item.avg_max || item.max_price || 0)).toFixed(0)}
            </div>
            <div className="text-xs text-red-600">Max Price (₹)</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {(chartData.reduce((sum, item) => sum + (item.avg_modal || item.modal_price || 0), 0) / chartData.length).toFixed(0)}
            </div>
            <div className="text-xs text-yellow-600">Avg Modal Price (₹)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VarietyPricesCard;
