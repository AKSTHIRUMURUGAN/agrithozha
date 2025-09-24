"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Shield, Leaf, Heart, Target } from "lucide-react"

export function ImpactMetrics() {
  const metrics = [
    {
      icon: Heart,
      title: "Lives Saved",
      value: "0",
      subtitle: "Farmer Suicides in Coverage Areas",
      change: "-100% vs national average",
      positive: true,
    },
    {
      icon: Leaf,
      title: "Food Waste Reduction",
      value: "50%",
      subtitle: "Through NourishNet Integration",
      change: "+25% vs industry average",
      positive: true,
    },
    {
      icon: Shield,
      title: "Insurance Coverage",
      value: "80%+",
      subtitle: "Farmers Protected",
      change: "+75% vs current 4.8%",
      positive: true,
    },
    {
      icon: TrendingUp,
      title: "Productivity Increase",
      value: "30%",
      subtitle: "Through IoT Precision Farming",
      change: "KIBO monitoring system",
      positive: true,
    },
    {
      icon: Users,
      title: "Farmers Supported",
      value: "1M+",
      subtitle: "Target by Year 5",
      change: "Across 200+ districts",
      positive: true,
    },
    {
      icon: Target,
      title: "Investment Returns",
      value: "12-15%",
      subtitle: "Consistent Annual Returns",
      change: "Risk-adjusted performance",
      positive: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {metrics.map((metric, index) => (
        <Card
          key={index}
          className="glass glow-primary p-6 text-center floating"
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <CardContent className="p-0">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center glow-primary">
              <metric.icon className="w-8 h-8 text-primary" />
            </div>
            <div className="text-4xl font-bold mb-2 text-primary text-glow">{metric.value}</div>
            <h3 className="font-semibold mb-2">{metric.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{metric.subtitle}</p>
            <Badge variant={metric.positive ? "default" : "destructive"} className="text-xs">
              {metric.change}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
