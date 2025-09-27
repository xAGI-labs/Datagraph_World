"use client"

import { useRouter } from "next/navigation"
import { useWorldAuth } from "@/hooks/use-world-auth"
import { useEffect, useState } from "react"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Wallet, CheckCircle, Shield } from 'lucide-react';

// Mock payment data
const mockPayments = [
  {
    id: 1,
    description: "AI Comparison Reward",
    amount: "+0.1 WLD",
    date: "2024-07-20",
    status: "Completed"
  },
  {
    id: 2,
    description: "AI Comparison Reward",
    amount: "+0.1 WLD",
    date: "2024-07-19",
    status: "Completed"
  },
  {
    id: 3,
    description: "USDC Conversion",
    amount: "+2.5 USDC",
    date: "2024-07-18",
    status: "Completed"
  }
];

export default function PointsPage() {
  const { user, isLoading } = useWorldAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
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
    setLoading(true);
    // Mock fetching payments
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.worldIdVerified) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto">
          <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">World ID Required</h2>
          <p className="text-gray-600 mb-6">Please complete World ID verification to access your payments.</p>
          <Button onClick={() => router.push("/onboarding")}>
            Get Verified
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Payments</h1>
        </div>

        <Card className="w-full border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-4xl font-bold">0.2 WLD</p>
                <p className="text-lg text-gray-600">+ 2.5 USDC</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Wallet Address</p>
                <p className="text-sm font-mono text-gray-800">
                  {user.worldChainAddress 
                    ? `${user.worldChainAddress.slice(0, 6)}...${user.worldChainAddress.slice(-4)}` 
                    : 'Not connected'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4 mt-6">History</h3>
            {payments.length === 0 ? (
              <div className="text-center py-16 border-t border-gray-200">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No transactions yet</h3>
                <p className="text-gray-500 mb-6">
                  Start comparing AI models to earn WLD and USDC.
                </p>
                <Button 
                  onClick={() => router.push("/textvibe")}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Start Comparing
                </Button>
              </div>
            ) : (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-gray-500">{payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{payment.amount}</p>
                      <p className="text-xs text-gray-500">{payment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
