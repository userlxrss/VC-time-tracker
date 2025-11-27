'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface EyeCareModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EyeCareModal({ isOpen, onClose }: EyeCareModalProps) {
  const [countdown, setCountdown] = useState(20)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setCountdown(20)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isVisible || countdown <= 0) {
      if (countdown <= 0) {
        onClose()
      }
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isVisible, countdown, onClose])

  if (!isVisible) return null

  const progress = ((20 - countdown) / 20) * 100

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">👁️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Time to Rest Your Eyes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Look at something 20 feet away for 20 seconds
          </p>
        </div>

        {/* Countdown Display */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {countdown}s
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip Button */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            I Did It!
          </button>
        </div>
      </div>
    </div>
  )
}