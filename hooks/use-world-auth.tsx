'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js'

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
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action,
        signal,
        verification_level: VerificationLevel.Orb,
      })

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

  return (
    <WorldAuthContext.Provider value={{
      user,
      isLoading,
      isWorldApp,
      login,
      logout,
      verifyWorldId,
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