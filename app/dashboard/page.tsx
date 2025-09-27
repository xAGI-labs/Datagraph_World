"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  MessageSquare, 
  Trophy, 
  BarChart3, 
  Users, 
  TrendingUp,
  Sparkles,
  Zap
} from "lucide-react"
import { useWalletSync } from "@/hooks/use-wallet-sync"

interface DashboardStats {
  totalComparisons: number
  pointsEarned: number
  weeklyComparisons: number
  rank: number
  currentVibePoints: number
  potentialEthValue: number
  tradingRate: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalComparisons: 0,
    pointsEarned: 0,
    weeklyComparisons: 0,
    rank: 0,
    currentVibePoints: 0,
    potentialEthValue: 0,
    tradingRate: 0.000001
  })
  const [loading, setLoading] = useState(true)
  
  // Use the wallet sync hook to automatically store wallet addresses
  const { isWalletSynced, walletAddress, isConnected } = useWalletSync()

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: session?.user })
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

    fetchDashboardStats()
  }, [session, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-black">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name || session?.user?.email}!
          </h1>
          <p className="text-xl text-gray-600">
            Here's your AI comparison activity and earnings overview
          </p>
        </div>

        {/* Earnings Summary */}
        {session?.user?.vibePoints && session.user.vibePoints > 0 && (
          <div className="mb-8">
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Earnings Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Current Balance</p>
                      <p className="text-2xl font-bold text-purple-600">{session.user.vibePoints.toLocaleString()} VP</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ETH Equivalent</p>
                      <p className="text-2xl font-bold text-green-600">{(session.user.vibePoints * 0.000001).toFixed(6)} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">USD Value</p>
                      <p className="text-2xl font-bold text-blue-600">${(session.user.vibePoints * 0.000001 * 2400).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Button 
                    onClick={() => router.push('/points')}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl"
                  >
                    Cash Out Now
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vibe Points</p>
                <p className="text-2xl font-bold text-purple-600">{session?.user?.vibePoints?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">Current balance</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ETH Value</p>
                <p className="text-2xl font-bold text-green-600">
                  {((session?.user?.vibePoints || 0) * 0.000001).toFixed(6)}
                </p>
                <p className="text-xs text-gray-500">Potential cashout</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Comparisons</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalComparisons}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-orange-600">{stats.weeklyComparisons}</p>
                <p className="text-xs text-gray-500">Comparisons</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <Sparkles className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Start Comparing</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Compare AI model responses and earn points for your feedback
            </p>
            <Button 
              onClick={() => router.push('/textvibe')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              New Comparison
            </Button>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Cash Out Points</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Convert your earned Vibe Points to ETH and trade on the blockchain
            </p>
            <Button 
              onClick={() => router.push('/points')}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Trade Points
            </Button>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">View Leaderboard</h2>
            </div>
            <p className="text-gray-600 mb-4">
              See how models rank against each others and top performers
            </p>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full rounded-xl bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              <Users className="h-4 w-4 mr-2" />
              View Rankings
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
