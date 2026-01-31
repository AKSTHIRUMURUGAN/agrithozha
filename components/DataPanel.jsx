'use client';

import { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Sun, 
  Wind, 
  Sprout,
  Calendar 
} from 'lucide-react';
import { getFieldData } from '../lib/agroMonitoring';

const DataPanel = ({ polygon }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weather');

  useEffect(() => {
    if (polygon) {
      loadData();
    }
  }, [polygon]);

  const loadData = async () => {
    if (!polygon) return;
    
    setLoading(true);
    try {
      const agroData = await getFieldData(polygon.id);
      setData(agroData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ icon: Icon, title, value, unit, color = 'blue' }) => (
    <div className={`bg-white p-4 rounded-lg shadow border-l-4 border-${color}-500`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 text-${color}-500`} />
        <h3 className="font-semibold text-gray-700">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value} <span className="text-sm text-gray-500">{unit}</span>
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Field Analysis - {polygon?.id}
        </h2>
        <p className="text-gray-600">
          Area: {(polygon?.area / 10000).toFixed(2)} hectares
        </p>
      </div>

      {/* Metric Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'weather', label: 'Weather', icon: Wind },
          { id: 'soil', label: 'Soil', icon: Droplets },
          { id: 'ndvi', label: 'NDVI', icon: Sprout },
          { id: 'accumulated', label: 'Accumulated', icon: Calendar },
          { id: 'uvi', label: 'UV Index', icon: Sun }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedMetric(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedMetric === id 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedMetric === 'weather' && data?.weather && (
          <>
            <MetricCard
              icon={Thermometer}
              title="Temperature"
              value={data.weather.temp}
              unit="°C"
              color="red"
            />
            <MetricCard
              icon={Droplets}
              title="Humidity"
              value={data.weather.humidity}
              unit="%"
              color="blue"
            />
            <MetricCard
              icon={Wind}
              title="Wind Speed"
              value={data.weather.wind_speed}
              unit="m/s"
              color="green"
            />
          </>
        )}

        {selectedMetric === 'soil' && data?.soil && (
          <>
            <MetricCard
              icon={Droplets}
              title="Soil Moisture"
              value={data.soil.moisture}
              unit="%"
              color="blue"
            />
            <MetricCard
              icon={Thermometer}
              title="Soil Temperature"
              value={data.soil.temperature}
              unit="°C"
              color="orange"
            />
          </>
        )}

        {selectedMetric === 'ndvi' && data?.ndvi && (
          <>
            <MetricCard
              icon={Sprout}
              title="NDVI Index"
              value={data.ndvi.value}
              unit=""
              color="green"
            />
            <MetricCard
              icon={Calendar}
              title="Last Update"
              value={new Date(data.ndvi.dt * 1000).toLocaleDateString()}
              unit=""
              color="purple"
            />
          </>
        )}

        {selectedMetric === 'accumulated' && data?.accumulated && (
          <>
            <MetricCard
              icon={Thermometer}
              title="Accumulated Temp"
              value={data.accumulated.temperature}
              unit="°C"
              color="red"
            />
            <MetricCard
              icon={Droplets}
              title="Accumulated Precip"
              value={data.accumulated.precipitation}
              unit="mm"
              color="blue"
            />
          </>
        )}
      </div>

      {!data && !loading && (
        <div className="text-center py-8 text-gray-500">
          No data available for this polygon
        </div>
      )}
    </div>
  );
};

export default DataPanel;