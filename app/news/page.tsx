"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Newspaper, Search, Calendar, TrendingUp, AlertTriangle, Leaf } from "lucide-react"

const newsData = [
  {
    id: 1,
    title: "Government Announces ₹50,000 Crore Package for Small Farmers",
    description: "New scheme to provide direct financial support to farmers with less than 2 hectares of land",
    category: "Policy",
    date: "2024-01-15",
    readTime: "3 min read",
    urgent: true,
    image: "/government-announcement-farmers.jpg",
  },
  {
    id: 2,
    title: "AI-Powered Crop Disease Detection Shows 95% Accuracy",
    description: "Revolutionary technology helps farmers identify diseases early, preventing massive crop losses",
    category: "Technology",
    date: "2024-01-14",
    readTime: "5 min read",
    urgent: false,
    image: "/ai-crop-disease-detection.jpg",
  },
  {
    id: 3,
    title: "Monsoon Forecast: Above Normal Rainfall Expected",
    description: "IMD predicts 106% of normal rainfall this season, bringing hope for better harvests",
    category: "Weather",
    date: "2024-01-13",
    readTime: "4 min read",
    urgent: false,
    image: "/monsoon-rainfall-forecast.jpg",
  },
  {
    id: 4,
    title: "Organic Farming Subsidies Increased by 40%",
    description: "Government boosts support for sustainable farming practices across all states",
    category: "Sustainability",
    date: "2024-01-12",
    readTime: "2 min read",
    urgent: false,
    image: "/organic-farming-subsidies.jpg",
  },
  {
    id: 5,
    title: "URGENT: Locust Swarm Alert in Rajasthan",
    description: "Farmers advised to take immediate preventive measures as locust swarms approach",
    category: "Alert",
    date: "2024-01-11",
    readTime: "2 min read",
    urgent: true,
    image: "/locust-swarm-alert.jpg",
  },
  {
    id: 6,
    title: "Digital Marketplace Connects 10,000 Farmers Directly to Consumers",
    description: "New platform eliminates middlemen, ensuring better prices for farmers",
    category: "Market",
    date: "2024-01-10",
    readTime: "6 min read",
    urgent: false,
    image: "/digital-marketplace-farmers.jpg",
  },
]

const categories = ["All", "Policy", "Technology", "Weather", "Sustainability", "Alert", "Market"]

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [filteredNews, setFilteredNews] = useState(newsData)

  useEffect(() => {
    let filtered = newsData

    if (selectedCategory !== "All") {
      filtered = filtered.filter((news) => news.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (news) =>
          news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          news.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredNews(filtered)
  }, [searchTerm, selectedCategory])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Policy":
        return <TrendingUp className="w-4 h-4" />
      case "Technology":
        return <Leaf className="w-4 h-4" />
      case "Alert":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Newspaper className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Policy":
        return "bg-blue-100 text-blue-800"
      case "Technology":
        return "bg-green-100 text-green-800"
      case "Weather":
        return "bg-cyan-100 text-cyan-800"
      case "Sustainability":
        return "bg-emerald-100 text-emerald-800"
      case "Alert":
        return "bg-red-100 text-red-800"
      case "Market":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Agricultural News</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest developments in agriculture, policy changes, and market trends
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Urgent News Banner */}
          {filteredNews.some((news) => news.urgent) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2" />
                Urgent Updates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNews
                  .filter((news) => news.urgent)
                  .map((news) => (
                    <Card key={news.id} className="border-red-200 bg-red-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge className="bg-red-600 text-white mb-2">URGENT</Badge>
                          <span className="text-sm text-gray-500">{news.readTime}</span>
                        </div>
                        <CardTitle className="text-lg text-red-900">{news.title}</CardTitle>
                        <CardDescription className="text-red-700">{news.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-red-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(news.date).toLocaleDateString()}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                          >
                            Read More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Regular News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews
              .filter((news) => !news.urgent)
              .map((news) => (
                <Card key={news.id} className="hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={news.image || "/placeholder.svg"}
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getCategoryColor(news.category)}>
                        <div className="flex items-center">
                          {getCategoryIcon(news.category)}
                          <span className="ml-1">{news.category}</span>
                        </div>
                      </Badge>
                      <span className="text-sm text-gray-500">{news.readTime}</span>
                    </div>
                    <CardTitle className="text-lg">{news.title}</CardTitle>
                    <CardDescription>{news.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(news.date).toLocaleDateString()}
                      </div>
                      <Button size="sm" variant="outline">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No news found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
