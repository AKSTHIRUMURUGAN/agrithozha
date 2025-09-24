"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calculator, CheckCircle, AlertCircle } from "lucide-react"

export default function LoansPage() {
  const [loanAmount, setLoanAmount] = useState("")
  const [loanTenure, setLoanTenure] = useState("")
  const [interestRate, setInterestRate] = useState("7")
  const [emi, setEmi] = useState(null)

  const calculateEMI = () => {
    const principal = Number.parseFloat(loanAmount)
    const rate = Number.parseFloat(interestRate) / 100 / 12
    const tenure = Number.parseFloat(loanTenure) * 12

    if (principal && rate && tenure) {
      const emiAmount = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1)
      setEmi({
        monthly: Math.round(emiAmount),
        total: Math.round(emiAmount * tenure),
        interest: Math.round(emiAmount * tenure - principal),
      })
    }
  }

  const loanTypes = [
    {
      name: "Kisan Credit Card (KCC)",
      interestRate: "4% - 7%",
      maxAmount: "₹3 Lakh",
      tenure: "1 year (renewable)",
      purpose: "Crop production, maintenance, post-harvest expenses",
      features: ["No collateral up to ₹1.6 lakh", "Interest subvention available", "Flexible repayment"],
      eligibility: "All farmers with cultivable land",
      documents: ["Land records", "Identity proof", "Bank statements"],
      provider: "All scheduled banks",
    },
    {
      name: "Agriculture Term Loan",
      interestRate: "8% - 12%",
      maxAmount: "₹50 Lakh",
      tenure: "5-7 years",
      purpose: "Farm mechanization, irrigation, land development",
      features: ["Longer repayment period", "Seasonal repayment", "Moratorium period"],
      eligibility: "Farmers with land ownership",
      documents: ["Project report", "Land documents", "Income proof"],
      provider: "Commercial & Regional Rural Banks",
    },
    {
      name: "Self Help Group (SHG) Loans",
      interestRate: "6% - 10%",
      maxAmount: "₹10 Lakh",
      tenure: "3-5 years",
      purpose: "Micro-enterprises, livestock, small farming",
      features: ["Group guarantee", "Lower interest rates", "Capacity building"],
      eligibility: "SHG members with 6 months savings",
      documents: ["SHG records", "Group resolution", "Identity proof"],
      provider: "Banks & MFIs",
    },
    {
      name: "Mudra Loan (Agriculture)",
      interestRate: "8% - 12%",
      maxAmount: "₹10 Lakh",
      tenure: "5 years",
      purpose: "Agri-allied activities, food processing, dairy",
      features: ["No collateral", "Quick processing", "Flexible repayment"],
      eligibility: "Non-corporate small businesses",
      documents: ["Business plan", "Identity proof", "Address proof"],
      provider: "All banks & NBFCs",
    },
    {
      name: "Warehouse Receipt Loan",
      interestRate: "7% - 9%",
      maxAmount: "Up to 75% of commodity value",
      tenure: "6-12 months",
      purpose: "Post-harvest financing against stored commodities",
      features: ["Commodity as collateral", "Better price realization", "Reduced distress sale"],
      eligibility: "Farmers with quality produce",
      documents: ["Warehouse receipt", "Quality certificate", "Identity proof"],
      provider: "Banks & Warehouse companies",
    },
    {
      name: "Joint Liability Group (JLG) Loan",
      interestRate: "7% - 10%",
      maxAmount: "₹2 Lakh per member",
      tenure: "1-3 years",
      purpose: "Crop production, small farm equipment",
      features: ["Group guarantee", "No individual collateral", "Peer support"],
      eligibility: "Small & marginal farmers in groups of 4-10",
      documents: ["Group agreement", "Land records", "Identity proof"],
      provider: "Regional Rural Banks",
    },
  ]

  const eligibilityChecklist = [
    "Indian citizen engaged in agriculture",
    "Age between 18-65 years",
    "Ownership or lease rights of agricultural land",
    "Good credit history (if any previous loans)",
    "Adequate repayment capacity",
    "Required documents as per loan type",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Agricultural Loans & Credit</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access various loan options designed specifically for farmers and agricultural businesses
            </p>
          </div>

          {/* EMI Calculator */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-600" />
                Loan EMI Calculator
              </CardTitle>
              <CardDescription>Calculate your monthly EMI for agricultural loans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    placeholder="100000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="loanTenure">Tenure (Years)</Label>
                  <Input
                    id="loanTenure"
                    type="number"
                    placeholder="5"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={calculateEMI} className="w-full bg-green-600 hover:bg-green-700">
                    Calculate EMI
                  </Button>
                </div>
              </div>

              {emi && (
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">Monthly EMI</p>
                    <p className="text-2xl font-bold text-green-800">₹{emi.monthly.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">Total Amount</p>
                    <p className="text-2xl font-bold text-green-800">₹{emi.total.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">Total Interest</p>
                    <p className="text-2xl font-bold text-green-800">₹{emi.interest.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loan Types */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {loanTypes.map((loan, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{loan.name}</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {loan.interestRate}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{loan.purpose}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Max Amount</p>
                      <p className="text-gray-600">{loan.maxAmount}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tenure</p>
                      <p className="text-gray-600">{loan.tenure}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 mb-2">Key Features</p>
                    <ul className="space-y-1">
                      {loan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 mb-1">Eligibility</p>
                    <p className="text-sm text-gray-600">{loan.eligibility}</p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 mb-1">Provider</p>
                    <p className="text-sm text-gray-600">{loan.provider}</p>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700">Apply for {loan.name}</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Eligibility & Documents */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  General Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {eligibilityChecklist.map((criteria, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm text-gray-700">{criteria}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Application Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    Compare interest rates from multiple banks before applying
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    Maintain good credit score for better loan terms
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    Keep all documents ready and updated
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    Consider government subsidy schemes for lower interest
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    Consult with bank officials for personalized advice
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    Read all terms and conditions carefully before signing
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
