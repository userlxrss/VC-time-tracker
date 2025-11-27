/**
 * Comprehensive Time Tracking Hook for VC Time Tracker
 * Provides real-time time tracking functionality with break management
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  TimeEntry,
  TimeEntryStatus,
  ShortBreak,
  BreakType,
  UserProfile,
  getCurrentTimeString,
  getCurrentDateString,
  createEmptyTimeEntry,
  updateTimeEntryStatus
} from '@/src/types'
import { TimeEntryService } from '@/src/services/timeEntryService'
import { UserService } from '@/src/services/userService'
import { TimeCalculator } from '@/src/utils/timeCalculations'
import { TimeEntryStorage, CurrentUserStorage } from '@/src/utils/localStorage'

export interface TimeTrackingState {
  // Current time entry
  currentTimeEntry: TimeEntry | null
  currentUser: UserProfile | null

  // Real-time tracking
  currentHours: number
  isTracking: boolean
  lastUpdate: Date

  // Break tracking
  activeBreak: ShortBreak | null
  breakTimeRemaining: number // in seconds
  onLunchBreak: boolean

  // Status
  status: TimeEntryStatus
  canClockIn: boolean
  canClockOut: boolean
  canStartLunch: boolean
  canEndLunch: boolean
  canStartBreak: boolean
  canEndBreak: boolean

  // Loading states
  isLoading: boolean
  isUpdating: boolean
  error: string | null
}

export interface TimeTrackingActions {
  // Core actions
  clockIn: (time?: string) => Promise<{ success: boolean; message?: string }>
  clockOut: (time?: string) => Promise<{ success: boolean; message?: string }>

  // Lunch break actions
  startLunch: (time?: string) => Promise<{ success: boolean; message?: string }>
  endLunch: (time?: string) => Promise<{ success: boolean; message?: string }>

  // Short break actions
  startBreak: (breakType: BreakType, time?: string) => Promise<{ success: boolean; message?: string }>
  endBreak: (breakId?: string, time?: string) => Promise<{ success: boolean; message?: string }>

  // Utility actions
  refresh: () => void
  clearError: () => void

  // Real-time updates
  forceUpdate: () => void
}

export function useTimeTracking(updateInterval: number = 1000) { // Default 1 second for precise tracking
  // State management
  const [state, setState] = useState<TimeTrackingState>({
    currentTimeEntry: null,
    currentUser: null,
    currentHours: 0,
    isTracking: false,
    lastUpdate: new Date(),
    activeBreak: null,
    breakTimeRemaining: 0,
    onLunchBreak: false,
    status: TimeEntryStatus.NOT_STARTED,
    canClockIn: false,
    canClockOut: false,
    canStartLunch: false,
    canEndLunch: false,
    canStartBreak: false,
    canEndBreak: false,
    isLoading: true,
    isUpdating: false,
    error: null
  })

  // Refs for timers and cleanup
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const forceUpdateRef = useRef<() => void>(() => {})

  // Calculate current hours and break time
  const calculateCurrentTime = useCallback((entry: TimeEntry) => {
    const now = new Date()
    const currentTimeString = TimeCalculator.parseTime(now).toTimeString().slice(0, 5)

    let currentHours = 0
    let activeBreak: ShortBreak | null = null
    let breakTimeRemaining = 0
    let onLunchBreak = false

    if (entry.clockIn) {
      if (entry.clockOut) {
        // Completed day - use calculated hours
        currentHours = TimeCalculator.calculateWorkHours(entry)
      } else {
        // Currently active - calculate live hours
        const clockInTime = TimeCalculator.parseTime(entry.clockIn)
        const totalMinutes = (now.getTime() - clockInTime.getTime()) / (1000 * 60)

        // Calculate break time to deduct
        let breakMinutes = 0

        // Lunch break deduction
        if (entry.lunchBreak.start && entry.lunchBreak.end) {
          breakMinutes += TimeCalculator.calculateLunchBreakMinutes(entry)
        } else if (entry.lunchBreak.start && !entry.lunchBreak.end) {
          // Currently on lunch break
          onLunchBreak = true
          const lunchStart = TimeCalculator.parseTime(entry.lunchBreak.start)
          breakMinutes += (now.getTime() - lunchStart.getTime()) / (1000 * 60)
        }

        // Short breaks deduction
        entry.shortBreaks.forEach(breakItem => {
          if (breakItem.start && breakItem.end) {
            breakMinutes += breakItem.duration
          } else if (breakItem.start && !breakItem.end) {
            // Currently on a short break
            activeBreak = breakItem
            const breakStart = TimeCalculator.parseTime(breakItem.start)
            const elapsedBreakMinutes = (now.getTime() - breakStart.getTime()) / (1000 * 60)
            breakMinutes += elapsedBreakMinutes
            breakTimeRemaining = Math.max(0, 60 - elapsedBreakMinutes) * 60 // Convert to seconds
          }
        })

        const workMinutes = Math.max(0, totalMinutes - breakMinutes)
        currentHours = workMinutes / 60
      }
    }

    return {
      currentHours,
      activeBreak,
      breakTimeRemaining,
      onLunchBreak
    }
  }, [])

  // Update state based on current time entry
  const updateStateFromEntry = useCallback((entry: TimeEntry | null, user: UserProfile | null) => {
    if (!entry || !user) {
      setState(prev => ({
        ...prev,
        currentTimeEntry: entry,
        currentUser: user,
        currentHours: 0,
        isTracking: false,
        activeBreak: null,
        breakTimeRemaining: 0,
        onLunchBreak: false,
        status: TimeEntryStatus.NOT_STARTED,
        canClockIn: !!user,
        canClockOut: false,
        canStartLunch: false,
        canEndLunch: false,
        canStartBreak: false,
        canEndBreak: false,
        isLoading: false
      }))
      return
    }

    const { currentHours, activeBreak, breakTimeRemaining, onLunchBreak } = calculateCurrentTime(entry)
    const status = updateTimeEntryStatus(entry)
    const isTracking = status === TimeEntryStatus.CLOCKED_IN || status === TimeEntryStatus.ON_LUNCH || status === TimeEntryStatus.ON_BREAK

    // Calculate action permissions
    const canClockIn = !entry.clockIn
    const canClockOut = !!(entry.clockIn && !entry.clockOut)
    const canStartLunch = !!(entry.clockIn && !entry.clockOut && !entry.lunchBreak.start && !activeBreak)
    const canEndLunch = !!(entry.lunchBreak.start && !entry.lunchBreak.end)
    const canStartBreak = !!(entry.clockIn && !entry.clockOut && !entry.lunchBreak.start && !entry.lunchBreak.end && !activeBreak)
    const canEndBreak = !!activeBreak

    setState(prev => ({
      ...prev,
      currentTimeEntry: entry,
      currentUser: user,
      currentHours,
      isTracking,
      lastUpdate: new Date(),
      activeBreak,
      breakTimeRemaining,
      onLunchBreak,
      status,
      canClockIn,
      canClockOut,
      canStartLunch,
      canEndLunch,
      canStartBreak,
      canEndBreak,
      isLoading: false
    }))
  }, [calculateCurrentTime])

  // Load initial data
  const loadTimeEntry = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const user = UserService.getCurrentSession().user
      const timeEntry = TimeEntryService.getTodayTimeEntry(user.id)

      updateStateFromEntry(timeEntry, user)
    } catch (error) {
      console.error('Error loading time entry:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load time entry',
        isLoading: false
      }))
    }
  }, [updateStateFromEntry])

  // Real-time update function
  const updateCurrentTime = useCallback(() => {
    if (state.currentTimeEntry && state.currentUser && state.isTracking) {
      const { currentHours, activeBreak, breakTimeRemaining, onLunchBreak } = calculateCurrentTime(state.currentTimeEntry)

      setState(prev => ({
        ...prev,
        currentHours,
        activeBreak,
        breakTimeRemaining,
        onLunchBreak,
        lastUpdate: new Date()
      }))
    }
  }, [state.currentTimeEntry, state.currentUser, state.isTracking, calculateCurrentTime])

  // Force update function
  const forceUpdate = useCallback(() => {
    loadTimeEntry()
  }, [loadTimeEntry])

  // Clock in action
  const clockIn = useCallback(async (time?: string) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }))

      if (!state.currentUser) {
        throw new Error('No user logged in')
      }

      const result = TimeEntryService.clockIn(state.currentUser.id, time)

      if (result.success) {
        updateStateFromEntry(result.entry, state.currentUser)
        return { success: true, message: result.message }
      } else {
        throw new Error(result.message || 'Failed to clock in')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clock in'
      setState(prev => ({ ...prev, error: errorMessage, isUpdating: false }))
      return { success: false, message: errorMessage }
    }
  }, [state.currentUser, updateStateFromEntry])

  // Clock out action
  const clockOut = useCallback(async (time?: string) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }))

      if (!state.currentUser) {
        throw new Error('No user logged in')
      }

      const result = TimeEntryService.clockOut(state.currentUser.id, time)

      if (result.success) {
        updateStateFromEntry(result.entry, state.currentUser)
        return { success: true, message: result.message }
      } else {
        throw new Error(result.message || 'Failed to clock out')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clock out'
      setState(prev => ({ ...prev, error: errorMessage, isUpdating: false }))
      return { success: false, message: errorMessage }
    }
  }, [state.currentUser, updateStateFromEntry])

  // Start lunch break
  const startLunch = useCallback(async (time?: string) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }))

      if (!state.currentUser) {
        throw new Error('No user logged in')
      }

      const result = TimeEntryService.startLunch(state.currentUser.id, time)

      if (result.success) {
        updateStateFromEntry(result.entry, state.currentUser)
        return { success: true, message: result.message }
      } else {
        throw new Error(result.message || 'Failed to start lunch')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start lunch'
      setState(prev => ({ ...prev, error: errorMessage, isUpdating: false }))
      return { success: false, message: errorMessage }
    }
  }, [state.currentUser, updateStateFromEntry])

  // End lunch break
  const endLunch = useCallback(async (time?: string) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }))

      if (!state.currentUser) {
        throw new Error('No user logged in')
      }

      const result = TimeEntryService.endLunch(state.currentUser.id, time)

      if (result.success) {
        updateStateFromEntry(result.entry, state.currentUser)
        return { success: true, message: result.message }
      } else {
        throw new Error(result.message || 'Failed to end lunch')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end lunch'
      setState(prev => ({ ...prev, error: errorMessage, isUpdating: false }))
      return { success: false, message: errorMessage }
    }
  }, [state.currentUser, updateStateFromEntry])

  // Start short break
  const startBreak = useCallback(async (breakType: BreakType, time?: string) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }))

      if (!state.currentUser) {
        throw new Error('No user logged in')
      }

      const result = TimeEntryService.startBreak(state.currentUser.id, breakType, time)

      if (result.success) {
        updateStateFromEntry(result.entry, state.currentUser)
        return { success: true, message: result.message }
      } else {
        throw new Error(result.message || 'Failed to start break')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start break'
      setState(prev => ({ ...prev, error: errorMessage, isUpdating: false }))
      return { success: false, message: errorMessage }
    }
  }, [state.currentUser, updateStateFromEntry])

  // End short break
  const endBreak = useCallback(async (breakId?: string, time?: string) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }))

      if (!state.currentUser) {
        throw new Error('No user logged in')
      }

      // If no breakId provided, use the active break
      const targetBreakId = breakId || state.activeBreak?.id

      if (!targetBreakId) {
        throw new Error('No active break found')
      }

      const result = TimeEntryService.endBreak(state.currentUser.id, targetBreakId, time)

      if (result.success) {
        updateStateFromEntry(result.entry, state.currentUser)
        return { success: true, message: result.message }
      } else {
        throw new Error(result.message || 'Failed to end break')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end break'
      setState(prev => ({ ...prev, error: errorMessage, isUpdating: false }))
      return { success: false, message: errorMessage }
    }
  }, [state.currentUser, state.activeBreak, updateStateFromEntry])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Refresh data
  const refresh = useCallback(() => {
    loadTimeEntry()
  }, [loadTimeEntry])

  // Actions object
  const actions: TimeTrackingActions = {
    clockIn,
    clockOut,
    startLunch,
    endLunch,
    startBreak,
    endBreak,
    refresh,
    clearError,
    forceUpdate
  }

  // Set up real-time updates
  useEffect(() => {
    if (state.isTracking) {
      updateIntervalRef.current = setInterval(() => {
        updateCurrentTime()
      }, updateInterval)

      return () => {
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current)
          updateIntervalRef.current = null
        }
      }
    }
  }, [state.isTracking, updateInterval, updateCurrentTime])

  // Listen for storage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('vctime_')) {
        loadTimeEntry()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [loadTimeEntry])

  // Initial load
  useEffect(() => {
    loadTimeEntry()
  }, [loadTimeEntry])

  // Store force update reference
  useEffect(() => {
    forceUpdateRef.current = forceUpdate
  }, [forceUpdate])

  return {
    ...state,
    ...actions,
    forceUpdate: forceUpdateRef.current
  }
}