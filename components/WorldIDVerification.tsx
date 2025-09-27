'use client'

import { IDKitWidget, ISuccessResult, VerificationLevel } from '@worldcoin/idkit'
import { useWorldAuth } from '@/hooks/use-world-auth'
import { WORLD_ID_ACTIONS } from '@/lib/world-actions'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

interface WorldIDVerificationProps {
  onSuccess?: (user?: any) => void
  onError?: (error: string) => void
  buttonText?: string
  action?: string
  signal?: string
}

export default function WorldIDVerification({
  onSuccess,
  onError,
  buttonText = "Verify with World ID",
  action = WORLD_ID_ACTIONS.ONBOARDING,
  signal
}: WorldIDVerificationProps) {
  const { verifyWithIDKit, isLoading } = useWorldAuth()

  const handleSuccess = async (result: ISuccessResult) => {
    console.log('🎉 IDKit verification successful:', result)
    
    try {
      const verificationResult = await verifyWithIDKit(result, action, signal)
      
      if (verificationResult.success) {
        console.log('✅ Complete verification successful!')
        onSuccess?.(verificationResult.user)
      } else {
        console.error('❌ Backend verification failed:', verificationResult.error)
        onError?.(verificationResult.error || 'Verification failed')
      }
    } catch (error) {
      console.error('❌ Verification process failed:', error)
      onError?.('Verification process failed')
    }
  }

  const handleError = (error: any) => {
    console.error('❌ IDKit error:', error)
    onError?.(error.detail || 'World ID verification failed')
  }

  return (
    <IDKitWidget
      app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`}
      action={action}
      signal={signal}
      onSuccess={handleSuccess}
      onError={handleError}
      verification_level={VerificationLevel.Device} // Start with device level for easier testing
    >
      {({ open }) => (
        <Button 
          onClick={open} 
          disabled={isLoading}
          className="w-full"
        >
          <Shield className="w-4 h-4 mr-2" />
          {isLoading ? 'Verifying...' : buttonText}
        </Button>
      )}
    </IDKitWidget>
  )
}