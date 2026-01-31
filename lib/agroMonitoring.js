const API_BASE_URL = 'https://api.agromonitoring.com';

export const createField = async (apiKey, name, geoJSON) => {
  const response = await fetch(`${API_BASE_URL}/agro/1.0/polygons?appid=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      geo_json: {
        type: 'Feature',
        properties: {},
        geometry: geoJSON
      }
    })
  });
  return response.json();
};

export const getFieldData = async (apiKey, polyid, start, end) => {
  // Get NDVI data
  const ndvi = fetch(`${API_BASE_URL}/agro/1.0/ndvi/history?polyid=${polyid}&start=${start}&end=${end}&appid=${apiKey}`)
    .then(res => res.json());

  // Get weather data
  const weather = fetch(`${API_BASE_URL}/agro/1.0/weather?polyid=${polyid}&appid=${apiKey}`)
    .then(res => res.json());

  // Get soil data
  const soil = fetch(`${API_BASE_URL}/agro/1.0/soil?polyid=${polyid}&appid=${apiKey}`)
    .then(res => res.json());

  // Get accumulated metrics
  const metrics = fetch(`${API_BASE_URL}/agro/1.0/accumulated?polyid=${polyid}&start=${start}&end=${end}&appid=${apiKey}`)
    .then(res => res.json());

  const [ndviData, weatherData, soilData, metricsData] = await Promise.all([ndvi, weather, soil, metrics]);
  
  return {
    ndvi: ndviData,
    weather: weatherData,
    soil: soilData,
    metrics: metricsData
  };
};

export const getSatelliteImagery = (apiKey, polyid, type = 'ndvi') => {
  // This is a simplified example - in reality, you'd need to calculate the appropriate tile coordinates
  // based on your polygon's bounding box
  const tileUrl = `${API_BASE_URL}/imagery/v1/${type}/tiles/{z}/{x}/{y}?appid=${apiKey}`;
  return tileUrl;
};
