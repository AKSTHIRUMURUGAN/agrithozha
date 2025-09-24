"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issues in some builds
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom marker component that handles dragging
function DraggableMarker({ coords, current, onLocationChange }) {
  const [position, setPosition] = useState([coords.lat, coords.lon]);

  useEffect(() => {
    setPosition([coords.lat, coords.lon]);
  }, [coords]);

  const eventHandlers = {
    dragend: (e) => {
      const marker = e.target;
      const newPosition = marker.getLatLng();
      setPosition([newPosition.lat, newPosition.lng]);
      // Call the parent callback with new coordinates
      onLocationChange(newPosition.lat, newPosition.lng);
    },
  };

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <div className="text-center">
          <div className="font-semibold">{current?.name ?? 'Location'}</div>
          <div className="text-lg">{current ? Math.round(current.main.temp) + '°C' : ''}</div>
          <div className="text-sm text-gray-600">Drag to change location</div>
        </div>
      </Popup>
    </Marker>
  );
}

// Map events component to handle map interactions
function MapEvents({ onLocationChange }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
}

export default function MapComponent({ coords, mapZoom, current, tileLayer, onLocationChange }) {
  // Only render on client side
  if (typeof window === 'undefined') {
    return <div className="h-full bg-gray-200 rounded flex items-center justify-center">Loading map...</div>;
  }

  return (
    <MapContainer 
      center={[coords.lat, coords.lon]} 
      zoom={mapZoom} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* OpenWeather tile overlay (temperature) - only show if tileLayer is provided */}
      {tileLayer && (
        <TileLayer url={tileLayer} opacity={0.6} />
      )}

      {/* Draggable marker */}
      <DraggableMarker 
        coords={coords} 
        current={current} 
        onLocationChange={onLocationChange}
      />

      {/* Map click events */}
      <MapEvents onLocationChange={onLocationChange} />
    </MapContainer>
  );
}
