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
import { ISuccessResult as IDKitSuccessResult } from '@worldcoin/idkit'

interface User {
  id: string
  worldIdNullifier: string
  worldIdVerified: boolean
  verificationLevel?: VerificationLevel
  worldChainAddress?: string
  name?: string
  email?: string
  image?: string
}

interface WorldAuthContextType {
  user: User | null
  isLoading: boolean
  isWorldApp: boolean
  login: (action: string, signal?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  verifyWorldId: (action: string, signal?: string) => Promise<{ success: boolean; error?: string }>
  verifyWithIDKit: (result: IDKitSuccessResult, action: string, signal?: string) => Promise<{ success: boolean; error?: string; user?: User }>
  initiatePayment: (amount: number, token: string, description: string) => Promise<{ success: boolean; error?: string }>
  toggleDevMode: () => void
}

const WorldAuthContext = createContext<WorldAuthContextType | undefined>(undefined)

export function WorldAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWorldApp, setIsWorldApp] = useState(false)

  useEffect(() => {
    // Enhanced World App detection with multiple methods
    const detectWorldApp = () => {
      const miniKitInstalled = MiniKit.isInstalled()
      
      // Additional detection methods for better compatibility
      const userAgent = navigator.userAgent.toLowerCase()
      const isWorldAppUA = userAgent.includes('worldapp') || 
                          userAgent.includes('world app') ||
                          userAgent.includes('minikit')
      
      // Check for World App specific context
      const hasWorldAppContext = typeof window !== 'undefined' && (
        window.hasOwnProperty('worldapp') || 
        window.hasOwnProperty('WorldApp') ||
        window.hasOwnProperty('minikit') ||
        // Check for World App iframe context
        window.parent !== window || // Running in iframe
        window.location.href.includes('world.org') ||
        document.referrer.includes('worldapp') ||
        document.referrer.includes('world.org')
      )
      
      // Developer override
      const devOverride = localStorage.getItem('world_app_dev_mode') === 'true'
      
      // Check URL parameters that might indicate World App
      const urlParams = new URLSearchParams(window.location.search)
      const hasWorldAppParams = urlParams.has('worldapp') || urlParams.has('miniapp')
      
      const detected = miniKitInstalled || isWorldAppUA || hasWorldAppContext || devOverride || hasWorldAppParams
      
      // Enhanced debug logging
      console.log('🌍 World App Detection Debug:', {
        miniKitInstalled,
        isWorldAppUA,
        hasWorldAppContext,
        devOverride,
        hasWorldAppParams,
        userAgent: userAgent.slice(0, 100) + '...',
        windowLocation: window.location.href,
        documentReferrer: document.referrer,
        isIframe: window.parent !== window,
        finalDetection: detected
      })
      
      return detected
    }
    
    setIsWorldApp(detectWorldApp())

    // Load user from localStorage
    const savedUser = localStorage.getItem('worldauth_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const verifyWorldId = async (
    action: string,
    signal?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const devMode = localStorage.getItem('world_app_dev_mode') === 'true'
    
    // More lenient check - allow verification if we detected World App OR dev mode
    if (!MiniKit.isInstalled() && !isWorldApp && !devMode) {
      return { success: false, error: 'Please open this app in World App to verify your identity' }
    }
    
    setIsLoading(true)

    try {
      console.log('🔐 Attempting World ID verification:', { action, signal, isWorldApp, devMode })
      
      const verifyPayload: VerifyCommandInput = {
        action,
        signal,
        verification_level: VerificationLevel.Orb,
      }

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)

      console.log('🔐 MiniKit verification response:', finalPayload)

      if (finalPayload.status === 'error') {
        console.error('❌ MiniKit verification failed:', finalPayload)
        return { success: false, error: finalPayload.error_code || 'Verification failed' }
      }

      console.log('✅ MiniKit verification successful, sending to backend...')

      // Verify on backend
      const verifyResponse = await fetch('/api/world/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payload: finalPayload as ISuccessResult, // Parses only the fields we need to verify
          action, 
          signal 
        }),
      })

      console.log('🌐 Backend response status:', verifyResponse.status)

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text()
        console.error('❌ Backend verification failed:', errorText)
        return { success: false, error: `Backend error: ${verifyResponse.status}` }
      }

      const result = await verifyResponse.json()
      console.log('🌐 Backend verification result:', result)

      if (result.success) {
        const newUser = result.user as User
        setUser(newUser)
        localStorage.setItem('worldauth_user', JSON.stringify(newUser))
        console.log('✅ Verification complete! User saved:', newUser)
        return { success: true }
      } else {
        console.error('❌ Backend verification rejected:', result)
        return { success: false, error: result.error || 'Verification failed' }
      }
    } catch (err) {
      console.error('World ID verification error:', err)
      return { success: false, error: 'Verification failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyWithIDKit = async (
    result: IDKitSuccessResult,
    action: string,
    signal?: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsLoading(true)

    try {
      console.log('🔐 IDKit verification received:', { result, action, signal })

      // Verify on backend
      const verifyResponse = await fetch('/api/world/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payload: result,
          action, 
          signal 
        }),
      })

      console.log('🌐 Backend response status:', verifyResponse.status)

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text()
        console.error('❌ Backend verification failed:', errorText)
        return { success: false, error: `Backend error: ${verifyResponse.status}` }
      }

      const verifyResult = await verifyResponse.json()
      console.log('🌐 Backend verification result:', verifyResult)

      if (verifyResult.success) {
        const newUser = verifyResult.user as User
        setUser(newUser)
        localStorage.setItem('worldauth_user', JSON.stringify(newUser))
        console.log('✅ IDKit verification complete! User saved:', newUser)
        return { success: true, user: newUser }
      } else {
        console.error('❌ Backend verification rejected:', verifyResult)
        return { success: false, error: verifyResult.error || 'Verification failed' }
      }
    } catch (err) {
      console.error('IDKit verification error:', err)
      return { success: false, error: 'Verification failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (action: string, signal?: string) => {
    return await verifyWorldId(action, signal)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('worldauth_user')
    window.location.href = '/'
  }

  const initiatePayment = async (
    amount: number,
    token: string,
    description: string
  ): Promise<{ success: boolean; error?: string }> => {
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

  const toggleDevMode = () => {
    const currentMode = localStorage.getItem('world_app_dev_mode') === 'true'
    const newMode = !currentMode
    localStorage.setItem('world_app_dev_mode', newMode.toString())
    
    console.log(`🔧 Developer Mode ${newMode ? 'ENABLED' : 'DISABLED'}`)
    
    // Force a hard refresh to re-evaluate World App detection
    window.location.reload()
  }

  return (
    <WorldAuthContext.Provider
      value={{
        user,
        isLoading,
        isWorldApp,
        login,
        logout,
        verifyWorldId,
        verifyWithIDKit,
        initiatePayment,
        toggleDevMode,
      }}
    >
      {children}
    </WorldAuthContext.Provider>
  )
}

export function useWorldAuth() {
  const context = useContext(WorldAuthContext)
  if (!context) {
    throw new Error('useWorldAuth must be used within a WorldAuthProvider')
  }
  return context
}