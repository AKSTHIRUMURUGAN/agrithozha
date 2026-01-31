"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with no SSR
const MapComponent = dynamic(() => import('../../components/EnhancedMap'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

const AnalysisDashboard = dynamic(() => import('../../components/AnalysisDashboard'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-gray-400">Loading analysis...</div>
    </div>
  )
});

const QuickActions = dynamic(() => import('../../components/QuickActions'), { 
  ssr: false,
  loading: () => (
    <div className="p-4 space-y-3">
      <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
      <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
    </div>
  )
});

// AgroMonitoring API service
const AGRO_API_KEY = process.env.NEXT_PUBLIC_AGRO_API_KEY || 'your_api_key_here';
const AGRO_BASE_URL = 'https://api.agromonitoring.com';

class AgroMonitoringService {
  static async createPolygon(polygonData) {
    try {
      const response = await fetch(`${AGRO_BASE_URL}/polygons?appid=${AGRO_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: polygonData.name,
          geo_json: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [polygonData.coordinates.map(coord => [coord[1], coord[0]])]
            }
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to create polygon');
      return await response.json();
    } catch (error) {
      console.error('Error creating polygon:', error);
      return { id: `mock_${Date.now()}`, name: polygonData.name };
    }
  }

  static async getNDVIHistory(polygonId) {
    try {
      const end = Math.floor(Date.now() / 1000);
      const start = end - (30 * 24 * 60 * 60);
      
      const response = await fetch(
        `${AGRO_BASE_URL}/ndvi/history?polyid=${polygonId}&start=${start}&end=${end}&appid=${AGRO_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch NDVI data');
      const data = await response.json();
      return data.length > 0 ? data : this.generateMockNDVI();
    } catch (error) {
      console.error('Error fetching NDVI:', error);
      return this.generateMockNDVI();
    }
  }

  static async getWeatherData(polygonId) {
    try {
      const response = await fetch(
        `${AGRO_BASE_URL}/weather?polyid=${polygonId}&appid=${AGRO_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      return this.generateMockWeather();
    }
  }

  static async getSoilData(polygonId) {
    try {
      const response = await fetch(
        `${AGRO_BASE_URL}/soil?polyid=${polygonId}&appid=${AGRO_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch soil data');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching soil data:', error);
      return this.generateMockSoil();
    }
  }

  static formatWeatherData(weatherData) {
    if (!weatherData) return this.generateMockWeather();
    
    return {
      temp: weatherData.main?.temp || weatherData.temp,
      feels_like: weatherData.main?.feels_like || weatherData.feels_like,
      humidity: weatherData.main?.humidity || weatherData.humidity,
      pressure: weatherData.main?.pressure || weatherData.pressure,
      wind_speed: weatherData.wind?.speed || weatherData.wind_speed,
      wind_deg: weatherData.wind?.deg || weatherData.wind_deg,
      weather: weatherData.weather || [{ main: 'Clear', description: 'clear sky' }],
      visibility: weatherData.visibility,
      clouds: weatherData.clouds?.all
    };
  }

  static generateMockNDVI() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      value: 0.3 + Math.random() * 0.6,
      dt: Date.now() / 1000
    }));
  }

  static generateMockWeather() {
    return {
      temp: 20 + Math.random() * 15,
      feels_like: 22 + Math.random() * 15,
      humidity: 40 + Math.random() * 40,
      pressure: 1000 + Math.random() * 50,
      wind_speed: 2 + Math.random() * 10,
      wind_deg: Math.random() * 360,
      weather: [{ 
        main: ['Clear', 'Clouds', 'Rain', 'Snow'][Math.floor(Math.random() * 4)],
        description: ['clear sky', 'few clouds', 'light rain', 'light snow'][Math.floor(Math.random() * 4)]
      }],
      visibility: 10000,
      clouds: Math.random() * 100
    };
  }

  static generateMockSoil() {
    return {
      moisture: 20 + Math.random() * 50,
      temperature: 15 + Math.random() * 15,
    };
  }
}

// Advanced agricultural calculations
class AgriculturalCalculations {
  // Calculate LAI (Leaf Area Index) from NDVI
  static calculateLAI(ndvi) {
    // LAI = -0.5 * ln(1 - NDVI) - empirical formula
    if (ndvi >= 0.99) return 8.0; // Maximum realistic LAI
    return Math.max(0, -0.5 * Math.log(1 - ndvi));
  }

