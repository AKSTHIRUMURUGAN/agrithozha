"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DollarSign,
  ArrowRight,
  Quote,
} from "lucide-react"
import { TypingEffect } from "@/components/typing-effect"
import { Navigation } from "@/components/navigation"

export default function AgriThozhaHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 hero-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-6">
              <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Crisis Alert: 11,290 farmer deaths annually
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <TypingEffect text="Transforming agriculture" speed={100} />
              <br />
              <span className="text-green-600">for every farmer</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              AgriThozha connects farmers with investors through our zero-risk farming model. Eliminate debt, guarantee
              income, and create sustainable livelihoods for India's farmers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 rounded-full border-gray-300 bg-transparent">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Crisis Data
              </Button>
            </div>

            <p className="text-sm text-gray-500 mb-8">
              Over 500+ farmers supported • ₹2.5Cr+ investments facilitated • 25% average yield increase
            </p>

            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-sm font-medium text-gray-400">Trusted by leading organizations:</div>
              <div className="flex items-center gap-6">
                <span className="text-lg font-semibold text-gray-400">KIBO</span>
                <span className="text-lg font-semibold text-gray-400">NourishNet</span>
                <span className="text-lg font-semibold text-gray-400">AgriTrade</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">The crisis we're solving</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Behind every statistic is a human story. These numbers represent families we can save.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { value: "11,290", label: "Farmer deaths annually", icon: Heart, color: "red" },
              { value: "86%", label: "Small farmers in debt", icon: AlertTriangle, color: "orange" },
              { value: "50%", label: "Farmers want to quit", icon: TrendingUp, color: "yellow" },
              { value: "₹1.7L", label: "Average farmer debt", icon: DollarSign, color: "blue" },
            ].map((stat, index) => (
              <Card key={index} className="text-center p-6 hover-lift border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div
                    className={`w-12 h-12 mx-auto mb-4 rounded-full bg-${stat.color}-100 flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className={`text-3xl font-bold mb-2 text-${stat.color}-600`}>{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20%283%29-U9EiN5GzCbflKE9ow4cx0ABLKieWa7.png"
              alt="Farmer Issues in India Statistics"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </section>

      <section id="solutions" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our comprehensive solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A complete ecosystem addressing every aspect of the farming crisis with cutting-edge technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AgriTrade Platform",
                description:
                  "Digital investment platform connecting farmers with investors through transparent tracking",
                icon: Globe,
                features: [
                  "Zero farmer investment",
                  "Guaranteed 12-15% returns",
                  "Real-time IoT tracking",
                  "Smart contract profits",
                ],
                tech: ["Flutter", "Firebase", "Firestore", "Gemini AI"],
              },
              {
                title: "KIBO IoT System",
                description: "AI-powered voice assistant providing real-time farm monitoring in regional languages",
                icon: Smartphone,
                features: ["Voice alerts in Tamil", "NPK soil monitoring", "Weather prediction", "Crop health AI"],
                tech: ["ESP32", "BME680", "Flask", "Google TTS/STT"],
              },
              {
                title: "NourishNet App",
                description: "Gamified sustainability platform reducing food waste through community engagement",
                icon: Leaf,
                features: ["Humanity Coin rewards", "Food donation network", "Waste-to-energy hubs", "Impact tracking"],
                tech: ["React", "Next.js", "MongoDB", "TensorFlow"],
              },
            ].map((solution, index) => (
              <Card key={index} className="hover-lift border-0 shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 mb-4 rounded-lg bg-green-100 flex items-center justify-center">
                    <solution.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{solution.title}</CardTitle>
                  <CardDescription className="text-base">{solution.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t pt-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Tech Stack:</p>
                    <div className="flex flex-wrap gap-1">
                      {solution.tech.map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Measurable impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real change in farmers' lives and agricultural productivity across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { value: "500+", label: "Farmers Supported", icon: Users },
              { value: "₹2.5Cr", label: "Investments Facilitated", icon: DollarSign },
              { value: "25%", label: "Average Yield Increase", icon: TrendingUp },
              { value: "0", label: "Farmer Suicides in Our Network", icon: Heart },
            ].map((metric, index) => (
              <Card key={index} className="text-center p-6 hover-lift border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold mb-2 text-green-600">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="gradient-bg text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-center">Case Study: 1-Acre Tomato Farm Success</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">₹30,000</div>
                  <p className="text-sm opacity-90">Investment Needed</p>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">25%</div>
                  <p className="text-sm opacity-90">Yield Increase</p>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">15%</div>
                  <p className="text-sm opacity-90">Investor Returns</p>
                </div>
              </div>
              <p className="text-center mt-4 opacity-90">
                10 investors × ₹3,000 each = Transformed farmer's life + Profitable returns
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Investment opportunities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start investing in agriculture with guaranteed returns and measurable social impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { tier: "Micro", amount: "₹400", shares: "1 share", returns: "12-15%", popular: false },
              { tier: "Small", amount: "₹5,000", shares: "12 shares", returns: "12-15%", popular: true },
              { tier: "Medium", amount: "₹25,000", shares: "62 shares", returns: "12-15%", popular: false },
              { tier: "Large", amount: "₹100,000", shares: "250 shares", returns: "12-15%", popular: false },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`text-center p-6 hover-lift border-0 shadow-sm relative ${plan.popular ? "ring-2 ring-green-500" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">{plan.tier}</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">{plan.amount}</div>
                  <div className="text-gray-600 mb-2">{plan.shares}</div>
                  <div className="text-lg font-medium text-blue-600 mb-6">{plan.returns} Returns</div>
                  <Button
                    className={`w-full ${plan.popular ? "bg-green-600 hover:bg-green-700" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Start Investing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Success stories & wisdom</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real impact from farmers, investors, and ancient Tamil wisdom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg mb-4 italic text-gray-700">
                  "AgriThozha saved my farm and family. Zero investment, guaranteed income. My children can now go to
                  school."
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">Rajesh Kumar</div>
                  <div className="text-sm text-gray-600">Farmer, Tamil Nadu</div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 bg-blue-50 border-0 shadow-sm">
              <CardContent className="pt-6">
                <Quote className="w-8 h-8 text-blue-600 mb-4" />
                <blockquote className="text-lg mb-4 italic text-blue-800">"உழுதுண்டு வாழ்வாரே வாழ்வார்"</blockquote>
                <p className="text-sm text-blue-700">"Those who live by farming live truly" - Thirukkural 1033</p>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg mb-4 italic text-gray-700">
                  "15% returns while helping farmers. Perfect impact investment. I can see exactly where my money goes."
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">Priya Sharma</div>
                  <div className="text-sm text-gray-600">Investor, Mumbai</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 gradient-bg text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Join the agricultural revolution</h2>
          <p className="text-xl mb-8 opacity-90">
            Every farmer saved, every family supported, every community transformed starts with your action today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-3 bg-white text-green-600 hover:bg-gray-100 rounded-full"
            >
              <Users className="w-5 h-5 mr-2" />
              I'm a Farmer
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 border-white text-white hover:bg-white hover:text-green-600 rounded-full bg-transparent"
            >
              <TrendingUp className="w-5 h-5 mr-2" />I Want to Invest
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold">AgriThozha</span>
              </div>
              <p className="text-sm text-gray-400">
                Building a sustainable future for Indian agriculture through technology and transparent investment.
              </p>
            </div>

            {[
              {
                title: "Solutions",
                links: ["AgriTrade Platform", "KIBO IoT System", "NourishNet App", "Investment Plans"],
              },
              {
                title: "Company",
                links: ["About Us", "Team", "Careers", "Contact"],
              },
              {
                title: "Resources",
                links: ["Crisis Data", "Impact Reports", "Success Stories", "Support"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <a href="#" className="hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 AgriThozha by Team Ctrl+Alt+ChatGPT. All rights reserved. Built with ❤️ for farmers.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
