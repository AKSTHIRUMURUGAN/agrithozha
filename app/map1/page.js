"use client";
import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Import components dynamically
const MapComponent = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = mod;
    const L = require('leaflet');
    
    // Configure Leaflet icons
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });

    // Helper components
    function MapClickHandler({ isDrawingMode, onMapClick }) {
      const map = useMapEvents({
        click(e) {
          if (isDrawingMode && onMapClick) {
            onMapClick(e.latlng);
          }
        },
      });
      return null;
    }

    function MapCursor({ isDrawingMode }) {
      const map = useMapEvents({});
      
      useEffect(() => {
        if (map) {
          map.getContainer().style.cursor = isDrawingMode ? 'crosshair' : 'grab';
        }
      }, [map, isDrawingMode]);
      
      return null;
    }

    function DrawingPolygon({ drawingPoints }) {
      const map = useMapEvents({});
      
      useEffect(() => {
        if (!map || !drawingPoints || drawingPoints.length < 2) return;
        
        // Clear existing drawing polygons
        map.eachLayer((layer) => {
          if (layer.options?.isDrawingPolygon) {
            map.removeLayer(layer);
          }
        });
        
        // Add polygon outline if we have enough points
        if (drawingPoints.length >= 2) {
          const polygonPoints = drawingPoints.map(point => [point[1], point[0]]);
          const polygon = L.polygon(polygonPoints, {
            color: '#3b82f6',
            weight: 3,
            fillOpacity: 0.2,
            dashArray: '5, 5',
            isDrawingPolygon: true
          });
          polygon.addTo(map);
        }
      }, [map, drawingPoints]);
      
      return null;
    }

    function SelectedPolygon({ selectedPolygon }) {
      const map = useMapEvents({});
      
      useEffect(() => {
        if (!map) return;
        
        // Clear existing selected polygons
        map.eachLayer((layer) => {
          if (layer.options?.isSelectedPolygon) {
            map.removeLayer(layer);
          }
        });
        
        // Add selected polygon if exists
        if (selectedPolygon?.geo_json) {
          const geoJsonLayer = L.geoJSON(selectedPolygon.geo_json, {
            style: { 
              color: '#10b981', 
              weight: 2, 
              fillOpacity: 0.1,
              isSelectedPolygon: true 
            }
          });
          geoJsonLayer.addTo(map);
        }
      }, [map, selectedPolygon]);
      
      return null;
    }

    // Main Map Component
    return function MapComponent({
      center,
      zoom,
      mapType,
      isDrawingMode,
      drawingPoints = [],
      selectedPolygon,
      onMapClick,
      onRemovePoint,
      satSearchResults = [],
      style
    }) {
      const [mapReady, setMapReady] = useState(false);
      
      const tileUrl = mapType === 'satellite' 
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        
      const attribution = mapType === 'satellite' 
        ? '&copy; <a href="https://www.esri.com/">Esri</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

      return (
        <div style={style}>
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            whenReady={() => setMapReady(true)}
          >
            <TileLayer url={tileUrl} attribution={attribution} />
            
            {mapReady && (
              <>
                <MapClickHandler isDrawingMode={isDrawingMode} onMapClick={onMapClick} />
                <MapCursor isDrawingMode={isDrawingMode} />
                <DrawingPolygon drawingPoints={drawingPoints} />
                <SelectedPolygon selectedPolygon={selectedPolygon} />
                
                {/* Drawing point markers */}
                {drawingPoints.map((point, index) => (
                  <Marker 
                    key={`${point[0]}-${point[1]}-${index}`}
                    position={[point[1], point[0]]}
                  >
                    <Popup>
                      <div className="text-center min-w-[150px]">
                        <div className="mb-2">
                          <strong>Point {index + 1}</strong>
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          Lat: {point[1]?.toFixed(6) || 'N/A'}<br/>
                          Lng: {point[0]?.toFixed(6) || 'N/A'}
                        </div>
                        <button 
                          onClick={() => onRemovePoint?.(index)}
                          className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          🗑️ Remove Point
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Sat search results */}
                {Array.isArray(satSearchResults) && satSearchResults.map((result, index) => (
                  <Marker 
                    key={`${result.lat}-${result.lng}-${index}`}
                    position={[result.lat, result.lng]}
                  >
                    <Popup>
                      <div className="text-center min-w-[150px]">
                        <div className="mb-2">
                          <strong>Sat Result {index + 1}</strong>
                        </div>
                        <div className="text-xs text-gray-500">
                          Lat: {result.lat?.toFixed(6) || 'N/A'}<br/>
                          Lng: {result.lng?.toFixed(6) || 'N/A'}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            )}
          </MapContainer>
        </div>
      );
    };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);


export default function MapPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [satSearchResults, setSatSearchResults] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const mapCenter = useMemo(() => [20.5937, 78.9629], []); // Default to India's center
  const [zoom, setZoom] = useState(5);
  const [mapType, setMapType] = useState('satellite');

  // Initialize map and load data
  useEffect(() => {
    // This will only run on client-side
    setIsMounted(true);
    
    // Load Leaflet CSS
    import('leaflet/dist/leaflet.css');
    
    // You can add any initial data loading here
    // For example, load initial satellite search results
    // fetchInitialSatelliteData();
  }, []);

  // Filter out any undefined or invalid points
  const validDrawingPoints = useMemo(() => 
    drawingPoints.filter(
      point => Array.isArray(point) && point.length === 2 && 
              !isNaN(point[0]) && !isNaN(point[1])
    ),
    [drawingPoints]
  );

  const handleMapClick = (latlng) => {
    if (isDrawingMode) {
      setDrawingPoints(prev => [...prev, [latlng.lng, latlng.lat]]);
    }
  };

  const handleRemovePoint = (index) => {
    setDrawingPoints(prev => prev.filter((_, i) => i !== index));
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">Interactive Map</h1>
        <div className="flex items-center space-x-4 mt-2">
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`px-4 py-2 rounded-md ${
              isDrawingMode 
                ? 'bg-red-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}
          >
            {isDrawingMode ? 'Stop Drawing' : 'Start Drawing'}
          </button>
          
          <select
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="satellite">Satellite</option>
            <option value="street">Street</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <MapComponent
          center={mapCenter}
          zoom={zoom}
          mapType={mapType}
          isDrawingMode={isDrawingMode}
          drawingPoints={validDrawingPoints}
          selectedPolygon={selectedPolygon}
          onMapClick={handleMapClick}
          onRemovePoint={handleRemovePoint}
          satSearchResults={satSearchResults}
          style={{ height: '100%', width: '100%' }}
        />
        
        {isDrawingMode && (
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
            <div className="text-sm font-medium mb-2">Drawing Mode Active</div>
            <p className="text-xs text-gray-600 mb-3">Click on the map to add points</p>
            <div className="text-xs text-gray-700">
              Points: {validDrawingPoints.length}
            </div>
            {validDrawingPoints.length > 0 && (
              <button
                onClick={() => setDrawingPoints([])}
                className="mt-2 w-full px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear All Points
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}