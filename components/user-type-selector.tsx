"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, TrendingUp, Heart } from "lucide-react"

interface UserTypeSelectorProps {
  onSelect: (type: "farmer" | "investor" | "ngo") => void
}

export function UserTypeSelector({ onSelect }: UserTypeSelectorProps) {
  const [selected, setSelected] = useState<"farmer" | "investor" | "ngo" | null>(null)

  const userTypes = [
    {
      type: "farmer" as const,
      icon: Users,
      title: "I'm a Farmer",
      description: "Get zero-risk farming support",
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      type: "investor" as const,
      icon: TrendingUp,
      title: "I'm an Investor",
      description: "Generate returns while creating impact",
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      type: "ngo" as const,
      icon: Heart,
      title: "I'm with an NGO",
      description: "Partner with us to save lives",
      color: "text-destructive",
      bgColor: "bg-destructive/20",
    },
  ]

  const handleSelect = (type: "farmer" | "investor" | "ngo") => {
    setSelected(type)
    onSelect(type)
  }

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <h3 className="text-2xl font-semibold text-center mb-8">How can AgriThozha help you?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userTypes.map((userType) => (
          <Card
            key={userType.type}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 glass ${
              selected === userType.type ? "ring-2 ring-primary glow-primary" : ""
            }`}
            onClick={() => handleSelect(userType.type)}
          >
            <CardContent className="p-6 text-center">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full ${userType.bgColor} flex items-center justify-center`}
              >
                <userType.icon className={`w-8 h-8 ${userType.color}`} />
              </div>
              <h4 className="text-lg font-semibold mb-2">{userType.title}</h4>
              <p className="text-sm text-muted-foreground">{userType.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
