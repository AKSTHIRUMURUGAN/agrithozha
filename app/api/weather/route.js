import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    const apiKey = "d34350314886dc3dd5075e6c0e57db42";
    const baseUrl = "https://api.openweathermap.org/data/2.5";
    
    // Fetch current weather
    const currentWeatherUrl = `${baseUrl}/weather?q=${encodeURIComponent(query)}&appid=${apiKey}&units=metric`;
    const currentResponse = await fetch(currentWeatherUrl);
    
    if (!currentResponse.ok) {
      const errorData = await currentResponse.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch weather data" },
        { status: currentResponse.status }
      );
    }
    
    const currentWeather = await currentResponse.json();
    
    // Fetch 5-day forecast
    const forecastUrl = `${baseUrl}/forecast?q=${encodeURIComponent(query)}&appid=${apiKey}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);
    
    if (!forecastResponse.ok) {
      // If forecast fails, still return current weather
      return NextResponse.json({
        current: currentWeather,
        forecast: null
      });
    }
    
    const forecast = await forecastResponse.json();
    
    return NextResponse.json({
      current: currentWeather,
      forecast: forecast
    });
    
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
