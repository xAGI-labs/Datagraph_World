'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  MiniKit, 
  VerificationLevel, 
  VerifyCommandInput,
  ISuccessResult,
  PayCommandInput,
  Tokens,
  tokenToDecimals
} from '@worldcoin/minikit-js'

interface User {
  id: string
  worldIdNullifier: string
  worldIdVerified: boolean
  verificationLevel?: string
  worldChainAddress?: string
  name?: string
  email?: string
  image?: string
}

interface WorldAuthContextType {
  user: User | null
  isLoading: boolean
  isWorldApp: boolean
  login: () => Promise<void>
  logout: () => void
  verifyWorldId: (action: string, signal?: string) => Promise<{ success: boolean; error?: string }>
  initiatePayment: (amount: number, token: string, description: string) => Promise<{ success: boolean; error?: string }>
}

const WorldAuthContext = createContext<WorldAuthContextType | undefined>(undefined)

export function WorldAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWorldApp, setIsWorldApp] = useState(false)

  useEffect(() => {
    // Check if running in World App
    setIsWorldApp(MiniKit.isInstalled())
    
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('worldauth_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async () => {
    // For now, we'll implement login through World ID verification
    // This will be called during onboarding
    setIsLoading(true)
    try {
      // Implement login logic here if needed
      console.log('Login triggered - will be handled through World ID verification')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('worldauth_user')
  }

  const verifyWorldId = async (action: string, signal?: string): Promise<{ success: boolean; error?: string }> => {
    if (!MiniKit.isInstalled()) {
      return { success: false, error: 'Please open this app in World App to verify your identity' }
    }

    try {
      const verifyPayload: VerifyCommandInput = {
        action,
        signal,
        verification_level: VerificationLevel.Orb,
      }

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)

      if (finalPayload.status === 'error') {
        return { success: false, error: 'Verification failed' }
      }

      // Verify the proof in the backend
      const verifyResponse = await fetch('/api/world/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          action,
          signal,
        }),
      })

      const result = await verifyResponse.json()

      if (result.success) {
        const newUser = result.user
        setUser(newUser)
        localStorage.setItem('worldauth_user', JSON.stringify(newUser))
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Verification failed' }
      }
    } catch (error) {
      console.error('World ID verification error:', error)
      return { success: false, error: 'Verification failed' }
    }
  }

  const initiatePayment = async (amount: number, token: string, description: string): Promise<{ success: boolean; error?: string }> => {
    if (!MiniKit.isInstalled()) {
      return { success: false, error: 'Please open this app in World App to make payments' }
    }

    if (!user || !user.worldIdVerified) {
      return { success: false, error: 'Please verify your World ID first' }
    }

    try {
      // Step 1: Initiate payment in backend
      const initiateRes = await fetch('/api/world/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          token,
          description,
        }),
      })

      const { id: reference } = await initiateRes.json()

      // Step 2: Create payment payload according to docs
      const paymentPayload: PayCommandInput = {
        reference,
        to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Your payment address
        tokens: [{
          symbol: token as Tokens,
          token_amount: tokenToDecimals(amount, token as Tokens).toString(),
        }],
        description,
      }

      // Step 3: Send payment command
      const { finalPayload } = await MiniKit.commandsAsync.pay(paymentPayload)

      if (finalPayload.status === 'success') {
        // Step 4: Confirm payment in backend
        const confirmRes = await fetch('/api/world/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: finalPayload }),
        })

        const result = await confirmRes.json()
        return { success: result.success, error: result.error }
      } else {
        return { success: false, error: 'Payment was cancelled or failed' }
      }
    } catch (error) {
      console.error('Payment error:', error)
      return { success: false, error: 'Payment failed' }
    }
  }

  return (
    <WorldAuthContext.Provider value={{
      user,
      isLoading,
      isWorldApp,
      login,
      logout,
      verifyWorldId,
      initiatePayment,
    }}>
      {children}
    </WorldAuthContext.Provider>
  )
}

export function useWorldAuth() {
  const context = useContext(WorldAuthContext)
  if (context === undefined) {
    throw new Error('useWorldAuth must be used within a WorldAuthProvider')
  }
  return context
}