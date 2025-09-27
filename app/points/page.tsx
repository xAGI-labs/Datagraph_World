"use client"

import { useRouter } from "next/navigation"
import { useWorldAuth } from "@/hooks/use-world-auth"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Coins, 
  Wallet as WalletIcon, 
  TrendingDown, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';

export default function PointsPage() {
  const { user, isLoading } = useWorldAuth()
  const router = useRouter()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || !user.worldIdVerified)) {
      router.push("/onboarding")
      return
    }

    if (user && user.worldIdVerified) {
      fetchPayments()
    }
  }, [user, isLoading, router])

  const fetchPayments = async () => {
    if (!user) return
    
    try {
      // This would fetch World Chain payment history
      // const response = await fetch('/api/world/payments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: user.id })
      // })
      
      // For now, just set empty array
      setPayments([])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
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
          <p className="text-gray-600 mb-4">Please complete World ID verification to access payments.</p>
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
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">World Chain Payments</h1>
        </div>

        {/* Payment Info */}
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment System</h3>
              <p className="text-gray-600">Earn WLD and USDC for each AI comparison</p>
            </div>
            <Coins className="w-8 h-8 text-indigo-500" />
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

        {/* Payment History */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h3>
          
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <WalletIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No payments yet</h3>
              <p className="text-gray-500 mb-4">
                Start comparing AI models to earn your first World Chain payment!
              </p>
              <Button 
                onClick={() => router.push("/textvibe")}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                Start Comparing
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.description}</p>
                      <p className="text-sm text-gray-500">{payment.createdAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{payment.amount} {payment.token}</p>
                    <p className="text-xs text-gray-500">{payment.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}