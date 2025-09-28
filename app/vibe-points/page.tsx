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
  const { user, initiatePayment, isLoading } = useWorldAuth()
  const router = useRouter()
  const [userStats, setUserStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [trading, setTrading] = useState(false)
  const [pointsToTrade, setPointsToTrade] = useState("")
  const [selectedToken, setSelectedToken] = useState("WLD")
  const [usingMockData, setUsingMockData] = useState(false)
  
  // Conversion rates (100 vibe points = 0.1 tokens)
  const conversionRates = {
    WLD: 0.001, // 1 vibe point = 0.001 WLD
    USDC: 0.001 // 1 vibe point = 0.001 USDC
  }

  // Mock data for when API is slow
  const getMockStats = () => ({
    vibePoints: 250,
    totalComparisons: 8,
    totalPayments: 2,
    paymentStats: {
      _count: { id: 2 }
    }
  })

  const fetchUserStats = useCallback(async () => {
    if (!user?.worldIdNullifier) return
    
    // Set a timeout to use mock data if API is slow
    const timeoutId = setTimeout(() => {
      if (statsLoading) {
        console.log('API timeout, using mock data')
        setUserStats(getMockStats())
        setUsingMockData(true)
        setStatsLoading(false)
      }
    }, 3000) // 3 second timeout
    
    try {
      const response = await fetch('/api/user/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldIdNullifier: user.worldIdNullifier })
      })
      
      if (response.ok) {
        const stats = await response.json()
        clearTimeout(timeoutId)
        setUserStats(stats)
        setUsingMockData(false)
      } else {
        // If API fails, use mock data
        clearTimeout(timeoutId)
        setUserStats(getMockStats())
        setUsingMockData(true)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      clearTimeout(timeoutId)
      setUserStats(getMockStats())
      setUsingMockData(true)
    } finally {
      setStatsLoading(false)
    }
  }, [user?.worldIdNullifier, statsLoading])

  useEffect(() => {
    if (!isLoading && !user?.worldIdVerified) {
      router.push('/onboarding')
    } else if (user?.worldIdVerified) {
      fetchUserStats()
    }
  }, [user?.worldIdVerified, isLoading, fetchUserStats, router])

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



  return (
    <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 px-2 sm:px-4">Vibe Points Trading</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 px-2 sm:px-4">Trade your earned vibe points for WLD and USDC</p>
          </div>

          {/* Mock Data Notification */}
          {usingMockData && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-amber-500 rounded-full flex-shrink-0"></div>
                <p className="text-sm sm:text-base text-amber-800">
                  <span className="font-semibold">Demo Mode:</span> Using sample data due to slow API response. Your actual stats may differ.
                </p>
              </div>
            </div>
          )}

          {/* Current Balance Card */}
          <Card className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 sm:h-7 md:h-8 w-24 sm:w-28 md:w-32 rounded"></div>
                    ) : (
                      <span className="block">{userStats?.vibePoints || 0} <span className="text-sm sm:text-base md:text-lg">Vibe Points</span></span>
                    )}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                    {usingMockData ? "Demo data - " : ""}Available for trading
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <p className="text-xs sm:text-sm text-gray-500">Estimated value</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-5 sm:h-6 w-16 sm:w-20 rounded sm:ml-auto"></div>
                  ) : (
                    `≈ ${((userStats?.vibePoints || 0) * conversionRates.WLD).toFixed(3)} WLD`
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Trading Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            {/* Trade Form */}
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Trade Vibe Points</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="points" className="text-sm sm:text-base font-medium">Vibe Points to Trade</Label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="Enter points (min 10)"
                    value={pointsToTrade}
                    onChange={(e) => setPointsToTrade(e.target.value)}
                    min="10"
                    max={userStats?.vibePoints || 0}
                    className="mt-1 text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Minimum 10 points required
                  </p>
                </div>

                <div>
                  <Label htmlFor="token" className="text-sm sm:text-base font-medium">Receive Token</Label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WLD">WLD (Worldcoin)</SelectItem>
                      <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {pointsToTrade && (
                  <div className="p-2 sm:p-3 md:p-4 bg-blue-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">You will receive:</span>
                      <span className="text-sm sm:text-base md:text-lg font-semibold text-blue-600 break-all">
                        {(parseInt(pointsToTrade || "0") * conversionRates[selectedToken as keyof typeof conversionRates]).toFixed(4)} {selectedToken}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleTrade}
                  disabled={!pointsToTrade || parseInt(pointsToTrade) < 10 || parseInt(pointsToTrade) > (userStats?.vibePoints || 0) || trading}
                  className="w-full text-sm sm:text-base py-2 sm:py-3"
                >
                  {trading ? "Processing Trade..." : "Trade Now"}
                </Button>
              </div>
            </Card>

            {/* Conversion Rates & Info */}
            <Card className="p-3 sm:p-4 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 md:mb-6">Conversion Rates</h3>
              
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <Card className="p-3 sm:p-4 md:p-6 text-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Comparisons</h3>
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto mb-2"></div>
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-green-600">{userStats?.totalComparisons || 0}</p>
              )}
              <p className="text-gray-600 text-xs sm:text-sm">Total completed</p>
            </Card>

            <Card className="p-4 sm:p-6 text-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Day Streak</h3>
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-8 rounded mx-auto mb-2"></div>
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{userStats?.dayStreak || 0}</p>
              )}
              <p className="text-gray-600 text-xs sm:text-sm">Consecutive days</p>
            </Card>

            <Card className="p-4 sm:p-6 text-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Payments</h3>
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-8 rounded mx-auto mb-2"></div>
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{userStats?.totalPayments || 0}</p>
              )}
              <p className="text-gray-600 text-xs sm:text-sm">Completed trades</p>
            </Card>
          </div>

          {/* Earn More Points */}
          <Card className="p-4 sm:p-6 md:p-8 text-center">
            <Coins className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-yellow-500 mx-auto mb-2 sm:mb-3 md:mb-4" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-2 sm:px-4">Need More Vibe Points?</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 md:mb-6 px-2 sm:px-4">
              Earn vibe points by comparing AI model responses. Each comparison earns you points that can be traded for real crypto.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center max-w-md mx-auto">
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

          <div className="mt-4 sm:mt-6 md:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 md:p-6">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">How Vibe Points Trading Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
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
