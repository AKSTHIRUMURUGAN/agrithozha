'use client';

import { WiDaySunny, WiRain, WiCloudy, WiDayCloudyHigh, WiThunderstorm, WiSnow } from 'react-icons/wi';

export default function WeatherCard({ weatherData, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading weather data...</div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No weather data available</p>
        <p className="text-sm mt-1">Select a field to view weather data</p>
      </div>
    );
  }

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <WiDaySunny className="text-yellow-500" size={48} />;
      case 'rain':
      case 'drizzle':
        return <WiRain className="text-blue-500" size={48} />;
      case 'clouds':
        return <WiCloudy className="text-gray-500" size={48} />;
      case 'thunderstorm':
        return <WiThunderstorm className="text-purple-500" size={48} />;
      case 'snow':
        return <WiSnow className="text-blue-200" size={48} />;
      default:
        return <WiDayCloudyHigh className="text-gray-400" size={48} />;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Weather Forecast</h3>
        <div className="text-sm text-gray-500">
          {weatherData.location && (
            <span>{weatherData.location}</span>
          )}
        </div>
      </div>
      
      {/* Current Weather */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-800">
              {weatherData.temperature}
            </div>
            <div className="text-sm text-gray-600">
              Feels like {weatherData.feelsLike}
            </div>
            <div className="mt-1 text-sm font-medium text-gray-700">
              {weatherData.condition}
            </div>
          </div>
          <div className="text-right">
            {getWeatherIcon(weatherData.condition)}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-blue-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500">Humidity</div>
            <div className="text-sm font-medium">{weatherData.humidity}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Wind</div>
            <div className="text-sm font-medium">
              {weatherData.windSpeed}
              <span className="ml-1 text-xs text-gray-500">
                {getWindDirection(weatherData.windDeg)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Pressure</div>
            <div className="text-sm font-medium">{weatherData.pressure} hPa</div>
          </div>
        </div>
      </div>
      
      {/* Hourly Forecast */}
      {weatherData.hourly && weatherData.hourly.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Next 24 Hours</h4>
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
            {weatherData.hourly.slice(0, 8).map((hour, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-16 bg-white p-2 rounded-lg border border-gray-100 text-center"
              >
                <div className="text-xs text-gray-600">
                  {formatTime(hour.dt * 1000)}
                </div>
                <div className="my-1">
                  {getWeatherIcon(hour.weather[0].main)}
                </div>
                <div className="text-sm font-medium">
                  {Math.round(hour.temp)}°
                </div>
                <div className="text-xs text-blue-500">
                  {hour.pop > 0 ? `${Math.round(hour.pop * 100)}%` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Daily Forecast */}
      {weatherData.daily && weatherData.daily.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">7-Day Forecast</h4>
          <div className="space-y-2">
            {weatherData.daily.slice(0, 5).map((day, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100"
              >
                <div className="w-24">
                  {formatDate(day.dt * 1000)}
                </div>
                <div className="flex-1 flex items-center justify-center">
                  {getWeatherIcon(day.weather[0].main)}
                </div>
                <div className="w-16 text-right">
                  <span className="font-medium">{Math.round(day.temp.max)}°</span>
                  <span className="text-gray-400 ml-1">{Math.round(day.temp.min)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Weather Alerts */}
      {weatherData.alerts && weatherData.alerts.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <h4 className="text-sm font-medium text-red-700 mb-1">Weather Alerts</h4>
          <div className="space-y-2">
            {weatherData.alerts.map((alert, index) => (
              <div key={index} className="text-sm text-red-600">
                <div className="font-medium">{alert.event}</div>
                <div className="text-xs text-red-500">
                  {new Date(alert.start * 1000).toLocaleString()} - {new Date(alert.end * 1000).toLocaleString()}
                </div>
                <p className="text-xs mt-1">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
