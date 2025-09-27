"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    // Since we're using World ID, redirect directly to onboarding
    router.replace("/onboarding")
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 backdrop-blur-md text-gray-900 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-bl from-gray-50 to-orange-100/40" />
      <div className="relative text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to onboarding...</p>
      </div>
    </div>
  )
}