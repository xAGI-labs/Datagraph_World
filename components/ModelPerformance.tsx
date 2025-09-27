"use client"

import { JSX, useState, useRef, useEffect } from "react"
import Image from "next/image"

interface ModelData {
  name: string
  shortName: string
  eloRating: number
  winRate: number
  logo: JSX.Element
  color: string
}

const baseModelInfo = [
  {
    name: "Claude Opus 4.1 (Thinking)",
    shortName: "Claude Opus 4.1 (Thinking)",
    logo: <Image src="/claude.png" alt="Claude" width={24} height={24} />,
    color: "bg-amber-600/60",
  },
  {
    name: "Claude Opus 4",
    shortName: "Claude Opus 4",
    logo: <Image src="/claude.png" alt="Claude" width={24} height={24} />,
    color: "bg-gray-500",
  },
  {
    name: "Claude Opus 4.1",
    shortName: "Claude Opus 4.1",
    logo: <Image src="/claude.png" alt="Claude" width={24} height={24} />,
    color: "bg-red-800/40",
  },
  {
    name: "Claude Sonnet 4",
    shortName: "Claude Sonnet 4",
    logo: <Image src="/claude.png" alt="Claude" width={24} height={24} />,
    color: "bg-gray-400",
  },
  {
    name: "DeepSeek-R1-0528",
    shortName: "DeepSeek-R1-0528",
    logo: <Image src="/deepseek.png" alt="DeepSeek" width={24} height={24} />,
    color: "bg-gray-400",
  },
  {
    name: "GPT-5 (Minimal)",
    shortName: "GPT-5 (Minimal)",
    logo: <Image src="/openai.png" alt="OpenAI" width={24} height={24} />,
    color: "bg-gray-400",
  },
  {
    name: "Mistral Large",
    shortName: "Mistral Large",
    logo: <Image src="/mistral.png" alt="Mistral" width={24} height={24} />,
    color: "bg-amber-400/40",
  },
  {
    name: "Mistral",
    shortName: "Mistral",
    logo: <Image src="/mistral.png" alt="Mistral" width={24} height={24} />,
    color: "bg-amber-400/40",
  },
  {
    name: "Qwen3 Coder 480B A35B Instruct",
    shortName: "Qwen3 Coder 480B A35B Instruct",
    logo: <Image src="/qwen.png" alt="Qwen" width={44} height={44} />,
    color: "bg-gray-400",
  },
  
  {
    name: "GLM 4.5",
    shortName: "GLM 4.5",
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#000000" />
      </svg>
    ),
    color: "bg-gray-300",
  },
  {
    name: "GPT-5 (High)",
    shortName: "GPT-5 (High)",
    logo: <Image src="/openai.png" alt="OpenAI" width={24} height={24} />,
    color: "bg-gray-300",
  },
]

// Removed static categoryData; component now fetches real leaderboard data from the API.

const categories = [
  "All Categories",
  "Website",
  "Game Dev",
  "3D Design",
  "Data Visualization",
  "UI Component",
  "Image",
  "Video",
]

