"use client"

import { useState, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Leaf, CheckCircle, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function CropPrediction() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [location, setLocation] = useState("")
  const [soilType, setSoilType] = useState("")
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  // Handle image selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setSelectedImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  // Main analyze function
  const handlePredict = async (e) => {
    e.preventDefault()

    if (!selectedImage) {
      setError("Please select an image")
      return
    }

    setLoading(true)
    setError("")
    setPrediction(null)

    try {
      // Convert selected image to base64
      const file = fileInputRef.current.files[0]
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
      })

      const apiKey = "AIzaSyD3nQ4W9-N4jYuyrUdtChlbQ8AHdudZYwo"
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`

      const prompt = `Analyze this agricultural land image and provide crop prediction recommendations. Consider the following details:
- Location: ${location || 'Not specified'}
- Soil Type: ${soilType || 'Not specified'}

Provide a JSON response with:
{
  "suitableCrops": ["Crop 1", "Crop 2", "Crop 3"],
  "bestMatch": "Best matching crop",
  "confidence": "X%",
  "analysis": "Detailed analysis of why these crops are suitable",
  "growingConditions": {
    "soil": "Ideal soil conditions",
    "climate": "Suitable climate conditions",
    "water": "Water requirements"
  },
  "plantingTips": ["Tip 1", "Tip 2", "Tip 3"],
  "expectedYield": "Expected yield information"
}`

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Image
                }
              }
            ]
          }
        ]
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error(`API request failed with status ${response.status}`)

      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw new Error("No valid response from AI model")

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("Could not parse AI response")

      const predictionData = JSON.parse(jsonMatch[0])
      setPrediction(predictionData)

    } catch (err) {
      console.error("Prediction error:", err)
      setError(err.message || "Failed to analyze the image. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Crop Prediction</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload land images to get AI-powered crop recommendations based on your soil and location
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  Analyze Your Land
                </CardTitle>
                <CardDescription>Upload clear images of your agricultural land for accurate crop prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePredict} className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <Label>Land Image</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {selectedImage ? (
                        <div className="space-y-4">
                          <Image
                            src={selectedImage}
                            alt="Uploaded land"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg object-cover"
                          />
                          <p className="text-sm text-gray-600">Click to change image</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-gray-900">Upload land image</p>
                            <p className="text-sm text-gray-600">PNG, JPG up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="location">Location (Optional)</Label>
                    <input
                      id="location"
                      type="text"
                      placeholder="E.g., Punjab, India"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* Soil Type */}
                  <div>
                    <Label htmlFor="soilType">Soil Type (Optional)</Label>
                    <select
                      id="soilType"
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select soil type</option>
                      <option value="clay">Clay</option>
                      <option value="sandy">Sandy</option>
                      <option value="loamy">Loamy</option>
                      <option value="silty">Silty</option>
                      <option value="peaty">Peaty</option>
                      <option value="chalky">Chalky</option>
                      <option value="black">Black Soil</option>
                      <option value="red">Red Soil</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading || !selectedImage}
                  >
                    {loading ? "Analyzing Land..." : "Get Crop Recommendations"}
                  </Button>

                  {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {prediction ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Crop Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Best Match</h3>
                      <p className="text-2xl font-bold text-green-700">{prediction.bestMatch}</p>
                      <p className="text-sm text-green-600 mt-1">Confidence: {prediction.confidence}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Suitable Crops</h3>
                      <div className="flex flex-wrap gap-2">
                        {prediction.suitableCrops?.map((crop, i) => (
                          <span key={i} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Analysis</h3>
                      <p className="text-gray-700">{prediction.analysis}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Growing Conditions</h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm"><span className="font-medium">Soil:</span> {prediction.growingConditions?.soil || 'N/A'}</p>
                          <p className="text-sm mt-1"><span className="font-medium">Climate:</span> {prediction.growingConditions?.climate || 'N/A'}</p>
                          <p className="text-sm mt-1"><span className="font-medium">Water:</span> {prediction.growingConditions?.water || 'N/A'}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Expected Yield</h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm">{prediction.expectedYield || 'Yield information not available'}</p>
                        </div>
                      </div>
                    </div>

                    {prediction.plantingTips?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Planting Tips</h3>
                        <ul className="space-y-2">
                          {prediction.plantingTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
                    <p className="text-gray-600">Upload an image of your agricultural land to get crop recommendations</p>
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Photography Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
                      Take photos in good natural light
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
                      Capture the entire field if possible
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
                      Include soil in the image for better analysis
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
                      Avoid shadows and reflections
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
