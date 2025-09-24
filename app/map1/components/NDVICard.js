'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function NDVICard({ ndviData, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading NDVI data...</div>
      </div>
    );
  }

  if (!ndviData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No NDVI data available</p>
        <p className="text-sm mt-1">Select a field to view NDVI data</p>
      </div>
    );
  }

  const chartData = {
    labels: ndviData.history.map(item => item.month),
    datasets: [
      {
        label: 'NDVI Index',
        data: ndviData.history.map(item => item.value),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#059669',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#059669',
        pointHoverBorderColor: '#fff',
        pointHitRadius: 10,
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `NDVI: ${context.parsed.y.toFixed(2)}`;
          },
          title: function() {
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        min: 0,
        max: 1,
        ticks: {
          color: '#6b7280',
          callback: function(value) {
            return value.toFixed(1);
          }
        },
        grid: {
          color: 'rgba(209, 213, 219, 0.3)',
        },
      },
    },
  };

  const getNDVIStatus = (value) => {
    if (value > 0.6) return 'Healthy Vegetation';
    if (value > 0.3) return 'Moderate Vegetation';
    return 'Sparse Vegetation';
  };

  const getStatusColor = (value) => {
    if (value > 0.6) return 'text-green-600';
    if (value > 0.3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const currentNDVI = parseFloat(ndviData.current);
  const statusColor = getStatusColor(currentNDVI);
  const ndviStatus = getNDVIStatus(currentNDVI);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">NDVI Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current NDVI Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current NDVI</p>
              <div className="flex items-baseline mt-1">
                <span className="text-3xl font-bold text-green-700">
                  {currentNDVI.toFixed(2)}
                </span>
                <span className="ml-1 text-sm text-gray-500">/ 1.0</span>
              </div>
              <div className={`mt-1 text-sm font-medium ${statusColor}`}>
                {ndviStatus}
              </div>
            </div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="text-3xl">
                {currentNDVI > 0.6 ? '🌿' : currentNDVI > 0.3 ? '🌱' : '🍂'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-green-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>0.0</span>
              <div className="w-full mx-2 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 h-1.5 rounded-full"
                  style={{ width: `${currentNDVI * 100}%` }}
                ></div>
              </div>
              <span>1.0</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              {ndviStatus}
            </div>
          </div>
        </div>
        
        {/* NDVI Trend */}
        <div className="md:col-span-2 bg-white p-4 rounded-xl border border-gray-100">
          <div className="h-48">
            <Line data={chartData} options={options} />
          </div>
          <div className="mt-2 text-xs text-center text-gray-500">
            NDVI Trend (Last 12 Months)
          </div>
        </div>
      </div>
      
      {/* NDVI Legend */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
          <span>0.0 - 0.3: Sparse</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
          <span>0.3 - 0.6: Moderate</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span>0.6 - 1.0: Healthy</span>
        </div>
      </div>
      
      {/* Recommendations */}
      {ndviData.recommendations && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Recommendations</h4>
          <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
            {ndviData.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
