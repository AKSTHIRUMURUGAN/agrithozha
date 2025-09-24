"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const crisisData = [
  { problem: "Low Insurance", percentage: 95.2, color: "#dc2626" },
  { problem: "Small Farmers", percentage: 86.0, color: "#ea580c" },
  { problem: "Crisis Index", percentage: 75.0, color: "#b91c1c" },
  { problem: "Land Fragment", percentage: 68.0, color: "#991b1b" },
  { problem: "Farmer Debt", percentage: 50.0, color: "#dc2626" },
  { problem: "Tech Gap", percentage: 35.0, color: "#ef4444" },
]

export function CrisisDataChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Farmer Issues in India</CardTitle>
        <CardDescription className="text-center">Critical challenges facing Indian agriculture sector</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={crisisData} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="problem" type="category" width={100} />
            <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} labelStyle={{ color: "#374151" }} />
            <Bar dataKey="percentage" fill="#dc2626" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
