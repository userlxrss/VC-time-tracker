/**
 * Reminder Settings Component
 * Allows users to configure eye care and clock out reminder preferences
 */

'use client'

import React, { useState } from 'react'
import { Settings, Eye, Clock, Volume2, Vibrate } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useReminders } from '@/src/hooks/useReminders'
import { ReminderPreferences } from '@/src/types/reminder'

interface ReminderSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function ReminderSettings({ isOpen, onClose }: ReminderSettingsProps) {
  const { theme } = useTheme()
  const { eyeCarePreferences, updateEyeCarePreferences } = useReminders()
  const [localPreferences, setLocalPreferences] = useState<ReminderPreferences>(eyeCarePreferences)
  const [hasChanges, setHasChanges] = useState(false)

  // Update local preferences when global preferences change
  React.useEffect(() => {
    setLocalPreferences(eyeCarePreferences)
    setHasChanges(false)
  }, [eyeCarePreferences])

  // Handle preference changes
  const handlePreferenceChange = (key: keyof ReminderPreferences, value: any) => {
    const updated = { ...localPreferences, [key]: value }
    setLocalPreferences(updated)
    setHasChanges(true)
  }

  // Save preferences
  const handleSave = () => {
    updateEyeCarePreferences(localPreferences)
    setHasChanges(false)
    onClose()
  }

  // Reset to defaults
  const handleReset = () => {
    const defaults = {
      eyeCareEnabled: true,
      eyeCareInterval: 20,
      lastEyeCareReminder: '',
      clockOutReminderEnabled: true,
      clockOutThreshold: 10,
      soundEnabled: true,
      vibrationEnabled: false
    }
    setLocalPreferences(defaults)
    setHasChanges(true)
  }

  // Discard changes
  const handleDiscard = () => {
    setLocalPreferences(eyeCarePreferences)
    setHasChanges(false)
    onClose()
  }

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
            onClick={handleDiscard}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`
              relative max-w-lg w-full mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto
              ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
              border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 sticky top-0 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Reminder Settings
                </h2>
              </div>
              <button
                onClick={handleDiscard}
                className={`
                  p-1 rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                  }
                `}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Eye Care Reminders */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className={`text-lg font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Eye Care Reminders
                  </h3>
                </div>

                {/* Enable Eye Care */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Enable Eye Care Reminders
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Get reminded to rest your eyes regularly
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('eyeCareEnabled', !localPreferences.eyeCareEnabled)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${localPreferences.eyeCareEnabled
                        ? 'bg-blue-600'
                        : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                      }
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${localPreferences.eyeCareEnabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Eye Care Interval */}
                {localPreferences.eyeCareEnabled && (
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Reminder Interval: {localPreferences.eyeCareInterval} minutes
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={localPreferences.eyeCareInterval}
                      onChange={(e) => handlePreferenceChange('eyeCareInterval', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>10m</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>60m</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Clock Out Reminders */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className={`text-lg font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Clock Out Reminders
                  </h3>
                </div>

                {/* Enable Clock Out */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Enable Clock Out Reminders
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Get notified when you've been working too long
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('clockOutReminderEnabled', !localPreferences.clockOutReminderEnabled)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${localPreferences.clockOutReminderEnabled
                        ? 'bg-red-600'
                        : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                      }
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${localPreferences.clockOutReminderEnabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Clock Out Threshold */}
                {localPreferences.clockOutReminderEnabled && (
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Alert after: {localPreferences.clockOutThreshold} hours
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="16"
                      step="1"
                      value={localPreferences.clockOutThreshold}
                      onChange={(e) => handlePreferenceChange('clockOutThreshold', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>6h</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>16h</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Settings */}
              <div className="mb-8">
                <h3 className={`text-lg font-medium mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Additional Settings
                </h3>

                {/* Sound */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Sound Effects
                    </span>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('soundEnabled', !localPreferences.soundEnabled)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${localPreferences.soundEnabled
                        ? 'bg-green-600'
                        : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                      }
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${localPreferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Vibration (if supported) */}
                {typeof window !== 'undefined' && 'vibrate' in navigator && (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Vibrate className="w-4 h-4 text-gray-500" />
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Vibration
                      </span>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('vibrationEnabled', !localPreferences.vibrationEnabled)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${localPreferences.vibrationEnabled
                          ? 'bg-purple-600'
                          : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                        }
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${localPreferences.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className={`
                    px-4 py-2 rounded-xl font-medium transition-colors
                    ${theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                  `}
                >
                  Reset to Defaults
                </button>
                <div className="flex-1 flex gap-3">
                  <button
                    onClick={handleDiscard}
                    className={`
                      flex-1 px-4 py-2 rounded-xl font-medium transition-colors
                      ${theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }
                    `}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`
                      flex-1 px-4 py-2 rounded-xl font-medium transition-all
                      ${hasChanges
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}