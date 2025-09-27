"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { 
  CheckCircle,
  Chrome
} from "lucide-react"

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push("/onboarding")
    }
  }, [status, session, router])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/onboarding' })
    } catch (error) {
      console.error("Sign in error:", error)
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 backdrop-blur-md text-gray-900 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-bl from-gray-50 to-orange-100/40" />
        <div className="relative text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-bl from-gray-50 to-orange-100/40" />
        <div className="relative text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 text-gray-900 flex items-center justify-center overflow-x-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-bl from-orange-50 via-gray-50 to-orange-100/40" />
      
      <div className="relative w-full max-w-md mx-auto bg-white/40 shadow-xl shadow-neutral-400/20 p-6 rounded-2xl backdrop-blur-2xl px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center justify-center space-x-3">
            <Image
              src="/assets/inverted_dg.png"
              alt="Datagraph"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-900">
              Datagraph
            </span>
          </div>

          {/* Sign In Card */}
          <Card className="bg-white/40 backdrop-blur-md border-gray-200/50">
            <CardHeader className="text-center">
              <CardTitle className="text-gray-900 text-xl">Welcome to Datagraph</CardTitle>
              <p className="text-gray-600 text-sm">Sign in to compare AI models and earn points</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleSignIn()}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Chrome className="w-5 h-5" />
                    <span>Sign in with Google</span>
                  </div>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/textvibe")}
                className="w-full border-gray-300 text-gray-700 bg-white/50 hover:bg-white/80 hover:text-gray-900 transition-all duration-300"
              >
                Continue without signing in
              </Button>
              
              <p className="text-center text-xs text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
