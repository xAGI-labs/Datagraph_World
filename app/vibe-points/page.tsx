"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWorldAuth } from "@/hooks/use-world-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Wallet, Zap } from "lucide-react"

export default function WorldChainPage() {
  const { user } = useWorldAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user?.worldIdVerified) {
      router.push('/onboarding')
    }
  }, [user, router])

  if (!user?.worldIdVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">World ID Required</h2>
          <p className="text-gray-600 mb-4">Please verify your World ID to access World Chain payments.</p>
          <Button onClick={() => router.push('/onboarding')}>
            Get Verified
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">World Chain Payments</h1>
            <p className="text-xl text-gray-600">Earn WLD and USDC for AI comparisons</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">World ID Verified</h3>
              <p className="text-gray-600">Your identity is verified and payments are secured</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Payments</h3>
              <p className="text-gray-600">Get paid immediately after each comparison</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">World Chain</h3>
              <p className="text-gray-600">Powered by World&apos;s secure blockchain</p>
            </Card>
          </div>

          <Card className="p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Earning Today</h2>
            <p className="text-gray-600 mb-6">
              Compare AI model responses and earn World Chain tokens. Each comparison you complete 
              earns you WLD or USDC tokens paid directly to your World Chain address.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/textvibe')}
                className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Start Comparing AI Models
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full md:w-auto ml-0 md:ml-4"
              >
                View Dashboard
              </Button>
            </div>
          </Card>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How World Chain Payments Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Compare AI Responses</p>
                  <p className="text-gray-600">Choose which AI gives the better answer</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Automatic Payment</p>
                  <p className="text-gray-600">Receive 0.1 WLD or equivalent USDC</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Secure Transfer</p>
                  <p className="text-gray-600">Tokens sent to your World Chain address</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
