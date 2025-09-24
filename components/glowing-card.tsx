"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GlowingCardProps {
  children: React.ReactNode
  className?: string
}

export function GlowingCard({ children, className }: GlowingCardProps) {
  return (
    <Card className={cn("glass hover:glow-primary transition-all duration-300 hover:scale-105", className)}>
      {children}
    </Card>
  )
}
