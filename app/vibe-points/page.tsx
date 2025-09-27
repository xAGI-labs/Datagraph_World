"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useWorldAuth } from "@/hooks/use-world-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, TrendingUp, Wallet, Zap, ArrowRightLeft, Coins } from "lucide-react"

export default function WorldChainPage() {
  const { user, initiatePayment } = useWorldAuth()
  const router = useRouter()
  const [userStats, setUserStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trading, setTrading] = useState(false)
  const [pointsToTrade, setPointsToTrade] = useState("")
  const [selectedToken, setSelectedToken] = useState("WLD")
  
  // Conversion rates (100 vibe points = 0.1 tokens)
  const conversionRates = {
    WLD: 0.001, // 1 vibe point = 0.001 WLD
    USDC: 0.001 // 1 vibe point = 0.001 USDC
  }

  const fetchUserStats = useCallback(async () => {
    if (!user?.worldIdNullifier) return
    
    try {
      const response = await fetch('/api/user/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldIdNullifier: user.worldIdNullifier })
      })
      
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.worldIdNullifier])

  useEffect(() => {
    if (!user?.worldIdVerified) {
      router.push('/onboarding')
    } else {
      fetchUserStats()
    }
  }, [user?.worldIdVerified, fetchUserStats, router])

  const handleTrade = async () => {
    if (!pointsToTrade || !user?.worldIdNullifier) return
    
    const points = parseInt(pointsToTrade)
    if (points > userStats?.vibePoints || points < 10) {
      alert('Invalid points amount. Minimum 10 points required.')
      return
    }

    setTrading(true)
    try {
      // Step 1: Process the trade (deduct points, create payment record)
      const response = await fetch('/api/vibe-points/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldIdNullifier: user.worldIdNullifier,
          vibePoints: points,
          token: selectedToken
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Trade initiated:', result)
        
        // Step 2: Initiate World Chain payment
        const paymentResult = await initiatePayment(
          result.trade.cryptoAmount,
          selectedToken,
          `Vibe Points Trade: ${points} points → ${result.trade.cryptoAmount} ${selectedToken}`
        )

        if (paymentResult.success) {
          alert(`Success! You've traded ${points} vibe points for ${result.trade.cryptoAmount} ${selectedToken}`)
          // Refresh stats
          await fetchUserStats()
          setPointsToTrade("")
        } else {
          alert(`Payment failed: ${paymentResult.error || 'Unknown error'}`)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Trade failed')
      }
    } catch (error) {
      console.error('Trade error:', error)
      alert('Trade failed')
    } finally {
      setTrading(false)
    }
  }

  if (!user?.worldIdVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <Wallet className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">World ID Required</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">Please verify your World ID to access vibe points trading.</p>
          <Button onClick={() => router.push('/onboarding')} className="w-full sm:w-auto">
            Get Verified
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading your vibe points...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-4">Vibe Points Trading</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">Trade your earned vibe points for WLD and USDC</p>
          </div>

          {/* Current Balance Card */}
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                  <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {userStats?.vibePoints || 0} Vibe Points
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">Available for trading</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Estimated value</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  ≈ {((userStats?.vibePoints || 0) * conversionRates.WLD).toFixed(3)} WLD
                </p>
              </div>
            </div>
          </Card>

          {/* Trading Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Trade Form */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Trade Vibe Points</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="points">Vibe Points to Trade</Label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="Enter points (min 10)"
                    value={pointsToTrade}
                    onChange={(e) => setPointsToTrade(e.target.value)}
                    min="10"
                    max={userStats?.vibePoints || 0}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 10 points required
                  </p>
                </div>

                <div>
                  <Label htmlFor="token">Receive Token</Label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WLD">WLD (Worldcoin)</SelectItem>
                      <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {pointsToTrade && (
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                      <span className="text-sm sm:text-base text-gray-700">You will receive:</span>
                      <span className="text-sm sm:text-base font-semibold text-blue-600">
                        {(parseInt(pointsToTrade || "0") * conversionRates[selectedToken as keyof typeof conversionRates]).toFixed(4)} {selectedToken}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleTrade}
                  disabled={!pointsToTrade || parseInt(pointsToTrade) < 10 || parseInt(pointsToTrade) > (userStats?.vibePoints || 0) || trading}
                  className="w-full"
                >
                  {trading ? "Processing Trade..." : "Trade Now"}
                </Button>
              </div>
            </Card>

            {/* Conversion Rates & Info */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Conversion Rates</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">W</span>
                    </div>
                    <span className="text-sm sm:text-base font-medium">WLD</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">1000 points = 1 WLD</span>
                </div>

                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                    <span className="text-sm sm:text-base font-medium">USDC</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">1000 points = 1 USDC</span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-sm sm:text-base font-semibold text-yellow-800 mb-2">How it works:</h4>
                <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
                  <li>• Minimum trade: 10 vibe points</li>
                  <li>• Instant conversion to crypto</li>
                  <li>• Sent to your World Chain wallet</li>
                  <li>• Secure World ID verification</li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6 text-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Comparisons</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{userStats?.comparisonsCompleted || 0}</p>
              <p className="text-gray-600 text-xs sm:text-sm">Total completed</p>
            </Card>

            <Card className="p-4 sm:p-6 text-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Day Streak</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{userStats?.dayStreak || 0}</p>
              <p className="text-gray-600 text-xs sm:text-sm">Consecutive days</p>
            </Card>

            <Card className="p-4 sm:p-6 text-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Payments</h3>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{userStats?.paymentStats?._count?.id || 0}</p>
              <p className="text-gray-600 text-xs sm:text-sm">Completed trades</p>
            </Card>
          </div>

          {/* Earn More Points */}
          <Card className="p-4 sm:p-6 lg:p-8 text-center">
            <Coins className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">Need More Vibe Points?</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
              Earn vibe points by comparing AI model responses. Each comparison earns you points that can be traded for real crypto.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button 
                onClick={() => router.push('/textvibe')}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Start Earning Points
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                View Dashboard
              </Button>
            </div>
          </Card>

          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">How Vibe Points Trading Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Earn Vibe Points</p>
                  <p className="text-gray-600">Complete AI comparisons and earn points</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Trade for Crypto</p>
                  <p className="text-gray-600">Convert points to WLD or USDC tokens</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Instant Transfer</p>
                  <p className="text-gray-600">Crypto sent to your World Chain wallet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
