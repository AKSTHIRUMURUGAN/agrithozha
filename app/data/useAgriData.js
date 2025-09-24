import { useState, useEffect } from "react";

export const useAgriData = (resourceId, filters = {}, limit = 10, apiKey) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resourceId) return;
    const params = new URLSearchParams({
      "api-key": apiKey,
      format: "json",
      limit,
      ...filters,
    });

    fetch(`https://api.data.gov.in/resource/${resourceId}?${params}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json.records || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data", err);
        setLoading(false);
      });
  }, [resourceId, JSON.stringify(filters), limit]);

  return { data, loading };
};
