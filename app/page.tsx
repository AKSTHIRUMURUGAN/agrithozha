"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sprout,
  TrendingUp,
  Users,
  Heart,
  AlertTriangle,
  BarChart3,
  Smartphone,
  Globe,
  Play,
  Star,
  CheckCircle,
  Leaf,
  ArrowRight,
  Quote,
  Shield,
  Zap,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { TypingEffect } from "@/components/typing-effect"
import { Navigation } from "@/components/navigation"
import { MagneticButton } from "@/components/magnetic-button"
import { SpotlightCard } from "@/components/spotlight-card"
import { AnimatedCounter } from "@/components/animated-counter"

export default function AgriThozhaHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("farmers")
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 50])

  return (
    <div className="min-h-screen bg-[#FBFBFB] overflow-x-hidden">
      <Navigation />

      {/* Hero Section - Cinematic & Emotion-First */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Premium Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0E8] via-[#FAF8F5] to-[#FFF]">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-soft-light" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-green-50/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-50/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-center"
          >
            {/* Urgency Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex mb-8"
            >
              <Badge className="bg-red-50/80 backdrop-blur-sm text-red-700 border-red-200/50 px-5 py-2.5 rounded-full text-sm font-medium tracking-wide shadow-sm">
                <motion.span
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-red-500 rounded-full mr-2.5"
                />
                Crisis Alert: 11,290 farmer deaths this year
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#1A1A1A] mb-8 leading-[1.05] tracking-tight"
            >
              <span className="block">Every grain</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                tells a story
              </span>
              <span className="block">of survival</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
              className="text-xl sm:text-2xl text-[#666666] mb-12 max-w-4xl mx-auto leading-relaxed font-light"
            >
              The people who feed our nation are dying by their own hands. 
              <span className="font-medium text-[#1A1A1A]"> AgriThozha</span> changes this — 
              with AI, community investment, and a complete ecosystem that gives farmers what they've always deserved: dignity.
            </motion.p>

            {/* CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <MagneticButton>
                <Button size="lg" className="bg-[#1A1A1A] hover:bg-[#333] text-white px-10 py-7 rounded-full text-lg font-medium shadow-lg shadow-black/5 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 group">
                  <Play className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Watch Farmers' Stories
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button size="lg" variant="outline" className="px-10 py-7 rounded-full text-lg font-medium border-[#E5E5E5] bg-white/50 backdrop-blur-sm hover:bg-white hover:border-[#CCC] transition-all duration-300">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Understand the Crisis
                </Button>
              </MagneticButton>
            </motion.div>

            {/* Trust Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#999999]"
            >
              <span className="font-medium">Built with farmers from</span>
              <span className="h-4 w-px bg-[#E0E0E0]" />
              <span className="font-semibold text-[#666666]">Tamil Nadu</span>
              <span className="font-semibold text-[#666666]">Karnataka</span>
              <span className="font-semibold text-[#666666]">Maharashtra</span>
              <span className="font-semibold text-[#666666]">Punjab</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-[#999999]" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Crisis Section - Data Storytelling */}
      <section ref={statsRef} className="relative py-32 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <p className="text-[#888] text-sm font-medium uppercase tracking-widest mb-6">The Reality</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Behind every number
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
                is a family
              </span>
            </h2>
            <p className="text-xl text-[#999] max-w-3xl mx-auto font-light">
              These aren't statistics. They're fathers, mothers, and children caught in a cycle that must end.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              { value: 11290, label: "Farmer deaths annually", description: "Every 48 minutes, a farmer takes their life", icon: Heart, color: "#EF4444" },
              { value: 86, suffix: "%", label: "Small farmers in debt", description: "Less than 2 acres, crushing interest rates", icon: AlertTriangle, color: "#F59E0B" },
              { value: 50, suffix: "%", label: "Want to quit farming", description: "Children refuse to continue the legacy", icon: TrendingUp, color: "#8B5CF6" },
              { value: 170000, prefix: "₹", label: "Average farmer debt", description: "Compound interest traps families for generations", icon: BarChart3, color: "#3B82F6" },
            ].map((stat, index) => (
              <SpotlightCard key={index} className="p-8 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl">
                <CardContent className="p-0">
                  <div
                    className="w-14 h-14 mb-6 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
                    <AnimatedCounter from={0} to={stat.value} duration={2.5} />
                    {stat.suffix}
                  </div>
                  <div className="text-lg font-medium text-white/90 mb-2">{stat.label}</div>
                  <p className="text-sm text-white/50 font-light">{stat.description}</p>
                </CardContent>
              </SpotlightCard>
            ))}
          </div>

          {/* Crisis Comparison Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-3xl p-10"
          >
            <p className="text-[#888] text-sm font-medium uppercase tracking-widest mb-8">The Full Burden</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Debt Trap", stat: "₹47,000", detail: "Average debt per household with compounding interest" },
                { title: "Climate Risk", stat: "No Insurance", detail: "One unseasonal rain destroys entire investment" },
                { title: "Sole Provider", stat: "No Safety Net", detail: "No PF, health cover, minimum salary, or job security" },
                { title: "Price Shock", stat: "90% Gap", detail: "Farmer gets ₹2/kg while consumer pays ₹40/kg" },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">{item.stat}</div>
                  <div className="text-sm font-medium text-white/70 mb-3">{item.title}</div>
                  <p className="text-xs text-white/40 font-light leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Ecosystem - Bento Grid */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#FBFBFB]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[#999] text-sm font-medium uppercase tracking-widest mb-6">The Ecosystem</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6">
              Not just a tool.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                A lifelong companion
              </span>
            </h2>
            <p className="text-xl text-[#666] max-w-3xl mx-auto font-light">
              Four interconnected platforms working as one — from field to market, from investment to impact.
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KIBO - Large Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-3xl p-10 border border-white/[0.05] relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 mb-4">AI + IoT</Badge>
                    <h3 className="text-3xl font-bold text-white mb-4">KIBO — The Soul of Your Farm</h3>
                    <p className="text-lg text-white/60 max-w-2xl font-light">
                      Voice-first AI assistant that speaks Tamil and 10+ languages. Real-time soil data, weather predictions, 
                      and emotional support — all without a smartphone.
                    </p>
                  </div>
                  <Smartphone className="w-12 h-12 text-green-400 opacity-80" />
                </div>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    "NPK, pH, moisture tracking",
                    "Voice alerts in regional languages",
                    "Auto-irrigation triggers",
                    "Pest detection via photo",
                    "Crop recommendation engine",
                    "Weather prediction system",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["LightGBM", "CNN", "ESP32", "BME680", "Gemini AI", "Flask"].map((tech) => (
                    <Badge key={tech} variant="secondary" className="bg-white/5 text-white/60 border-white/10">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* AgriTrade Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#0066FF]/5 to-[#0066FF]/10 rounded-3xl p-8 border border-[#0066FF]/10 relative overflow-hidden group cursor-pointer"
            >
              <div className="mb-6">
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 mb-4">Investment</Badge>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">AgriTrade</h3>
                <p className="text-[#666] font-light">Farm-as-a-Share model. Urban investors fund crops, farmers get zero-interest capital.</p>
              </div>
              <div className="space-y-3 mb-8">
                {["15% avg investor returns", "Blockchain transparency", "Zero farmer investment", "Smart contract payouts"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-[#555]">{f}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white">
                Start Investing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {/* Kaira Marketplace */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#7C3AED]/5 to-[#7C3AED]/10 rounded-3xl p-8 border border-[#7C3AED]/10 relative overflow-hidden group cursor-pointer"
            >
              <div className="mb-6">
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 mb-4">Marketplace</Badge>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">Kaira</h3>
                <p className="text-[#666] font-light">Direct farmer-to-buyer marketplace. No middlemen, transparent pricing.</p>
              </div>
              <div className="space-y-3">
                {["Live pricing dashboard", "Pre-harvest booking", "Farm-to-door logistics", "Restaurant & retail network"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-[#555]">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* NourishNet */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#059669]/5 to-[#059669]/10 rounded-3xl p-8 border border-[#059669]/10 relative overflow-hidden group cursor-pointer"
            >
              <div className="mb-6">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-4">Zero Waste</Badge>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">NourishNet</h3>
                <p className="text-[#666] font-light">Surplus food feeds communities. Waste becomes energy. 40% reduction in loss.</p>
              </div>
              <div className="space-y-3">
                {["Humanity Coins rewards", "NGO & food bank network", "Biogas + Fertilizer output", "Impact tracking dashboard"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-[#555]">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#F5F0E8] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[#999] text-sm font-medium uppercase tracking-widest mb-6">The Impact</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6">
              Real change,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                measurable results
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              { value: 500, suffix: "+", label: "Farmers Supported", detail: "Across 4 Indian states" },
              { value: 25000000, prefix: "₹", label: "Capital Deployed", detail: "Zero-interest, zero-middleman" },
              { value: 25, suffix: "%", label: "Yield Increase", detail: "Through AI precision farming" },
              { value: 0, label: "Farmer Suicides", detail: "In our farmer network", highlight: true },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className={`p-8 rounded-2xl ${metric.highlight ? 'bg-green-600 text-white' : 'bg-white'} shadow-sm border border-[#E5E0D5]`}
              >
                <div className={`text-3xl sm:text-4xl font-bold mb-3 tracking-tight ${metric.highlight ? 'text-white' : 'text-[#1A1A1A]'}`}>
                  {metric.prefix && <span>{metric.prefix}</span>}
                  <AnimatedCounter from={0} to={metric.value} duration={2} />
                  {metric.suffix}
                </div>
                <div className={`text-lg font-medium mb-2 ${metric.highlight ? 'text-white/90' : 'text-[#1A1A1A]'}`}>
                  {metric.label}
                </div>
                <p className={`text-sm font-light ${metric.highlight ? 'text-white/70' : 'text-[#999]'}`}>
                  {metric.detail}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Case Study */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-10 shadow-sm border border-[#E5E0D5]"
          >
            <p className="text-[#999] text-sm font-medium uppercase tracking-widest mb-6">Case Study</p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-8">1-Acre Tomato Farm — Ramasamy's Story</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">₹30,000</div>
                <p className="text-sm text-[#666] font-light">Investment from 10 urban investors</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">+25%</div>
                <p className="text-sm text-[#666] font-light">Yield increase with KIBO guidance</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">15%</div>
                <p className="text-sm text-[#666] font-light">Returns for each investor</p>
              </div>
            </div>
            <p className="text-center text-[#666] font-light">
              "Before AgriThozha, I was ready to give up. Now my children go to school. The voice assistant guides me every day."
              <span className="block mt-2 font-medium text-[#1A1A1A]">— Ramasamy, 52, Tamil Nadu</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-8" />
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Be part of the
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                quiet revolution
              </span>
            </h2>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto font-light">
              Every farmer saved is a family preserved. Every investment is a life transformed. 
              This isn't charity — it's justice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-[#1A1A1A] px-10 py-7 rounded-full text-lg font-medium">
                <Users className="w-5 h-5 mr-3" />
                I'm a Farmer
              </Button>
              <Button size="lg" variant="outline" className="px-10 py-7 rounded-full text-lg font-medium border-white/20 text-white hover:bg-white/10 bg-transparent">
                <TrendingUp className="w-5 h-5 mr-3" />
                I Want to Invest
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight">AgriThozha</span>
              </div>
              <p className="text-white/40 font-light leading-relaxed max-w-md">
                Building a future where every farmer has technology, capital, and dignity. 
                Powered by AI, funded by community, driven by compassion.
              </p>
            </div>
            
            {[
              {
                title: "Ecosystem",
                links: ["AgriTrade", "KIBO AI", "Kaira Marketplace", "NourishNet"],
              },
              {
                title: "About",
                links: ["Our Mission", "Impact Reports", "Field Stories", "Research"],
              },
              {
                title: "Connect",
                links: ["Farmer Registration", "Investor Portal", "Partner With Us", "Contact"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-6">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <a href="#" className="text-white/40 hover:text-white transition-colors duration-200 text-sm font-light">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm font-light">
              &copy; 2024 AgriThozha — Team Ctrl+Alt+ChatGPT
            </p>
            <div className="flex items-center gap-2 text-white/30 text-sm font-light">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              <span>for India's farmers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}