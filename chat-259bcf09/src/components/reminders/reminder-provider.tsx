/**
 * Reminder Provider Component
 * Wraps the application with reminder functionality and provides context
 */

'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { EyeCareModal } from './eye-care-modal'
import { ReminderSettings } from './reminder-settings'
import { useReminders } from '@/src/hooks/useReminders'
import { Settings } from 'lucide-react'

interface ReminderContextType {
  // Eye Care
  showEyeCareReminder: () => void
  hideEyeCareReminder: () => void
  isEyeCareModalOpen: boolean
  eyeCarePreferences: any

  // Settings
  showReminderSettings: () => void
  hideReminderSettings: () => void
  updateReminderPreferences: (preferences: any) => void

  // Status
  isInitialized: boolean
  error: string | null
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined)

interface ReminderProviderProps {
  children: ReactNode
}

export function ReminderProvider({ children }: ReminderProviderProps) {
  const {
    isEyeCareModalOpen,
    eyeCarePreferences,
    isInitialized,
    error,
    showEyeCareReminder,
    hideEyeCareReminder,
    skipEyeCareReminder,
    completeEyeCareReminder,
    updateEyeCarePreferences,
    clearError
  } = useReminders()

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  const showReminderSettings = () => setIsSettingsOpen(true)
  const hideReminderSettings = () => setIsSettingsOpen(false)

  const updateReminderPreferences = (preferences: any) => {
    updateEyeCarePreferences(preferences)
  }

  const contextValue: ReminderContextType = {
    showEyeCareReminder,
    hideEyeCareReminder,
    isEyeCareModalOpen,
    eyeCarePreferences,
    showReminderSettings,
    hideReminderSettings,
    updateReminderPreferences,
    isInitialized,
    error
  }

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ReminderContext.Provider value={contextValue}>
      {children}

      {/* Eye Care Modal */}
      <EyeCareModal
        isOpen={isEyeCareModalOpen}
        onClose={hideEyeCareReminder}
        onSkip={skipEyeCareReminder}
        onComplete={completeEyeCareReminder}
      />

      {/* Settings Modal */}
      <ReminderSettings
        isOpen={isSettingsOpen}
        onClose={hideReminderSettings}
      />

      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff'
            }
          }
        }}
      />

      {/* Floating Settings Button */}
      <button
        onClick={showReminderSettings}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 group"
        aria-label="Reminder Settings"
      >
        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Reminder Settings
        </span>
      </button>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 left-6 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>Reminder Error: {error}</span>
            <button
              onClick={clearError}
              className="ml-2 hover:bg-red-600 rounded p-1"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </ReminderContext.Provider>
  )
}

// Hook to use reminder context
export function useReminderContext() {
  const context = useContext(ReminderContext)
  if (context === undefined) {
    throw new Error('useReminderContext must be used within a ReminderProvider')
  }
  return context
}