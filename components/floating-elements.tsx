"use client"

import { Sprout, Leaf, Heart, Zap } from "lucide-react"

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-20 left-10 text-primary/20 floating" style={{ animationDelay: "0s" }}>
        <Sprout className="w-8 h-8" />
      </div>
      <div className="absolute top-40 right-20 text-accent/20 floating" style={{ animationDelay: "1s" }}>
        <Leaf className="w-6 h-6" />
      </div>
      <div className="absolute bottom-40 left-20 text-destructive/20 floating" style={{ animationDelay: "2s" }}>
        <Heart className="w-7 h-7" />
      </div>
      <div className="absolute bottom-20 right-10 text-primary/20 floating" style={{ animationDelay: "3s" }}>
        <Zap className="w-5 h-5" />
      </div>
      <div className="absolute top-1/2 left-5 text-accent/20 floating" style={{ animationDelay: "4s" }}>
        <Sprout className="w-4 h-4" />
      </div>
      <div className="absolute top-1/3 right-5 text-primary/20 floating" style={{ animationDelay: "5s" }}>
        <Leaf className="w-9 h-9" />
      </div>
    </div>
  )
}
