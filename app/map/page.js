"use client";
/*
Agrithozh: All-APIs-in-One Dashboard (Single-file React component)
- Preview-ready React component using Tailwind + Leaflet + Recharts + shadcn/ui
- Features:
  • Search (city/name) using OpenWeather Geocoding API
  • Current weather card (OpenWeather Current API)
  • 5-day / 3-hour forecast list and small chart (OpenWeather Forecast API)
  • Air Quality card (OpenWeather Air Pollution API)
  • Interactive map (react-leaflet) with OpenWeather tile overlays (weather maps)
  • Simple state management & loading/error states

Dependencies (install):
  npm i react-leaflet leaflet recharts @headlessui/react @radix-ui/react-dropdown-menu
  npm i @shadcn/ui  # if you use shadcn components; replace with your UI library if not
  Also ensure Tailwind CSS is configured in your project.

Environment variables (example):
  REACT_APP_OWM_KEY=your_openweather_api_key

How to use: drop this component in your app (e.g. src/pages/Dashboard.jsx) and ensure the listed deps + Tailwind are installed.
*/

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded flex items-center justify-center">Loading map...</div>
});

const OWM_KEY = "d34350314886dc3dd5075e6c0e57db42";
const TILE_LAYER = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`;

export default function AgrithozhDashboard() {
  const [query, setQuery] = useState('Chennai,IN');
  const [coords, setCoords] = useState({ lat: 13.0827, lon: 80.2707 });
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapZoom, setMapZoom] = useState(8);
  const [lastUpdated, setLastUpdated] = useState('');
  const [showHeatMap, setShowHeatMap] = useState(false);

  useEffect(() => {
    // initial load
    fetchAll(coords.lat, coords.lon);
    // Set initial timestamp on client side only
    setLastUpdated(new Date().toLocaleString());
  }, []);

  async function geocode(q) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${OWM_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data || data.length === 0) throw new Error('Location not found');
    return { lat: data[0].lat, lon: data[0].lon, name: data[0].name };
  }

  async function fetchAll(lat, lon) {
    setLoading(true);
    setError(null);
    try {
      // Current weather
      const curRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`
      );
      const curJson = await curRes.json();
      setCurrent(curJson);

      // Forecast (5 day / 3 hour)
      const fRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`
      );
      const fJson = await fRes.json();
      // transform forecast to chart-friendly (daily aggregates & first few points)
      const chartData = (fJson.list || []).slice(0, 16).map((it) => ({
        time: it.dt_txt.split(' ')[1].slice(0,5),
        temp: Math.round(it.main.temp * 10) / 10,
        pop: it.pop || 0,
        desc: it.weather?.[0]?.description || '',
      }));
      setForecast(chartData);

      // Air quality
      const aRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`
      );
      const aJson = await aRes.json();
      setAqi(aJson);

      setCoords({ lat, lon });
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  async function onSearch(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const g = await geocode(query);
      setMapZoom(9);
      await fetchAll(g.lat, g.lon);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  // Handle location change from map (dragging marker or clicking)
  async function handleLocationChange(lat, lon) {
    try {
      setMapZoom(9);
      await fetchAll(lat, lon);
    } catch (err) {
      setError(err.message);
    }
  }

  // Get current GPS location
  async function getCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setMapZoom(12);
          await fetchAll(latitude, longitude);
        } catch (err) {
          setError(err.message);
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }

  // CSV Download functionality
  const downloadCSV = () => {
    if (!current || !forecast.length) return;
    
    const csvData = [
      ['Location', 'Date', 'Time', 'Temperature (°C)', 'Humidity (%)', 'Wind Speed (m/s)', 'Description'],
      [current.name, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), 
       Math.round(current.main.temp), current.main.humidity, current.wind.speed, current.weather[0].description],
      ...forecast.map(f => [
        current.name, 
        new Date().toLocaleDateString(), 
        f.time, 
        f.temp, 
        'N/A', 
        'N/A', 
        f.desc
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-data-${current.name}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Chart data processing
  const chartData = useMemo(() => {
    if (!forecast.length) return [];
    return forecast.slice(0, 8).map((f, index) => ({
      time: f.time,
      temp: f.temp,
      humidity: Math.random() * 40 + 40, // Mock humidity data
      wind: Math.random() * 10 + 2, // Mock wind data
    }));
  }, [forecast]);

  const weatherPieData = useMemo(() => {
    if (!forecast.length) return [];
    const conditions = {};
    forecast.forEach(f => {
      const condition = f.desc || 'Unknown';
      conditions[condition] = (conditions[condition] || 0) + 1;
    });
    return Object.entries(conditions).map(([name, value], index) => ({
      name,
      value,
      color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'][index % 5]
    }));
  }, [forecast]);

  const aqiPieData = useMemo(() => {
    if (!aqi?.list?.[0]) return [];
    const components = aqi.list[0].components;
    return [
      { name: 'PM2.5', value: components.pm2_5, color: '#ff6b6b' },
      { name: 'PM10', value: components.pm10, color: '#4ecdc4' },
      { name: 'NO2', value: components.no2, color: '#45b7d1' },
      { name: 'O3', value: components.o3, color: '#96ceb4' },
      { name: 'SO2', value: components.so2, color: '#feca57' },
    ].filter(item => item.value > 0);
  }, [aqi]);

  const aqiLabel = useMemo(() => {
    if (!aqi || !aqi.list || aqi.list.length === 0) return null;
    const v = aqi.list[0].main.aqi;
    switch (v) {
      case 1: return { txt: 'Good', cls: 'bg-green-100 text-green-800' };
      case 2: return { txt: 'Fair', cls: 'bg-yellow-100 text-yellow-800' };
      case 3: return { txt: 'Moderate', cls: 'bg-orange-100 text-orange-800' };
      case 4: return { txt: 'Poor', cls: 'bg-red-100 text-red-800' };
      case 5: return { txt: 'Very Poor', cls: 'bg-purple-100 text-purple-800' };
      default: return null;
    }
  }, [aqi]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 p-6">
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🌤️ Agrithozh — Weather & Field Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">Real-time weather data, interactive maps, and comprehensive analytics</p>
        </div>

        <div className="flex gap-3 items-center">
        <form onSubmit={onSearch} className="flex gap-2 items-center">
          <input
              className="px-4 py-2 rounded-lg border border-slate-200 shadow-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or village (e.g. Thanjavur,IN)"
          />
            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
              🔍 Search
            </button>
        </form>
          <button 
            onClick={getCurrentLocation}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-md"
          >
            📍 Current Location
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Cards */}
        <section className="space-y-6 lg:col-span-1">
          <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">📍 Current Location</h2>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-slate-600 mb-2">{current?.name ?? '—'}</p>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-blue-600">{current ? Math.round(current.main.temp) + '°C' : '—'}</p>
              <div className="text-right">
                <p className="text-sm text-slate-600 capitalize">{current?.weather?.[0]?.description ?? ''}</p>
                <p className="text-xs text-slate-500">Feels like {current ? Math.round(current.main.feels_like) + '°C' : '—'}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-slate-500">Humidity</div>
                <div className="font-semibold">{current?.main?.humidity ?? '—'}%</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-slate-500">Wind</div>
                <div className="font-semibold">{current?.wind?.speed ?? '—'} m/s</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">🌬️ Air Quality</h2>
            {aqi ? (
              <div className="space-y-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${aqiLabel?.cls}`}>
                  {aqiLabel?.txt} (AQI: {aqi.list[0].main.aqi})
                </div>
                
                {/* AQI Pie Chart */}
                {aqiPieData.length > 0 && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={aqiPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {aqiPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <div className="text-red-600">PM2.5</div>
                    <div className="font-semibold">{aqi.list[0].components.pm2_5} μg/m³</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <div className="text-blue-600">PM10</div>
                    <div className="font-semibold">{aqi.list[0].components.pm10} μg/m³</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No AQI data available</p>
            )}
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">⚡ Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={getCurrentLocation}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                📍 Get My Location
              </button>
              <button 
                onClick={downloadCSV}
                disabled={!current || !forecast.length}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                📊 Download CSV
              </button>
              <button 
                onClick={() => setShowHeatMap(!showHeatMap)}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                🔥 {showHeatMap ? 'Hide' : 'Show'} Heat Map
              </button>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-700">
                💡 <strong>Pro Tip:</strong> Drag the map marker or click anywhere on the map to explore weather in different locations!
              </div>
            </div>
          </div>
        </section>

        {/* Middle: Forecast chart & list */}
        <section className="lg:col-span-1 p-6 bg-white rounded-xl shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">📈 5-Day Forecast</h2>
            <div className="text-xs text-slate-500">Next 48hrs shown</div>
          </div>
          
          {/* Temperature Chart */}
          <div style={{ height: 200 }} className="w-full mb-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#666" fontSize={12} />
                  <YAxis domain={[dataMin => Math.floor(dataMin - 2), dataMax => Math.ceil(dataMax + 2)]} stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No forecast available</div>
            )}
          </div>

          {/* Weather Conditions Pie Chart */}
          {weatherPieData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Weather Conditions</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={weatherPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {weatherPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Forecast List */}
          <div className="space-y-2 max-h-64 overflow-auto">
            {forecast.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                <div className="text-sm font-medium">{f.time}</div>
                <div className="text-sm text-blue-600 font-semibold">{f.temp}°C</div>
                <div className="text-xs text-slate-500 capitalize">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Map */}
        <section className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-slate-800">🗺️ Interactive Weather Map</h2>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${showHeatMap ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                <span className="text-xs text-slate-500">
                  {showHeatMap ? 'Heat Map ON' : 'Heat Map OFF'}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500">Drag the marker or click anywhere on the map to get weather for that location.</p>
          </div>
          <div style={{ height: 480 }}>
            <MapComponent 
              coords={coords} 
              mapZoom={mapZoom} 
              current={current} 
              tileLayer={showHeatMap ? TILE_LAYER : null}
              onLocationChange={handleLocationChange}
            />
          </div>
        </section>
      </main>

      {/* Footer / status */}
      <footer className="max-w-7xl mx-auto mt-8 p-4 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading weather data...
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600">
                <span>⚠️</span>
                <span>Error: {error}</span>
              </div>
            ) : lastUpdated ? (
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Last updated: {lastUpdated}</span>
              </div>
            ) : (
              <div className="text-slate-400">Ready to explore weather data</div>
            )}
          </div>
          <div className="text-xs text-slate-400">
            Powered by OpenWeatherMap API
          </div>
        </div>
      </footer>
    </div>
  );
}
