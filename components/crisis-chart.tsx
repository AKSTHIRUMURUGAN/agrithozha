"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingDown, Users, Zap } from "lucide-react"

export function CrisisChart() {
  const crisisData = [
    { problem: "Low Insurance", percentage: 95.2, color: "bg-destructive" },
    { problem: "Small Farmers", percentage: 86.0, color: "bg-accent" },
    { problem: "Crisis Index", percentage: 75.0, color: "bg-primary" },
    { problem: "Land Fragment", percentage: 68.0, color: "bg-chart-4" },
    { problem: "Farmer Debt", percentage: 50.0, color: "bg-chart-2" },
    { problem: "Tech Gap", percentage: 35.0, color: "bg-chart-5" },
  ]

  return (
    <Card className="glass glow-primary">
      <CardHeader>
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          Farmer Issues in India
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {crisisData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.problem}</span>
                <span className="text-sm font-bold">{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} className="h-3" />
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-primary/10 rounded-lg">
          <h4 className="font-semibold mb-2 text-primary">AgriThozha Impact</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-primary" />
              <span>0% Farmer Suicides in Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>80%+ Insurance Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>30% Productivity Increase</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <span>50% Waste Reduction</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
