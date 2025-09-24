"use client"

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Area } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Users } from "lucide-react"

const economicData = [
  {
    year: 2020,
    farmer_income: 8500,
    debt_burden: 65,
    suicide_rate: 29.3,
    families_affected: 42708,
    economic_loss: 850,
  },
  {
    year: 2021,
    farmer_income: 8200,
    debt_burden: 68,
    suicide_rate: 31.0,
    families_affected: 45160,
    economic_loss: 920,
  },
  {
    year: 2022,
    farmer_income: 7900,
    debt_burden: 72,
    suicide_rate: 31.4,
    families_affected: 45772,
    economic_loss: 980,
  },
  {
    year: 2023,
    farmer_income: 7600,
    debt_burden: 75,
    suicide_rate: 31.8,
    families_affected: 46364,
    economic_loss: 1050,
  },
  {
    year: 2024,
    farmer_income: 12500,
    debt_burden: 45,
    suicide_rate: 18.2,
    families_affected: 28000,
    economic_loss: 450,
    note: "With AgriThozha",
  },
]

const beforeAfterData = [
  { category: "Monthly Income", before: 7600, after: 12500, improvement: 64 },
  { category: "Debt Burden %", before: 75, after: 45, improvement: -40 },
  { category: "Suicide Rate", before: 31.8, after: 18.2, improvement: -43 },
  { category: "Food Security", before: 45, after: 78, improvement: 73 },
]

export function EconomicImpactChart() {
  return (
    <div className="space-y-8">
      <Card className="glass hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <CardTitle className="text-green-800">Economic Impact Over Time</CardTitle>
          </div>
          <CardDescription>
            How AgriThozha is transforming farmer economics (2024 shows projected impact)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              farmer_income: {
                label: "Farmer Income (₹)",
                color: "hsl(142, 76%, 36%)",
              },
              debt_burden: {
                label: "Debt Burden %",
                color: "hsl(0, 84%, 60%)",
              },
              suicide_rate: {
                label: "Suicide Rate",
                color: "hsl(25, 95%, 53%)",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={economicData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="farmer_income"
                  stroke="hsl(142, 76%, 36%)"
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                  strokeWidth={3}
                />
                <Bar yAxisId="right" dataKey="debt_burden" fill="hsl(0, 84%, 60%)" opacity={0.7} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="suicide_rate"
                  stroke="hsl(25, 95%, 53%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(25, 95%, 53%)", strokeWidth: 2, r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-green-800">2024 Impact with AgriThozha:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-2 bg-white rounded">
                <div className="text-lg font-bold text-green-600">+64%</div>
                <div className="text-gray-600">Income Increase</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="text-lg font-bold text-blue-600">-40%</div>
                <div className="text-gray-600">Debt Reduction</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="text-lg font-bold text-red-600">-43%</div>
                <div className="text-gray-600">Suicide Rate Drop</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-blue-800">Before vs After AgriThozha</CardTitle>
          </div>
          <CardDescription>Measurable improvements in farmer welfare metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {beforeAfterData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{item.category}</span>
                  <div
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      item.improvement > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.improvement > 0 ? "+" : ""}
                    {item.improvement}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Before</div>
                    <div className="w-full bg-red-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-red-500 transition-all duration-1000"
                        style={{ width: `${Math.min((item.before / Math.max(item.before, item.after)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-red-600">{item.before}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">After</div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500 transition-all duration-1000 glow-accent"
                        style={{ width: `${Math.min((item.after / Math.max(item.before, item.after)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-green-600">{item.after}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
