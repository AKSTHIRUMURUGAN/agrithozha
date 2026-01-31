'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, Polygon, Marker, Popup, useMap } from 'react-leaflet';

// Fix for Leaflet markers
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapClickHandler = ({ isDrawing, onMapClick }) => {
  useMapEvents({
    click(e) {
      if (isDrawing && onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const MapController = ({ center, zoom, selectedPolygon, mapType }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedPolygon && selectedPolygon.coordinates && selectedPolygon.coordinates.length > 0) {
      try {
        const bounds = new L.LatLngBounds(selectedPolygon.coordinates);
        map.fitBounds(bounds, { padding: [20, 20] });
      } catch (error) {
        console.warn('Error fitting bounds:', error);
        map.setView(center, zoom);
      }
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom, selectedPolygon]);

  // Force map refresh when type changes
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map, mapType]);

  return null;
};

// Tile layer component that updates when mapType changes
const DynamicTileLayer = ({ mapType }) => {
  const map = useMap();
  
  const tileLayers = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
    },
    standard: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
  };

  const currentLayer = tileLayers[mapType] || tileLayers.standard;

  return (
    <TileLayer
      url={currentLayer.url}
      attribution={currentLayer.attribution}
      maxZoom={19}
      minZoom={2}
    />
  );
};

export default function EnhancedMap({
  center = [20.5937, 78.9629],
  zoom = 5,
  mapType = 'standard',
  isDrawing = false,
  drawingPoints = [],
  selectedPolygon = null,
  polygons = [],
  onMapClick = () => {},
  onPolygonSelect = () => {},
}) {
  const mapRef = useRef();

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ 
          height: '100%', 
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}
        whenCreated={(map) => { 
          mapRef.current = map;
          // Force tile layer refresh
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }}
        zoomControl={true}
      >
        <DynamicTileLayer mapType={mapType} />
        
        <MapController center={center} zoom={zoom} selectedPolygon={selectedPolygon} mapType={mapType} />
        <MapClickHandler isDrawing={isDrawing} onMapClick={onMapClick} />

        {/* Drawing polygon preview */}
        {isDrawing && drawingPoints.length >= 2 && (
          <Polygon
            positions={drawingPoints}
            pathOptions={{
              color: '#3B82F6',
              weight: 3,
              fillColor: '#60A5FA',
              fillOpacity: 0.2,
              dashArray: '5, 5'
            }}
          />
        )}

        {/* Drawing points */}
        {isDrawing && drawingPoints.map((point, index) => (
          <Marker key={`drawing-${index}`} position={point}>
            <Popup>
              <div className="text-center min-w-[120px]">
                <div className="font-medium text-sm">Point {index + 1}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Lat: {point[0].toFixed(4)}<br/>
                  Lng: {point[1].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Existing polygons */}
        {polygons.map((polygon) => (
          <Polygon
            key={polygon.id}
            positions={polygon.coordinates}
            eventHandlers={{
              click: () => onPolygonSelect(polygon),
            }}
            pathOptions={{
              color: polygon.id === selectedPolygon?.id ? '#10B981' : '#EF4444',
              weight: polygon.id === selectedPolygon?.id ? 4 : 2,
              fillColor: polygon.id === selectedPolygon?.id ? '#10B981' : '#EF4444',
              fillOpacity: 0.1,
            }}
          />
        ))}

        {/* Selected polygon highlight */}
        {selectedPolygon && (
          <Polygon
            positions={selectedPolygon.coordinates}
            pathOptions={{
              color: '#10B981',
              weight: 4,
              fillColor: '#10B981',
              fillOpacity: 0.2,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}