import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import Script from "next/script"

export const metadata: Metadata = {
  title: "AgriThozha - Zero-Risk Farming Revolution",
  description:
    "Empowering farmers, engaging investors, and growing a greener tomorrow. Join the revolution to end farmer suicides in India.",
  generator: "AgriThozha",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased w-full h-full`}>
        <Suspense fallback={null}>
          {children}
          <elevenlabs-convai 
          agent-id="agent_3001k5ndk62yehz9kf4r5a2xdgsp" 
          style={{
            position: 'fixed',
            bottom: '10px',
            left: '40px',
            width: '100vw',
            height: '100vh',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            zIndex: 50,
            transform: 'translateY(0)'
          }} 
        />
        <Script
          src="https://unpkg.com/@elevenlabs/convai-widget-embed"
          strategy="afterInteractive"
        />
        <Analytics />
        </Suspense>
        {/* ElevenLabs ConvAI Widget - Fixed to viewport */}

      </body>
    </html>
  )
}
