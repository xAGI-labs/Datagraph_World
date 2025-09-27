"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import OnboardingForm from "@/components/OnboardingForm"
import { useWalletSync } from "@/hooks/use-wallet-sync"

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Use the wallet sync hook to automatically store wallet addresses
  const { isWalletSynced, walletAddress, isConnected } = useWalletSync()

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: session?.user })
        })
        if (response.ok) {
          const data = await response.json()
          if (data.hasOnboarded) {
            router.replace("/dashboard")
            return
          }
          setProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, router])

  const handleOnboardingSubmit = async (form: any) => {
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: session?.user, ...form, hasOnboarded: true })
      })
      router.replace("/dashboard")
    } catch (error) {
      console.error('Error submitting onboarding:', error)
      router.replace("/dashboard")
    }
  }

  const handleOnboardingSkip = () => {
    router.push("/dashboard")
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-black">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 text-black flex items-center justify-center overflow-x-hidden">
      <div className="w-full max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Tell us a bit about yourself</h2>
        <p className="text-black text-center mb-8">This helps us personalize your experience. You can skip any field or the whole step.</p>
        <OnboardingForm
          initialData={profile}
          onSubmit={handleOnboardingSubmit}
          onSkip={handleOnboardingSkip}
        />
      </div>
    </div>
  )
} 