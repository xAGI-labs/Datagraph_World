"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface FollowUpInputProps {
  onSubmit: (prompt: string) => void
  isSubmitting: boolean
}

export default function FollowUpInput({ onSubmit, isSubmitting }: FollowUpInputProps) {
  const [prompt, setPrompt] = useState("")

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt.trim())
      setPrompt("")
    }
  }

  return (
    <div className="relative">
      <Textarea
        placeholder="Ask a followup question..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
          }
        }}
        className="w-full bg-white border-2 border-amber-600/40 text-gray-900 placeholder-gray-400 p-4 pr-16 rounded-xl resize-none focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 shadow-sm"
      />
      <Button
        onClick={handleSubmit}
        disabled={!prompt.trim() || isSubmitting}
        className="absolute bottom-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full p-2.5 shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </div>
  )
}
