"use client"

import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AlertTriangle, TrendingDown } from "lucide-react"

const farmerDeathData = [
  { year: 2018, suicides: 10349, rate: 28.4, affected_families: 41396 },
  { year: 2019, suicides: 10281, rate: 28.2, affected_families: 41124 },
  { year: 2020, suicides: 10677, rate: 29.3, affected_families: 42708 },
  { year: 2021, suicides: 11290, rate: 31.0, affected_families: 45160 },
  { year: 2022, suicides: 11443, rate: 31.4, affected_families: 45772 },
  { year: 2023, suicides: 11591, rate: 31.8, affected_families: 46364 },
]

const stateWiseData = [
  { state: "Maharashtra", deaths: 3927, percentage: 33.8 },
  { state: "Karnataka", deaths: 2162, percentage: 18.6 },
  { state: "Andhra Pradesh", deaths: 1033, percentage: 8.9 },
  { state: "Madhya Pradesh", deaths: 895, percentage: 7.7 },
  { state: "Tamil Nadu", deaths: 687, percentage: 5.9 },
  { state: "Others", deaths: 2887, percentage: 24.9 },
]

export function FarmerDeathTrends() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="glass hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <CardTitle className="text-red-800">Farmer Suicide Trends (2018-2023)</CardTitle>
          </div>
          <CardDescription>Alarming increase in farmer deaths across India</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              suicides: {
                label: "Farmer Suicides",
                color: "hsl(0, 84%, 60%)",
              },
              rate: {
                label: "Rate per 100,000",
                color: "hsl(25, 95%, 53%)",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={farmerDeathData}>
                <defs>
                  <linearGradient id="suicidesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="suicides"
                  stroke="hsl(0, 84%, 60%)"
                  fillOpacity={1}
                  fill="url(#suicidesGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-800 font-medium">
              📈 12% increase from 2018 to 2023 - Every 42 minutes, a farmer dies by suicide
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-6 h-6 text-orange-600" />
            <CardTitle className="text-orange-800">State-wise Distribution (2023)</CardTitle>
          </div>
          <CardDescription>Maharashtra leads with highest farmer suicide rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stateWiseData.map((state, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{state.state}</span>
                    <span className="text-sm text-gray-600">{state.deaths} deaths</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        index === 0
                          ? "bg-red-600"
                          : index === 1
                            ? "bg-red-500"
                            : index === 2
                              ? "bg-orange-500"
                              : index === 3
                                ? "bg-orange-400"
                                : "bg-yellow-400"
                      }`}
                      style={{ width: `${state.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{state.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 font-medium">
              🚨 Top 3 states account for 61.3% of all farmer suicides
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
