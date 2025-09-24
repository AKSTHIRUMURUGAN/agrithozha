"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Building, Search, ExternalLink, Calendar, Users, IndianRupee } from "lucide-react"

export default function GovernmentSchemes() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const schemes = [
    {
      id: 1,
      name: "PM-KISAN Samman Nidhi",
      category: "Direct Benefit",
      amount: "₹6,000/year",
      eligibility: "Small & marginal farmers",
      description: "Direct income support to farmer families owning cultivable land up to 2 hectares",
      deadline: "Ongoing",
      status: "Active",
      beneficiaries: "11+ Crore farmers",
      applyLink: "https://pmkisan.gov.in",
    },
    {
      id: 2,
      name: "Pradhan Mantri Fasal Bima Yojana",
      category: "Insurance",
      amount: "Up to ₹2 Lakh",
      eligibility: "All farmers",
      description: "Crop insurance scheme providing financial support to farmers in case of crop failure",
      deadline: "Before sowing season",
      status: "Active",
      beneficiaries: "5.5+ Crore farmers",
      applyLink: "https://pmfby.gov.in",
    },
    {
      id: 3,
      name: "Kisan Credit Card",
      category: "Credit",
      amount: "Up to ₹3 Lakh",
      eligibility: "All farmers",
      description: "Easy access to credit for agricultural and allied activities",
      deadline: "Ongoing",
      status: "Active",
      beneficiaries: "7+ Crore farmers",
      applyLink: "https://kcc.gov.in",
    },
    {
      id: 4,
      name: "PM Kisan Maandhan Yojana",
      category: "Pension",
      amount: "₹3,000/month",
      eligibility: "Small & marginal farmers (18-40 years)",
      description: "Voluntary pension scheme for farmers with monthly pension after 60 years",
      deadline: "Ongoing",
      status: "Active",
      beneficiaries: "20+ Lakh farmers",
      applyLink: "https://maandhan.in",
    },
    {
      id: 5,
      name: "Soil Health Card Scheme",
      category: "Technology",
      amount: "Free",
      eligibility: "All farmers",
      description: "Soil testing and health cards to promote balanced use of fertilizers",
      deadline: "Ongoing",
      status: "Active",
      beneficiaries: "22+ Crore farmers",
      applyLink: "https://soilhealth.dac.gov.in",
    },
    {
      id: 6,
      name: "National Agriculture Market (e-NAM)",
      category: "Marketing",
      amount: "Free platform",
      eligibility: "All farmers",
      description: "Online trading platform for agricultural commodities",
      deadline: "Ongoing",
      status: "Active",
      beneficiaries: "1.7+ Crore farmers",
      applyLink: "https://enam.gov.in",
    },
    {
      id: 7,
      name: "Paramparagat Krishi Vikas Yojana",
      category: "Organic",
      amount: "₹50,000/hectare",
      eligibility: "Farmers adopting organic farming",
      description: "Financial assistance for organic farming practices and certification",
      deadline: "March 2024",
      status: "Active",
      beneficiaries: "8+ Lakh farmers",
      applyLink: "https://pgsindia-ncof.gov.in",
    },
    {
      id: 8,
      name: "Rashtriya Krishi Vikas Yojana",
      category: "Development",
      amount: "State-wise allocation",
      eligibility: "State governments",
      description: "Comprehensive agricultural development program",
      deadline: "Ongoing",
      status: "Active",
      beneficiaries: "All states",
      applyLink: "https://rkvy.nic.in",
    },
  ]

  const categories = [
    { value: "all", label: "All Schemes" },
    { value: "Direct Benefit", label: "Direct Benefit" },
    { value: "Insurance", label: "Insurance" },
    { value: "Credit", label: "Credit" },
    { value: "Pension", label: "Pension" },
    { value: "Technology", label: "Technology" },
    { value: "Marketing", label: "Marketing" },
    { value: "Organic", label: "Organic" },
    { value: "Development", label: "Development" },
  ]

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || scheme.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Government Schemes for Farmers</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover and apply for various government schemes designed to support farmers across India
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Schemes Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{scheme.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{scheme.category}</Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {scheme.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{scheme.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium">Amount</p>
                        <p className="text-gray-600">{scheme.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Beneficiaries</p>
                        <p className="text-gray-600">{scheme.beneficiaries}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-sm mb-1">Eligibility</p>
                    <p className="text-gray-600 text-sm">{scheme.eligibility}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Deadline:</span>
                    <span className="text-gray-600">{scheme.deadline}</span>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open(scheme.applyLink, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schemes found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Important Notice */}
          <Card className="mt-12 bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Notice</h3>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Always verify scheme details from official government websites</li>
                <li>• Beware of fraudulent agents asking for money to process applications</li>
                <li>• Most government schemes are free to apply</li>
                <li>• Keep all required documents ready before applying</li>
                <li>• Contact local agriculture officers for assistance</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
