"use client"

import { useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"
import { useWorldAuth } from "@/hooks/use-world-auth"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useWorldAuth()
  const pathname = usePathname()
  const [sidebarWidth, setSidebarWidth] = useState(64)

  const handleSidebarWidthChange = useCallback((width: number) => {
    setSidebarWidth(width)
  }, [])

  const shouldShowSidebar = !pathname.startsWith('/admin') && !pathname.startsWith('/auth') && pathname !== '/admin/login' && pathname !== '/' && pathname !== '/onboarding' && pathname !== '/how-it-works' && pathname !== '/compare' && pathname !== '/face-captcha' 

  if (pathname.startsWith('/auth') || pathname.startsWith('/admin') || pathname === '/' || pathname === '/onboarding' || pathname === '/how-it-works' || pathname === '/compare' || pathname === '/leaderboard' || pathname === '/face-captcha') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 w-full overflow-x-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 w-full overflow-x-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40" />
      <div className="relative z-10 flex">
        {/* Fixed position sidebar that stays in place */}
        <div className="fixed left-0 top-0 h-screen z-30">
          <Sidebar onWidthChange={handleSidebarWidthChange} />
        </div>
                <main className={`flex-1 min-h-screen ${sidebarWidth === 240 ? 'md:pl-60' : 'md:pl-16'}`}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
