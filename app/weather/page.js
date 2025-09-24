"use client";

import { useState, useEffect } from "react";

export default function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation(`${latitude},${longitude}`);
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }
  }, []);

  const fetchWeather = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      setWeather(data.current);
      setForecast(data.forecast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(location);
  };

  const handleCurrentLocation = () => {
    if (currentLocation) {
      fetchWeather(currentLocation);
    }
  };

  const formatTemperature = (temp) => {
    return Math.round(temp);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWindDirection = (degrees) => {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Weather Forecast
        </h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Enter city name or coordinates (lat,lon)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Get Weather"}
            </button>
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={!currentLocation || loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Current Location
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Current Weather */}
        {weather && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Current Weather</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <img
                  src={getWeatherIcon(weather.weather[0].icon)}
                  alt={weather.weather[0].description}
                  className="w-20 h-20"
                />
                <div>
                  <div className="text-4xl font-bold text-gray-800">
                    {formatTemperature(weather.main.temp)}°C
                  </div>
                  <div className="text-lg text-gray-600 capitalize">
                    {weather.weather[0].description}
                  </div>
                  <div className="text-sm text-gray-500">
                    Feels like {formatTemperature(weather.main.feels_like)}°C
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-600">Humidity</div>
                  <div className="font-semibold">{weather.main.humidity}%</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-600">Pressure</div>
                  <div className="font-semibold">{weather.main.pressure} hPa</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-600">Wind</div>
                  <div className="font-semibold">
                    {weather.wind.speed} m/s {getWindDirection(weather.wind.deg)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-600">Visibility</div>
                  <div className="font-semibold">
                    {weather.visibility ? (weather.visibility / 1000).toFixed(1) : "N/A"} km
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <div>Location: {weather.name}, {weather.sys.country}</div>
              <div>Last updated: {new Date(weather.dt * 1000).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">5-Day Forecast</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {forecast.list.slice(0, 5).map((day, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm font-semibold text-gray-600 mb-2">
                    {formatDate(day.dt)}
                  </div>
                  <img
                    src={getWeatherIcon(day.weather[0].icon)}
                    alt={day.weather[0].description}
                    className="w-12 h-12 mx-auto mb-2"
                  />
                  <div className="text-lg font-bold text-gray-800">
                    {formatTemperature(day.main.temp)}°C
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {day.weather[0].description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTemperature(day.main.temp_min)}° / {formatTemperature(day.main.temp_max)}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
