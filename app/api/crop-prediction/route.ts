import { type NextRequest, NextResponse } from "next/server"

// API route: POST /api/crop-prediction
// Expects JSON body with farm details and returns structured prediction from Gemini
// Required env: GOOGLE_API_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      state,
      district,
      season,
      area,
      soilType,
      rainfall,
      temperature,
      humidity,
      ph,
    } = body || {}

    // Basic validation
    if (!state || !district || !season || !soilType) {
      return NextResponse.json(
        {
          error: "Missing required fields: state, district, season, soilType",
        },
        { status: 400 },
      )
    }

    const apiKey = "AIzaSyBJ3h_osEPJQHssS_3_IjmVjEAtfLR9RCgAIzaSyBhdZ8LgM1D9TOyxDFK_3SHFmBa_8od2zs"

    // Graceful fallback if API key not configured
    if (!apiKey) {
      const fallback = buildFallbackPrediction({ state, district, season, area, soilType, rainfall, temperature, humidity, ph })
      return NextResponse.json({ prediction: fallback, notice: "Using local heuristic fallback. Set GOOGLE_API_KEY for Gemini." })
    }

    // Build a precise prompt to get consistent, structured JSON
    const prompt = buildPrompt({ state, district, season, area, soilType, rainfall, temperature, humidity, ph })

    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent"

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      throw new Error(`Gemini API error: ${res.status} ${res.statusText} ${errText}`)
    }

    const gemini = await res.json()

    // The API returns JSON encoded as text in candidates[0].content.parts[0].text
    const text: string | undefined = gemini?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error("No candidates returned from Gemini")
    }

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      // Some responses might contain extra text around JSON; try to extract JSON block
      const jsonMatch = text.match(/\{[\s\S]*\}$/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Failed to parse JSON from Gemini response")
      }
    }

    return NextResponse.json({ prediction: parsed, model: "gemini-1.5-pro-latest" })
  } catch (error) {
    console.error("[crop-prediction] API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate crop prediction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function buildPrompt(input: {
  state: string
  district: string
  season: string
  area?: string
  soilType: string
  rainfall?: string
  temperature?: string
  humidity?: string
  ph?: string
}) {
  const infoLines = [
    `Region: ${input.district}, ${input.state}`,
    `Season: ${input.season}`,
    `Area (ha): ${input.area || "unknown"}`,
    `Soil type: ${input.soilType}`,
    `Rainfall (mm): ${input.rainfall || "unknown"}`,
    `Temperature (°C): ${input.temperature || "unknown"}`,
    `Humidity (%): ${input.humidity || "unknown"}`,
    `Soil pH: ${input.ph || "unknown"}`,
  ]
    .map((x) => `- ${x}`)
    .join("\n")

  return `You are an expert agronomist specializing in Indian agriculture (Kharif, Rabi, Zaid seasons) and region-specific crop planning. Use the farm context below to recommend the most suitable crops and actionable guidance.

Farm context:\n${infoLines}

Important requirements:
- OUTPUT MUST BE STRICT JSON only. No markdown, no comments, no extra text.
- Base recommendations on Indian agro-climatic zones, typical rainfall needs, soil compatibility, and seasonality.
- Quantify yield in tons/hectare or kg/hectare with realistic ranges for the specified region and season.
- Profit estimates in INR per hectare based on typical input costs and MSP/market price ranges.
- Include brief rationale for each crop.
- Be conservative and practical.

Return JSON in this exact schema:
{
  "recommendedCrops": [
    {
      "name": string,
      "suitability": number, // 0-100
      "expectedYield": string, // e.g., "4.0-4.8 tons/ha"
      "profit": string, // e.g., "₹40,000-₹55,000/ha"
      "rationale": string
    },
    ... up to 5 items
  ],
  "riskFactors": string[],
  "recommendations": string[]
}
`
}

function buildFallbackPrediction(input: {
  state?: string
  district?: string
  season?: string
  area?: string
  soilType?: string
  rainfall?: string
  temperature?: string
  humidity?: string
  ph?: string
}) {
  // Very basic heuristic example used when GOOGLE_API_KEY is not set
  const isHighRain = Number(input.rainfall || 0) >= 800
  const isNeutralPh = (() => {
    const v = Number(input.ph)
    return !Number.isNaN(v) && v >= 6 && v <= 7.5
  })()

  const crops = [] as any[]
  if (isHighRain) {
    crops.push({
      name: "Rice",
      suitability: 90,
      expectedYield: "3.8-4.6 tons/ha",
      profit: "₹40,000-₹55,000/ha",
      rationale: `High rainfall favors paddy; widely grown in ${input.state || "region"}.`
    })
  }
  crops.push({
    name: "Maize",
    suitability: isNeutralPh ? 80 : 70,
    expectedYield: "3.0-4.0 tons/ha",
    profit: "₹30,000-₹45,000/ha",
    rationale: "Tolerant to varied soils; good seasonal flexibility.",
  })

  return {
    recommendedCrops: crops.slice(0, 3),
    riskFactors: [
      "Mocked prediction due to missing GOOGLE_API_KEY",
      "Local climate variability not fully accounted",
    ],
    recommendations: [
      "Conduct a soil test to refine NPK requirements",
      "Adopt water-efficient irrigation (drip/sprinkler) where feasible",
      "Select regionally recommended varieties from state agri universities",
    ],
  }
}
