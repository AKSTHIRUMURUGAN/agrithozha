'use client';

import { GiPlantWatering, GiAcid, GiWheat, GiPlantRoots } from 'react-icons/gi';
import { FaTemperatureHigh, FaTint } from 'react-icons/fa';

export default function SoilCard({ soilData, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading soil data...</div>
      </div>
    );
  }

  if (!soilData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No soil data available</p>
        <p className="text-sm mt-1">Select a field to view soil analysis</p>
      </div>
    );
  }

  const getMoistureLevel = (moisture) => {
    const value = parseFloat(moisture);
    if (value < 15) return { level: 'Very Dry', color: 'text-red-500', bg: 'bg-red-50' };
    if (value < 30) return { level: 'Dry', color: 'text-orange-500', bg: 'bg-orange-50' };
    if (value < 50) return { level: 'Ideal', color: 'text-green-500', bg: 'bg-green-50' };
    return { level: 'Wet', color: 'text-blue-500', bg: 'bg-blue-50' };
  };

  const getPHLevel = (ph) => {
    const value = parseFloat(ph);
    if (value < 5.5) return { level: 'Acidic', color: 'text-red-500', bg: 'bg-red-50' };
    if (value < 6.5) return { level: 'Slightly Acidic', color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (value < 7.5) return { level: 'Neutral', color: 'text-green-500', bg: 'bg-green-50' };
    return { level: 'Alkaline', color: 'text-blue-500', bg: 'bg-blue-50' };
  };

  const getNutrientStatus = (value, type) => {
    // These thresholds are general and should be adjusted based on specific crop needs
    const thresholds = {
      nitrogen: { low: 50, high: 150 }, // kg/ha
      phosphorus: { low: 15, high: 30 }, // ppm
      potassium: { low: 100, high: 200 }, // ppm
    };

    if (value < thresholds[type].low) {
      return { status: 'Low', color: 'text-red-500', icon: '🔴' };
    } else if (value > thresholds[type].high) {
      return { status: 'High', color: 'text-yellow-500', icon: '🟡' };
    } else {
      return { status: 'Optimal', color: 'text-green-500', icon: '🟢' };
    }
  };

  const moisture = getMoistureLevel(soilData.moisture);
  const ph = getPHLevel(soilData.ph);
  const nitrogen = getNutrientStatus(parseInt(soilData.nitrogen), 'nitrogen');
  const phosphorus = getNutrientStatus(parseInt(soilData.phosphorus), 'phosphorus');
  const potassium = getNutrientStatus(parseInt(soilData.potassium), 'potassium');

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Soil Analysis</h3>
      
      {/* Soil Moisture */}
      <div className={`p-4 rounded-xl border ${moisture.bg} border-opacity-50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <FaTint className={`text-2xl ${moisture.color}`} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Soil Moisture</div>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${moisture.color}`}>
                  {soilData.moisture}
                </span>
                <span className="ml-1 text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${moisture.color} bg-white bg-opacity-70`}>
            {moisture.level}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-opacity-30 border-gray-400">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 h-2 rounded-full"
              style={{ width: `${soilData.moisture}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      
      {/* pH Level */}
      <div className={`p-4 rounded-xl border ${ph.bg} border-opacity-50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <GiAcid className={`text-2xl ${ph.color}`} />
            </div>
            <div>
              <div className="text-sm text-gray-600">pH Level</div>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${ph.color}`}>
                  {soilData.ph}
                </span>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${ph.color} bg-white bg-opacity-70`}>
            {ph.level}
          </div>
        </div>
        <div className="mt-3 pt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Acidic</span>
            <span>Neutral</span>
            <span>Alkaline</span>
          </div>
          <div className="w-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full border border-gray-300"
              style={{ 
                width: '6px',
                height: '10px',
                marginTop: '-4px',
                marginLeft: `${(parseFloat(soilData.ph) / 14) * 100}%`,
                transform: 'translateX(-50%)',
                position: 'relative',
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>7</span>
            <span>14</span>
          </div>
        </div>
      </div>
      
      {/* Nutrients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Nitrogen (N)</span>
            <span className={`text-xs font-medium ${nitrogen.color}`}>
              {nitrogen.status}
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold">{soilData.nitrogen}</span>
            <span className="ml-1 text-xs text-gray-500">kg/ha</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Essential for leaf growth
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Phosphorus (P)</span>
            <span className={`text-xs font-medium ${phosphorus.color}`}>
              {phosphorus.status}
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold">{soilData.phosphorus}</span>
            <span className="ml-1 text-xs text-gray-500">ppm</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Important for root development
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Potassium (K)</span>
            <span className={`text-xs font-medium ${potassium.color}`}>
              {potassium.status}
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold">{soilData.potassium}</span>
            <span className="ml-1 text-xs text-gray-500">ppm</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Improves overall health
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      {soilData.recommendations && soilData.recommendations.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Recommendations</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {soilData.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Last Updated */}
      <div className="text-xs text-gray-400 text-right mt-2">
        Last updated: {new Date(soilData.lastUpdated || Date.now()).toLocaleString()}
      </div>
    </div>
  );
}
