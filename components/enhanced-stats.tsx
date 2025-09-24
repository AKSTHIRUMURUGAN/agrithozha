"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign, Heart } from "lucide-react"

const criticalStats = [
  {
    icon: AlertTriangle,
    title: "Farmer Suicides Daily",
    value: 31,
    trend: "+2.3%",
    trendUp: true,
    color: "red",
    description: "Every 42 minutes",
    impact: "11,290 families destroyed annually",
  },
  {
    icon: DollarSign,
    title: "Average Farmer Debt",
    value: 74000,
    trend: "+15%",
    trendUp: true,
    color: "orange",
    description: "Per farmer household",
    impact: "50% of farmers in debt trap",
  },
  {
    icon: Users,
    title: "Small Farmers",
    value: 86,
    trend: "stable",
    trendUp: false,
    color: "blue",
    description: "% with <2 hectares",
    impact: "146M farmers struggling",
  },
  {
    icon: Heart,
    title: "Lives Saved by AgriThozha",
    value: 127,
    trend: "+45%",
    trendUp: false,
    color: "green",
    description: "Farmers supported",
    impact: "Zero suicides in our network",
  },
]

export function EnhancedStats() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("enhanced-stats")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div id="enhanced-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {criticalStats.map((stat, index) => (
        <Card
          key={index}
          className={`glass card-hover morph ${isVisible ? "fade-in-up" : "opacity-0"} stagger-${index + 1}`}
        >
          <CardContent className="p-8">
            <div
              className={`w-16 h-16 mx-auto mb-6 rounded-full bg-${stat.color}-100 flex items-center justify-center glow-${stat.color === "red" ? "danger" : stat.color === "green" ? "success" : "accent"} animate-pulse-glow`}
            >
              <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
            </div>

            <div className="text-center space-y-3">
              <div className={`text-4xl font-bold text-${stat.color}-600 text-glow`}>
                {typeof stat.value === "number" && stat.value > 1000
                  ? `₹${(stat.value / 1000).toFixed(0)}K`
                  : stat.value}
              </div>

              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{stat.title}</span>
                {stat.trend !== "stable" && (
                  <div
                    className={`flex items-center text-xs px-2 py-1 rounded-full ${
                      stat.trendUp ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {stat.trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {stat.trend}
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500">{stat.description}</p>
              <p className={`text-xs font-medium ${stat.color === "green" ? "text-green-700" : "text-red-700"}`}>
                {stat.impact}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
