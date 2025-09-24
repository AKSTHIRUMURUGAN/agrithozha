"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const impactData = [
  { year: 2010, vanishingFarm: 350, debtTrap: 250, foodCrisis: 190, dreamsShattered: 150, livesLost: 10 },
  { year: 2012, vanishingFarm: 360, debtTrap: 260, foodCrisis: 200, dreamsShattered: 160, livesLost: 12 },
  { year: 2014, vanishingFarm: 370, debtTrap: 270, foodCrisis: 210, dreamsShattered: 170, livesLost: 14 },
  { year: 2016, vanishingFarm: 380, debtTrap: 280, foodCrisis: 220, dreamsShattered: 180, livesLost: 16 },
  { year: 2018, vanishingFarm: 390, debtTrap: 290, foodCrisis: 230, dreamsShattered: 190, livesLost: 18 },
  { year: 2020, vanishingFarm: 395, debtTrap: 295, foodCrisis: 240, dreamsShattered: 200, livesLost: 20 },
  { year: 2022, vanishingFarm: 400, debtTrap: 300, foodCrisis: 250, dreamsShattered: 210, livesLost: 22 },
  { year: 2024, vanishingFarm: 410, debtTrap: 310, foodCrisis: 260, dreamsShattered: 220, livesLost: 24 },
]

export function ImpactAreaChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">India Farm Crisis: Cascading Impact</CardTitle>
        <CardDescription className="text-center">
          The escalating agricultural crisis affecting millions of people
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={impactData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                `${value}M People`,
                name === "vanishingFarm"
                  ? "Vanishing Farm"
                  : name === "debtTrap"
                    ? "Debt Trap"
                    : name === "foodCrisis"
                      ? "Food Crisis"
                      : name === "dreamsShattered"
                        ? "Dreams Shattered"
                        : "Lives Lost (in thousands)",
              ]}
            />
            <Legend />
            <Area type="monotone" dataKey="vanishingFarm" stackId="1" stroke="#1f2937" fill="#1f2937" />
            <Area type="monotone" dataKey="debtTrap" stackId="1" stroke="#7c2d12" fill="#7c2d12" />
            <Area type="monotone" dataKey="foodCrisis" stackId="1" stroke="#b91c1c" fill="#b91c1c" />
            <Area type="monotone" dataKey="dreamsShattered" stackId="1" stroke="#dc2626" fill="#dc2626" />
            <Area type="monotone" dataKey="livesLost" stackId="1" stroke="#ef4444" fill="#ef4444" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
