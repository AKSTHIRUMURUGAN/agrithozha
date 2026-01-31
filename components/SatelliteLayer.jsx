import { useEffect } from 'react';
import { useMap, TileLayer } from 'react-leaflet';
import { LayersControl } from 'react-leaflet';

const SatelliteLayer = () => {
  const map = useMap();

  return (
    <LayersControl.Overlay checked name="NDVI Layer">
      <TileLayer
        url={`https://api.agromonitoring.com/imagery/v1/ndvi/tiles/{z}/{x}/{y}?appid=${process.env.NEXT_PUBLIC_AGRO_KEY}`}
        attribution="AgroMonitoring NDVI"
        opacity={0.7}
      />
    </LayersControl.Overlay>
  );
};

export default SatelliteLayer;