  // Calculate Crop Vigor Index (0-100)
  static calculateCropVigor(ndvi, soilMoisture, temperature) {
    let vigor = ndvi * 70; // Base from NDVI (0-70 points)
    
    // Soil moisture contribution (0-20 points)
    if (soilMoisture >= 30 && soilMoisture <= 60) {
      vigor += 20; // Optimal moisture
    } else if (soilMoisture >= 20 && soilMoisture < 30) {
      vigor += 10; // Moderate moisture
    } else if (soilMoisture > 60 && soilMoisture <= 80) {
      vigor += 15; // High but acceptable
    }
    
    // Temperature contribution (0-10 points)
    if (temperature >= 18 && temperature <= 28) {
      vigor += 10; // Optimal temperature
    } else if (temperature >= 15 && temperature < 18) {
      vigor += 5; // Cool but acceptable
    } else if (temperature > 28 && temperature <= 32) {
      vigor += 5; // Warm but acceptable
    }
    
    return Math.min(100, Math.max(0, vigor));
  }

  // Calculate Canopy Cover Percentage from NDVI
  static calculateCanopyCover(ndvi) {
    // Canopy cover = 125 * NDVI - 25 (empirical relationship)
    const cover = (125 * ndvi) - 25;
    return Math.min(100, Math.max(0, cover));
  }

  // Calculate Growing Degree Days (simplified)
  static calculateGDD(baseTemp = 10, currentTemp) {
    return Math.max(0, currentTemp - baseTemp);
  }

  // Calculate Water Stress Index
  static calculateWaterStress(soilMoisture, cropType) {
    const optimalMoisture = {
      'Corn': 50,
      'Wheat': 45,
      'Soybean': 55,
      'Rice': 70,
      'default': 50
    };
    
    const optimal = optimalMoisture[cropType] || optimalMoisture.default;
    const deviation = Math.abs(soilMoisture - optimal);
    
    if (deviation < 10) return 'low';
    if (deviation < 20) return 'medium';
    return 'high';
  }
}

