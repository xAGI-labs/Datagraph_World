"use client"

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useWorldAuth } from "@/hooks/use-world-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Zap, 
  Brain, 
  Cpu, 
  CheckCircle, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Ban,
  Target,
  Timer,
  Star,
  Lightbulb,
  Eye,
  BookOpen,
  Users,
  Smile,
  Frown,
  History
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import FollowUpInput from "@/components/textvibe/FollowUpInput";
import EndSessionModal from "@/components/textvibe/modals/EndSessionModal";
import Image from "next/image"

interface AIModel {
  id: string
  label: string
  provider: string
}

interface AIResponse {
  modelId: string
  modelLabel: string
  provider: string
  response: string
  responseTime: number
}

interface GenerateResponse {
  prompt: string
  responses: AIResponse[]
}

export default function TextVibePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40" />
        <div className="relative z-10 text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TextVibeContent />
    </Suspense>
  )
}

function TextVibeContent() {
  const { user } = useWorldAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentScreen, setCurrentScreen] = useState<'input' | 'processing' | 'comparison' | 'reward'>('input')
  const [prompt, setPrompt] = useState("")
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [responses, setResponses] = useState<AIResponse[]>([])
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFeedbackPills, setSelectedFeedbackPills] = useState<string[]>([])
  const [showNeitherOption, setShowNeitherOption] = useState(false)
  const [userCorrectAnswer, setUserCorrectAnswer] = useState("")
  const [showFloatingBar, setShowFloatingBar] = useState(false)
  const [floatingBarSelection, setFloatingBarSelection] = useState<'left' | 'right' | 'tie' | 'both-bad' | null>(null)
  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string
    prompt: string
    timestamp: Date
    responses: AIResponse[]
    feedbackGiven?: boolean
  }>>([])
  const hasFetched = useRef(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showEndSessionModal, setShowEndSessionModal] = useState(false)
  const [totalPoints, setTotalPoints] = useState(0)

  const questionPills = [
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
    "Best investment strategies for 2025",
    "How to learn coding from scratch?",
    "What makes relationships work?",
    "How to build confidence?",
    "Explain climate change solutions",
    "Best productivity techniques",
    "How to start meditation?",
    "What's the meaning of life?"
  ]

  const feedbackPills = [
    { icon: <Target className="w-4 h-4" />, label: "On target!", emoji: "🎯" },
    { icon: <Timer className="w-4 h-4" />, label: "Fast", emoji: "🔥" },
    { icon: <Star className="w-4 h-4" />, label: "Style", emoji: "🎨" },
    { icon: <Lightbulb className="w-4 h-4" />, label: "Insightful", emoji: "💡" },
    { icon: <BookOpen className="w-4 h-4" />, label: "Informative", emoji: "📚" },
    { icon: <Eye className="w-4 h-4" />, label: "Clear", emoji: "👁️" },
    { icon: <Users className="w-4 h-4" />, label: "Practical", emoji: "🔧" },
    { icon: <Brain className="w-4 h-4" />, label: "Creative", emoji: "🎭" }
  ]

  const negativeFeedbackPills = [
    { icon: <X className="w-4 h-4" />, label: "Wrong", emoji: "❌" },
    { icon: <Smile className="w-4 h-4" />, label: "Hallucination", emoji: "🤯" },
    { icon: <Timer className="w-4 h-4" />, label: "Slow", emoji: "🐌" },
    { icon: <Frown className="w-4 h-4" />, label: "Vague", emoji: "🤔" },
    { icon: <Ban className="w-4 h-4" />, label: "Generic", emoji: "😐" }
  ]

  useEffect(() => {
    if (!hasFetched.current) {
      fetchAvailableModels()
      hasFetched.current = true
    }
  }, [])

  const handleSubmitPrompt = useCallback(async (followUpPrompt?: string) => {
    const promptToSubmit = followUpPrompt || prompt
    if (!promptToSubmit.trim()) return

    if (!followUpPrompt) {
      const shuffled = [...availableModels]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      const randomModels = shuffled.slice(0, 2).map(m => m.id)
      setSelectedModels(randomModels)
      console.log('Selected models:', randomModels.map(id => {
        const model = availableModels.find(m => m.id === id)
        return `${model?.label} (${model?.provider})`
      }))
    }

    setIsGenerating(true)
    setCurrentScreen('processing')
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSubmit.trim(),
          models: selectedModels
        })
      })

      if (response.ok) {
        const data: GenerateResponse = await response.json()
        setResponses(data.responses)
        setProgress(100)
        
        const historyItem = {
          id: Date.now().toString(),
          prompt: promptToSubmit.trim(),
          timestamp: new Date(),
          responses: data.responses
        }
        setChatHistory(prev => [historyItem, ...prev])
        
        setTimeout(() => {
          setCurrentScreen('comparison')
          setIsGenerating(false)
          setShowFloatingBar(true)
        }, 1000)
      } else {
        throw new Error('Failed to generate responses')
      }
    } catch (error) {
      console.error('Error generating responses:', error)
      setIsGenerating(false)
      setCurrentScreen('input')
    }

    clearInterval(progressInterval)
  }, [prompt, availableModels, selectedModels])

  useEffect(() => {
    const urlPrompt = searchParams.get('prompt')
    const autostart = searchParams.get('autostart')
    
    if (urlPrompt && autostart === 'true') {
      setPrompt(decodeURIComponent(urlPrompt))
      const timer = setTimeout(() => {
        if (availableModels.length > 0) {
          handleSubmitPrompt(decodeURIComponent(urlPrompt))
        }
      }, 500)
      return () => clearTimeout(timer)
    } else if (urlPrompt) {
      setPrompt(decodeURIComponent(urlPrompt))
    }
  }, [searchParams, availableModels, handleSubmitPrompt])

  useEffect(() => {
    if (currentScreen === 'reward') {
      const timer = setTimeout(() => {
        setCurrentScreen('input')
        setPrompt("")
        setResponses([])
        setChatHistory([])
        setTotalPoints(0)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen])

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch('/api/ai/generate')
      if (response.ok) {
        const data = await response.json()
        setAvailableModels(data.models)
        if (data.models.length >= 2) {
          setSelectedModels([data.models[0].id, data.models[1].id])
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }

  const handleModelChange = (index: number, modelId: string) => {
    const newModels = [...selectedModels]
    newModels[index] = modelId
    setSelectedModels(newModels)
  }

  const handleFloatingBarSelection = (selection: 'left' | 'right' | 'tie' | 'both-bad') => {
    if (!user?.worldIdVerified) {
      router.push('/onboarding')
      setShowFloatingBar(false)
      return
    }
    setFloatingBarSelection(selection)
    setShowFloatingBar(false)
    
    if (selection === 'left' || selection === 'right') {
      setSelectedResponse(selection === 'left' ? responses[0].modelId : responses[1].modelId)
      setShowFeedbackDetails(true)
    } else if (selection === 'tie') {
      handleSubmitTie()
    } else if (selection === 'both-bad') {
      setShowNeitherOption(true)
    }
  }

  const handleEndSession = () => {
    setCurrentScreen('reward')
  }

  const handleSubmitTie = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          prompt: prompt,
          modelA: responses[0].modelId,
          modelB: responses[1].modelId,
          modelALabel: responses[0].modelLabel,
          modelBLabel: responses[1].modelLabel,
          selectedModel: null,
          feedback: null,
          responseTimeA: responses[0].responseTime,
          responseTimeB: responses[1].responseTime,
          selectedNeither: false,
          userCorrectAnswer: null,
          isTie: true
        })
      })

      if (response.ok) {
        setTotalPoints(prev => prev + 100)
        const lastItem = chatHistory[0]
        if (lastItem) {
          lastItem.feedbackGiven = true
        }
        setShowFloatingBar(false)
      }
    } catch (error) {
      console.error('Error saving tie:', error)
    }

    setIsSubmitting(false)
  }

  const handleSelectResponse = async (modelId: string) => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          prompt: prompt,
          modelA: responses[0].modelId,
          modelB: responses[1].modelId,
          modelALabel: responses[0].modelLabel,
          modelBLabel: responses[1].modelLabel,
          selectedModel: modelId,
          feedback: feedback.trim() || null,
          responseTimeA: responses[0].responseTime,
          responseTimeB: responses[1].responseTime,
          selectedNeither: false,
          userCorrectAnswer: null
        })
      })

      if (response.ok) {
        setTotalPoints(prev => prev + 100)
        const lastItem = chatHistory[0]
        if (lastItem) {
          lastItem.feedbackGiven = true
        }
        setShowFeedbackDetails(false)
        setSelectedResponse(null)
        setFeedback("")
        setSelectedFeedbackPills([])
        setShowFloatingBar(false)
        if (typeof window !== 'undefined') {
          const toast = document.createElement('div')
          toast.innerText = 'Feedback submitted! Thank you.'
          toast.style.position = 'fixed'
          toast.style.top = '32px'
          toast.style.left = '50%'
          toast.style.transform = 'translateX(-50%)'
          toast.style.background = 'linear-gradient(to right, #f97316, #ef4444)'
          toast.style.color = 'white'
          toast.style.padding = '12px 24px'
          toast.style.borderRadius = '999px'
          toast.style.fontWeight = 'bold'
          toast.style.fontSize = '1rem'
          toast.style.zIndex = '9999'
          toast.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'
          document.body.appendChild(toast)
          setTimeout(() => {
            toast.style.opacity = '0'
            setTimeout(() => {
              if (toast.parentNode) toast.parentNode.removeChild(toast)
            }, 400)
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error saving comparison:', error)
    }

    setIsSubmitting(false)
  }

  const handleSelectNeither = async () => {
    if (isSubmitting || !userCorrectAnswer.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          prompt: prompt,
          modelA: responses[0].modelId,
          modelB: responses[1].modelId,
          modelALabel: responses[0].modelLabel,
          modelBLabel: responses[1].modelLabel,
          selectedModel: null,
          feedback: feedback.trim() || null,
          responseTimeA: responses[0].responseTime,
          responseTimeB: responses[1].responseTime,
          selectedNeither: true,
          userCorrectAnswer: userCorrectAnswer.trim()
        })
      })

      if (response.ok) {
        setTotalPoints(prev => prev + 100)
        const lastItem = chatHistory[0]
        if (lastItem) {
          lastItem.feedbackGiven = true
        }
        setShowNeitherOption(false)
        setShowFloatingBar(false)
      }
    } catch (error) {
      console.error('Error saving comparison:', error)
    }

    setIsSubmitting(false)
  }

  const handleFeedbackPillClick = (pill: { label: string; emoji: string }) => {
    setSelectedFeedbackPills(prev => {
      if (prev.includes(pill.label)) {
        return prev.filter(p => p !== pill.label)
      } else {
        return [...prev, pill.label]
      }
    })
    
    const updatedPills = selectedFeedbackPills.includes(pill.label)
      ? selectedFeedbackPills.filter(p => p !== pill.label)
      : [...selectedFeedbackPills, pill.label]
    
    if (updatedPills.length > 0) {
      setFeedback(updatedPills.join(", "))
    } else {
      setFeedback("")
    }
  }

  const handleFollowUpSubmit = (followUpPrompt: string) => {
    setPrompt(followUpPrompt)
    setShowFloatingBar(true)
    handleSubmitPrompt(followUpPrompt)
  }

  const getModelIcon = (provider: string) => {
    const p = (provider || "").toLowerCase()
    if (p.includes("openai") || p.includes("gpt")) {
      return <Image src="/openai.png" alt="OpenAI" width={28} height={28} className="rounded-full" />
    }
    if (p.includes("anthropic") || p.includes("claude")) {
      return <Image src="/claude.png" alt="Anthropic / Claude" width={28} height={28} className="rounded-full" />
    }
    if (p.includes("meta") || p.includes("llama")) {
      return <Image src="/llama.png" alt="Meta / Llama" width={28} height={28} className="rounded-full" />
    }
    if (p.includes("Mistral") || p.includes("mistral")) {
      return <Image src="/mistral.png" alt="Mistral" width={28} height={28} className="rounded-full" />
    }

    if (p.includes("deepseek")) {
      return <Image src="/deepseek.png" alt="DeepSeek" width={28} height={28} className="rounded-full" />
    }
    if (p.includes("qwen")) {
      return <Image src="/qwen.png" alt="Qwen" width={28} height={28} className="rounded-full" />
    }
    // fallback to a generic datagraph logo
    return <Image src="/datagraph.png" alt={provider || "Model"} width={28} height={28} className="rounded-full" />
  }

  if (currentScreen === 'input') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 text-gray-900 flex flex-col w-full max-w-full items-center justify-center relative p-4"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40" />
        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          {/* Header */}
          <motion.header 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center justify-center px-4 py-2 md:p-6 w-full max-w-full"
          > 
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="flex items-center space-x-2 justify-center"
            >
              <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <span className="text-lg font-bold text-gray-900">TextVibe</span>
            </motion.div>
          </motion.header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 text-center w-full max-w-full pt-2">
            <div className="w-full max-w-2xl mx-auto space-y-4 md:space-y-6 flex flex-col items-center justify-center">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="space-y-2 md:space-y-3 flex flex-col items-center justify-center"
              >
                <h1 className="text-lg sm:text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent break-words leading-tight text-center">
                  Hey, welcome to TextVibe!
                </h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto text-center"
                >
                  Write a prompt here and get the best responses from top AIs
                </motion.p>
              </motion.div>

              {/* Prompt Input */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="w-full max-w-full flex flex-col items-center justify-center"
              >
                <div className="relative w-full flex flex-col items-center justify-center">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (prompt.trim()) {
                          handleSubmitPrompt()
                        }
                      }
                    }}
                    className="w-full min-h-[70px] sm:min-h-[100px] bg-white border-2 border-amber-600/40 text-gray-900 placeholder-gray-400 text-sm sm:text-base p-3 pr-12 sm:p-4 sm:pr-16 rounded-xl resize-none focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 shadow-sm"
                  />
                  <div className="flex justify-center">
                    <Button
                      onClick={() => handleSubmitPrompt()}
                      disabled={!prompt.trim()}
                      className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full p-2.5 shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="w-full max-w-full overflow-x-auto pb-2 flex justify-center"
              >
                <div
                  className="flex space-x-2 whitespace-nowrap min-w-max px-1 justify-center"
                >
                  {[...questionPills, ...questionPills].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(question)}
                      className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-300 min-w-max shadow-sm"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </motion.div>

              <div className="pt-2 text-gray-600 text-xs sm:text-sm w-full text-center flex justify-center">
                We'll automatically choose the best AI models for your prompt
              </div>
              <div className="text-gray-500 text-xs w-full text-center pb-2 flex justify-center">
                Press Enter to send • Shift+Enter for new line • Click any question above to try it
              </div>
            </div>
          </main>
        </div>
      </motion.div>
    )
  }

  if (currentScreen === 'processing') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center px-4 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40" />
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          {/* Main Title */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-3"
          >
            <motion.h1 
              className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-red-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Analyzing your prompt...
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base text-gray-600"
            >
              Our AI models are crafting the perfect responses for you
            </motion.p>
          </motion.div>

          {/* Prompt Display */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white border border-gray-200 rounded-xl p-4 text-left shadow-lg"
          >
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 leading-relaxed text-sm">{prompt}</p>
              </div>
            </div>
          </motion.div>

          {/* AI Models Processing */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex justify-center space-x-4 sm:space-x-6">
              {selectedModels.map((modelId, index) => {
                const model = availableModels.find(m => m.id === modelId)
                const isActive = progress > (index + 1) * 30
                const isCompleted = progress > (index + 1) * 60
                
                return (
                  <motion.div 
                    key={modelId} 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.2, type: "spring", stiffness: 200 }}
                    className="flex flex-col items-center space-y-2"
                  >
                    <div className="relative">
                      <motion.div
                        className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400' 
                            : isActive 
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-400' 
                              : 'bg-gray-100 border-gray-300'
                        }`}
                        animate={isActive && !isCompleted ? { 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        } : {}}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.5, type: "spring" }}
                          >
                            <CheckCircle className="w-6 h-6 text-white" />
                          </motion.div>
                        ) : (
                          <motion.div
                            animate={isActive ? { 
                              rotate: 360,
                              scale: [1, 1.1, 1]
                            } : {}}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className={isActive || isCompleted ? "text-white" : "text-gray-600"}
                          >
                            {getModelIcon(model?.provider || '')}
                          </motion.div>
                        )}
                      </motion.div>
                      
                      {/* Processing indicator */}
                      {isActive && !isCompleted && (
                        <motion.div
                          className="absolute -inset-1.5 border-2 border-dashed border-orange-400 rounded-xl"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className={`text-xs font-medium ${
                        isCompleted ? 'text-green-600' : isActive ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        {model?.label}
                      </p>
                      <p className="text-2xs text-gray-400 mt-0.5">
                        {isCompleted ? 'Complete' : isActive ? 'Processing...' : 'Waiting'}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="space-y-1.5"
            >
              <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute top-0 h-full w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                  animate={{ 
                    x: progress > 0 ? ["-100%", "400%"] : "-100%"
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <div className="flex justify-between text-2xs text-gray-500">
                <span>0%</span>
                <span className="font-medium text-orange-600">{Math.round(progress)}%</span>
                <span>100%</span>
              </div>
            </motion.div>

            {/* Status Messages */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-center"
            >
              <motion.p 
                className="text-gray-600 text-xs"
                key={Math.floor(progress / 25)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {progress < 25 && "Initializing AI models..."}
                {progress >= 25 && progress < 50 && "Processing your prompt..."}
                {progress >= 50 && progress < 75 && "Generating responses..."}
                {progress >= 75 && progress < 100 && "Finalizing outputs..."}
                {progress >= 100 && "Ready to compare responses!"}
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  if (currentScreen === 'reward') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4"
      >
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ y: -50, opacity: 0, rotateX: 45 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 150 }}
            className="relative"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(147, 51, 234, 0.3)",
                  "0 0 40px rgba(59, 130, 246, 0.4)",
                  "0 0 20px rgba(147, 51, 234, 0.3)"
                ]
              }}
              transition={{ 
                boxShadow: { duration: 2, repeat: Infinity },
                scale: { duration: 0.3 },
                rotateY: { duration: 0.3 }
              }}
              className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 shadow-2xl cursor-pointer"
            >
              <div className="space-y-3">
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-base font-bold text-white"
                >
                  To continue, scratch here & win Vibe credits
                </motion.h3>
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5, type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl h-14 flex items-center justify-center relative overflow-hidden"
                >
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="text-gray-600 text-base font-bold z-10"
                  >
                    +{totalPoints} POINTS
                  </motion.div>
                  <motion.div
                    animate={{ 
                      background: [
                        "linear-gradient(45deg, #fbbf24, #f59e0b)",
                        "linear-gradient(45deg, #f59e0b, #d97706)",
                        "linear-gradient(45deg, #fbbf24, #f59e0b)"
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 opacity-20"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Reward Text */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-3"
          >
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6, type: "spring", stiffness: 150 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent"
            >
              Your feedback comes with rewards!
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="space-y-1.5 text-base text-zinc-300"
            >
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                You get rewarded with credits to keep exploring AIs for free.
              </motion.p>
              <motion.p
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                Or you can cash out!
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6, type: "spring", stiffness: 200 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.6, duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full relative"
              >
                <motion.div
                  animate={{ 
                    x: ["-100%", "100%"],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 2, duration: 1, repeat: Infinity }}
            className="text-gray-500 text-xs"
          >
            Returning to dashboard in a moment...
          </motion.p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 text-gray-900 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40" />
      <div className="relative z-10 flex flex-col h-full">
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.5);
        }
      `}</style>
      
      {/* Header - Fixed */}
      <header className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-center p-3 sm:p-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <p className="text-lg font-bold text-gray-900">TextVibe</p>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChatHistory(!showChatHistory)}
              className="text-gray-500 hover:bg-white hover:text-black text-xs px-2 sm:px-3"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              History
            </Button>
           
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowEndSessionModal(true)}
              className="text-white bg-red-600 hover:bg-red-700 text-xs px-2 sm:px-3"
            >
              End Session
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row justify-center w-full overflow-hidden">
        {/* Main Content - Scrollable */}
        <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto overflow-hidden">
          {/* Prompt Section */}
          <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="bg-amber-500 rounded-lg p-3 sm:p-4 border-2 border-amber-500 shadow-lg">
                <p className="text-white text-center font-semibold text-sm sm:text-base drop-shadow-sm">{prompt}</p>
              </div>
            </div>
          </div>

          {/* Response Comparison - Full Height Cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-amber-300/60 w-full max-w-5xl mx-auto overflow-hidden">
            {responses.map((response, index) => (
              <div key={response.modelId} className="flex flex-col min-w-0 h-full overflow-hidden">
                {/* Model Header - mobile friendly */}
                <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-2 space-y-1 sm:space-y-0 py-3 sm:py-4 bg-gray-100 rounded-t-xl border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    {getModelIcon(response.provider)}
                    <span className="font-medium text-gray-900 text-sm sm:text-base bg-white px-2 py-1 sm:px-3 rounded-lg shadow-md border border-gray-200">
                      {response.modelLabel}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-2xs sm:text-xs">•</span>
                    <span className="text-2xs sm:text-xs text-gray-500">{response.responseTime}ms</span>
                  </div>
                </div>

                {/* Response Content - Full Height */}
                <div className="flex-1 p-3 sm:p-6 min-w-0 overflow-y-auto custom-scrollbar">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-b-xl p-3 sm:p-6 border border-gray-200 hover:border-gray-300 transition-colors duration-200 min-w-0 h-full"
                  >
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                      {response.response}
                    </p>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Chat History Sidebar */}
        <AnimatePresence>
          {showChatHistory && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 h-full w-full md:w-96 bg-white border-l border-gray-200 flex flex-col z-50"
            >
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChatHistory(false)}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {chatHistory.length > 0 ? (
                  <div className="space-y-3">
                    {chatHistory.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                        onClick={() => {
                          setPrompt(item.prompt)
                          setResponses(item.responses)
                          setShowChatHistory(false)
                        }}
                      >
                        <p className="text-sm text-gray-900 mb-1.5 line-clamp-2">
                          {item.prompt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No chat history yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating elements for comparison screen */}
      {currentScreen === 'comparison' && (
        <>
          {/* Comparison Bar Floating */}
          <AnimatePresence>
            {showFloatingBar && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-20 sm:bottom-16 left-0 right-0 z-50 px-4 sm:px-6 flex justify-center"
              >
                <div className="bg-white/70 backdrop-blur-xl rounded-xl p-1.5 shadow-2xl border border-gray-200/50 grid grid-cols-[1fr,auto,1fr] items-center gap-1.5 w-full max-w-sm sm:max-w-md">
                  <Button
                    onClick={() => handleFloatingBarSelection('left')}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg w-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Model A</span>
                    <span className="sm:hidden">A</span>
                  </Button>
                  <div className="flex gap-1 sm:gap-1.5">
                    <Button
                      onClick={() => handleFloatingBarSelection('tie')}
                      className="bg-gray-200/50 hover:bg-gray-200 text-gray-700 p-2 sm:p-2.5 rounded-lg flex items-center justify-center text-xs border border-gray-300/50 transition-all duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </Button>
                    <Button
                      onClick={() => handleFloatingBarSelection('both-bad')}
                      className="bg-gray-200/50 hover:bg-gray-200 text-gray-700 p-2 sm:p-2.5 rounded-lg flex items-center justify-center text-xs border border-gray-300/50 transition-all duration-300"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleFloatingBarSelection('right')}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg w-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300"
                  >
                    <span className="hidden sm:inline">Model B</span>
                    <span className="sm:hidden">B</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FollowUpInput is always visible on comparison screen */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed ${showFloatingBar ? 'bottom-36 sm:bottom-32' : 'bottom-4 sm:bottom-6'} left-0 right-0 z-50 px-4 sm:px-6`}
          >
            <FollowUpInput onSubmit={handleFollowUpSubmit} isSubmitting={isGenerating} />
          </motion.div>

          {/* Feedback Modal Floating - always rendered when showFeedbackDetails is true */}
          <AnimatePresence>
            {showFeedbackDetails && selectedResponse && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Why was {responses.find(r => r.modelId === selectedResponse)?.modelLabel} better?
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowFeedbackDetails(false)
                        setSelectedResponse(null)
                        setFeedback("")
                        setSelectedFeedbackPills([])
                        setShowFloatingBar(true)
                      }}
                      className="text-gray-500 hover:text-gray-900"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Quick feedback tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {feedbackPills.map((pill) => (
                          <button
                            key={pill.label}
                            onClick={() => handleFeedbackPillClick(pill)}
                            className={`px-2.5 py-1.5 rounded-full text-xs transition-all duration-200 border flex items-center space-x-1.5 ${
                              selectedFeedbackPills.includes(pill.label)
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-orange-500/50'
                            }`}
                          >
                            <span>{pill.emoji}</span>
                            <span>{pill.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Additional feedback (optional)
                      </label>
                      <Textarea
                        placeholder="Tell us more about why this response was better..."
                        value={feedback}
                        onChange={(e) => {
                          setFeedback(e.target.value)
                          if (e.target.value !== selectedFeedbackPills.join(", ")) {
                            setSelectedFeedbackPills([])
                          }
                        }}
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 resize-none min-h-[80px] text-sm"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        handleSelectResponse(selectedResponse)
                        // Do NOT close modal here
                      }}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-2.5 text-sm"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        'Submit Feedback'
                      )}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <EndSessionModal 
            isOpen={showEndSessionModal}
            onClose={() => setShowEndSessionModal(false)}
            onConfirm={handleEndSession}
          />
        </>
      )}

      {/* Neither Option Modal */}
      <AnimatePresence>
        {showNeitherOption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                  Provide the correct answer
                </h3>
                <p className="text-gray-600 text-sm">
                  Help improve AI responses by sharing what you think the correct answer should be
                </p>
              </div>
              
              <div className="space-y-3">
                <Textarea
                  placeholder="Write your correct answer here..."
                  value={userCorrectAnswer}
                  onChange={(e) => setUserCorrectAnswer(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 resize-none min-h-[100px] text-sm"
                />
                
                <div className="flex justify-center space-x-3">
                  <Button
                    onClick={() => {
                      setShowNeitherOption(false)
                      setUserCorrectAnswer("")
                      setShowFloatingBar(true)
                    }}
                    variant="outline"
                    className="border-gray-300 text-gray-900 hover:bg-gray-50 hover:text-gray-900 text-sm px-4 py-2"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={handleSelectNeither}
                    disabled={isSubmitting || !userCorrectAnswer.trim()}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-sm px-4 py-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit Answer'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Details Modal */}
      <AnimatePresence>
        {showFeedbackDetails && selectedResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Why was {responses.find(r => r.modelId === selectedResponse)?.modelLabel} better?
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowFeedbackDetails(false)
                    setSelectedResponse(null)
                    setFeedback("")
                    setSelectedFeedbackPills([])
                    setShowFloatingBar(true)
                  }}
                  className="text-gray-500 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    Quick feedback tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {feedbackPills.map((pill) => (
                      <button
                        key={pill.label}
                        onClick={() => handleFeedbackPillClick(pill)}
                        className={`px-2.5 py-1.5 rounded-full text-xs transition-all duration-200 border flex items-center space-x-1.5 ${
                          selectedFeedbackPills.includes(pill.label)
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-orange-500/50'
                        }`}
                      >
                        <span>{pill.emoji}</span>
                        <span>{pill.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    Additional feedback (optional)
                  </label>
                  <Textarea
                    placeholder="Tell us more about why this response was better..."
                    value={feedback}
                    onChange={(e) => {
                      setFeedback(e.target.value)
                      if (e.target.value !== selectedFeedbackPills.join(", ")) {
                        setSelectedFeedbackPills([])
                      }
                    }}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 resize-none min-h-[80px] text-sm"
                  />
                </div>

                <Button
                  onClick={() => {
                    handleSelectResponse(selectedResponse)
                    setShowFeedbackDetails(false)
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-2.5 text-sm"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
