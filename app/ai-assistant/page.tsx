"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Loader2, ExternalLink, Sprout } from "lucide-react"
import { FormattedMessage } from "./FormattedMessage"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: string[]
}

const GOVERNMENT_PORTALS = [
  { name: "PM Kisan", url: "https://pmkisan.gov.in/", description: "Direct income support to farmers" },
  { name: "AgMarkNet", url: "https://www.agmarknet.gov.in/", description: "Agricultural marketing information" },
  { name: "ICAR", url: "https://www.icar.org.in/", description: "Indian Council of Agricultural Research" },
  { name: "Kisan Suvidha", url: "https://kisansuvidha.gov.in/", description: "Farmer services portal" },
  { name: "NFSM", url: "https://www.nfsm.gov.in/", description: "National Food Security Mission" },
  { name: "SeedNet", url: "https://seednet.gov.in/", description: "Seed certification and quality" },
  { name: "eNAM", url: "https://www.enam.gov.in/web/", description: "National Agriculture Market" },
  { name: "Soil Health", url: "https://soilhealth.dac.gov.in/home", description: "Soil health card scheme" },
  { name: "PMFBY", url: "https://pmfby.gov.in/", description: "Crop insurance scheme" },
  { name: "mKisan", url: "https://mkisan.gov.in/", description: "Mobile advisory services" },
  { name: "Data Gov", url: "https://community.data.gov.in/", description: "Government data portal" },
]