export default function EnhancedMapPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [mapType, setMapType] = useState('standard');
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiPolygons, setApiPolygons] = useState({});

  useEffect(() => {
    setIsMounted(true);
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    const samplePolygon = {
      id: 'sample-1',
      name: 'Main Field',
      coordinates: [
        [20.5937, 78.9629],
        [20.6037, 78.9729],
        [20.6037, 78.9529],
        [20.5837, 78.9529],
        [20.5937, 78.9629]
      ],
      area: '2.5 ha',
      cropType: 'Corn',
      soilType: 'Loam'
    };
    setPolygons([samplePolygon]);
    setSelectedPolygon(samplePolygon);
  };

  const startDrawing = useCallback(() => {
    setIsDrawing(true);
    setDrawingPoints([]);
  }, []);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setDrawingPoints([]);
  }, []);

  const handleMapClick = useCallback((latlng) => {
    if (isDrawing) {
      setDrawingPoints(prev => [...prev, [latlng.lat, latlng.lng]]);
    }
  }, [isDrawing]);

  const savePolygon = useCallback(async () => {
    if (drawingPoints.length < 3) {
      alert('Please add at least 3 points to create a field');
      return;
    }

    const closedPoints = [...drawingPoints, drawingPoints[0]];

    const newPolygon = {
      id: `polygon-${Date.now()}`,
      name: `Field ${polygons.length + 1}`,
      coordinates: closedPoints,
      area: `${(Math.random() * 10 + 1).toFixed(1)} ha`,
      cropType: ['Corn', 'Wheat', 'Soybean', 'Rice'][Math.floor(Math.random() * 4)],
      soilType: ['Loam', 'Clay', 'Sandy', 'Silt'][Math.floor(Math.random() * 4)]
    };

    try {
      const apiPolygon = await AgroMonitoringService.createPolygon(newPolygon);
      setApiPolygons(prev => ({
        ...prev,
        [newPolygon.id]: apiPolygon.id
      }));
      newPolygon.apiId = apiPolygon.id;
    } catch (error) {
      console.warn('Failed to create polygon in API, using local data only');
    }

    setPolygons(prev => [...prev, newPolygon]);
    setSelectedPolygon(newPolygon);
    setIsDrawing(false);
    setDrawingPoints([]);
    
    setTimeout(() => analyzeField(newPolygon), 500);
  }, [drawingPoints, polygons.length]);

  const analyzeField = useCallback(async (polygon) => {
    if (!polygon) return;
    
    setIsAnalyzing(true);
    setAnalysisData(null);
    
    try {
      const apiPolygonId = apiPolygons[polygon.id] || polygon.apiId;
      
      const [ndviData, weatherData, soilData] = await Promise.all([
        AgroMonitoringService.getNDVIHistory(apiPolygonId || polygon.id),
        AgroMonitoringService.getWeatherData(apiPolygonId || polygon.id),
        AgroMonitoringService.getSoilData(apiPolygonId || polygon.id)
      ]);

      const currentNDVI = ndviData[0]?.value || ndviData.value || 0.5;
      
      // Calculate advanced metrics
      const lai = AgriculturalCalculations.calculateLAI(currentNDVI);
      const cropVigor = AgriculturalCalculations.calculateCropVigor(
        currentNDVI, 
        soilData.moisture, 
        weatherData.temp
      );
      const canopyCover = AgriculturalCalculations.calculateCanopyCover(currentNDVI);
      const waterStress = AgriculturalCalculations.calculateWaterStress(soilData.moisture, polygon.cropType);
      const gdd = AgriculturalCalculations.calculateGDD(10, weatherData.temp);

      const analysis = {
        ndvi: currentNDVI,
        ndviHistory: ndviData,
        soilHealth: Math.min(100, (soilData.moisture / 80) * 100),
        moisture: soilData.moisture,
        temperature: weatherData.temp,
        weather: weatherData,
        soil: soilData,
        
        // Advanced calculations
        lai: lai,
        cropVigor: cropVigor,
        canopyCover: canopyCover,
        waterStress: waterStress,
        gdd: gdd,
        
        recommendations: generateRecommendations(currentNDVI, soilData.moisture, weatherData.temp, waterStress),
        riskFactors: assessRisks(currentNDVI, soilData.moisture, weatherData, waterStress)
      };
      
      setAnalysisData(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to mock data with calculations
      const currentNDVI = 0.65 + Math.random() * 0.3;
      const mockWeather = AgroMonitoringService.generateMockWeather();
      const mockSoil = AgroMonitoringService.generateMockSoil();
      
      const lai = AgriculturalCalculations.calculateLAI(currentNDVI);
      const cropVigor = AgriculturalCalculations.calculateCropVigor(currentNDVI, mockSoil.moisture, mockWeather.temp);
      const canopyCover = AgriculturalCalculations.calculateCanopyCover(currentNDVI);
      const waterStress = AgriculturalCalculations.calculateWaterStress(mockSoil.moisture, selectedPolygon?.cropType);
      const gdd = AgriculturalCalculations.calculateGDD(10, mockWeather.temp);

      const analysis = {
        ndvi: currentNDVI,
        soilHealth: 70 + Math.random() * 25,
        moisture: mockSoil.moisture,
        temperature: mockWeather.temp,
        weather: mockWeather,
        soil: mockSoil,
        lai: lai,
        cropVigor: cropVigor,
        canopyCover: canopyCover,
        waterStress: waterStress,
        gdd: gdd,
        recommendations: [
          'Optimal growth conditions detected',
          'Consider irrigation in 2-3 days',
          'Soil nutrients are balanced',
          'Monitor for pest activity'
        ],
        riskFactors: [
          { factor: 'Water Stress', level: 'low', impact: 'minimal' },
          { factor: 'Nutrient Deficiency', level: 'medium', impact: 'moderate' },
          { factor: 'Pest Risk', level: 'low', impact: 'minimal' }
        ]
      };
      setAnalysisData(analysis);
    } finally {
      setIsAnalyzing(false);
    }
  }, [apiPolygons, selectedPolygon]);

  const generateRecommendations = (ndvi, moisture, temperature, waterStress) => {
    const recommendations = [];
    
    if (ndvi < 0.3) {
      recommendations.push('Low vegetation health detected. Consider soil testing and fertilization.');
    } else if (ndvi > 0.7) {
      recommendations.push('Excellent vegetation growth. Maintain current practices.');
    }
    
    if (waterStress === 'high') {
      recommendations.push('High water stress detected. Immediate irrigation recommended.');
    } else if (waterStress === 'medium') {
      recommendations.push('Moderate water stress. Schedule irrigation within 2-3 days.');
    }
    
    if (moisture < 25) {
      recommendations.push('Low soil moisture. Irrigation recommended within 1-2 days.');
    } else if (moisture > 70) {
      recommendations.push('High soil moisture. Reduce irrigation to prevent waterlogging.');
    }
    
    if (temperature < 10) {
      recommendations.push('Low temperature. Consider protective measures for crops.');
    } else if (temperature > 35) {
      recommendations.push('High temperature. Ensure adequate water supply.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Optimal growing conditions. Continue current practices.');
    }
    
    return recommendations;
  };

  const assessRisks = (ndvi, moisture, weather, waterStress) => {
    const risks = [];
    
    if (ndvi < 0.4) risks.push({ factor: 'Vegetation Health', level: 'high', impact: 'significant' });
    else if (ndvi < 0.6) risks.push({ factor: 'Vegetation Health', level: 'medium', impact: 'moderate' });
    
    if (waterStress === 'high') risks.push({ factor: 'Drought Risk', level: 'high', impact: 'critical' });
    else if (waterStress === 'medium') risks.push({ factor: 'Drought Risk', level: 'medium', impact: 'significant' });
    
    if (weather.temp > 35) risks.push({ factor: 'Heat Stress', level: 'medium', impact: 'moderate' });
    if (weather.humidity > 80) risks.push({ factor: 'Fungal Disease', level: 'medium', impact: 'moderate' });
    
    if (risks.length === 0) {
      risks.push({ factor: 'Overall Risk', level: 'low', impact: 'minimal' });
    }
    
    return risks;
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Agricultural Analysis System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-lg border-b z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🌱 AgroSmart Analyzer</h1>
              <p className="text-sm text-gray-600">
                {AGRO_API_KEY !== 'your_api_key_here' ? 'Connected to AgroMonitoring API' : 'Using Demo Data - Add API Key'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMapType(prev => prev === 'satellite' ? 'standard' : 'satellite')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <span>{mapType === 'satellite' ? '🗺️ Map' : '🛰️ Satellite'}</span>
              </button>
              
              {selectedPolygon && (
                <button
                  onClick={() => analyzeField(selectedPolygon)}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>📊</span>
                      <span>Analyze Field</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col z-10">
          <QuickActions
            isDrawing={isDrawing}
            drawingPoints={drawingPoints}
            selectedPolygon={selectedPolygon}
            polygons={polygons}
            onStartDrawing={startDrawing}
            onCancelDrawing={cancelDrawing}
            onSavePolygon={savePolygon}
            onPolygonSelect={setSelectedPolygon}
            onClearPoints={() => setDrawingPoints([])}
          />

          <div className="flex-1 overflow-y-auto">
            <AnalysisDashboard
              selectedPolygon={selectedPolygon}
              analysisData={analysisData}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>

        <div className="flex-1 relative">
          <MapComponent
            center={selectedPolygon ? selectedPolygon.coordinates[0] : [20.5937, 78.9629]}
            zoom={selectedPolygon ? 14 : 5}
            mapType={mapType}
            isDrawing={isDrawing}
            drawingPoints={drawingPoints}
            selectedPolygon={selectedPolygon}
            polygons={polygons}
            onMapClick={handleMapClick}
            onPolygonSelect={setSelectedPolygon}
          />

          {isDrawing && (
            <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg border z-20">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-blue-600">Drawing Mode Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Click on the map to add points. Minimum 3 points required.
              </p>
              <div className="text-xs text-gray-500">
                Points: <strong>{drawingPoints.length}</strong> | 
                {drawingPoints.length >= 3 ? ' ✅ Ready to save' : ' ❌ Need more points'}
              </div>
            </div>
          )}

          {selectedPolygon && !isDrawing && (
            <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-20">
              <h3 className="font-bold text-gray-800 mb-2">{selectedPolygon.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span className="font-medium">{selectedPolygon.area}</span>
                </div>
                <div className="flex justify-between">
                  <span>Crop Type:</span>
                  <span className="font-medium">{selectedPolygon.cropType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Soil Type:</span>
                  <span className="font-medium">{selectedPolygon.soilType}</span>
                </div>
              </div>
              {analysisData && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs">
                    <span>NDVI: <strong className="text-green-600">{analysisData.ndvi?.toFixed(2)}</strong></span>
                    <span>Vigor: <strong className="text-blue-600">{analysisData.cropVigor?.toFixed(0)}%</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}