export default function ModelPerformance() {
  const [selectedMetric, setSelectedMetric] = useState<"winRate" | "eloRating">("eloRating")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [isLoading, setIsLoading] = useState(false)
  const [modelData, setModelData] = useState<ModelData[] | null>(null)
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({})

  // Map UI category names to the API category query param the leaderboard endpoint expects.
  const mapCategoryToApi = (cat: string) => {
    switch (cat) {
      case "All Categories":
        return "overview"
      case "Website":
        return "webdev"
      case "Game Dev":
        return "webdev"
      case "3D Design":
        return "vision"
      case "Data Visualization":
        return "text"
      case "UI Component":
        return "copilot"
      case "Image":
        return "texttoimage"
      case "Video":
        return "vision"
      default:
        return "overview"
    }
  }

  // Return logo/color from baseModelInfo when possible
  const findLogoAndColor = (name: string) => {
    const found = baseModelInfo.find((m) => m.name === name || m.shortName === name)
    if (found) return { logo: found.logo, color: found.color }
    // fallback heuristics
    if (name.toLowerCase().includes("claude")) {
      return { logo: <Image src="/claude.png" alt="Claude" width={24} height={24} />, color: "bg-amber-600/60" }
    }
    if (name.toLowerCase().includes("deepseek")) {
      return { logo: <Image src="/deepseek.png" alt="DeepSeek" width={24} height={24} />, color: "bg-gray-400" }
    }
    if (name.toLowerCase().includes("qwen")) {
      return { logo: <Image src="/qwen.png" alt="Qwen" width={24} height={24} />, color: "bg-gray-400" }
    }
    if (name.toLowerCase().includes("gpt") || name.toLowerCase().includes("openai")) {
      return { logo: <Image src="/openai.png" alt="OpenAI" width={24} height={24} />, color: "bg-gray-300" }
    }
        if (name.toLowerCase().includes("Mistral") || name.toLowerCase().includes("mistral")) {
      return { logo: <Image src="/mistral.png" alt="Mistral" width={24} height={24} />, color: "bg-gray-300" }
    }

    return {
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#000000" />
        </svg>
      ),
      color: "bg-gray-300",
    }
  }

  useEffect(() => {
    const updateSliderPosition = () => {
      const selectedButton = categoryRefs.current[selectedCategory]
      const container = containerRef.current

      if (selectedButton && container) {
        const containerRect = container.getBoundingClientRect()
        const buttonRect = selectedButton.getBoundingClientRect()

        setSliderStyle({
          width: buttonRect.width,
          height: buttonRect.height,
          transform: `translate(${buttonRect.left - containerRect.left}px, ${buttonRect.top - containerRect.top}px)`,
          transition: "all 300ms ease-out",
        })
      }
    }

    // Update position after render
    const timeoutId = setTimeout(updateSliderPosition, 0)

    // Update on window resize
    window.addEventListener("resize", updateSliderPosition)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", updateSliderPosition)
    }
  }, [selectedCategory])

  const handleMetricChange = (metric: "winRate" | "eloRating") => {
    if (metric !== selectedMetric) {
      setIsLoading(true)
      setTimeout(() => {
        setSelectedMetric(metric)
        setIsLoading(false)
      }, 800)
    }
  }

  // Fetch leaderboard data from the API for the selected category
  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const apiCategory = mapCategoryToApi(selectedCategory)
        const res = await fetch(`/api/leaderboard?category=${encodeURIComponent(apiCategory)}`)
        if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`)
        const json = await res.json()
        // API shape: { leaderboard: LeaderboardModel[], ... }
        const list = Array.isArray(json?.leaderboard) ? json.leaderboard : []
        const mapped: ModelData[] = list.map((m: any) => {
          const name = m.modelName || m.modelId || "Unknown Model"
          const { logo, color } = findLogoAndColor(name)
          return {
            name,
            shortName: name,
            eloRating: m.arenaElo || m.score || 1200,
            winRate: typeof m.winRate === "number" ? m.winRate : 50,
            logo,
            color,
          }
        })
        if (mounted) setModelData(mapped)
      } catch (err) {
        console.error("Error fetching leaderboard for ModelPerformance:", err)
        // fallback: keep existing modelData or set null
        if (mounted) setModelData(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [selectedCategory])

  // Use fetched modelData; while null show loading / fallback UI.
  const displayedModels = modelData ?? baseModelInfo.map((m) => ({
    name: m.name,
    shortName: m.shortName,
    eloRating: 1200,
    winRate: 50,
    logo: m.logo,
    color: m.color,
  }))

  const maxValue = selectedMetric === "eloRating" ? 1800 : 100
  const minValue = selectedMetric === "eloRating" ? 600 : 0

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-transparent rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-8 pt-8 pb-4">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4 sm:mb-0">Model Performance</h1>

            <div className="relative flex bg-gray-200 p-1 rounded-full">
              {/* Sliding background */}
              <div
                className={`absolute top-1 bottom-1 bg-white rounded-full transition-all duration-300 ease-out ${
                  selectedMetric === "winRate" ? "left-1 right-1/2" : "left-1/2 right-1"
                }`}
              />

              {/* Buttons */}
              <button
                onClick={() => handleMetricChange("winRate")}
                className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                  selectedMetric === "winRate" ? "text-gray-900" : "text-gray-600"
                }`}
              >
                Win Rate
              </button>
              <button
                onClick={() => handleMetricChange("eloRating")}
                className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                  selectedMetric === "eloRating" ? "text-gray-900" : "text-gray-600"
                }`}
              >
                Elo Rating
              </button>
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className="relative h-96">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500 text-base">Updating chart...</div>
                </div>
              ) : (
                <>
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-400 pr-4 py-4">
                    <span>{selectedMetric === "eloRating" ? "1800" : "100%"}</span>
                    <span>{selectedMetric === "eloRating" ? "1350" : "75%"}</span>
                    <span>{selectedMetric === "eloRating" ? "900" : "50%"}</span>
                    <span>{selectedMetric === "eloRating" ? "450" : "25%"}</span>
                    <span>{selectedMetric === "eloRating" ? "600" : "0%"}</span>
                  </div>

                  {/* Y-axis title */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-gray-400 font-medium whitespace-nowrap">
                    {selectedMetric === "eloRating" ? "Elo Rating" : "Win Rate"}
                  </div>

                  {/* Chart container */}
                  <div className="ml-8 sm:ml-16 h-full flex items-end justify-center gap-3 py-4">
                    {displayedModels.map((model, index) => {
                      const value = selectedMetric === "eloRating" ? model.eloRating : model.winRate
                      const heightPercentage = ((value - minValue) / (maxValue - minValue)) * 100

                      return (
                        <div key={model.name + index} className="flex flex-col items-center">
                          {/* Model logo */}
                          <div className="mb-2 opacity-80">{model.logo}</div>

                          {/* Model name above bar */}
                          <div className="text-xs text-gray-600 text-center mb-2 max-w-20 leading-tight">
                            {model.shortName}
                          </div>

                          {/* Bar container */}
                          <div className="relative flex flex-col items-center">
                            <div
                              className={`w-12 sm:w-16 ${model.color} rounded-t-sm transition-all duration-500 ease-out relative`}
                              style={{ height: `${Math.max(heightPercentage * 2.4, 20)}px` }}
                            >
                              {/* Value label inside bar */}
                              <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                                {selectedMetric === "eloRating" ? value : `${value}%`}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="relative mt-8 pt-4 border-t border-gray-100" ref={containerRef}>
              {/* Sliding background for categories */}
              <div
                className="absolute bg-gray-100 rounded-full transition-all duration-300 ease-out pointer-events-none"
                style={sliderStyle}
              />

              {/* Category buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    ref={(el) => { categoryRefs.current[category] = el }}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                      selectedCategory === category ? "text-gray-900" : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
