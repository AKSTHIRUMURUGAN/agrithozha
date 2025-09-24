'use client';

import { WiDaySunny, WiDaySunnyOvercast, WiCloudy, WiRain, WiSnow, WiThunderstorm } from 'react-icons/wi';

export default function UVIndexCard({ uvData, weatherCondition, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading UV data...</div>
      </div>
    );
  }

  if (!uvData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No UV data available</p>
        <p className="text-sm mt-1">Select a field to view UV index</p>
      </div>
    );
  }

  const getUVIndexData = (index) => {
    if (index <= 2) {
      return {
        level: 'Low',
        description: 'No protection needed.',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-100',
        icon: '😎',
      };
    } else if (index <= 5) {
      return {
        level: 'Moderate',
        description: 'Wear a hat and sunscreen if outside for long periods.',
        color: 'text-yellow-500',
        bg: 'bg-yellow-50',
        border: 'border-yellow-100',
        icon: '☀️',
      };
    } else if (index <= 7) {
      return {
        level: 'High',
        description: 'Seek shade during midday hours. Wear protective clothing.',
        color: 'text-orange-500',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        icon: '⚠️',
      };
    } else if (index <= 10) {
      return {
        level: 'Very High',
        description: 'Avoid being outside during midday hours. Use SPF 30+ sunscreen.',
        color: 'text-red-500',
        bg: 'bg-red-50',
        border: 'border-red-100',
        icon: '🔥',
      };
    } else {
      return {
        level: 'Extreme',
        description: 'Avoid all sun exposure. Stay indoors during midday hours.',
        color: 'text-purple-600',
        bg: 'purple-50',
        border: 'border-purple-100',
        icon: '☢️',
      };
    }
  };

  const getWeatherIcon = (condition) => {
    if (!condition) return <WiDaySunny className="text-yellow-500" size={48} />;
    
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return <WiDaySunny className="text-yellow-500" size={48} />;
    if (conditionLower.includes('cloud')) return <WiCloudy className="text-gray-500" size={48} />;
    if (conditionLower.includes('rain')) return <WiRain className="text-blue-500" size={48} />;
    if (conditionLower.includes('snow')) return <WiSnow className="text-blue-200" size={48} />;
    if (conditionLower.includes('thunder')) return <WiThunderstorm className="text-purple-500" size={48} />;
    return <WiDaySunnyOvercast className="text-gray-400" size={48} />;
  };

  const uvIndex = Math.round(uvData.index);
  const uvStatus = getUVIndexData(uvIndex);
  
  // Calculate sun position (simplified for demonstration)
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const sunPosition = ((hours + minutes / 60) / 24) * 100;
  
  // Calculate sunrise and sunset times (simplified)
  const sunrise = 6 + Math.random() * 2; // Between 6-8 AM
  const sunset = 18 + Math.random() * 2; // Between 6-8 PM
  
  // Check if it's day or night
  const isDaytime = hours >= sunrise && hours < sunset;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">UV Index & Sun Exposure</h3>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
      </div>
      
      {/* Current UV Index */}
      <div className={`p-4 rounded-xl border ${uvStatus.bg} ${uvStatus.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Current UV Index</div>
            <div className="flex items-baseline">
              <span className={`text-4xl font-bold ${uvStatus.color}`}>
                {uvIndex}
              </span>
              <span className="ml-1 text-lg">/ 11+</span>
            </div>
            <div className={`mt-1 text-sm font-medium ${uvStatus.color}`}>
              {uvStatus.level} Risk
            </div>
          </div>
          <div className="text-5xl">
            {uvStatus.icon}
          </div>
        </div>
        
        {/* UV Index Scale */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Very High</span>
            <span>Extreme</span>
          </div>
          <div className="w-full h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white border border-gray-300 rounded-full"
              style={{ left: `${(uvIndex / 11) * 100}%`, transform: 'translateX(-50%)' }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>3</span>
            <span>6</span>
            <span>8</span>
            <span>11+</span>
          </div>
        </div>
      </div>
      
      {/* Sun Position */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-medium">Sun Position</div>
          <div className="text-sm text-gray-500">
            {isDaytime ? 'Daytime' : 'Nighttime'}
          </div>
        </div>
        
        <div className="relative h-24 bg-gradient-to-r from-blue-100 via-yellow-100 to-blue-100 rounded-full mb-2">
          <div 
            className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-300 transform -translate-y-1/2"
            style={{ boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)' }}
          ></div>
          
          {/* Sun icon moving across the sky */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-3xl"
            style={{ left: `${sunPosition}%` }}
          >
            {isDaytime ? '☀️' : '🌙'}
          </div>
          
          {/* Horizon line */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-200 to-transparent rounded-b-full"></div>
          
          {/* Sunrise/sunset indicators */}
          <div 
            className="absolute bottom-0 transform translate-x-1/2 text-xs text-gray-500"
            style={{ left: `${(sunrise / 24) * 100}%` }}
          >
            <div className="text-center">
              <div>🌅</div>
              <div>Sunrise</div>
              <div className="font-medium">
                {Math.floor(sunrise)}:{Math.floor((sunrise % 1) * 60).toString().padStart(2, '0')} AM
              </div>
            </div>
          </div>
          
          <div 
            className="absolute bottom-0 transform -translate-x-1/2 text-xs text-gray-500"
            style={{ left: `${(sunset / 24) * 100}%` }}
          >
            <div className="text-center">
              <div>🌇</div>
              <div>Sunset</div>
              <div className="font-medium">
                {Math.floor(sunset - 12)}:{Math.floor((sunset % 1) * 60).toString().padStart(2, '0')} PM
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-center text-gray-500 mt-1">
          Current time: {hours % 12 || 12}:{minutes.toString().padStart(2, '0')} {hours >= 12 ? 'PM' : 'AM'}
        </div>
      </div>
      
      {/* Protection Tips */}
      <div className={`p-3 rounded-lg border ${uvStatus.bg} ${uvStatus.border}`}>
        <h4 className="text-sm font-medium mb-1">Protection Tips</h4>
        <p className="text-sm">{uvStatus.description}</p>
        
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-50 rounded">
            <span>🧴</span>
            <span className="text-xs">Use SPF 30+ sunscreen</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-50 rounded">
            <span>👒</span>
            <span className="text-xs">Wear a wide-brimmed hat</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-50 rounded">
            <span>🕶️</span>
            <span className="text-xs">Wear UV-blocking sunglasses</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-50 rounded">
            <span>⛱️</span>
            <span className="text-xs">Seek shade when possible</span>
          </div>
        </div>
      </div>
      
      {/* Hourly Forecast */}
      <div className="bg-white p-3 rounded-lg border border-gray-100">
        <h4 className="text-sm font-medium mb-2">UV Index Forecast</h4>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {Array.from({ length: 24 }).map((_, hour) => {
            // Simulate UV index throughout the day (peaking at solar noon)
            const hourOfDay = (hour + new Date().getHours()) % 24;
            const uvValue = Math.round(
              uvIndex * Math.sin((Math.PI * hourOfDay) / 24) + (Math.random() * 0.5 - 0.25)
            );
            const hourUV = Math.max(0, Math.min(uvValue, 11));
            const hourStatus = getUVIndexData(hourUV);
            
            return (
              <div 
                key={hour} 
                className="flex-shrink-0 w-14 text-center"
              >
                <div className="text-xs text-gray-500">
                  {hourOfDay % 12 === 0 ? 12 : hourOfDay % 12}{hourOfDay < 12 ? 'AM' : 'PM'}
                </div>
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto text-sm font-medium ${hourStatus.color} ${hourStatus.bg}`}
                >
                  {hourUV}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Additional Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Peak hours: 10 AM - 4 PM</p>
        <p>Next update: {new Date(Date.now() + 3600000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
      </div>
    </div>
  );
}
