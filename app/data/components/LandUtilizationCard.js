"use client";
import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";

const LandUtilizationCard = ({ data, loading, datasetType = "landUtilization" }) => {
  const [filter, setFilter] = useState("all");
  const [chartType, setChartType] = useState("pie");
  const [metric, setMetric] = useState("area");
  const [yearFilter, setYearFilter] = useState("latest");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by state for land utilization data
    if (datasetType === "landUtilization" || datasetType === "landUtilizationDetailed") {
      return data.filter(item => {
        const state = item.state || item.states___uts || item.reporting_area_for_land_utilisation_statistics || "";
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
    
    if (datasetType === "landUtilization" || datasetType === "landUtilizationDetailed") {
      const unique = [...new Set(data.map(item => 
        item.state || item.states___uts || item.reporting_area_for_land_utilisation_statistics
      ).filter(Boolean))];
      return unique.slice(0, 10);
    }
    
    // Default for other datasets
    const unique = [...new Set(data.map(item => item.commodity || item.crop).filter(Boolean))];
    return unique.slice(0, 10);
  }, [data, datasetType]);

  // Get available years
  const availableYears = useMemo(() => {
    if (!data || data.length === 0) return [];
    const years = [...new Set(data.map(item => item._year || item.year || item.year__1_).filter(Boolean))];
    return years.sort();
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    if (datasetType === "landUtilization" || datasetType === "landUtilizationDetailed") {
      // Process land utilization data - handle both API response formats
      const landCategories = [
        { key: "forests__4_", name: "Forests", color: "#22c55e" },
        { key: "not_available_for_cultivation_total__col_5_6___7_", name: "Not Available", color: "#6b7280" },
        { key: "other_uncultivated_land_excluding_fallow_land_permanent_pastures___other_grazing_lands__8_", name: "Pastures", color: "#84cc16" },
        { key: "other_uncultivated_land_excluding_fallow_land_land_under_misc_tree_crops___groves__not_incl__in_net_area_sown___9_", name: "Tree Crops", color: "#16a34a" },
        { key: "other_uncultivated_land_excluding_fallow_land_culturable_waste_land__10_", name: "Culturable Waste", color: "#ca8a04" },
        { key: "fallow_lands_fallow_lands_other_than_current_fallows__12_", name: "Fallow Lands", color: "#ea580c" },
        { key: "fallow_lands_current_fallows__13_", name: "Current Fallows", color: "#dc2626" },
        { key: "net_area_sown__15_", name: "Net Area Sown", color: "#059669" },
        { key: "area_sown_more_than_once__col_16_15___17_", name: "Area Sown More", color: "#0d9488" }
      ];

      // Get latest year data or specific year
      let yearData = filteredData;
      if (yearFilter !== "all" && yearFilter !== "latest") {
        yearData = filteredData.filter(item => (item._year || item.year || item.year__1_) == yearFilter);
      } else if (yearFilter === "latest" && availableYears.length > 0) {
        const latestYear = Math.max(...availableYears);
        yearData = filteredData.filter(item => (item._year || item.year || item.year__1_) == latestYear);
      }

      return landCategories.map(category => {
        const totalArea = yearData.reduce((sum, item) => {
          return sum + parseFloat(item[category.key] || 0);
        }, 0);

        return {
          name: category.name,
          value: totalArea,
          color: category.color,
          percentage: 0 // Will be calculated after total is known
        };
      }).filter(item => item.value > 0);
    }
    
    // Default processing for other datasets
    return filteredData.slice(0, 8).map((item, index) => ({
      name: item.commodity || item.crop || `Item ${index + 1}`,
      value: parseFloat(item.area || item.production || 0)
    }));
  }, [filteredData, datasetType, yearFilter, availableYears]);

  // Calculate percentages for pie chart
  const chartDataWithPercentages = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    return chartData.map(item => ({
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1)
    }));
  }, [chartData]);

  // Get year-wise trend data
  const trendData = useMemo(() => {
    if (datasetType !== "landUtilization" && datasetType !== "landUtilizationDetailed") return [];
    if (availableYears.length < 2) return [];

    return availableYears.map(year => {
      const yearData = filteredData.filter(item => (item._year || item.year || item.year__1_) == year);
      
      return {
        year: year,
        net_area_sown: yearData.reduce((sum, item) => sum + parseFloat(item.net_area_sown__15_ || 0), 0),
        forests: yearData.reduce((sum, item) => sum + parseFloat(item.forests__4_ || 0), 0),
        not_available: yearData.reduce((sum, item) => sum + parseFloat(item.not_available_for_cultivation_total__col_5_6___7_ || 0), 0),
        total_area: yearData.reduce((sum, item) => sum + parseFloat(item.total_cropped_area__16_ || 0), 0)
      };
    }).sort((a, b) => a.year - b.year);
  }, [filteredData, datasetType, availableYears]);

  const COLORS = ['#22c55e', '#6b7280', '#84cc16', '#16a34a', '#ca8a04', '#ea580c', '#dc2626', '#059669', '#0d9488'];

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
            {datasetType === "landUtilization" || datasetType === "landUtilizationDetailed" 
              ? "🌍 Land Utilization" 
              : "📊 Land Data"
            }
          </h3>
          <p className="text-sm text-gray-600">
            {datasetType === "landUtilization" || datasetType === "landUtilizationDetailed"
              ? "Land utilization patterns and statistics (2000-14)"
              : "Land use analysis and patterns"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {(datasetType === "landUtilization" || datasetType === "landUtilizationDetailed") && (
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="latest">Latest Year</option>
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="pie">Pie Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Trend Chart</option>
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
            All Areas ({data?.length || 0})
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
        {chartDataWithPercentages.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "pie" ? (
              <PieChart>
                <Pie
                  data={chartDataWithPercentages}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                >
                  {chartDataWithPercentages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Area (Hectares)']} />
              </PieChart>
            ) : chartType === "bar" ? (
              <BarChart data={chartDataWithPercentages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" name="Area (Hectares)" />
              </BarChart>
            ) : (
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="net_area_sown" stroke="#059669" strokeWidth={3} name="Net Area Sown" />
                <Line type="monotone" dataKey="forests" stroke="#22c55e" strokeWidth={2} name="Forests" />
                <Line type="monotone" dataKey="not_available" stroke="#6b7280" strokeWidth={2} name="Not Available" />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">🌍</div>
              <p className="text-gray-500">No land utilization data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {chartDataWithPercentages.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {chartDataWithPercentages.length}
            </div>
            <div className="text-xs text-green-600">Land Categories</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {chartDataWithPercentages.reduce((sum, item) => sum + item.value, 0).toFixed(0)}
            </div>
            <div className="text-xs text-blue-600">Total Area (Ha)</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {chartDataWithPercentages.find(item => item.name === "Net Area Sown")?.percentage || "0"}%
            </div>
            <div className="text-xs text-purple-600">Net Area Sown</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {chartDataWithPercentages.find(item => item.name === "Forests")?.percentage || "0"}%
            </div>
            <div className="text-xs text-yellow-600">Forest Cover</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandUtilizationCard;
