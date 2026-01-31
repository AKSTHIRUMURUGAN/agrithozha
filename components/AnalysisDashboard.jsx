'use client';
import { useState } from 'react';

export default function AnalysisDashboard({ selectedPolygon, analysisData, isAnalyzing }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!selectedPolygon) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="text-4xl mb-4">🌾</div>
        <p>Select a field to view analysis</p>
        <p className="text-sm mt-1">or draw a new field on the map</p>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing field data...</p>
        <p className="text-sm text-gray-500 mt-1">Fetching real-time data from AgroMonitoring API</p>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-gray-600">Field analysis not available</p>
        <p className="text-sm text-gray-500 mt-1">Click &ldquo;Analyze Field&rdquo; to get real insights</p>
      </div>
    );
  }

  const getNDVIColor = (value) => {
    if (value > 0.7) return 'text-green-600';
    if (value > 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthColor = (value) => {
    if (value > 80) return 'text-green-600';
    if (value > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getVigorColor = (value) => {
    if (value > 80) return 'text-green-600';
    if (value > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLAIColor = (value) => {
    if (value > 4) return 'text-green-600';
    if (value > 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || 'clear';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('thunder')) return '⛈️';
    return '☀️';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['overview', 'crop', 'weather', 'recommendations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium capitalize ${
              activeTab === tab
                ? 'text-green-600 border-b-2 border-green-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className={`text-2xl font-bold ${getNDVIColor(analysisData.ndvi)}`}>
                {analysisData.ndvi?.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">NDVI Index</div>
              <div className={`text-xs font-medium ${getNDVIColor(analysisData.ndvi)}`}>
                {analysisData.ndvi > 0.7 ? 'Healthy' : analysisData.ndvi > 0.5 ? 'Moderate' : 'Poor'}
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className={`text-2xl font-bold ${getVigorColor(analysisData.cropVigor)}`}>
                {analysisData.cropVigor?.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Crop Vigor</div>
              <div className={`text-xs font-medium ${getVigorColor(analysisData.cropVigor)}`}>
                {analysisData.cropVigor > 80 ? 'Excellent' : analysisData.cropVigor > 60 ? 'Good' : 'Poor'}
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h4 className="font-medium text-sm mb-2">Crop Health Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">LAI (Leaf Area Index):</span>
                <span className={`font-medium ${getLAIColor(analysisData.lai)}`}>
                  {analysisData.lai?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Canopy Cover:</span>
                <span className="font-medium">{analysisData.canopyCover?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Water Stress:</span>
                <span className={`font-medium ${
                  analysisData.waterStress === 'high' ? 'text-red-600' : 
                  analysisData.waterStress === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {analysisData.waterStress?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growing Degree Days:</span>
                <span className="font-medium">{analysisData.gdd?.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crop Health Tab */}
      {activeTab === 'crop' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-600">
                {analysisData.lai?.toFixed(2)}
              </div>
              <div className="text-xs text-green-700 mt-1">Leaf Area Index</div>
              <div className="text-xs text-green-600">
                {analysisData.lai > 4 ? 'Dense' : analysisData.lai > 2 ? 'Moderate' : 'Sparse'}
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysisData.canopyCover?.toFixed(0)}%
              </div>
              <div className="text-xs text-blue-700 mt-1">Canopy Cover</div>
              <div className="text-xs text-blue-600">
                {analysisData.canopyCover > 70 ? 'Full' : analysisData.canopyCover > 40 ? 'Partial' : 'Open'}
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h4 className="font-medium text-sm mb-2">Crop Vigor Analysis</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Overall Vigor</span>
                  <span className={`font-medium ${getVigorColor(analysisData.cropVigor)}`}>
                    {analysisData.cropVigor?.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      analysisData.cropVigor > 80 ? 'bg-green-500' :
                      analysisData.cropVigor > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysisData.cropVigor}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className={`p-2 rounded ${
                  analysisData.ndvi > 0.7 ? 'bg-green-100 text-green-700' : 
                  analysisData.ndvi > 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  <div>NDVI</div>
                  <div className="font-bold">{analysisData.ndvi?.toFixed(2)}</div>
                </div>
                <div className={`p-2 rounded ${
                  analysisData.moisture > 40 ? 'bg-green-100 text-green-700' : 
                  analysisData.moisture > 25 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  <div>Moisture</div>
                  <div className="font-bold">{analysisData.moisture?.toFixed(0)}%</div>
                </div>
                <div className={`p-2 rounded ${
                  analysisData.temperature > 18 && analysisData.temperature < 30 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <div>Temp</div>
                  <div className="font-bold">{analysisData.temperature?.toFixed(0)}°C</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weather Tab */}
      {activeTab === 'weather' && analysisData.weather && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {analysisData.weather.temp?.toFixed(1)}°C
                </div>
                <div className="text-sm text-gray-600">
                  Feels like {analysisData.weather.feels_like?.toFixed(1)}°C
                </div>
                <div className="mt-1 text-sm font-medium text-gray-700 capitalize">
                  {analysisData.weather.weather?.[0]?.description}
                </div>
              </div>
              <div className="text-4xl">
                {getWeatherIcon(analysisData.weather.weather?.[0]?.main)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className="text-lg font-bold text-blue-600">
                {analysisData.weather.humidity?.toFixed(0)}%
              </div>
              <div className="text-xs text-blue-700">Humidity</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className="text-lg font-bold text-green-600">
                {analysisData.weather.wind_speed?.toFixed(1)} m/s
              </div>
              <div className="text-xs text-green-700">Wind Speed</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className="text-lg font-bold text-purple-600">
                {analysisData.weather.pressure?.toFixed(0)}
              </div>
              <div className="text-xs text-purple-700">Pressure (hPa)</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <div className="text-lg font-bold text-orange-600">
                {analysisData.weather.clouds?.toFixed(0)}%
              </div>
              <div className="text-xs text-orange-700">Cloud Cover</div>
            </div>
          </div>

          {analysisData.weather.visibility && (
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Visibility</span>
                <span className="font-medium">{(analysisData.weather.visibility / 1000).toFixed(1)} km</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Action Recommendations</h4>
          {analysisData.recommendations?.map((rec, index) => (
            <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">💡</span>
                <span className="text-sm text-blue-800">{rec}</span>
              </div>
            </div>
          ))}
          
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h5 className="font-medium text-sm text-yellow-800 mb-2">Risk Factors</h5>
            {analysisData.riskFactors?.map((risk, index) => (
              <div key={index} className="flex justify-between items-center text-sm mb-1">
                <span className="text-yellow-700">{risk.factor}</span>
                <span className={`px-2 py-1 rounded text-xs ${getRiskColor(risk.level)}`}>
                  {risk.level} risk
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Status */}
      <div className="text-xs text-gray-400 text-center mt-4">
        {process.env.NEXT_PUBLIC_AGRO_API_KEY !== 'your_api_key_here' 
          ? '✅ Connected to AgroMonitoring API' 
          : '⚠️ Using demo data - Add API key for real data'
        }
      </div>
    </div>
  );
}