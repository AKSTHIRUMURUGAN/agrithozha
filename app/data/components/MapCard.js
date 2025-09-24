"use client";
import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamic imports for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

const MapCard = ({ data, loading }) => {
  const [mapType, setMapType] = useState("street");
  const [filter, setFilter] = useState("all");

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    // Filter by commodity or region
    return data.filter(item => {
      const commodity = item.commodity || item.crop || "";
      const region = item.state || item.district_name || "";
      return commodity.toLowerCase().includes(filter.toLowerCase()) || 
             region.toLowerCase().includes(filter.toLowerCase());
    });
  }, [data, filter]);

  // Get unique commodities for filter options
  const commodities = useMemo(() => {
    if (!data || data.length === 0) return [];
    const unique = [...new Set(data.map(item => item.commodity || item.crop).filter(Boolean))];
    return unique.slice(0, 8); // Limit to 8 for UI
  }, [data]);

  // Filter data with valid coordinates
  const mapData = useMemo(() => {
    return filteredData.filter(item => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    }).slice(0, 100); // Limit to 100 markers for performance
  }, [filteredData]);

  // Calculate map center based on data
  const mapCenter = useMemo(() => {
    if (mapData.length === 0) return [20.5937, 78.9629]; // Default to India center
    
    const avgLat = mapData.reduce((sum, item) => sum + parseFloat(item.latitude), 0) / mapData.length;
    const avgLng = mapData.reduce((sum, item) => sum + parseFloat(item.longitude), 0) / mapData.length;
    
    return [avgLat, avgLng];
  }, [mapData]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
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
            🗺️ Geographic Data Map
          </h3>
          <p className="text-sm text-gray-600">Location-based data visualization</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setMapType("street")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                mapType === "street" 
                  ? "bg-white text-gray-800 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🗺️ Street
            </button>
            <button 
              onClick={() => setMapType("satellite")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                mapType === "satellite" 
                  ? "bg-white text-gray-800 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🛰️ Satellite
            </button>
          </div>
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
            All Locations ({mapData.length})
          </button>
          {commodities.map((commodity) => (
            <button
              key={commodity}
              onClick={() => setFilter(commodity)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === commodity
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {commodity}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
        {mapData.length > 0 ? (
          <MapContainer 
            center={mapCenter} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer 
              url={mapType === 'satellite' 
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
              attribution={mapType === 'satellite' 
                ? '&copy; <a href="https://www.esri.com/">Esri</a>'
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }
            />
            
            {mapData.map((item, idx) => (
              <Marker
                key={idx}
                position={[parseFloat(item.latitude), parseFloat(item.longitude)]}
              >
                <Popup>
                  <div className="p-2">
                    <div className="font-semibold text-sm">
                      {item.commodity || item.crop || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {item.market || item.district_name || item.state || "Unknown Location"}
                    </div>
                    {item.min_price && (
                      <div className="text-xs text-green-600 mt-1">
                        Min Price: ₹{item.min_price}
                      </div>
                    )}
                    {item.max_price && (
                      <div className="text-xs text-red-600">
                        Max Price: ₹{item.max_price}
                      </div>
                    )}
                    {item.production && (
                      <div className="text-xs text-blue-600">
                        Production: {item.production}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">📍</div>
              <p className="text-gray-500">No location data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {mapData.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {mapData.length}
            </div>
            <div className="text-xs text-blue-600">Locations</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {[...new Set(mapData.map(item => item.commodity || item.crop))].length}
            </div>
            <div className="text-xs text-green-600">Commodities</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {[...new Set(mapData.map(item => item.state || item.district_name))].length}
            </div>
            <div className="text-xs text-purple-600">Regions</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCard;
