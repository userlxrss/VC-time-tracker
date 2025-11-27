/**
 * Comprehensive Reminder System Hook
 * Manages eye care reminders and clock out notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { TimeEntryStatus } from '@/src/types'
import { useTimeTracking } from '@/hooks/useTimeTracking'
import { ReminderPreferences, DEFAULT_REMINDER_PREFERENCES } from '@/src/types/reminder'
import { ReminderStorage } from '@/src/utils/reminderStorage'
import toast, { Toaster } from 'react-hot-toast'
import { Clock, Eye } from 'lucide-react'

interface ReminderState {
  // Eye Care Reminder
  isEyeCareModalOpen: boolean
  eyeCareCountdown: number
  lastEyeCareReminder: string
  eyeCarePreferences: ReminderPreferences

  // Clock Out Reminder
  lastClockOutCheck: string
  clockOutReminderShown: boolean

  // System Status
  isInitialized: boolean
  error: string | null
}

interface ReminderActions {
  // Eye Care Actions
  showEyeCareReminder: () => void
  hideEyeCareReminder: () => void
  skipEyeCareReminder: () => void
  completeEyeCareReminder: () => void
  updateEyeCarePreferences: (preferences: Partial<ReminderPreferences>) => void

  // Clock Out Actions
  checkClockOutReminder: () => void
  showClockOutReminder: (hoursWorked: number) => void

  // System Actions
  initializeReminders: () => void
  clearError: () => void
}

export function useReminders() {
  const { currentTimeEntry, currentUser, status, clockOut } = useTimeTracking()

  // State
  const [state, setState] = useState<ReminderState>({
    isEyeCareModalOpen: false,
    eyeCareCountdown: 20,
    lastEyeCareReminder: '',
    eyeCarePreferences: DEFAULT_REMINDER_PREFERENCES,
    lastClockOutCheck: '',
    clockOutReminderShown: false,
    isInitialized: false,
    error: null
  })

  // Refs for intervals
  const eyeCareIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const clockOutIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize reminder preferences from localStorage
  const loadReminderPreferences = useCallback(() => {
    try {
      const preferences = ReminderStorage.loadReminderPreferences()
      setState(prev => ({
        ...prev,
        eyeCarePreferences: preferences,
        lastEyeCareReminder: preferences.lastEyeCareReminder || '',
        isInitialized: true
      }))
    } catch (error) {
      console.error('Error loading reminder preferences:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to load reminder preferences',
        isInitialized: true
      }))
    }
  }, [])

  // Save reminder preferences to localStorage
  const saveReminderPreferences = useCallback((preferences: ReminderPreferences) => {
    try {
      const success = ReminderStorage.saveReminderPreferences(preferences)
      if (success) {
        setState(prev => ({ ...prev, eyeCarePreferences: preferences }))
      } else {
        setState(prev => ({ ...prev, error: 'Failed to save reminder preferences' }))
      }
    } catch (error) {
      console.error('Error saving reminder preferences:', error)
      setState(prev => ({ ...prev, error: 'Failed to save reminder preferences' }))
    }
  }, [])

  // Eye Care Reminder Logic
  const checkEyeCareReminder = useCallback(() => {
    if (!state.eyeCarePreferences.eyeCareEnabled) return
    if (!currentUser || !currentTimeEntry) return
    if (status !== TimeEntryStatus.CLOCKED_IN) return
    if (state.isEyeCareModalOpen) return

    const now = new Date()
    const lastReminder = state.lastEyeCareReminder ? new Date(state.lastEyeCareReminder) : new Date(0)
    const timeDiff = now.getTime() - lastReminder.getTime()
    const intervalMs = state.eyeCarePreferences.eyeCareInterval * 60 * 1000

    if (timeDiff >= intervalMs) {
      showEyeCareReminder()
    }
  }, [
    state.eyeCarePreferences,
    state.lastEyeCareReminder,
    state.isEyeCareModalOpen,
    currentUser,
    currentTimeEntry,
    status
  ])

  // Clock Out Reminder Logic
  const checkClockOutReminder = useCallback(() => {
    if (!state.eyeCarePreferences.clockOutReminderEnabled) return
    if (!currentUser || !currentTimeEntry) return
    if (status !== TimeEntryStatus.CLOCKED_IN) return
    if (!currentTimeEntry.clockIn) return
    if (state.clockOutReminderShown) return

    const now = new Date()
    const clockInTime = new Date()
    const [hours, minutes] = currentTimeEntry.clockIn.split(':').map(Number)
    clockInTime.setHours(hours, minutes, 0, 0)

    const hoursWorked = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
    const threshold = state.eyeCarePreferences.clockOutThreshold

    if (hoursWorked >= threshold) {
      showClockOutReminder(hoursWorked)
      setState(prev => ({ ...prev, clockOutReminderShown: true }))
    }
  }, [
    state.eyeCarePreferences.clockOutReminderEnabled,
    state.eyeCarePreferences.clockOutThreshold,
    state.clockOutReminderShown,
    currentUser,
    currentTimeEntry,
    status
  ])

  // Show Eye Care Reminder
  const showEyeCareReminder = useCallback(() => {
    const now = new Date().toISOString()
    setState(prev => ({
      ...prev,
      isEyeCareModalOpen: true,
      eyeCareCountdown: 20,
      lastEyeCareReminder: now
    }))

    // Update preferences with new reminder time
    ReminderStorage.updateLastEyeCareReminder(now)
    loadReminderPreferences() // Reload to sync state
  }, [loadReminderPreferences])

  // Hide Eye Care Reminder
  const hideEyeCareReminder = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEyeCareModalOpen: false,
      eyeCareCountdown: 20
    }))
  }, [])

  // Skip Eye Care Reminder
  const skipEyeCareReminder = useCallback(() => {
    hideEyeCareReminder()
    toast('Eye care break skipped. Remember to rest your eyes soon!', {
      icon: '👁️',
      duration: 3000
    })
  }, [hideEyeCareReminder])

  // Complete Eye Care Reminder
  const completeEyeCareReminder = useCallback(() => {
    hideEyeCareReminder()
    toast('Great job! Your eyes thank you. 💙', {
      icon: '✨',
      duration: 3000
    })
  }, [hideEyeCareReminder])

  // Show Clock Out Reminder
  const showClockOutReminder = useCallback((hoursWorked: number) => {
    const hours = Math.floor(hoursWorked)
    const minutes = Math.floor((hoursWorked - hours) * 60)

    toast((t) => (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Clock className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">
            Don't forget to clock out!
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You've been working for {hours}h {minutes}m
          </p>
        </div>
        <button
          onClick={() => {
            clockOut()
            toast.dismiss(t.id)
          }}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
        >
          Clock Out Now
        </button>
      </div>
    ), {
      duration: 10000,
      position: 'top-right',
      style: {
        background: 'var(--toast-bg)',
        color: 'var(--toast-color)',
        border: '1px solid var(--toast-border)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }
    })
  }, [clockOut])

  // Update Eye Care Preferences
  const updateEyeCarePreferences = useCallback((preferences: Partial<ReminderPreferences>) => {
    const updated = ReminderStorage.updateReminderPreferences(preferences)
    if (updated) {
      setState(prev => ({ ...prev, eyeCarePreferences: updated }))
    }
  }, [])

  // Initialize Reminders
  const initializeReminders = useCallback(() => {
    loadReminderPreferences()
  }, [loadReminderPreferences])

  // Clear Error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Set up reminder intervals
  useEffect(() => {
    if (!state.isInitialized || !currentUser) return

    // Eye care reminder check - every minute
    if (state.eyeCarePreferences.eyeCareEnabled) {
      eyeCareIntervalRef.current = setInterval(() => {
        checkEyeCareReminder()
      }, 60000) // 1 minute
    }

    // Clock out reminder check - every hour
    if (state.eyeCarePreferences.clockOutReminderEnabled) {
      clockOutIntervalRef.current = setInterval(() => {
        checkClockOutReminder()
      }, 3600000) // 1 hour
    }

    return () => {
      if (eyeCareIntervalRef.current) {
        clearInterval(eyeCareIntervalRef.current)
        eyeCareIntervalRef.current = null
      }
      if (clockOutIntervalRef.current) {
        clearInterval(clockOutIntervalRef.current)
        clockOutIntervalRef.current = null
      }
    }
  }, [
    state.isInitialized,
    state.eyeCarePreferences,
    currentUser,
    checkEyeCareReminder,
    checkClockOutReminder
  ])

  // Reset clock out reminder when user clocks out
  useEffect(() => {
    if (status === TimeEntryStatus.CLOCKED_OUT) {
      setState(prev => ({ ...prev, clockOutReminderShown: false }))
    }
  }, [status])

  // Handle countdown
  useEffect(() => {
    if (state.isEyeCareModalOpen && state.eyeCareCountdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setState(prev => {
          const newCountdown = prev.eyeCareCountdown - 1
          if (newCountdown <= 0) {
            completeEyeCareReminder()
            return { ...prev, eyeCareCountdown: 0 }
          }
          return { ...prev, eyeCareCountdown: newCountdown }
        })
      }, 1000)
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [state.isEyeCareModalOpen, state.eyeCareCountdown, completeEyeCareReminder])

  // Listen for storage events (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vctime_reminder_preferences') {
        loadReminderPreferences()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [loadReminderPreferences])

  // Initialize on mount
  useEffect(() => {
    initializeReminders()
  }, [initializeReminders])

  // Actions
  const actions: ReminderActions = {
    showEyeCareReminder,
    hideEyeCareReminder,
    skipEyeCareReminder,
    completeEyeCareReminder,
    updateEyeCarePreferences,
    checkClockOutReminder,
    showClockOutReminder,
    initializeReminders,
    clearError
  }

  return {
    ...state,
    ...actions
  }
}