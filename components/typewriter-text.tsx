"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TypewriterTextProps {
  text: string
  delay?: number
  speed?: number
  className?: string
}

export function TypewriterText({ text, delay = 0, speed = 50, className }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true)
      let i = 0
      const typeTimer = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1))
          i++
        } else {
          clearInterval(typeTimer)
          setIsTyping(false)
        }
      }, speed)

      return () => clearInterval(typeTimer)
    }, delay)

    return () => clearTimeout(timer)
  }, [text, delay, speed])

  return <span className={cn(className, isTyping && "typing-cursor")}>{displayText}</span>
}
