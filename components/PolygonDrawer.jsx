'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

const PolygonDrawer = ({ onPolygonCreated, onPolygonSelect, polygons, setPolygons }) => {
  const map = useMap();
  const featureGroupRef = useRef(L.featureGroup());
  const drawControlRef = useRef(null);

  // Initialize draw control
  useEffect(() => {
    if (!map) return;

    // Add feature group to the map
    const featureGroup = featureGroupRef.current;
    featureGroup.addTo(map);

    // Initialize draw control
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
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
        },
        rectangle: false,
        circle: false,
        circlemarker: false,
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

    // Handle draw events
    const handleCreated = (e) => {
      const layer = e.layer;
      const geoJSON = layer.toGeoJSON();
      const polygonId = `polygon_${Date.now()}`;
      
      // Store the polygon data
      const polygonData = {
        id: polygonId,
        geoJSON: geoJSON.geometry,
        latlngs: layer.getLatLngs()[0],
        area: L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]),
        layer: layer
      };
      
      // Add to feature group and state
      featureGroup.addLayer(layer);
      setPolygons(prev => [...prev, polygonData]);
      
      // Notify parent component
      if (onPolygonCreated) {
        onPolygonCreated(polygonData);
      }
      
      // Select the newly created polygon
      if (onPolygonSelect) {
        onPolygonSelect(polygonData);
      }
    };

    const handleEdited = (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const polygonId = layer._leaflet_id;
        const updatedPolygon = {
          id: polygonId,
          geoJSON: layer.toGeoJSON().geometry,
          latlngs: layer.getLatLngs()[0],
          area: L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]),
          layer: layer
        };
        
        setPolygons(prev => prev.map(p => 
          p.id === polygonId ? updatedPolygon : p
        ));
      });
    };

    const handleDeleted = (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const polygonId = layer._leaflet_id;
        setPolygons(prev => prev.filter(p => p.id !== polygonId));
        if (onPolygonSelect) {
          onPolygonSelect(null);
        }
      });
    };

    // Click handler for polygon selection
    const handleMapClick = (e) => {
      if (e.originalEvent.target._leaflet_id) {
        const clickedPolygon = polygons.find(
          p => p.id === e.originalEvent.target._leaflet_id
        );
        if (clickedPolygon && onPolygonSelect) {
          onPolygonSelect(clickedPolygon);
        }
      }
    };

    // Add event listeners
    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);
    map.on('click', handleMapClick);

    // Cleanup
    return () => {
      if (map) {
        map.off(L.Draw.Event.CREATED, handleCreated);
        map.off(L.Draw.Event.EDITED, handleEdited);
        map.off(L.Draw.Event.DELETED, handleDeleted);
        map.off('click', handleMapClick);
        map.removeControl(drawControl);
        map.removeLayer(featureGroup);
      }
    };
  }, [map, onPolygonCreated, onPolygonSelect, polygons, setPolygons]);

  // This component doesn't render anything itself
  return null;
};

export default PolygonDrawer;