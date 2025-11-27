/**
 * Eye Care Reminder Modal Component
 * Shows a modal with 20-second countdown for eye care breaks
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Eye, SkipForward } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

interface EyeCareModalProps {
  isOpen: boolean
  onClose: () => void
  onSkip: () => void
  onComplete: () => void
  interval?: number // in seconds, default 20
}

export function EyeCareModal({
  isOpen,
  onClose,
  onSkip,
  onComplete,
  interval = 20
}: EyeCareModalProps) {
  const { theme } = useTheme()
  const [countdown, setCountdown] = useState(interval)
  const [progress, setProgress] = useState(100)

  // Countdown logic
  useEffect(() => {
    if (!isOpen || countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        const newValue = prev - 1
        if (newValue <= 0) {
          onComplete()
          return 0
        }
        return newValue
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, countdown, onComplete])

  // Update progress bar
  useEffect(() => {
    setProgress((countdown / interval) * 100)
  }, [countdown, interval])

  // Format countdown display
  const formatCountdown = (seconds: number): string => {
    return seconds.toString().padStart(2, '0')
  }

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onSkip()
    }
  }, [onSkip])

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onSkip}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              relative max-w-md w-full mx-4 rounded-2xl shadow-2xl
              ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
              border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Time to Rest Your Eyes
                </h2>
              </div>
              <button
                onClick={onSkip}
                className={`
                  p-1 rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                  }
                `}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <p className={`text-center mb-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Look at something 20 feet away for 20 seconds to reduce eye strain.
              </p>

              {/* Countdown Display */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <motion.div
                    className="text-6xl font-bold text-blue-600 dark:text-blue-400"
                    initial={{ scale: 1 }}
                    animate={{
                      scale: countdown <= 5 ? [1, 1.1, 1] : 1
                    }}
                    transition={{
                      repeat: countdown <= 5 ? Infinity : 0,
                      duration: 1
                    }}
                  >
                    {formatCountdown(countdown)}
                  </motion.div>
                </div>
                <div className={`text-sm mt-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  seconds remaining
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className={`h-2 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>
              </div>

              {/* Eye Care Tips */}
              <div className={`p-4 rounded-lg mb-6 ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <h3 className={`font-medium mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  💡 Eye Care Tips:
                </h3>
                <ul className={`text-sm space-y-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <li>• Blink frequently to keep eyes moist</li>
                  <li>• Focus on a distant object</li>
                  <li>• Roll your eyes gently in circles</li>
                  <li>• Take deep breaths and relax</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onSkip}
                  className={`
                    flex-1 px-4 py-3 rounded-xl font-medium transition-all
                    ${theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-2">
                    <SkipForward className="w-4 h-4" />
                    Skip Break
                  </div>
                </button>
                <button
                  onClick={onComplete}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
                >
                  Done Early
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}