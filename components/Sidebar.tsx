"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useWorldAuth } from "@/hooks/use-world-auth"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  MessageSquare, 
  User, 
  Trophy, 
  Mic, 
  Video, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  HelpCircle,
  LogOut,
  Menu,
  TrendingUp,
  Code,
  Wallet
} from "lucide-react"
import Image from "next/image"

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  enabled: boolean
  badge?: string
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    path: "/dashboard",
    enabled: true
  },
  {
    id: "new-chat",
    label: "New Chat",
    icon: <MessageSquare className="w-5 h-5" />,
    path: "/textvibe",
    enabled: true
  },
  {
    id: "points",
    label: "Points",
    icon: <Trophy className="w-5 h-5" />,
    path: "/points",
    enabled: true
  },
  // {
  //   id: "projects",
  //   label: "Projects",
  //   icon: <Code className="w-5 h-5" />,
  //   path: "/projects",
  //   enabled: true
  // },
  // {
  //   id: "profile",
  //   label: "Profile",
  //   icon: <User className="w-5 h-5" />,
  //   path: "/profile",
  //   enabled: true
  // },
  // {
  //   id: "voice-annotate",
  //   label: "Voice Annotate",
  //   icon: <Mic className="w-5 h-5" />,
  //   path: "/audiovibe",
  //   enabled: true
  // },
  // {
  //   id: "how-it-works",
  //   label: "How it works",
  //   icon: <HelpCircle className="w-5 h-5" />,
  //   path: "/how-it-works",
  //   enabled: true
  // },
  // {
  //   id: "trading",
  //   label: "Trading",
  //   icon: <TrendingUp className="w-5 h-5" />,
  //   path: "/trading",
  //   enabled: false, 
  //   badge: "Soon"
  // },
  // {
  //   id: "video-annotation",
  //   label: "Video Annotation",
  //   icon: <Video className="w-5 h-5" />,
  //   path: "/video",
  //   enabled: false,
  //   badge: "Soon"
  // }
]

interface SidebarProps {
  className?: string
  onWidthChange?: (width: number) => void
}

export default function Sidebar({ className = "", onWidthChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useWorldAuth()

  const showExpanded = isExpanded || isHovered

  useEffect(() => {
    const width = showExpanded ? 240 : 64
    onWidthChange?.(width)
  }, [showExpanded, onWidthChange])

  const handleNavigation = (item: SidebarItem) => {
    if (item.enabled) {
      router.push(item.path)
    }
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  // Only show 'New Chat', 'Leaderboard', and 'How it works' if not signed in
  const filteredSidebarItems = user?.worldIdVerified
    ? sidebarItems
    : sidebarItems.filter(item => ["new-chat", "leaderboard", "how-it-works"].includes(item.id))

  // Mobile menu button
  return (
    <>
      <button
        className="fixed top-4 left-4 z-[100] md:hidden bg-white border border-gray-200 rounded-lg p-2 shadow-lg"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-900" />
      </button>
      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-gray-50 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Image
              src="/assets/datagraph.png"
              alt="Datagraph"
              width={36}
              height={36}
              className="rounded-md"
              />
              <span className="text-lg font-bold text-gray-900">
              Datagraph
              </span>
            </div>
            <button
              className="text-gray-900 hover:text-gray-700 p-2"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col space-y-2 p-4">
            {filteredSidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleNavigation(item)
                }}
                disabled={!item.enabled}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-lg transition-all duration-200 group relative text-left ${
                  isActive(item.path)
                    ? "bg-orange-500/20 text-orange-600"
                    : item.enabled
                    ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <span className="flex-shrink-0 mr-2">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full ml-2">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          {/* Wallet Connect for Mobile - Only show if user is signed in */}
          {user?.worldIdVerified && (
            <div className="px-4 border-t border-gray-200 pt-4">
              <div className="mb-4">
                {/* World Chain address is automatically connected via World ID */}
                {user?.worldChainAddress && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    World Chain: {user.worldChainAddress.slice(0, 6)}...{user.worldChainAddress.slice(-4)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Desktop sidebar */}
      <motion.div
        className={`h-screen bg-white border-r border-gray-200 hidden md:block flex-shrink-0 ${className}`}
        initial={{ width: 64 }}
        animate={{ width: showExpanded ? 240 : 64 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <AnimatePresence>
                {showExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center space-x-3"
                  >
                      <Image
                        src="/assets/datagraph.png"
                        alt="Datagraph"
                        width={36}
                        height={36}
                        className="rounded-md"
                      />
                    <span className="text-lg font-bold text-gray-900">Datagraph</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!showExpanded && (
                <Image
                  src="/assets/datagraph.png"
                  alt="Datagraph"
                  width={36}
                  height={36}
                  className="rounded-md"
                />
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-4">
            <nav className="space-y-2 px-2">
              {filteredSidebarItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  disabled={!item.enabled}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    isActive(item.path)
                      ? "bg-orange-500/20 text-orange-600 border border-orange-200"
                      : item.enabled
                      ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  whileHover={item.enabled ? { scale: 1.02 } : {}}
                  whileTap={item.enabled ? { scale: 0.98 } : {}}
                >
                  <div className={`flex-shrink-0 ${
                    isActive(item.path) ? "text-orange-600" : 
                    item.enabled ? "text-gray-700 group-hover:text-gray-900" : "text-gray-400"
                  }`}>
                    {item.icon}
                  </div>
                  
                  <AnimatePresence>
                    {showExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {!showExpanded && (
                    <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      {item.label}
                      {item.badge && (
                        <span className="ml-2 px-1 py-0.5 text-xs bg-gray-600 rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Signout/Sign in Button */}
          <div className="px-2 pb-4 border-t border-gray-200">
            {user?.worldIdVerified ? (
              <motion.button
                onClick={() => logout()}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group mt-2 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex-shrink-0 text-gray-700 group-hover:text-red-600">
                  <LogOut className="w-5 h-5" />
                </div>
                <AnimatePresence>
                  {showExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1"
                    >
                      <span className="text-sm font-medium">Sign Out</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Tooltip for collapsed state */}
                {!showExpanded && (
                  <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Sign Out
                  </div>
                )}
              </motion.button>
            ) : (
              <motion.button
                onClick={() => router.push('/onboarding')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group mt-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex-shrink-0 text-gray-700 group-hover:text-orange-600">
                  <LogOut className="w-5 h-5" />
                </div>
                <AnimatePresence>
                  {showExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1"
                    >
                      <span className="text-sm font-medium">Sign In</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Tooltip for collapsed state */}
                {!showExpanded && (
                  <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Sign In
                  </div>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}
