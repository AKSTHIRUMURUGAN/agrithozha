"use client";
import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const ColdStorageCard = ({ data, loading, datasetType = "coldStorage" }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("pie");
  const [sectorType, setSectorType] = useState("capacity");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by state for cold storage data
    if (datasetType === "coldStorage") {
      return data.filter(item => {
        const state = item.states___uts || item.state || "";
        return state.toLowerCase().includes(filter.toLowerCase());
      });
    }
    
    // Default filtering for other datasets
    return data.filter(item => {
      const commodity = item.commodity || item.crop || "";
      return commodity.toLowerCase().includes(filter.toLowerCase());
    });
  }, [data, filter, datasetType]);

  // Get unique filter options based on dataset type
  const filterOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (datasetType === "coldStorage") {
      const unique = [...new Set(data.map(item => item.states___uts || item.state).filter(Boolean))];
      return unique.slice(0, 10);
    }
    
    // Default for other datasets
    const unique = [...new Set(data.map(item => item.commodity || item.crop).filter(Boolean))];
    return unique.slice(0, 10);
  }, [data, datasetType]);

  // Prepare chart data based on dataset type
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    if (datasetType === "coldStorage") {
      // Process cold storage sector data
      const sectors = ["private", "cooperative", "public"];
      return sectors.map(sector => {
        const sectorData = filteredData.reduce((acc, item) => {
          const count = parseFloat(item[`${sector}_sector__no__`] || 0);
          const capacity = parseFloat(item[`${sector}_sector_capacity__tonnes_`] || 0);
          acc.count += count;
          acc.capacity += capacity;
          return acc;
        }, { count: 0, capacity: 0 });
        
        return {
          name: sector.charAt(0).toUpperCase() + sector.slice(1),
          count: sectorData.count,
          capacity: sectorData.capacity,
          value: sectorType === "capacity" ? sectorData.capacity : sectorData.count
        };
      });
    }
    
    // Default processing for other datasets
    return filteredData.slice(0, 8).map((item, index) => ({
      name: item.commodity || item.crop || `Item ${index + 1}`,
      value: parseFloat(item.storage_capacity || item.production || item.min_price || 0),
      price: parseFloat(item.min_price || item.max_price || 0),
      production: parseFloat(item.production || 0)
    }));
  }, [filteredData, datasetType, sectorType]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

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
            {datasetType === "coldStorage" ? "🧊 Cold Storage Distribution" : "📊 Data Analysis"}
          </h3>
          <p className="text-sm text-gray-600">
            {datasetType === "coldStorage" 
              ? "Sector-wise distribution of cold storages in India" 
              : "Storage capacity and commodity analysis"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {datasetType === "coldStorage" && (
            <select
              value={sectorType}
              onChange={(e) => setSectorType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="capacity">Capacity (Tonnes)</option>
              <option value="count">Number of Units</option>
            </select>
          )}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pie">Pie Chart</option>
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
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "pie" ? (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [
                  value, 
                  datasetType === "coldStorage" 
                    ? (sectorType === "capacity" ? "Capacity (Tonnes)" : "Number of Units")
                    : "Storage Capacity"
                ]} />
              </PieChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8" 
                  name={datasetType === "coldStorage" 
                    ? (sectorType === "capacity" ? "Capacity (Tonnes)" : "Number of Units")
                    : "Storage Capacity"
                  } 
                />
                {datasetType !== "coldStorage" && (
                  <Bar dataKey="price" fill="#82ca9d" name="Price" />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">📊</div>
              <p className="text-gray-500">No data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {datasetType === "coldStorage" ? "3" : chartData.length}
            </div>
            <div className="text-xs text-blue-600">
              {datasetType === "coldStorage" ? "Sectors" : "Total Items"}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {chartData.reduce((sum, item) => sum + item.value, 0).toFixed(0)}
            </div>
            <div className="text-xs text-green-600">
              {datasetType === "coldStorage" 
                ? (sectorType === "capacity" ? "Total Capacity (T)" : "Total Units")
                : "Total Capacity"
              }
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toFixed(0)}
            </div>
            <div className="text-xs text-purple-600">
              {datasetType === "coldStorage" 
                ? (sectorType === "capacity" ? "Avg Capacity (T)" : "Avg Units")
                : "Avg Capacity"
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColdStorageCard;
