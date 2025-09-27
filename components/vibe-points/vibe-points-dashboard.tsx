"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Star, Zap } from "lucide-react"
import { EthVibeTrading } from './eth-vibe-trading'

interface VibePointsData {
  balance: number
  totalEarned: number
  weeklyEarned: number
  rank: number
  recentTransactions: Array<{
    id: string
    type: 'earned' | 'spent'
    amount: number
    description: string
    timestamp: Date
  }>
}

export default function VibePointsDashboard() {
  const { data: session } = useSession()
  const [pointsData, setPointsData] = useState<VibePointsData>({
    balance: 0,
    totalEarned: 0,
    weeklyEarned: 0,
    rank: 0,
    recentTransactions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    const fetchVibePoints = async () => {
      try {
        const response = await fetch('/api/vibe-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: session?.user })
        })

        if (response.ok) {
          const data = await response.json()
          setPointsData(data)
        }
      } catch (error) {
        console.error('Error fetching vibe points:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVibePoints()
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vibe Points</h1>
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold">{pointsData.balance} VP</span>
        </div>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">{pointsData.balance}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">{pointsData.totalEarned}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Global Rank</p>
              <p className="text-2xl font-bold text-gray-900">#{pointsData.rank}</p>
            </div>
            <Trophy className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <Zap className="h-5 w-5 text-orange-500" />
        </div>
        
        {pointsData.recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {pointsData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} VP
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm">Start comparing AI responses to earn points!</p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex space-x-4">
        <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
          <Star className="h-4 w-4 mr-2" />
          Earn More Points
        </Button>
        <Button variant="outline" className="flex-1">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Leaderboard
        </Button>
      </div>
    </div>
  )
}
