"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Leaflet dynamic imports for Next.js (avoid SSR)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then(mod => mod.GeoJSON), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
const useMap = dynamic(() => import("react-leaflet").then(mod => mod.useMap), { ssr: false });

// Custom Zoom Control Component
function CustomZoomControl({ onZoomIn, onZoomOut, zoomLevel }) {
  return (
    <div className="leaflet-control leaflet-bar">
      <a 
        className="leaflet-control-zoom-in" 
        href="#" 
        title="Zoom in"
        onClick={(e) => {
          e.preventDefault();
          onZoomIn();
        }}
      >
        +
      </a>
      <a 
        className="leaflet-control-zoom-out" 
        href="#" 
        title="Zoom out"
        onClick={(e) => {
          e.preventDefault();
          onZoomOut();
        }}
      >
        −
      </a>
      <div className="leaflet-control-zoom-level">
        {zoomLevel}
      </div>
    </div>
  );
}

export default function AgroMonitoringDashboard() {
  const API_KEY = process.env.NEXT_PUBLIC_AGRO_KEY; // set this in .env.local
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [geoJsonText, setGeoJsonText] = useState('');
  const [satSearchResults, setSatSearchResults] = useState([]);
  const [ndviHistory, setNdviHistory] = useState([]);
  const [soilData, setSoilData] = useState(null);
  const [uviData, setUviData] = useState(null);
  const [accumTemp, setAccumTemp] = useState([]);
  const [loading, setLoading] = useState(false);
  const [polygonsLoading, setPolygonsLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPolygon, setDrawingPolygon] = useState(null);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [mapType, setMapType] = useState('street'); // 'street' or 'satellite'
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);
  const [mapZoom, setMapZoom] = useState(10);
  const [mapInstance, setMapInstance] = useState(null);
  const mapRef = useRef(null);
  const drawingPoints = useRef([]);

  // Fetch user's polygons
  async function fetchPolygons() {
    setPolygonsLoading(true);
    try {
      const res = await fetch(`https://api.agromonitoring.com/agro/1.0/polygons?appid=${API_KEY}`);
      const data = await res.json();
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setPolygons(data);
      } else {
        console.warn('API returned non-array data:', data);
        setPolygons([]);
      }
    } catch (err) {
      console.error('Failed to fetch polygons', err);
      setPolygons([]);
    } finally {
      setPolygonsLoading(false);
    }
  }

  useEffect(() => { fetchPolygons(); }, []);

  // Cleanup effect for map
  useEffect(() => {
    return () => {
      // Cleanup any map instances if needed
      if (typeof window !== 'undefined' && window.L) {
        // Leaflet cleanup if needed
      }
    };
  }, []);

  // Set map loaded state after component mounts
  useEffect(() => {
    // Simulate map loading delay for better UX
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle map instance creation
  const handleMapCreated = (map) => {
    setMapInstance(map);
    mapRef.current = map;
    
    // Add drawing mode event listeners
    if (isDrawingMode) {
      map.getContainer().style.cursor = 'crosshair';
    }
    
    // Add map ready event
    map.whenReady(() => {
      console.log('Map is ready for polygon drawing');
    });
  };

  // Update map cursor when drawing mode changes
  useEffect(() => {
    if (mapInstance) {
      if (isDrawingMode) {
        mapInstance.getContainer().style.cursor = 'crosshair';
      } else {
        mapInstance.getContainer().style.cursor = 'grab';
      }
    }
  }, [isDrawingMode, mapInstance]);

  // Create polygon (expects valid GeoJSON Feature with Polygon geometry)
  async function createPolygon(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = JSON.parse(geoJsonText);
      const body = { name: `Field ${Date.now()}`, geo_json: payload };
      const res = await fetch(`https://api.agromonitoring.com/agro/1.0/polygons?appid=${API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Create failed');
      await fetchPolygons();
      setGeoJsonText('');
      alert('Polygon created');
    } catch (err) {
      console.error(err); alert('Failed to create polygon: ' + err.message);
    } finally { setLoading(false); }
  }

  // Select polygon and load related data
  async function selectPolygon(poly) {
    setSelectedPolygon(poly);
    // Satellite imagery search: last year range
    const end = Math.floor(Date.now()/1000);
    const start = end - 60*60*24*365; // 1 year
    setLoading(true);
    try {
      const searchUrl = `https://api.agromonitoring.com/agro/1.0/image/search?polyid=${poly.id}&start=${start}&end=${end}&appid=${API_KEY}`;
      const res = await fetch(searchUrl);
      const data = await res.json();
      setSatSearchResults(data || []);

      // NDVI history
      const ndviUrl = `https://api.agromonitoring.com/agro/1.0/ndvi/history?polyid=${poly.id}&start=${start}&end=${end}&appid=${API_KEY}`;
      const ndviRes = await fetch(ndviUrl);
      const ndviJson = await ndviRes.json();
      setNdviHistory(ndviJson || []);

      // Soil data
      const soilRes = await fetch(`https://api.agromonitoring.com/agro/1.0/soil?polyid=${poly.id}&appid=${API_KEY}`);
      const soilJson = await soilRes.json();
      setSoilData(soilJson || null);

      // UVI current and forecast
      const uviRes = await fetch(`https://api.agromonitoring.com/agro/1.0/uvi?polyid=${poly.id}&appid=${API_KEY}`);
      const uviJson = await uviRes.json();
      setUviData(uviJson || null);

      // Accumulated parameters example (temperature)
      const accumRes = await fetch(`https://api.agromonitoring.com/agro/1.0/weather/history/accumulated_temperature?lat=${poly.center[1]}&lon=${poly.center[0]}&start=${start}&end=${end}&appid=${API_KEY}`);
      const accumJson = await accumRes.json();
      setAccumTemp(accumJson || []);

      // set map center and force map re-mount
      if (poly.center) {
        setMapCenter([poly.center[1], poly.center[0]]);
        setMapZoom(12); // Zoom in when selecting polygon
        setMapKey(prev => prev + 1); // Force map re-mount
      }
    } catch (err) {
      console.error('Failed to load polygon data', err);
      alert('Failed to load polygon data');
    } finally {
      setLoading(false);
    }
  }

  // Helper to get tile URL for NDVI / truecolor etc from search result
  function getTileTemplate(item, preset = 'ndvi') {
    // search result 'tile' object contains templates: insert z/x/y
    return item.tile && item.tile[preset] ? item.tile[preset] + `&appid=${API_KEY}` : null;
  }

  // Start drawing mode
  function startDrawing() {
    console.log('Starting drawing mode');
    setIsDrawingMode(true);
    setDrawingPolygon(null);
    drawingPoints.current = [];
    
    // Force map re-render to enable drawing mode
    setMapKey(prev => prev + 1);
  }

  // Stop drawing mode
  function stopDrawing() {
    setIsDrawingMode(false);
    setDrawingPolygon(null);
    drawingPoints.current = [];
  }

  // Handle map click for drawing
  function handleMapClick(e) {
    console.log('Map click event:', e);
    console.log('Drawing mode:', isDrawingMode);
    
    if (!isDrawingMode) {
      console.log('Not in drawing mode, ignoring click');
      return;
    }
    
    console.log('Map clicked in drawing mode:', e.latlng);
    
    const { lat, lng } = e.latlng;
    const newPoint = [lng, lat]; // GeoJSON format: [longitude, latitude]
    
    // Add the new point
    drawingPoints.current.push(newPoint);
    console.log('Drawing points:', drawingPoints.current);
    
    // Create or update drawing polygon with proper GeoJSON structure
    if (drawingPoints.current.length >= 2) {
      // For drawing, we show the polygon as it's being drawn
      const polygonData = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [drawingPoints.current]
        },
        properties: {}
      };
      
      setDrawingPolygon(polygonData);
    }
    
    // Force re-render to show the new point
    setMapKey(prev => prev + 1);
  }

  // Handle map touch for mobile devices
  function handleMapTouch(e) {
    if (!isDrawingMode) return;
    
    console.log('Map touched in drawing mode:', e.latlng);
    handleMapClick(e);
  }

  // Finish drawing and create polygon
  function finishDrawing() {
    if (drawingPoints.current.length < 3) {
      alert('Please draw a polygon with at least 3 points');
      return;
    }

    // Close the polygon by adding the first point at the end
    const closedCoords = [...drawingPoints.current, drawingPoints.current[0]];
    
    const finalPolygon = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [closedCoords]
      },
      properties: {}
    };

    // Convert to GeoJSON text and create polygon
    setGeoJsonText(JSON.stringify(finalPolygon, null, 2));
    console.log('Polygon created:', finalPolygon);
    
    // Show success message and stop drawing
    alert(`Polygon created with ${drawingPoints.current.length} points! Click "Create Polygon" to save it.`);
    stopDrawing();
  }

  // Cancel drawing
  function cancelDrawing() {
    setDrawingPolygon(null);
    drawingPoints.current = [];
    stopDrawing();
  }

  // Clear all drawing points
  function clearDrawingPoints() {
    drawingPoints.current = [];
    setDrawingPolygon(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agrithozh — Polygon & Satellite Dashboard</h1>
          <p className="text-sm text-slate-600">Create polygons, view satellite imagery, NDVI history, soil, UV, and accumulated params</p>
        </div>
        <div className="text-sm text-slate-500">API: AgroMonitoring • Make sure NEXT_PUBLIC_AGRO_KEY is set</div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Polygons list & create */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Create Polygon</h2>
               <div className="flex gap-2">
                 <button 
                   onClick={startDrawing}
                   className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                     isDrawingMode 
                       ? 'bg-green-600 text-white hover:bg-green-700' 
                       : 'bg-blue-600 text-white hover:bg-blue-700'
                   }`}
                 >
                   {isDrawingMode ? '🎯 Drawing Active' : '🗺️ Draw on Map'}
                 </button>
               </div>
          </div>

            <div className="space-y-4">
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste GeoJSON Feature:
                </label>
                <textarea 
                  rows={6} 
                  value={geoJsonText} 
                  onChange={(e)=>setGeoJsonText(e.target.value)} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono" 
                  placeholder='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[ [lon,lat], ... ]]}}' 
                />
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={createPolygon} 
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading || !geoJsonText.trim()}
                >
                  {loading ? 'Creating...' : 'Create Polygon'}
                </button>
                <button 
                  onClick={() => setGeoJsonText('')} 
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Polygons</h2>
            <div className="space-y-3 max-h-96 overflow-auto">
              {polygonsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading polygons...</span>
                </div>
              ) : (!Array.isArray(polygons) || polygons.length===0) ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">🗺️</div>
                  <p className="text-sm text-gray-500">No polygons yet</p>
                  <p className="text-xs text-gray-400 mt-1">Draw or paste a polygon to get started</p>
                </div>
              ) : (
                Array.isArray(polygons) && polygons.map(p => (
                  <div key={p.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm">{p.name || `Polygon ${p.id}`}</div>
                        <div className="text-xs text-gray-500 mt-1">Area: {Math.round(p.area*100)/100} ha</div>
                        <div className="text-xs text-gray-400">ID: {p.id}</div>
                  </div>
                      <button 
                        onClick={()=>selectPolygon(p)} 
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        View
                      </button>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Middle: Map and imagery */}
        <section className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">Map & Imagery</h2>
                {isDrawingMode && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Drawing Mode
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => setMapType('street')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
                      mapType === 'street' 
                        ? 'bg-white text-gray-800 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    🗺️ Street
                  </button>
                  <button 
                    onClick={() => setMapType('satellite')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
                      mapType === 'satellite' 
                        ? 'bg-white text-gray-800 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    🛰️ Satellite
                  </button>
                </div>
                
                {/* Custom Zoom Controls */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
                    className="px-3 py-1.5 text-xs rounded-md transition-colors font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                    title="Zoom In"
                  >
                    🔍+
                  </button>
                  <button 
                    onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 text-xs rounded-md transition-colors font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                    title="Zoom Out"
                  >
                    🔍-
                  </button>
                  <div className="px-2 py-1 text-xs text-gray-500 border-l border-gray-300 ml-1">
                    Zoom: {mapZoom}
                  </div>
                  <div className="px-2 py-1 text-xs text-green-600 border-l border-gray-300 ml-1">
                    {mapType === 'street' ? '🗺️ OSM' : '🛰️ Satellite'}
                  </div>
                </div>
                
                {isDrawingMode && (
                  <div className="flex gap-2">
                    <button 
                      onClick={finishDrawing}
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      ✓ Finish Drawing
                    </button>
                    <button 
                      onClick={cancelDrawing}
                      className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                    >
                      ✕ Cancel
                    </button>
                    <button 
                      onClick={() => {
                        console.log('Current drawing mode:', isDrawingMode);
                        console.log('Current drawing points:', drawingPoints.current);
                        console.log('Current map key:', mapKey);
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      🔍 Debug
                    </button>
                  </div>
                )}
              </div>
            </div>
            
             <div className={`h-[500px] rounded-lg overflow-hidden border border-gray-200 relative ${isDrawingMode ? 'ring-2 ring-blue-500' : ''}`}>
               {isDrawingMode && (
                 <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-blue-200">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                     <span className="text-sm font-semibold text-blue-800">Drawing Instructions</span>
                   </div>
                   <div className="text-xs text-gray-700 space-y-1">
                     <div>• Click or tap on the map to add points</div>
                     <div>• Need at least 3 points to create polygon</div>
                     <div>• Click &ldquo;Finish Drawing&rdquo; when done</div>
                     <div className="text-blue-600 font-medium">Points: {drawingPoints.current.length}</div>
                   </div>
                 </div>
               )}
               {mapLoaded ? (
                 <MapContainer 
                   key={mapKey}
                   center={mapCenter} 
                   zoom={mapZoom} 
                   style={{ 
                     height: '100%', 
                     width: '100%',
                     cursor: isDrawingMode ? 'crosshair' : 'grab'
                   }}
                   whenCreated={handleMapCreated}
                   eventHandlers={{
                     click: handleMapClick,
                     touchstart: handleMapTouch
                   }}
                   zoomControl={true}
                   scrollWheelZoom={!isDrawingMode}
                   doubleClickZoom={!isDrawingMode}
                   dragging={!isDrawingMode}
                   zoomControlOptions={{
                     position: 'topright'
                   }}
                   tap={false}
                   touchZoom={!isDrawingMode}
                   boxZoom={!isDrawingMode}
                   keyboard={!isDrawingMode}
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
                    maxZoom={18}
                    minZoom={1}
                    subdomains={mapType === 'street' ? ['a', 'b', 'c'] : undefined}
                    tileSize={256}
                    zoomOffset={0}
                  />
                  
                   {/* Show drawing polygon */}
                   {drawingPolygon && (
                     <GeoJSON 
                       data={drawingPolygon} 
                       style={{ 
                         color: '#3b82f6', 
                         weight: 3, 
                         fillOpacity: 0.2,
                         dashArray: isDrawingMode ? '5, 5' : 'none'
                       }}
                     />
                   )}
                   
                   {/* Show drawing points as markers */}
                   {isDrawingMode && drawingPoints.current.map((point, index) => (
                     <Marker 
                       key={index} 
                       position={[point[1], point[0]]}
                     >
                       <Popup>
                         <div className="text-center min-w-[200px]">
                           <div className="flex items-center justify-center gap-2 mb-2">
                             <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                               {index + 1}
                             </div>
                             <div className="font-semibold text-blue-600">Drawing Point {index + 1}</div>
                           </div>
                           <div className="text-xs text-gray-500 mb-3 space-y-1">
                             <div>📍 Lat: {point[1].toFixed(6)}</div>
                             <div>📍 Lng: {point[0].toFixed(6)}</div>
                           </div>
                           {index > 0 && (
                             <button 
                               onClick={() => {
                                 drawingPoints.current.splice(index, 1);
                                 setDrawingPolygon(null);
                                 if (drawingPoints.current.length >= 2) {
                                   const polygonData = {
                                     type: "Feature",
                                     geometry: {
                                       type: "Polygon",
                                       coordinates: [drawingPoints.current]
                                     },
                                     properties: {}
                                   };
                                   setDrawingPolygon(polygonData);
                                 }
                               }}
                               className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
                             >
                               🗑️ Remove Point
                             </button>
                           )}
                         </div>
                       </Popup>
                     </Marker>
                   ))}
                   
                {/* show selected polygon geojson */}
                {selectedPolygon && selectedPolygon.geo_json && (
                     <GeoJSON 
                       data={selectedPolygon.geo_json} 
                       style={{ color: '#10b981', weight: 2, fillOpacity: 0.1 }}
                     />
                )}

                {/* show first available NDVI tile overlay (if any search result exists) */}
                {satSearchResults.length>0 && (()=>{
                  const t = getTileTemplate(satSearchResults[0], 'ndvi');
                  return t ? <TileLayer url={t} opacity={0.6} /> : null;
                })()}
              </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 mx-auto"></div>
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Map</h3>
                    <p className="text-sm text-gray-600 mb-4">Initializing OpenStreetMap for polygon drawing...</p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

             {isDrawingMode && (
               <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                       <p className="text-sm font-semibold text-blue-800">
                         🎯 Drawing Mode Active
                       </p>
                     </div>
                     <p className="text-sm text-blue-700 mb-2">
                       Click on the map to add points to your polygon. You need at least 3 points.
                     </p>
                     <div className="flex items-center gap-4 text-xs text-blue-600">
                       <span>📍 Points: <strong>{drawingPoints.current.length}</strong></span>
                       <span>Status: {drawingPoints.current.length < 3 ? 'Need more points' : 'Ready to finish'}</span>
                     </div>
                   </div>
                   <div className="flex gap-2 flex-shrink-0">
                     {drawingPoints.current.length > 0 && (
                       <button 
                         onClick={clearDrawingPoints}
                         className="px-3 py-2 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium"
                       >
                         🗑️ Clear Points
                       </button>
                     )}
                     <button 
                       onClick={finishDrawing}
                       className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                         drawingPoints.current.length < 3
                           ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                           : 'bg-green-600 text-white hover:bg-green-700'
                       }`}
                       disabled={drawingPoints.current.length < 3}
                     >
                       ✓ Finish ({drawingPoints.current.length} points)
                     </button>
                     <button 
                       onClick={cancelDrawing}
                       className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                     >
                       ✕ Cancel
                     </button>
                   </div>
                 </div>
               </div>
             )}

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Satellite Imagery</h3>
              {satSearchResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {satSearchResults.slice(0,4).map((s, idx) => (
                    <div key={idx} className="p-3 border border-gray-200 rounded-lg bg-gray-50 hover:shadow-sm transition-shadow">
                      <div className="text-xs font-medium text-gray-800 mb-1">
                        {new Date(s.dt*1000).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Type: {s.type} • Cloud: {s.cl}%
                      </div>
                      <div className="aspect-square rounded overflow-hidden">
                        {s.image && s.image.ndvi ? (
                          <img 
                            src={`${s.image.ndvi}?appid=${API_KEY}`} 
                            alt="NDVI" 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{display: s.image && s.image.ndvi ? 'none' : 'flex'}}>
                          <span className="text-xs text-gray-500">No image available</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 text-2xl mb-2">🛰️</div>
                  <p className="text-sm text-gray-500">No satellite imagery available</p>
                  <p className="text-xs text-gray-400 mt-1">Select a polygon to load imagery</p>
                </div>
              )}
            </div>
          </div>

          {/* NDVI history chart */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-2">NDVI History (daily)</h2>
            {ndviHistory.length>0 ? (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={ndviHistory.map(d=>({date: new Date(d.dt*1000).toLocaleDateString(), mean: d.data.mean}))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="mean" stroke="#22c55e" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No NDVI history for selected polygon</p>
            )}
          </div>
        </section>

        {/* Right column: Data cards */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Soil Data</h3>
            {soilData ? (
              <div className="mt-2 text-sm text-slate-700">
                <div>Surface Temp: {(soilData.t0 - 273.15).toFixed(1)} °C</div>
                <div>10cm Temp: {(soilData.t10 - 273.15).toFixed(1)} °C</div>
                <div>Moisture: {soilData.moisture}</div>
              </div>
            ) : <p className="text-sm text-slate-500">Select polygon to load soil data</p>}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">UV Index</h3>
            {uviData ? <div className="mt-2">UVI: {uviData.uvi}</div> : <p className="text-sm text-slate-500">Select polygon to load UVI</p>}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Accumulated Temperature</h3>
            {accumTemp.length>0 ? (
              <div className="text-sm mt-2 space-y-1 max-h-48 overflow-auto">
                {accumTemp.slice(-10).map((a,i)=> (
                  <div key={i} className="flex justify-between"><div>{new Date(a.dt*1000).toLocaleDateString()}</div><div>{a.count}</div></div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-500">Select polygon to load accumulated temp</p>}
          </div>
        </aside>
      </main>

      <footer className="max-w-7xl mx-auto mt-6 text-sm text-slate-500">Data provided by AgroMonitoring APIs</footer>
    </div>
  );
}
