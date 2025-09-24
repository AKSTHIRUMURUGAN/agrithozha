"use client"

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Users, DollarSign, Target, Zap, Award } from "lucide-react"

const revenueStreams = [
  { name: "Transaction Fees", value: 35, amount: "₹2.1Cr", color: "#10B981" },
  { name: "IoT Hardware", value: 25, amount: "₹1.5Cr", color: "#3B82F6" },
  { name: "Premium Analytics", value: 20, amount: "₹1.2Cr", color: "#8B5CF6" },
  { name: "Partnership Revenue", value: 15, amount: "₹0.9Cr", color: "#F59E0B" },
  { name: "Consulting Services", value: 5, amount: "₹0.3Cr", color: "#EF4444" },
]

const growthMetrics = [
  { month: "Jan", farmers: 50, investors: 120, revenue: 15 },
  { month: "Feb", farmers: 85, investors: 200, revenue: 28 },
  { month: "Mar", farmers: 140, investors: 350, revenue: 45 },
  { month: "Apr", farmers: 220, investors: 580, revenue: 72 },
  { month: "May", farmers: 350, investors: 920, revenue: 115 },
  { month: "Jun", farmers: 500, investors: 1250, revenue: 180 },
]

const marketPenetration = [
  { region: "Tamil Nadu", penetration: 85, farmers: 1200 },
  { region: "Karnataka", penetration: 65, farmers: 800 },
  { region: "Andhra Pradesh", penetration: 45, farmers: 600 },
  { region: "Maharashtra", penetration: 35, farmers: 400 },
  { region: "Madhya Pradesh", penetration: 25, farmers: 300 },
]

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"]

export function StartupMetricsDashboard() {
  return (
    <div className="space-y-8">
      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              <CardTitle className="text-green-800">Revenue Streams (2024)</CardTitle>
            </div>
            <CardDescription>Diversified income sources ensuring sustainability</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Revenue %",
                  color: "hsl(142, 76%, 36%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueStreams}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {revenueStreams.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Revenue Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {revenueStreams.map((stream, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stream.color }} />
                    <span>{stream.name}</span>
                  </div>
                  <span className="font-semibold">{stream.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-blue-800">Growth Trajectory</CardTitle>
            </div>
            <CardDescription>Exponential growth in farmers and investors</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                farmers: {
                  label: "Farmers",
                  color: "hsl(142, 76%, 36%)",
                },
                investors: {
                  label: "Investors",
                  color: "hsl(217, 91%, 60%)",
                },
                revenue: {
                  label: "Revenue (₹L)",
                  color: "hsl(262, 83%, 58%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthMetrics}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="farmers" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="investors" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Market Penetration */}
      <Card className="glass hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-purple-800">Market Penetration by State</CardTitle>
          </div>
          <CardDescription>Regional expansion and farmer adoption rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {marketPenetration.map((region, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{region.region}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-600">{region.penetration}%</div>
                      <div className="text-xs text-gray-500">{region.farmers} farmers</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000 glow-accent"
                      style={{ width: `${region.penetration}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white">
                  <div>
                    <div className="text-2xl font-bold">3,300+</div>
                    <div className="text-sm">Total Farmers</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">5</div>
                    <div className="text-xs text-green-700">States</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">51%</div>
                    <div className="text-xs text-blue-700">Avg. Penetration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Users,
            title: "Active Users",
            value: "4,750",
            change: "+23%",
            color: "green",
            description: "Farmers + Investors",
          },
          {
            icon: DollarSign,
            title: "Total Investment",
            value: "₹6Cr",
            change: "+45%",
            color: "blue",
            description: "Facilitated through platform",
          },
          {
            icon: Award,
            title: "Success Rate",
            value: "94%",
            change: "+2%",
            color: "purple",
            description: "Profitable investments",
          },
          {
            icon: Zap,
            title: "Avg. ROI",
            value: "14.2%",
            change: "+1.2%",
            color: "orange",
            description: "For investors",
          },
        ].map((kpi, index) => (
          <Card
            key={index}
            className="glass hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform-3d"
          >
            <CardContent className="p-6">
              <div
                className={`w-12 h-12 mb-4 rounded-full bg-${kpi.color}-100 flex items-center justify-center glow-accent`}
              >
                <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
              </div>
              <div className={`text-2xl font-bold mb-1 text-${kpi.color}-600 text-glow`}>{kpi.value}</div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-900">{kpi.title}</span>
                <span className={`text-xs px-2 py-1 rounded-full bg-${kpi.color}-100 text-${kpi.color}-700`}>
                  {kpi.change}
                </span>
              </div>
              <p className="text-xs text-gray-500">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
