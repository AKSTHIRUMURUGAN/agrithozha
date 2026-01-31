import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, sources } = await request.json()

    console.log("[v0] AI Assistant API called with message:", message)
    console.log("[v0] PERPLEXITY_API_KEY exists:", !!process.env.PERPLEXITY_API_KEY)

    // Check if API key exists
    if (!process.env.PERPLEXITY_API_KEY) {
      console.log("[v0] Missing PERPLEXITY_API_KEY")
      return NextResponse.json({
        response:
          "Hello friend! I'm currently being set up to give you the best farming advice. While I get ready, I can still help you with general agricultural guidance. What would you like to know about farming, schemes, or market prices?",
        sources: ["pmkisan.gov.in", "agmarknet.gov.in"],
      })
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: `You are AgriThozha, a warm and friendly AI assistant for Indian farmers. You're like a knowledgeable friend who always has time to help. 

IMPORTANT FORMATTING RULES:
- Never use * or # for formatting
- Use **bold text** for titles and important points
- Write in a conversational, friendly tone like talking to a friend
- Always include clickable website URLs when mentioning government portals
- Structure responses with clear sections using bold headings
- Give step-by-step guidance in numbered lists
- Be encouraging and supportive

Provide helpful guidance on:
- Government schemes (PM-KISAN, PMFBY, fertilizer subsidies)
- Market prices from AgMarkNet and eNAM
- Weather forecasts and farming alerts  
- Crop recommendations and best practices
- Fertilizer and pesticide guidance
- Agricultural loans and insurance
- Soil health and testing procedures

Always cite official sources with full URLs and be conversational yet informative. Focus on practical solutions with current data.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        search_domain_filter: [
          "pmkisan.gov.in",
          "agmarknet.gov.in",
          "icar.org.in",
          "kisansuvidha.gov.in",
          "enam.gov.in",
          "soilhealth.dac.gov.in",
          "pmfby.gov.in",
          "mkisan.gov.in",
          "nfsm.gov.in",
          "seednet.gov.in",
          "community.data.gov.in",
        ],
        search_recency_filter: "month",
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }),
    })

    console.log("[v0] Perplexity API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Perplexity API error response:", errorText)
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Perplexity API response data:", data)

    let aiResponse =
      data.choices?.[0]?.message?.content || "I apologize, but I cannot provide a response right now. Please try again."

    aiResponse = formatResponse(aiResponse)

    return NextResponse.json({
      response: aiResponse,
      sources: extractSources(aiResponse),
    })
  } catch (error) {
    console.error("[v0] AI Assistant API Error:", error)

    return NextResponse.json({
      response: `Hey there! I'm having a little trouble connecting to my knowledge base right now, but don't worry - I'm still here to help you! 

**For immediate assistance, you can visit these helpful portals:**

**Government Schemes**: Visit https://pmkisan.gov.in for PM-KISAN benefits and direct income support

**Market Prices**: Check https://agmarknet.gov.in for current mandi rates and price trends

**Weather Updates**: Use https://mkisan.gov.in for weather alerts and farming advisories

**Soil Testing**: Visit https://soilhealth.dac.gov.in for soil health cards and recommendations

**Crop Insurance**: Check https://pmfby.gov.in for PMFBY schemes and claim procedures

What specific farming question can I help you with? I'd love to guide you through any agricultural challenge you're facing!`,
      sources: ["pmkisan.gov.in", "agmarknet.gov.in", "mkisan.gov.in", "soilhealth.dac.gov.in"],
    })
  }
}

function formatResponse(content: string): string {
  // Remove markdown headers (# and ##)
  content = content.replace(/^#{1,6}\s+/gm, "")

  // Remove asterisk bullet points and replace with friendly formatting
  content = content.replace(/^\*\s+/gm, "• ")

  // Convert **text** to bold formatting (keep this for emphasis)
  // This will be handled by the frontend

  // Make URLs clickable by ensuring they're properly formatted
  content = content.replace(
    /(?<!https?:\/\/)(pmkisan\.gov\.in|agmarknet\.gov\.in|icar\.org\.in|kisansuvidha\.gov\.in|enam\.gov\.in|soilhealth\.dac\.gov\.in|pmfby\.gov\.in|mkisan\.gov\.in|nfsm\.gov\.in|seednet\.gov\.in|community\.data\.gov\.in)/g,
    "https://$1",
  )

  return content
}

function extractSources(content: string): string[] {
  // Extract government website mentions from the response
  const sources: string[] = []
  const websites = [
    "pmkisan.gov.in",
    "agmarknet.gov.in",
    "icar.org.in",
    "kisansuvidha.gov.in",
    "enam.gov.in",
    "soilhealth.dac.gov.in",
    "pmfby.gov.in",
    "mkisan.gov.in",
    "nfsm.gov.in",
    "seednet.gov.in",
    "community.data.gov.in",
  ]

  websites.forEach((site) => {
    if (content.toLowerCase().includes(site.toLowerCase()) || content.toLowerCase().includes(site.split(".")[0])) {
      sources.push(site)
    }
  })

  return sources.length > 0 ? sources : ["agmarknet.gov.in", "pmkisan.gov.in"]
}
