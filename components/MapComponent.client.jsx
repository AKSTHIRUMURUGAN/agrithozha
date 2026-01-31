'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, LayersControl, GeoJSON, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { createField, getFieldData, getSatelliteImagery } from '@/lib/agroMonitoring';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
  });
}

const MapContent = ({ onFieldDataUpdate }) => {
  const map = useMap();
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [layerType, setLayerType] = useState('satellite');
  const featureGroupRef = useRef();

  // Handle polygon creation
  const handleCreate = useCallback((e) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const geoJSON = layer.toGeoJSON();
      const newField = {
        id: `field_${Date.now()}`,
        name: `Field ${fields.length + 1}`,
        geoJSON: geoJSON.geometry,
        data: null
      };
      
      setFields(prev => [...prev, newField]);
      setSelectedField(newField);
      
      // Save to AgroMonitoring API
      createField(geoJSON, newField.name)
        .then(fieldData => {
          setFields(prev => 
            prev.map(f => f.id === newField.id ? { ...f, ...fieldData } : f)
          );
          onFieldDataUpdate?.(fieldData);
        })
        .catch(console.error);
    }
  }, [fields.length, onFieldDataUpdate]);

  // Handle field selection
  const handleFieldClick = useCallback((field) => {
    setSelectedField(field);
    if (field.data) {
      onFieldDataUpdate?.(field.data);
    } else {
      setIsLoading(true);
      getFieldData(field.id)
        .then(data => {
          const updatedField = { ...field, data };
          setFields(prev => 
            prev.map(f => f.id === field.id ? updatedField : f)
          );
          onFieldDataUpdate?.(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [onFieldDataUpdate]);

  // Render GeoJSON for each field
  const renderFields = () => {
    return fields.map(field => (
      <GeoJSON
        key={field.id}
        data={field.geoJSON}
        eventHandlers={{
          click: () => handleFieldClick(field)
        }}
        style={{
          color: field.id === selectedField?.id ? '#ff0000' : '#3388ff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.2
        }}
      >
        <Popup>
          <div>
            <h3 className="font-bold">{field.name}</h3>
            {field.data && (
              <div className="mt-2">
                <p>NDVI: {field.data.ndvi?.toFixed(2) || 'N/A'}</p>
                <p>Temperature: {field.data.weather?.temp || 'N/A'}°C</p>
              </div>
            )}
          </div>
        </Popup>
      </GeoJSON>
    ));
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow z-[1000]">
          Loading field data...
        </div>
      )}
      
      <LayersControl position="topright">
        {/* Base Layers */}
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
        </LayersControl.BaseLayer>
        
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            subdomains={['mt0','mt1','mt2','mt3']}
            attribution='&copy; Google Satellite'
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topleft"
          onCreated={handleCreate}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: {
              allowIntersection: false,
              showArea: true,
              drawError: {
                color: '#e1e100',
                message: '<strong>Error drawing polygon!<strong> (no intersection allowed)'
              },
              shapeOptions: {
                color: '#3388ff',
                fillColor: '#3388ff',
                fillOpacity: 0.2,
                weight: 2
              }
            }
          }}
        />
        {renderFields()}
      </FeatureGroup>
    </div>
  );
};

const MapComponent = ({ onFieldDataUpdate }) => {
  // Default center (adjust based on your region)
  const defaultCenter = [20.5937, 78.9629]; // India
  const defaultZoom = 5;

  // Only render on client-side
  if (typeof window === 'undefined') {
    return <div className="h-[600px] bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapContent onFieldDataUpdate={onFieldDataUpdate} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
