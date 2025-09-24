"use client";
import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const MarketPricesCard = ({ data, loading }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [priceType, setPriceType] = useState("min_price");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by market or commodity
    return data.filter(item => {
      const market = item.market || item.commodity || item.crop || "";
      return market.toLowerCase().includes(filter.toLowerCase());
    });
  }, [data, filter]);

  // Get unique markets for filter options
  const markets = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.market || item.commodity || item.crop).filter(Boolean))];
    return unique.slice(0, 10); // Limit to 10 for UI
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    // Group by commodity and calculate price statistics
    const grouped = filteredData.reduce((acc, item) => {
      const commodity = item.commodity || item.crop || "Unknown";
      
      if (!acc[commodity]) {
        acc[commodity] = {
          commodity: commodity,
          min_price: 0,
          max_price: 0,
          avg_price: 0,
          count: 0,
          total_min: 0,
          total_max: 0
        };
      }
      
      const minPrice = parseFloat(item.min_price || 0);
      const maxPrice = parseFloat(item.max_price || 0);
      
      acc[commodity].total_min += minPrice;
      acc[commodity].total_max += maxPrice;
      acc[commodity].count += 1;
      acc[commodity].min_price = Math.min(acc[commodity].min_price || Infinity, minPrice);
      acc[commodity].max_price = Math.max(acc[commodity].max_price || 0, maxPrice);
      
      return acc;
    }, {});
    
    return Object.values(grouped)
      .map(item => ({
        ...item,
        avg_price: (item.total_min + item.total_max) / (2 * item.count),
        price_range: item.max_price - item.min_price
      }))
      .sort((a, b) => b.avg_price - a.avg_price)
      .slice(0, 10); // Top 10 by average price
  }, [filteredData]);

  const getPriceData = () => {
    switch (priceType) {
      case "min_price":
        return { dataKey: "min_price", color: "#ef4444", name: "Min Price" };
      case "max_price":
        return { dataKey: "max_price", color: "#22c55e", name: "Max Price" };
      case "avg_price":
        return { dataKey: "avg_price", color: "#3b82f6", name: "Avg Price" };
      case "price_range":
        return { dataKey: "price_range", color: "#f59e0b", name: "Price Range" };
      default:
        return { dataKey: "min_price", color: "#ef4444", name: "Min Price" };
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
            💰 Market Prices Data
          </h3>
          <p className="text-sm text-gray-600">Price trends and market analysis</p>
        </div>
        <div className="flex gap-2">
          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="min_price">Min Price</option>
            <option value="max_price">Max Price</option>
            <option value="avg_price">Avg Price</option>
            <option value="price_range">Price Range</option>
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="bar">Bar Chart</option>
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
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Markets ({data?.length || 0})
          </button>
          {markets.map((market) => (
            <button
              key={market}
              onClick={() => setFilter(market)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === market
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {market}
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
                <XAxis dataKey="commodity" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={getPriceData().dataKey} fill={getPriceData().color} name={getPriceData().name} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="commodity" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey={getPriceData().dataKey}
                  stroke={getPriceData().color}
                  strokeWidth={3}
                  name={getPriceData().name}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">📊</div>
              <p className="text-gray-500">No price data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {chartData.length}
            </div>
            <div className="text-xs text-yellow-600">Commodities</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {Math.min(...chartData.map(item => item.min_price)).toFixed(0)}
            </div>
            <div className="text-xs text-red-600">Lowest Price</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...chartData.map(item => item.max_price)).toFixed(0)}
            </div>
            <div className="text-xs text-green-600">Highest Price</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {(chartData.reduce((sum, item) => sum + item.avg_price, 0) / chartData.length).toFixed(0)}
            </div>
            <div className="text-xs text-blue-600">Avg Price</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPricesCard;