const QUICK_ACTIONS = [
  "Check PM Kisan status",
  "Find crop insurance schemes",
  "Get mandi prices today",
  "Weather forecast for farming",
  "Fertilizer subsidy schemes",
  "Seed varieties for my region",
  "Soil health card benefits",
  "Agricultural loan options",
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Namaste! I'm AgriThozha, your friendly farming assistant. I'm here to help you with government schemes, loans, market prices, weather updates, and farming guidance. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message?: string) => {
    const userMessage = message || input.trim()
    if (!userMessage || isLoading) return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: userMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simulate API call to Perplexity with government data sources
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          sources: GOVERNMENT_PORTALS.map((portal) => portal.url),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response || getSimulatedResponse(userMessage),
        timestamp: new Date(),
        sources: data.sources || getRelevantSources(userMessage),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can visit the government portals directly for immediate assistance.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getSimulatedResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("pm kisan") || lowerMessage.includes("pmkisan")) {
      return `**PM Kisan Samman Nidhi Scheme**

Great question! PM Kisan provides ₹6,000 annually to eligible farmers in 3 installments of ₹2,000 each. Here's how you can check your status:

**Step-by-step process:**
1. Visit https://pmkisan.gov.in
2. Click on 'Beneficiary Status' 
3. Enter your Aadhaar number, Account number, or Mobile number
4. View your payment history and next installment date

**Eligibility criteria:**
• Small and marginal farmers with cultivable land up to 2 hectares
• Aadhaar must be linked to your bank account
• Land records should be updated

**Pro tip:** Make sure your Aadhaar is linked to your bank account for smooth transfers. If you face any issues, visit your nearest Common Service Center (CSC) for assistance!`
    }

    if (lowerMessage.includes("crop insurance") || lowerMessage.includes("pmfby")) {
      return `**Pradhan Mantri Fasal Bima Yojana (PMFBY)**

I'm happy to help you with crop insurance! PMFBY provides comprehensive coverage for your crops.

**Premium Rates (very affordable!):**
• Kharif crops: Only 2% of sum insured
• Rabi crops: Only 1.5% of sum insured  
• Horticultural crops: 5% of sum insured

**What's covered:**
• Natural calamities (drought, flood, hailstorm)
• Pest attacks and diseases
• Fire and lightning damage

**How to enroll:**
1. Visit your nearest bank branch
2. Go to Common Service Centers (CSCs)
3. Online at https://pmfby.gov.in
4. Contact your agriculture officer

**Important:** You must enroll before the cut-off date (usually 1-2 weeks before sowing). For 2024-25, over 4 crore farmers are already protected!`
    }

    if (lowerMessage.includes("mandi price") || lowerMessage.includes("market price")) {
      return `**Today's Mandi Prices**

Here are the current market rates updated daily on AgMarkNet:

**Key Commodity Prices:**
• Wheat: ₹2,125-2,200 per quintal
• Rice: ₹2,040-2,060 per quintal  
• Cotton: ₹5,800-6,200 per quintal
• Sugarcane: ₹340-350 per quintal

**How to check live prices:**
1. Visit https://agmarknet.gov.in
2. Select your state and district
3. Choose your commodity and date
4. View real-time prices from nearby mandis

**Bonus tip:** Download the eNAM app for online trading and better price discovery across 1,000+ mandis. You can also set price alerts for your crops!

**For better prices:** Consider selling through eNAM platform at https://enam.gov.in for transparent pricing and direct buyer access.`
    }

    return `**Hello friend!** 

I'm AgriThozha, and I'm here to help you with all your farming needs! I have access to the latest information from government portals and can guide you through:

**What I can help you with:**
• **Government Schemes:** PM Kisan, fertilizer subsidies, equipment grants
• **Market Intelligence:** Daily mandi prices, demand forecasts  
• **Technical Support:** Crop selection, soil health, pest management
• **Financial Aid:** Agricultural loans, insurance, emergency support
• **Weather Updates:** Forecasts, alerts, and farming advisories

**Popular government portals I can guide you through:**
• https://pmkisan.gov.in - For direct income support
• https://agmarknet.gov.in - For market prices
• https://soilhealth.dac.gov.in - For soil testing
• https://pmfby.gov.in - For crop insurance

Please ask me about any specific topic, and I'll provide detailed, step-by-step guidance with the most current information. What would you like to know about today?`
  }

  const getRelevantSources = (message: string): string[] => {
    const lowerMessage = message.toLowerCase()
    const sources: string[] = []

    if (lowerMessage.includes("pm kisan")) sources.push("pmkisan.gov.in")
    if (lowerMessage.includes("insurance") || lowerMessage.includes("pmfby")) sources.push("pmfby.gov.in")
    if (lowerMessage.includes("price") || lowerMessage.includes("mandi"))
      sources.push("agmarknet.gov.in", "enam.gov.in")
    if (lowerMessage.includes("soil")) sources.push("soilhealth.dac.gov.in")
    if (lowerMessage.includes("seed")) sources.push("seednet.gov.in")

    return sources.length > 0 ? sources : ["agmarknet.gov.in", "pmkisan.gov.in"]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mr-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AgriThozha AI Assistant</h1>
              <p className="text-lg text-gray-600 mt-2">Your intelligent farming companion</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Government Portals Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Government Portals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {GOVERNMENT_PORTALS.slice(0, 6).map((portal) => (
                  <a
                    key={portal.name}
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border hover:bg-green-50 hover:border-green-200 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900">{portal.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{portal.description}</div>
                  </a>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {QUICK_ACTIONS.slice(0, 4).map((action) => (
                  <Button
                    key={action}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2 text-xs"
                    onClick={() => handleSendMessage(action)}
                  >
                    {action}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Sprout className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Chat with AgriThozha</CardTitle>
                    <p className="text-sm text-gray-600">
                      Get real-time farming guidance and government scheme information
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                      <div
                        className={`rounded-lg p-4 ${
                          message.type === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === "assistant" && <Bot className="w-5 h-5 mt-0.5 text-green-600" />}
                          {message.type === "user" && <User className="w-5 h-5 mt-0.5 text-white" />}
                          <div className="flex-1">
                            <FormattedMessage content={message.content} />
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-600 mb-2">Sources:</div>
                                <div className="flex flex-wrap gap-1">
                                  {message.sources.map((source, index) => (
                                    <a
                                      key={index}
                                      href={`https://${source}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block"
                                    >
                                      <Badge variant="secondary" className="text-xs hover:bg-green-100 cursor-pointer">
                                        {source}
                                      </Badge>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 px-2">{message.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-green-600" />
                      <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                      <span className="text-gray-600">AgriThozha is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about schemes, prices, weather, loans..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {QUICK_ACTIONS.slice(4, 8).map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() => handleSendMessage(action)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
