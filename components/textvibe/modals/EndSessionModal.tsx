"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface EndSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function EndSessionModal({ isOpen, onClose, onConfirm }: EndSessionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200 text-center shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">End Session?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to end this session? You will see your total rewards.</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 px-4 py-2"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-4 font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                onClick={onConfirm}
              >
                End Session
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
