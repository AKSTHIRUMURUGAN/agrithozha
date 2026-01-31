"use client"

import { useState, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Bug, Upload, Camera, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"

export default function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [symptoms, setSymptoms] = useState("")
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
  const handleAnalyze = async (e) => {
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
     

      const apiKey = "AIzaSyD3nQ4W9-N4jYuyrUdtChlbQ8AHdudZYwo"// Replace with your actual API key
      console.log(apiKey)
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

      const prompt = `Analyze this plant image and identify any diseases. Provide a JSON response with:
{
  "disease": "Disease Name or Healthy",
  "confidence": "X%",
  "description": "Disease description",
  "treatment": ["Step 1", "Step 2", "Step 3"],
  "prevention": ["Tip 1", "Tip 2", "Tip 3"]
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

      setPrediction({
        name: predictionData.disease,
        confidence: predictionData.confidence,
        description: predictionData.description,
        treatment: predictionData.treatment || [],
        prevention: predictionData.prevention || []
      })

    } catch (err) {
      console.error("Prediction error:", err)
      setError(err.message || "Failed to analyze the image")
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <Bug className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Disease Detection</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload crop images for instant disease identification and treatment recommendations
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-red-600" />
                  Disease Detection
                </CardTitle>
                <CardDescription>Upload clear images of affected plant parts for accurate diagnosis</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnalyze} className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <Label>Plant Image</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {selectedImage ? (
                        <div className="space-y-4">
                          <Image
                            src={selectedImage}
                            alt="Uploaded crop"
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
                            <p className="text-lg font-medium text-gray-900">Upload crop image</p>
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


                  {/* Symptoms */}
                  <div>
                    <Label htmlFor="symptoms">Observed Symptoms</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Describe what you observe: leaf spots, wilting, discoloration, etc."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading || !selectedImage}
                  >
                    {loading ? "Analyzing Image..." : "Detect Disease"}
                  </Button>

                  {error && <p className="text-red-600 mt-2">{error}</p>}
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {prediction ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {prediction.name === "Healthy" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      {prediction.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p><strong>Confidence:</strong> {prediction.confidence}</p>
                    <p><strong>Description:</strong> {prediction.description}</p>

                    {prediction.treatment.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-600 mb-2">Treatment</h4>
                        <ul className="list-disc list-inside">
                          {prediction.treatment.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    )}

                    {prediction.prevention.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-600 mb-2">Prevention</h4>
                        <ul className="list-disc list-inside">
                          {prediction.prevention.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
                    <p className="text-gray-600">Upload a clear image of your crop for disease detection</p>
                  </CardContent>
                </Card>
              )}

              {/* Photography Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Photography Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                      Take photos in good natural light
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                      Focus on affected areas clearly
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                      Include both healthy and diseased parts
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                      Avoid blurry or dark images
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
