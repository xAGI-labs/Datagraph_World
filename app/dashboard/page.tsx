"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWorldAuth } from "@/hooks/use-world-auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  MessageSquare, 
  Trophy, 
  BarChart3, 
  Users, 
  TrendingUp,
  Sparkles,
  Zap,
  Shield
} from "lucide-react"

interface DashboardStats {
  vibePoints: number
  totalComparisons: number
  weeklyComparisons: number
  rank: number
}

export default function DashboardPage() {
  const { user, isLoading, isWorldApp } = useWorldAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    vibePoints: 0,
    totalComparisons: 0,
    weeklyComparisons: 0,
    rank: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) return
      
      try {
        const response = await fetch('/api/dashboard/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading && (!user || !user.worldIdVerified)) {
      router.push("/onboarding")
      return
    }

    if (user && user.worldIdVerified) {
      fetchDashboardStats()
    }
  }, [user, isLoading, router])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-black">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.worldIdVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 text-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">World ID Required</h2>
          <p className="text-gray-600 mb-4">Please complete World ID verification to access the dashboard.</p>
          <Button onClick={() => router.push("/onboarding")}>
            Get Verified
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name || 'User'}!
          </h1>
          <p className="text-xl text-gray-600">
            Here's your AI comparison activity overview
          </p>
          <div className="flex items-center mt-2">
            <Shield className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-green-600 font-medium">
              World ID Verified ({user.verificationLevel})
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Vibe Points</p>
                <p className="text-2xl font-bold text-amber-700">{stats.vibePoints.toLocaleString()}</p>
              </div>
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <Button 
              onClick={() => router.push("/vibe-points")}
              className="mt-4 w-full bg-amber-500 hover:bg-amber-600"
            >
              Trade Points
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Start Comparing</p>
                <p className="text-2xl font-bold text-blue-700">AI Models</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <Button 
              onClick={() => router.push("/textvibe")}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600"
            >
              Compare Now
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Comparisons</p>
                <p className="text-2xl font-bold text-purple-700">{stats.totalComparisons}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">This Week</p>
                <p className="text-2xl font-bold text-green-700">{stats.weeklyComparisons}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Your Rank</p>
                <p className="text-2xl font-bold text-orange-700">#{stats.rank || 'N/A'}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* World Chain Payment Info */}
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">World Chain Payments</h3>
              <p className="text-gray-600">Earn WLD and USDC for each AI comparison</p>
            </div>
            <Zap className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Payment per comparison</p>
              <p className="text-lg font-semibold text-indigo-600">0.1 WLD or equivalent USDC</p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-sm text-gray-600">World Chain Address</p>
              <p className="text-sm font-mono text-gray-800">
                {user.worldChainAddress ? 
                  `${user.worldChainAddress.slice(0, 6)}...${user.worldChainAddress.slice(-4)}` : 
                  'Not connected'
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Getting Started */}
        {stats.totalComparisons === 0 && (
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 shadow-lg">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-4">
                Compare AI model responses and earn World Chain payments for your contributions!
              </p>
              <Button 
                onClick={() => router.push("/textvibe")}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Start Your First Comparison
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}