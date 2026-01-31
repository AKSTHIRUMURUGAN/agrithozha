'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Dynamic imports for Leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/images/marker-icon-2x.png',
        iconUrl: '/images/marker-icon.png',
        shadowUrl: '/images/marker-shadow.png',
      });
    }
    return mod.MapContainer;
  }),
  { 
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-100 flex items-center justify-center">Loading map...</div>
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const MapComponent = () => {
  const [geoJson, setGeoJson] = useState(null);
  const mapRef = useRef(null);
  const featureGroupRef = useRef(null);
  const drawControlRef = useRef(null);
  
  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const defaultZoom = 5;

  // Initialize map and drawing controls
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const L = require('leaflet');
    const map = mapRef.current.leafletElement;
    
    // Initialize feature group
    const featureGroup = new L.FeatureGroup();
    map.addLayer(featureGroup);
    featureGroupRef.current = featureGroup;

    // Initialize draw control
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> Polygon edges cannot cross!'
          },
          shapeOptions: {
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0.2,
            weight: 2
          }
        },
        rectangle: false,
        circle: false,
        marker: false,
        polyline: false
      },
      edit: {
        featureGroup: featureGroup,
        remove: true
      }
    });

    // Add draw control to map
    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    // Handle created features
    const handleCreated = (e) => {
      const layer = e.layer;
      const geoJSON = layer.toGeoJSON();
      setGeoJson(JSON.stringify(geoJSON, null, 2));
      
      // Add to feature group
      featureGroup.addLayer(layer);
    };

    // Add event listeners
    map.on(L.Draw.Event.CREATED, handleCreated);

    // Clean up
    return () => {
      if (map) {
        map.off(L.Draw.Event.CREATED, handleCreated);
        if (drawControlRef.current) {
          map.removeControl(drawControlRef.current);
        }
        if (featureGroupRef.current) {
          map.removeLayer(featureGroupRef.current);
        }
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="h-[500px] w-full relative border rounded-lg overflow-hidden">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
        </MapContainer>
      </div>
      
      {geoJson && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">GeoJSON Output</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {geoJson}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MapComponent;