"use client";
import React, { useState } from "react";
import { useAgriData } from "./useAgriData"; // our fetch hook

// Import separate components
import ColdStorageCard from "./components/ColdStorageCard";
import FertilizerCard from "./components/FertilizerCard";
import WeatherCard from "./components/WeatherCard";
import MarketPricesCard from "./components/MarketPricesCard";
import MapCard from "./components/MapCard";
import VegetableProductionCard from "./components/VegetableProductionCard";
import LandUtilizationCard from "./components/LandUtilizationCard";
import DisasterDamageCard from "./components/DisasterDamageCard";
import FruitsVegetablesCard from "./components/FruitsVegetablesCard";
import VarietyPricesCard from "./components/VarietyPricesCard";
import CropProductionCard from "./components/CropProductionCard";
import YieldIndexCard from "./components/YieldIndexCard";

const apiKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

// all API resource IDs with proper names and descriptions
const resources = {
  coldStorage: {
    id: "0b827ac7-ebad-47c1-9cc9-816ce4ab10a7",
    name: "Cold Storage Distribution",
    description: "Sector-wise distribution of cold storages in India"
  },
  vegetableProduction: {
    id: "e965308a-17b9-46c3-9d43-681611d7a866", 
    name: "Vegetable Production",
    description: "State-wise area & production of vegetables (2009-15)"
  },
  fruitsVegetables: {
    id: "d2dd1d29-048a-4963-b6e8-192a638819a9",
    name: "Fruits & Vegetables",
    description: "Major fruits & vegetables producing countries"
  },
  fertilizerProduction: {
    id: "373358c8-63fd-4612-8f2b-9ce483422312",
    name: "Fertilizer Production", 
    description: "Product-wise & month-wise fertilizer production"
  },
  landUtilization: {
    id: "c8abc82f-b750-4886-a6c7-e97150fdda9e",
    name: "Land Utilization",
    description: "All India pattern of land utilisation (2000-14)"
  },
  landUtilizationDetailed: {
    id: "3e07efd9-3ced-4c65-909c-6ca792daab83",
    name: "Land Utilization (Detailed)",
    description: "Year-wise land utilisation statistics by states"
  },
  disasterDamage: {
    id: "f5fc3381-dfca-4b22-bf10-dd8f03996b05",
    name: "Disaster Damage",
    description: "Year-wise damage due to floods, cyclones, landslides"
  },
  yieldIndex: {
    id: "f055c331-6cf3-4b74-bb58-d44161e32bfa",
    name: "Yield Index",
    description: "Index numbers of yield of principal crops (2007-16)"
  },
  marketPrices: {
    id: "9ef84268-d588-465a-a308-a864a43d0070",
    name: "Market Prices",
    description: "Current daily price of commodities (Mandi)"
  },
  varietyPrices: {
    id: "35985678-0d79-46b4-9ed6-6f13308a1d24",
    name: "Variety Prices",
    description: "Variety-wise daily market prices"
  },
  cropProduction: {
    id: "35be999b-0208-4354-b557-f6ca9a5355de",
    name: "Crop Production",
    description: "District-wise season-wise crop production (from 1997)"
  }
};

