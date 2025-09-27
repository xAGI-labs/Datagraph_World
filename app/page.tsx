'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, MessageSquare, Mic, BarChart3, Brain, Code, LogIn, User, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import ModelPerformance from "@/components/ModelPerformance";

interface RecentPrompt {
  id: string;
  text: string;
  createdAt: string;
}

export default function App() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentPrompts, setRecentPrompts] = useState<RecentPrompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const words = ["design", "art", "voice", "text", "games", "code", "stories", "music"];

  // Close profile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showProfileMenu && !target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showProfileMenu) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showProfileMenu]);

  const fallbackQuestions = [
    "What's the best way to learn a new language?",
    "How to start a successful startup?",
    "Explain quantum computing simply",
    "Best practices for remote work",
    "How to cook the perfect pasta?",
    "What makes a good leader?",
    "Explain cryptocurrency basics",
    "How to improve sleep quality?",
    "Best exercise routine for beginners",
    "How to manage stress effectively?",
    "What's the future of AI?",
    "How to write compelling stories?",
    "Best investment strategies for beginners",
    "How to build confidence?",
    "Explain machine learning basics"
  ];

  useEffect(() => {
    fetchRecentPrompts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecentPrompts = async () => {
    try {
      setIsLoadingPrompts(true);
      const response = await fetch('/api/prompts/recent?limit=15');
      if (response.ok) {
        const data = await response.json();
        const fallbackPromptData = fallbackQuestions.map((text, i) => ({
          id: `fallback-${i}`,
          text,
          createdAt: new Date(Date.now() - (i * 3600000) - 86400000).toISOString() // Offset by a day
        }));
        
        // Mix real prompts with fallback questions
        const combinedPrompts = [
          ...data.prompts,
          ...fallbackPromptData
        ];
        
        const shuffledPrompts = [...combinedPrompts].sort(() => Math.random() - 0.5);
        
        const limitedPrompts = shuffledPrompts.slice(0, 30);
        
        setRecentPrompts(limitedPrompts);
      } else {
        console.error('Failed to fetch prompts');
        setRecentPrompts(fallbackQuestions.map((text, i) => ({
          id: `fallback-${i}`,
          text,
          createdAt: new Date(Date.now() - i * 3600000).toISOString() // Fake timestamps
        })));
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setRecentPrompts(fallbackQuestions.map((text, i) => ({
        id: `fallback-${i}`,
        text,
        createdAt: new Date(Date.now() - i * 3600000).toISOString() // Fake timestamps
      })));
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [words.length]);

  const categories = [
    { icon: MessageSquare, label: "Text Compare", color: "text-blue-400", borderColor: "border-blue-400", textColor: "text-blue-600", shadowColor: "shadow-blue-400", focusColor: "rgb(96 165 250)" },
    { icon: Mic, label: "Voice Chat", color: "text-purple-400", borderColor: "border-purple-400", textColor: "text-purple-600", shadowColor: "shadow-purple-400", focusColor: "rgb(196 181 253)" },
    { icon: Brain, label: "AI Analysis", color: "text-green-400", borderColor: "border-green-400", textColor: "text-green-600", shadowColor: "shadow-green-400", focusColor: "rgb(74 222 128)" },
    { icon: BarChart3, label: "Data Viz", color: "text-orange-400", borderColor: "border-orange-400", textColor: "text-orange-600", shadowColor: "shadow-orange-400", focusColor: "rgb(251 146 60)" },
    { icon: Code, label: "Code Review", color: "text-cyan-400", borderColor: "border-cyan-400", textColor: "text-cyan-600", shadowColor: "shadow-cyan-400", focusColor: "rgb(34 211 238)" },
  ];

  const handleSubmitPrompt = () => {
    if (searchQuery.trim()) {
      router.push(`/textvibe?prompt=${encodeURIComponent(searchQuery)}&autostart=true`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  // Double the prompts array for the continuous scroll effect
  const displayPrompts = useMemo(() => {
    if (recentPrompts.length === 0) return [];
    return [...recentPrompts, ...recentPrompts];
  }, [recentPrompts]);

  const selectedCategoryData = categories.find(cat => cat.label === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative"
         style={{
           '--focus-border-color': selectedCategoryData?.focusColor || 'rgb(209 213 219)'
         } as React.CSSProperties}>
      <div className="absolute inset-0 bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40" />

      {/* Header with Auth and Profile */}
      <header className="relative z-10 pt-4 pr-4">
        <div className="flex justify-end items-center space-x-3">
          {/* When not signed in */}
          {!session && (
            <div className="flex space-x-2">
              <Button 
                onClick={() => signIn('google')}
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-md border border-gray-200/50 hover:bg-white/90 text-gray-700 hover:text-gray-900"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          )}
          
          {/* When signed in - Profile and Dashboard */}
          {session && (
            <div className="flex items-center space-x-3">
              {/* Dashboard Button */}
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-md border border-gray-200/50 hover:bg-white/90 text-gray-700 hover:text-gray-900"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>

              {/* Points/Trading Button */}
              <Button 
                onClick={() => router.push('/points')}
                variant="outline"
                size="sm"
                className="bg-purple-500/10 backdrop-blur-md border border-purple-200/50 hover:bg-purple-500/20 text-purple-700 hover:text-purple-900"
              >
                <Brain className="w-4 h-4 mr-2" />
                Trade VP
              </Button>

              {/* User Profile Menu */}
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full bg-white/80 backdrop-blur-md border border-gray-200/50 hover:bg-white/90 transition-all duration-200"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {session.user?.name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                      {session.user?.vibePoints !== undefined && (
                        <p className="text-xs text-purple-600 font-medium mt-1">
                          {session.user.vibePoints.toLocaleString()} Vibe Points
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        router.push('/dashboard');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        router.push('/points');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Brain className="w-4 h-4" />
                      <span>Trade Vibe Points</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        router.push('/vibe-points');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Vibe Points</span>
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          signOut();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-11">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-16"
        >
          {/* Hero Section */}
          <div className="space-y-4 pt-8">
            <div className="flex justify-center mb-2">
              <Image
                src="/assets/inverted_dg.png"
                alt="Datagraph"
                width={44}
                height={44}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-5xl md:text-5xl font-bold tracking-tight text-gray-900">
              Datagraph
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
              Join voters to discover which AI is the best at{" "}
              <span className="inline-block relative h-8.5 min-w-[6rem] overflow-hidden align-middle">
                <motion.span
                  key={currentWordIndex}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="absolute left-0 text-gray-900 font-medium"
                >
                  {words[currentWordIndex]}
                </motion.span>
              </span>
            </p>
          </div>

          {/* Search Input */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="relative -mt-10">
              <Textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      handleSubmitPrompt();
                    }
                  }
                }}
                placeholder="Compare AI models for your next project"
                className="w-full h-36 bg-white border-amber-600/40 border-2 text-gray-900 placeholder-gray-400 text-base p-4 pr-14 rounded-xl resize-none transition-all duration-200 shadow-sm"
                style={{
                  borderColor: 'var(--focus-border-color)'
                } as React.CSSProperties}
              />
              <Button
                onClick={handleSubmitPrompt}
                disabled={!searchQuery.trim()}
                size="sm"
                className="absolute bottom-3 right-3 bg-gray-800 text-white hover:bg-gray-700 rounded-full p-4 disabled:opacity-50 transition-all duration-200"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="-mt-10"
          >
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {categories.map((category, index) => {
                const isSelected = selectedCategory === category.label;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setSelectedCategory(isSelected ? null : category.label)}
                    className={`
                      ${isSelected 
                        ? `${category.borderColor} ${category.textColor} ${category.shadowColor} bg-white` 
                        : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 shadow-2xl shadow-neutral-400 hover:border-gray-300'
                      } 
                      transition-all rounded-full px-2 py-1.5 text-xs font-medium whitespace-nowrap
                    `}
                  >
                    <category.icon className={`w-3.5 h-3.5 mr-1.5 transition-colors ${
                      isSelected ? category.color : 'text-gray-400'
                    }`} />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </motion.div>

          {/* Animated Question Carousel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="w-full max-w-screen-2xl mx-auto overflow-hidden -mt-10"
          >
            <div className="relative">
              {isLoadingPrompts ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
              ) : (
                <motion.div
                  animate={{ x: [0, -2400] }}
                  transition={{ 
                    duration: 60, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="flex space-x-2 whitespace-nowrap pl-4"
                >
                  {displayPrompts.map((prompt, index) => (
                    <div
                      key={`${prompt.id}-${index}`}
                      onClick={() => setSearchQuery(prompt.text)}
                      className="bg-white border border-gray-200 rounded-2xl px-2 py-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 text-wrap flex-shrink-0 w-64"
                    >
                      <div className="text-sm text-gray-700 mt-2 text-left leading-relaxed mb-2">
                        {prompt.text}
                      </div>
                      <div className="text-xs text-gray-400 text-left">
                        {formatTimeAgo(prompt.createdAt)}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Helper Text */}
          <div className="text-sm text-gray-400 space-y-1 -mt-5">
            <div>We&apos;ll automatically choose the best AI models for your prompt</div>
          </div>

        </motion.div>
      </main>

      {/* Model Performance Section */}
      <section className="relative z-10 py-20 -mt-24">
        <ModelPerformance />
      </section>

      <style jsx>{`
        textarea:focus {
          border-color: var(--focus-border-color) !important;
          --tw-ring-color: var(--focus-border-color);
        }
      `}</style>
    </div>
  );
}
