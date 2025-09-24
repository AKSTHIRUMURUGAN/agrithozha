"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Brain, Sprout, TrendingUp, MapPin, Loader2 } from "lucide-react"

// Gemini API key (in a real app, this should be stored securely and accessed via environment variables)
const GEMINI_API_KEY = "AIzaSyD3nQ4W9-N4jYuyrUdtChlbQ8AHdudZYwo" // Replace with your actual API key

export default function CropPredictionPage() {
  const [formData, setFormData] = useState({
    state: "",
    district: "",
    season: "",
    area: "",
    soilType: "",
    rainfall: "",
    temperature: "",
    humidity: "",
    ph: "",
  })
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const callGeminiAPI = async (prompt: string) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      return data.candidates[0].content.parts[0].text
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      throw error
    }
  }

  const parseGeminiResponse = (response: string) => {
    try {
      // Try to parse JSON if the response is in JSON format
      if (response.trim().startsWith('{') || response.trim().startsWith('[')) {
        return JSON.parse(response)
      }
      
      // If not JSON, try to extract structured data from text
      const recommendedCrops = []
      const riskFactors = []
      const recommendations = []
      
      // Simple parsing logic - you might need to adjust this based on your actual response format
      const lines = response.split('\n')
      let currentSection = ''
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        
        if (trimmedLine.includes('Recommended Crops') || trimmedLine.includes('CROP RECOMMENDATIONS')) {
          currentSection = 'crops'
        } else if (trimmedLine.includes('Risk Factors') || trimmedLine.includes('RISK ANALYSIS')) {
          currentSection = 'risks'
        } else if (trimmedLine.includes('Recommendations') || trimmedLine.includes('ADVICE')) {
          currentSection = 'recommendations'
        } else if (trimmedLine && currentSection === 'crops' && !trimmedLine.includes(':')) {
          // Simple crop detection - you might want to improve this
          const suitabilityMatch = trimmedLine.match(/(\d+)%/)
          if (suitabilityMatch) {
            recommendedCrops.push({
              name: trimmedLine.split('(')[0].trim(),
              suitability: parseInt(suitabilityMatch[1]),
              expectedYield: "Varies based on conditions",
              profit: "To be calculated"
            })
          }
        } else if (trimmedLine && currentSection === 'risks') {
          if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
            riskFactors.push(trimmedLine.substring(1).trim())
          }
        } else if (trimmedLine && currentSection === 'recommendations') {
          if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
            recommendations.push(trimmedLine.substring(1).trim())
          }
        }
      }
      
      // If we couldn't parse anything meaningful, provide a fallback
      if (recommendedCrops.length === 0 && riskFactors.length === 0 && recommendations.length === 0) {
        return {
          recommendedCrops: [
            { name: "Rice", suitability: 75, expectedYield: "4-6 tons/hectare", profit: "₹30,000-45,000/hectare" },
            { name: "Wheat", suitability: 65, expectedYield: "3-5 tons/hectare", profit: "₹25,000-40,000/hectare" }
          ],
          riskFactors: ["Moderate rainfall variability", "Potential pest issues"],
          recommendations: ["Implement drip irrigation", "Use organic fertilizers", "Monitor soil pH regularly"]
        }
      }
      
      return {
        recommendedCrops,
        riskFactors: riskFactors.length > 0 ? riskFactors : ["No significant risks identified"],
        recommendations: recommendations.length > 0 ? recommendations : ["Follow standard agricultural practices for your region"]
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error)
      // Fallback response if parsing fails
      return {
        recommendedCrops: [
          { name: "Maize", suitability: 70, expectedYield: "5-7 tons/hectare", profit: "₹35,000-50,000/hectare" },
          { name: "Pulses", suitability: 60, expectedYield: "1-2 tons/hectare", profit: "₹20,000-35,000/hectare" }
        ],
        riskFactors: ["Limited data available for precise risk assessment"],
        recommendations: ["Consult with local agricultural extension officer", "Test soil nutrients before planting"]
      }
    }
  }

  const handlePredict = async () => {
    setLoading(true)
    setPrediction(null)

    try {
      // Create a detailed prompt for Gemini
      const prompt = `
        Act as an agricultural expert. Based on the following farm details, provide crop recommendations:
        
        Location: ${formData.district}, ${formData.state}
        Season: ${formData.season}
        Farm Area: ${formData.area} hectares
        Soil Type: ${formData.soilType}
        Annual Rainfall: ${formData.rainfall} mm
        Average Temperature: ${formData.temperature}°C
        Average Humidity: ${formData.humidity}%
        Soil pH: ${formData.ph}
        
        Please provide your response in the following JSON format:
        {
          "recommendedCrops": [
            {
              "name": "Crop Name",
              "suitability": 85,
              "expectedYield": "Yield estimate",
              "profit": "Profit estimate"
            }
          ],
          "riskFactors": ["Risk factor 1", "Risk factor 2"],
          "recommendations": ["Recommendation 1", "Recommendation 2"]
        }
        
        If you cannot provide specific data, make educated estimates based on the region and conditions.
        Focus on crops commonly grown in ${formData.state}, India.
      `

      const geminiResponse = await callGeminiAPI(prompt)
      const parsedPrediction = parseGeminiResponse(geminiResponse)
      
      setPrediction(parsedPrediction)
    } catch (error) {
      console.error("Prediction error:", error)
      // Fallback to mock data if API fails
      setPrediction({
        recommendedCrops: [
          { 
            name: "Rice", 
            suitability: 78, 
            expectedYield: "4.5-5.5 tons/hectare", 
            profit: "₹35,000-45,000/hectare" 
          },
          { 
            name: "Cotton", 
            suitability: 65, 
            expectedYield: "2-3 tons/hectare", 
            profit: "₹40,000-60,000/hectare" 
          },
          { 
            name: "Soybean", 
            suitability: 62, 
            expectedYield: "2.5-3.5 tons/hectare", 
            profit: "₹30,000-45,000/hectare" 
          }
        ],
        riskFactors: [
          "Rainfall may be insufficient during critical growth stages",
          "Soil pH is slightly outside optimal range for some crops"
        ],
        recommendations: [
          "Consider installing irrigation system for dry spells",
          "Apply soil amendments to adjust pH before planting",
          "Use drought-resistant crop varieties"
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const getSuitabilityColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 75) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Crop Prediction</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get personalized crop recommendations based on your location, soil, and weather conditions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Farm Details
                </CardTitle>
                <CardDescription>Provide your farm information for accurate crop predictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select onValueChange={(value) => handleInputChange("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                        <SelectItem value="kerala">Kerala</SelectItem>
                        <SelectItem value="punjab">Punjab</SelectItem>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="district">District</Label>
                    <Input
                      placeholder="Enter district"
                      value={formData.district}
                      onChange={(e) => handleInputChange("district", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="season">Season</Label>
                    <Select onValueChange={(value) => handleInputChange("season", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kharif">Kharif (Jun-Oct)</SelectItem>
                        <SelectItem value="rabi">Rabi (Nov-Apr)</SelectItem>
                        <SelectItem value="summer">Summer (Apr-Jun)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="area">Area (hectares)</Label>
                    <Input
                      type="number"
                      placeholder="Enter area"
                      value={formData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Select onValueChange={(value) => handleInputChange("soilType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay">Clay</SelectItem>
                      <SelectItem value="sandy">Sandy</SelectItem>
                      <SelectItem value="loamy">Loamy</SelectItem>
                      <SelectItem value="black">Black Cotton</SelectItem>
                      <SelectItem value="red">Red Soil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rainfall">Rainfall (mm)</Label>
                    <Input
                      type="number"
                      placeholder="Annual rainfall"
                      value={formData.rainfall}
                      onChange={(e) => handleInputChange("rainfall", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      type="number"
                      placeholder="Avg temperature"
                      value={formData.temperature}
                      onChange={(e) => handleInputChange("temperature", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <Input
                      type="number"
                      placeholder="Avg humidity"
                      value={formData.humidity}
                      onChange={(e) => handleInputChange("humidity", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ph">Soil pH</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    placeholder="Soil pH level"
                    value={formData.ph}
                    onChange={(e) => handleInputChange("ph", e.target.value)}
                  />
                </div>

                <Button onClick={handlePredict} className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Get AI Prediction
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Prediction Results */}
            <div className="space-y-6">
              {prediction ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sprout className="w-5 h-5 mr-2 text-green-600" />
                        Recommended Crops
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {prediction.recommendedCrops.map((crop: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{crop.name}</h3>
                            <Badge className={getSuitabilityColor(crop.suitability)}>
                              {crop.suitability}% Suitable
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Expected Yield:</span>
                              <p className="font-medium">{crop.expectedYield}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Estimated Profit:</span>
                              <p className="font-medium text-green-600">{crop.profit}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                        Risk Analysis & Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Risk Factors:</h4>
                        <ul className="space-y-1">
                          {prediction.riskFactors.map((risk: string, index: number) => (
                            <li key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                              • {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {prediction.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">AI Prediction Ready</h3>
                    <p className="text-gray-600">Fill in your farm details to get personalized crop recommendations</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}