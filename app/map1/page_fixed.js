"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiMap, FiLayers, FiSun, FiDroplet, FiThermometer } from 'react-icons/fi';
import { FaLeaf, FaWater, FaWind, FaTemperatureHigh, FaCloudRain, FaSun } from 'react-icons/fa';

// Import components
import PolygonManager from './components/PolygonManager';
import NDVICard from './components/NDVICard';
import WeatherCard from './components/WeatherCard';
import SoilCard from './components/SoilCard';
import UVIndexCard from './components/UVIndexCard';

// Configure Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Dynamically import MapComponent with all necessary Leaflet components
const MapComponent = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = mod;
    
    // Helper components
    function MapClickHandler({ isDrawingMode, onMapClick }) {
      useMapEvents({
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
        if (selectedPolygon?.coordinates) {
          const polygon = L.polygon(selectedPolygon.coordinates, {
            color: '#10b981',
            weight: 2,
            fillOpacity: 0.1,
            isSelectedPolygon: true
          });
          polygon.addTo(map);
          
          // Fit bounds to the polygon
          map.fitBounds(polygon.getBounds(), { padding: [50, 50] });
        }
      }, [map, selectedPolygon]);
      
      return null;
    }

    // Main Map Component
    return function MapComponent({
      center = [51.505, -0.09],
      zoom = 13,
      mapType = 'standard',
      isDrawingMode = false,
      drawingPoints = [],
      selectedPolygon = null,
      onMapClick = () => {},
      onRemovePoint = () => {},
      satSearchResults = [],
      style = { height: '100%', width: '100%' }
    }) {
      const [mapReady, setMapReady] = useState(false);
      const mapRef = useRef(null);
      
      const tileUrl = useMemo(() => {
        return mapType === 'satellite' 
          ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      }, [mapType]);
      
      const attribution = useMemo(() => {
        return mapType === 'satellite' 
          ? '&copy; <a href="https://www.esri.com/">Esri</a>'
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
      }, [mapType]);

      return (
        <div style={style}>
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            whenReady={() => setMapReady(true)}
            whenCreated={(map) => {
              mapRef.current = map;
            }}
          >
            <TileLayer url={tileUrl} attribution={attribution} />
            
            {mapReady && (
              <>
                <MapClickHandler isDrawingMode={isDrawingMode} onMapClick={onMapClick} />
                <MapCursor isDrawingMode={isDrawingMode} />
                <DrawingPolygon drawingPoints={drawingPoints} />
                <SelectedPolygon selectedPolygon={selectedPolygon} />
                
                {/* Drawing Points */}
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
                          onClick={() => onRemovePoint(index)}
                          className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          🗑️ Remove Point
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Satellite Search Results */}
                {satSearchResults.map((result, index) => (
                  <Marker 
                    key={`result-${index}`}
                    position={[result.lat, result.lng]}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-medium">{result.title}</div>
                        <div className="text-xs text-gray-500">{result.description}</div>
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

// Function to generate sample polygon data
function generateSamplePolygon() {
  const centerLat = 51.505;
  const centerLng = -0.09;
  const radius = 0.01;
  const points = 6;
  
  const polygon = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * (Math.PI * 2);
    const lat = centerLat + Math.sin(angle) * radius;
    const lng = centerLng + Math.cos(angle) * radius;
    polygon.push([lat, lng]);
  }
  
  return {
    id: 'sample-' + Date.now(),
    name: 'Sample Field',
    coordinates: polygon,
    area: '1.2 ha',
    cropType: 'Corn',
    lastUpdated: new Date().toISOString()
  };
}

export default function MapPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [activeTab, setActiveTab] = useState('polygons');
  const [mapType, setMapType] = useState('standard');
  
  // Sample data states
  const [ndviData, setNdviData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [uvData, setUvData] = useState(null);
  
  // Load sample data on mount
  useEffect(() => {
    setIsMounted(true);
    
    // Simulate API calls
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load sample polygons
      const samplePolygon = generateSamplePolygon();
      setPolygons([samplePolygon]);
      setSelectedPolygon(samplePolygon);
      
      // Load sample NDVI data
      setNdviData({
        current: 0.78,
        trend: 'increasing',
        history: Array(7).fill(0).map((_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          value: 0.6 + (Math.random() * 0.4)
        })),
        recommendations: [
          'Optimal growth conditions detected',
          'Consider irrigation in the next 3 days',
          'Fertilizer application recommended next week'
        ]
      });
      
      // Load sample weather data
      setWeatherData({
        current: {
          temp: 24.5,
          condition: 'Partly Cloudy',
          humidity: 65,
          wind: 12.3,
          precipitation: 0.5,
          icon: 'partly-cloudy-day'
        },
        hourly: Array(24).fill(0).map((_, i) => ({
          time: `${i}:00`,
          temp: 20 + Math.sin(i / 24 * Math.PI) * 8,
          condition: i > 6 && i < 18 ? 'sunny' : 'clear-night',
          precipitation: Math.random() > 0.8 ? Math.random() * 5 : 0
        })),
        forecast: Array(7).fill(0).map((_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          high: 25 + Math.sin(i) * 3,
          low: 15 + Math.sin(i) * 2,
          condition: ['sunny', 'partly-cloudy', 'cloudy', 'rain'][Math.floor(Math.random() * 4)],
          precipitation: Math.random() > 0.6 ? Math.random() * 10 : 0
        }))
      });
      
      // Load sample soil data
      setSoilData({
        moisture: 0.42,
        temperature: 18.7,
        ph: 6.8,
        nutrients: {
          nitrogen: 'medium',
          phosphorus: 'high',
          potassium: 'low',
          organicMatter: 2.1
        },
        recommendations: [
          'Add potassium-rich fertilizer',
          'Maintain current irrigation schedule',
          'Test soil pH again in 2 weeks'
        ]
      });
      
      // Load sample UV data
      setUvData({
        current: 6.5,
        maxDaily: 8.2,
        hourly: Array(24).fill(0).map((_, i) => ({
          hour: `${i}:00`,
          uv: i > 6 && i < 18 ? Math.sin((i - 6) / 12 * Math.PI) * 8.2 : 0
        })),
        protectionTips: [
          'Wear protective clothing',
          'Use SPF 30+ sunscreen',
          'Seek shade during midday hours'
        ]
      });
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Filter out any undefined or invalid points
  const validDrawingPoints = useMemo(() => {
    return drawingPoints.filter(
      point => point && point.length === 2 && 
              !isNaN(point[0]) && !isNaN(point[1])
    );
  }, [drawingPoints]);

  // Handle map click when in drawing mode
  const handleMapClick = useCallback((latlng) => {
    if (isDrawingMode) {
      setDrawingPoints(prev => [...prev, [latlng.lat, latlng.lng]]);
    }
  }, [isDrawingMode]);

  // Handle starting a new drawing
  const handleStartDrawing = useCallback((coordinates = null) => {
    if (coordinates) {
      setDrawingPoints(coordinates);
    } else {
      setDrawingPoints([]);
    }
    setIsDrawingMode(true);
  }, []);

  // Handle canceling the current drawing
  const handleCancelDrawing = useCallback(() => {
    setDrawingPoints([]);
    setIsDrawingMode(false);
  }, []);

  // Handle saving the current polygon
  const handleSavePolygon = useCallback((polygonId = null) => {
    if (validDrawingPoints.length < 3) return;
    
    const newPolygon = {
      id: polygonId || `polygon-${Date.now()}`,
      name: `Field ${polygons.length + 1}`,
      coordinates: validDrawingPoints.map(point => [point[0], point[1]]),
      area: `${(Math.random() * 5 + 1).toFixed(1)} ha`,
      cropType: ['Corn', 'Wheat', 'Soybean', 'Rice', 'Cotton'][Math.floor(Math.random() * 5)],
      lastUpdated: new Date().toISOString()
    };
    
    if (polygonId) {
      // Update existing polygon
      setPolygons(prev => 
        prev.map(p => p.id === polygonId ? newPolygon : p)
      );
      setSelectedPolygon(newPolygon);
    } else {
      // Add new polygon
      setPolygons(prev => [...prev, newPolygon]);
      setSelectedPolygon(newPolygon);
    }
    
    // Reset drawing state
    setDrawingPoints([]);
    setIsDrawingMode(false);
  }, [validDrawingPoints, polygons]);

  // Handle polygon selection
  const handlePolygonSelect = useCallback((polygon) => {
    setSelectedPolygon(polygon);
    setActiveTab('ndvi'); // Switch to NDVI tab when a polygon is selected
  }, []);

  // Handle polygon deletion
  const handlePolygonDelete = useCallback((polygonId) => {
    setPolygons(prev => prev.filter(p => p.id !== polygonId));
    if (selectedPolygon?.id === polygonId) {
      setSelectedPolygon(null);
    }
  }, [selectedPolygon]);

  // Handle clearing all points
  const handleClearPoints = useCallback(() => {
    setDrawingPoints([]);
  }, []);

  // Handle removing a specific point
  const handleRemovePoint = useCallback((index) => {
    setDrawingPoints(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Show loading state while mounting
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

  // Render the appropriate content based on the active tab
  const renderTabContent = () => {
    const tabProps = {
      isLoading,
      selectedPolygon
    };

    switch(activeTab) {
      case 'polygons':
        return (
          <PolygonManager
            polygons={polygons}
            selectedPolygon={selectedPolygon}
            isDrawingMode={isDrawingMode}
            drawingPoints={validDrawingPoints}
            onPolygonSelect={handlePolygonSelect}
            onPolygonDelete={handlePolygonDelete}
            onStartDrawing={handleStartDrawing}
            onCancelDrawing={handleCancelDrawing}
            onSavePolygon={handleSavePolygon}
            onClearPoints={handleClearPoints}
            onRemovePoint={handleRemovePoint}
          />
        );
        
      case 'ndvi':
        return <NDVICard ndviData={ndviData} {...tabProps} />;
        
      case 'weather':
        return <WeatherCard weatherData={weatherData} {...tabProps} />;
        
      case 'soil':
        return <SoilCard soilData={soilData} {...tabProps} />;
        
      case 'uv':
        return <UVIndexCard uvData={uvData} weatherCondition={weatherData?.condition} {...tabProps} />;
        
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Field Management</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMapType(prev => prev === 'satellite' ? 'standard' : 'satellite')}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex items-center"
            >
              {mapType === 'satellite' ? (
                <>
                  <FiMap className="mr-1.5 h-4 w-4" />
                  Map View
                </>
              ) : (
                <>
                  <FiLayers className="mr-1.5 h-4 w-4" />
                  Satellite View
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {['polygons', 'ndvi', 'weather', 'soil', 'uv'].map((tab) => {
              const icons = {
                polygons: <FiMap className="h-4 w-4 mr-2" />,
                ndvi: <FaLeaf className="h-4 w-4 mr-2 text-green-600" />,
                weather: <FiSun className="h-4 w-4 mr-2 text-yellow-500" />,
                soil: <FiDroplet className="h-4 w-4 mr-2 text-amber-800" />,
                uv: <FaSun className="h-4 w-4 mr-2 text-orange-500" />
              };
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {icons[tab]}
                  <span className="capitalize">{tab}</span>
                </button>
              );
            })}
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderTabContent()}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapComponent
            center={selectedPolygon?.coordinates?.length > 0 
              ? [
                  selectedPolygon.coordinates[0][0], 
                  selectedPolygon.coordinates[0][1]
                ] 
              : [51.505, -0.09]}
            zoom={selectedPolygon ? 14 : 13}
            mapType={mapType}
            isDrawingMode={isDrawingMode}
            drawingPoints={validDrawingPoints}
            selectedPolygon={selectedPolygon}
            onMapClick={handleMapClick}
            onRemovePoint={handleRemovePoint}
            style={{ height: '100%' }}
          />
          
          {/* Current Location Button */}
          <button
            onClick={() => {
              // In a real app, this would get the user's current location
              // For now, we'll just center on the selected polygon or default
              console.log('Center on current location');
            }}
            className="absolute bottom-6 right-6 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            title="Center on my location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
