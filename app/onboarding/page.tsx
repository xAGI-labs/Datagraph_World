"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWorldAuth } from "@/hooks/use-world-auth"
import OnboardingForm from "@/components/OnboardingForm"
import WorldIDVerification from "@/components/WorldIDVerification"
import { Button } from "@/components/ui/button"
import { CheckCircle, Shield, AlertCircle } from "lucide-react"
import { WORLD_ID_ACTIONS } from "@/lib/world-actions"

export default function OnboardingPage() {
  const { user, isWorldApp, isLoading, verifyWorldId } = useWorldAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const fetchProfile = async (userData?: any) => {
    const currentUser = userData || user
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
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

  useEffect(() => {
    if (user && user.worldIdVerified) {
      fetchProfile();
    } else if (!user) {
      if (isWorldApp) {
        const autoVerify = async () => {
          const result = await verifyWorldId(WORLD_ID_ACTIONS.ONBOARDING);
          if (!result.success) {
            setVerificationError(result.error || 'Automatic verification failed.');
            setLoading(false);
          }
        };
        autoVerify();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isWorldApp, verifyWorldId, router]);



  const handleOnboardingSubmit = async (form: any) => {
    if (!user) return
    
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...form, hasOnboarded: true })
      })
      router.replace("/dashboard")
    } catch (error) {
      console.error('Error submitting onboarding:', error)
      router.replace("/dashboard")
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

  // Show verification step if user hasn't verified yet
  if (!user || !user.worldIdVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 text-black flex items-center justify-center overflow-x-hidden">
        <div className="w-full max-w-md mx-auto p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Verify Your Identity</h2>
          <p className="text-gray-600 mb-6">
            Complete World ID verification to access Datagraph and start earning through AI comparisons.
          </p>
          
          {verificationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center text-red-800">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">{verificationError}</span>
              </div>
            </div>
          )}
          
          <div className="w-full">
            <WorldIDVerification
              onSuccess={async (userData) => {
                setVerificationError(null)
                await fetchProfile(userData)
              }}
              onError={(error) => {
                setVerificationError(error)
              }}
              buttonText="Verify with World ID"
              action={WORLD_ID_ACTIONS.ONBOARDING}
            />
          </div>
          
          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>Proof of personhood</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>Bot-free experience</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>Secure World Chain payments</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show onboarding form after verification
  return (
    <div className="min-h-screen bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40 text-black flex items-center justify-center overflow-x-hidden">
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Identity Verified!</h2>
          <p className="text-gray-600">Now tell us a bit about yourself to personalize your experience.</p>
        </div>
        
        <OnboardingForm
          initialData={profile}
          onSubmit={handleOnboardingSubmit}
          onSkip={() => router.push("/dashboard")}
        />
      </div>
    </div>
  )
}