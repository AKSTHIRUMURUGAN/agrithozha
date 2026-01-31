"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Leaf, TrendingUp, AlertCircle } from "lucide-react"

interface PredictionResult {
  primaryFertilizer: string;
  quantity: string;
  applicationTiming: string;
  organicAlternatives: string[];
  micronutrients: string[];
  costEstimate: string;
  expectedYieldIncrease: string;
}

export default function FertilizerPrediction() {
  const [formData, setFormData] = useState({
    cropType: "",
    soilType: "",
    soilPh: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    rainfall: "",
    location: "",
  })
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate AI prediction
    setTimeout(() => {
      const recommendations = {
        primaryFertilizer: "NPK 20-20-20",
        quantity: "150 kg/hectare",
        applicationTiming: "Split application: 50% at sowing, 25% at 30 days, 25% at 60 days",
        organicAlternatives: ["Vermicompost: 2 tons/hectare", "Neem cake: 200 kg/hectare"],
        micronutrients: ["Zinc Sulphate: 25 kg/hectare", "Boron: 1 kg/hectare"],
        costEstimate: "₹8,500 - ₹12,000 per hectare",
        expectedYieldIncrease: "15-25%",
      }
      setPrediction(recommendations)
      setLoading(false)
    }, 2000)
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI-Powered Fertilizer Recommendation</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get personalized fertilizer recommendations based on your soil conditions, crop type, and environmental
              factors
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Farm & Soil Details
                </CardTitle>
                <CardDescription>Provide your farm details for accurate fertilizer recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cropType">Crop Type</Label>
                      <Select
                        value={formData.cropType}
                        onValueChange={(value) => setFormData({ ...formData, cropType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rice">Rice</SelectItem>
                          <SelectItem value="wheat">Wheat</SelectItem>
                          <SelectItem value="maize">Maize</SelectItem>
                          <SelectItem value="cotton">Cotton</SelectItem>
                          <SelectItem value="sugarcane">Sugarcane</SelectItem>
                          <SelectItem value="tomato">Tomato</SelectItem>
                          <SelectItem value="potato">Potato</SelectItem>
                          <SelectItem value="onion">Onion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="soilType">Soil Type</Label>
                      <Select
                        value={formData.soilType}
                        onValueChange={(value) => setFormData({ ...formData, soilType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select soil type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clay">Clay</SelectItem>
                          <SelectItem value="sandy">Sandy</SelectItem>
                          <SelectItem value="loamy">Loamy</SelectItem>
                          <SelectItem value="silt">Silt</SelectItem>
                          <SelectItem value="black">Black Cotton</SelectItem>
                          <SelectItem value="red">Red Soil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="soilPh">Soil pH</Label>
                      <Input
                        id="soilPh"
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        placeholder="6.5"
                        value={formData.soilPh}
                        onChange={(e) => setFormData({ ...formData, soilPh: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="nitrogen">Nitrogen (kg/ha)</Label>
                      <Input
                        id="nitrogen"
                        type="number"
                        placeholder="120"
                        value={formData.nitrogen}
                        onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phosphorus">Phosphorus (kg/ha)</Label>
                      <Input
                        id="phosphorus"
                        type="number"
                        placeholder="60"
                        value={formData.phosphorus}
                        onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="potassium">Potassium (kg/ha)</Label>
                      <Input
                        id="potassium"
                        type="number"
                        placeholder="40"
                        value={formData.potassium}
                        onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        placeholder="28"
                        value={formData.temperature}
                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="humidity">Humidity (%)</Label>
                      <Input
                        id="humidity"
                        type="number"
                        placeholder="65"
                        value={formData.humidity}
                        onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rainfall">Annual Rainfall (mm)</Label>
                      <Input
                        id="rainfall"
                        type="number"
                        placeholder="800"
                        value={formData.rainfall}
                        onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="District, State"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading ? "Analyzing..." : "Get Fertilizer Recommendation"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {prediction ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-5 h-5" />
                      Fertilizer Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Primary Fertilizer</h3>
                      <p className="text-green-700">{prediction.primaryFertilizer}</p>
                      <p className="text-sm text-green-600 mt-1">Quantity: {prediction.quantity}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Application Schedule</h3>
                      <p className="text-gray-700">{prediction.applicationTiming}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Organic Alternatives</h3>
                      <ul className="space-y-1">
                        {prediction.organicAlternatives.map((alt: string, index: number) => (
                          <li key={index} className="text-gray-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {alt}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Micronutrients</h3>
                      <ul className="space-y-1">
                        {prediction.micronutrients.map((nutrient: string, index: number) => (
                          <li key={index} className="text-gray-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            {nutrient}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <h4 className="font-medium text-gray-900">Cost Estimate</h4>
                        <p className="text-lg font-semibold text-green-600">{prediction.costEstimate}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Expected Yield Increase</h4>
                        <p className="text-lg font-semibold text-green-600">{prediction.expectedYieldIncrease}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
                    <p className="text-gray-600">
                      Fill in your farm details to get personalized fertilizer recommendations
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                      Test your soil pH regularly for accurate recommendations
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                      Apply fertilizers during optimal weather conditions
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                      Consider organic alternatives for sustainable farming
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                      Monitor crop response and adjust accordingly
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