export default function AgriDashboard() {
  const [activeDataset, setActiveDataset] = useState("coldStorage");

  // load data dynamically based on active dataset
  const { data, loading } = useAgriData(resources[activeDataset].id, { format: "json" }, 50, apiKey);

  // Get dataset display name and description
  const getDatasetInfo = (key) => {
    const resource = resources[key];
    return {
      name: resource?.name || key.toUpperCase(),
      description: resource?.description || "Agricultural data"
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🌾 Agriculture Data Dashboard</h1>
            <p className="text-sm text-gray-600 mt-2">Comprehensive agricultural data analysis and visualization</p>
          </div>
          <div className="text-sm text-gray-500">
            Data Source: Government of India APIs
          </div>
        </div>
      </header>

      {/* Dataset Switcher */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Dataset</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(resources).map((key) => {
              const info = getDatasetInfo(key);
              return (
          <button
            key={key}
            onClick={() => setActiveDataset(key)}
                  className={`p-4 rounded-lg transition-colors text-left ${
                    activeDataset === key 
                      ? "bg-green-600 text-white shadow-md" 
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{info.name}</div>
                  <div className={`text-xs ${activeDataset === key ? 'text-green-100' : 'text-gray-500'}`}>
                    {info.description}
                  </div>
          </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
              <span className="text-gray-600">Fetching {getDatasetInfo(activeDataset).name} data...</span>
            </div>
          </div>
        </div>
      )}

      {/* Data Cards Grid */}
      {!loading && data.length > 0 && (
        <div className="max-w-7xl mx-auto">
          {/* Show different card combinations based on dataset */}
          {activeDataset === "coldStorage" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ColdStorageCard data={data} loading={loading} datasetType="coldStorage" />
              <MapCard data={data} loading={loading} datasetType="coldStorage" />
            </div>
          )}
          
          {activeDataset === "fertilizerProduction" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <FertilizerCard data={data} loading={loading} datasetType="fertilizerProduction" />
              <MapCard data={data} loading={loading} datasetType="fertilizerProduction" />
            </div>
          )}
          
          {activeDataset === "vegetableProduction" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <VegetableProductionCard data={data} loading={loading} datasetType="vegetableProduction" />
              <MapCard data={data} loading={loading} datasetType="vegetableProduction" />
            </div>
          )}
          
          {activeDataset === "landUtilization" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <LandUtilizationCard data={data} loading={loading} datasetType="landUtilization" />
              <MapCard data={data} loading={loading} datasetType="landUtilization" />
            </div>
          )}
          
          {activeDataset === "landUtilizationDetailed" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <LandUtilizationCard data={data} loading={loading} datasetType="landUtilizationDetailed" />
              <MapCard data={data} loading={loading} datasetType="landUtilizationDetailed" />
            </div>
          )}
          
          {activeDataset === "disasterDamage" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <DisasterDamageCard data={data} loading={loading} datasetType="disasterDamage" />
              <MapCard data={data} loading={loading} datasetType="disasterDamage" />
            </div>
          )}
          
          {activeDataset === "marketPrices" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <MarketPricesCard data={data} loading={loading} datasetType="marketPrices" />
              <MapCard data={data} loading={loading} datasetType="marketPrices" />
            </div>
          )}
          
          {activeDataset === "fruitsVegetables" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <FruitsVegetablesCard data={data} loading={loading} datasetType="fruitsVegetables" />
              <MapCard data={data} loading={loading} datasetType="fruitsVegetables" />
            </div>
          )}
          
          {activeDataset === "varietyPrices" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <VarietyPricesCard data={data} loading={loading} datasetType="varietyPrices" />
              <MapCard data={data} loading={loading} datasetType="varietyPrices" />
            </div>
          )}
          
          {activeDataset === "cropProduction" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <CropProductionCard data={data} loading={loading} datasetType="cropProduction" />
              <MapCard data={data} loading={loading} datasetType="cropProduction" />
            </div>
          )}
          
          {activeDataset === "yieldIndex" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <YieldIndexCard data={data} loading={loading} datasetType="yieldIndex" />
              <MapCard data={data} loading={loading} datasetType="yieldIndex" />
            </div>
          )}
          
          {/* Default layout for other datasets */}
          {!["coldStorage", "fertilizerProduction", "vegetableProduction", "marketPrices", "landUtilization", "landUtilizationDetailed", "disasterDamage", "fruitsVegetables", "varietyPrices", "cropProduction", "yieldIndex"].includes(activeDataset) && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ColdStorageCard data={data} loading={loading} datasetType={activeDataset} />
                <FertilizerCard data={data} loading={loading} datasetType={activeDataset} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <WeatherCard data={data} loading={loading} datasetType={activeDataset} />
                <MarketPricesCard data={data} loading={loading} datasetType={activeDataset} />
              </div>
              
              {/* Map Card - Full Width */}
              <div className="mb-6">
                <MapCard data={data} loading={loading} datasetType={activeDataset} />
              </div>
            </>
          )}
        </div>
      )}

      {/* No Data State */}
      {!loading && data.length === 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h3>
              <p className="text-gray-600">No data found for the selected dataset. Please try a different dataset.</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-8 text-center text-sm text-gray-500">
        Data provided by Government of India APIs • Last updated: {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
}
