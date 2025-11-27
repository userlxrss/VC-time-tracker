/**
 * Enhanced Real-time stats hook for VC Time Tracker
 * Provides live updates for time tracking statistics with comprehensive integration
 */

import { useEffect, useState, useCallback } from 'react'
import { TimeEntry, TimeEntryStatus, UserProfile } from '@/src/types'
import { TimeCalculator } from '@/src/utils/timeCalculations'
import { TimeEntryStorage, CurrentUserStorage } from '@/src/utils/localStorage'
import { UserService } from '@/src/services/userService'

interface RealTimeStats {
  hoursToday: number
  hoursThisWeek: number
  currentStatus: TimeEntryStatus
  teamActiveCount: number
  teamTotalCount: number
  lastUpdated: Date
  isTracking: boolean
  onBreak: boolean
  breakType?: string
  weekProgress: number // percentage of week completed
  dailyGoalProgress: number // percentage of daily goal (8 hours)
}

export function useRealTimeStats(updateInterval: number = 60000) { // Default 1 minute
  const [stats, setStats] = useState<RealTimeStats>({
    hoursToday: 0,
    hoursThisWeek: 0,
    currentStatus: TimeEntryStatus.NOT_STARTED,
    teamActiveCount: 0,
    teamTotalCount: 0,
    lastUpdated: new Date(),
    isTracking: false,
    onBreak: false,
    weekProgress: 0,
    dailyGoalProgress: 0
  })

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Calculate current time with live updates for active sessions
  const calculateCurrentHours = useCallback((timeEntry: TimeEntry): number => {
    if (!timeEntry.clockIn) return 0

    if (timeEntry.clockOut) {
      // Completed day - use calculated work hours
      return TimeCalculator.calculateWorkHours(timeEntry)
    } else {
      // Currently active - calculate live hours
      const now = new Date()
      const clockInTime = TimeCalculator.parseTime(timeEntry.clockIn)
      const totalMinutes = (now.getTime() - clockInTime.getTime()) / (1000 * 60)

      // Calculate break time to deduct
      let breakMinutes = 0

      // Lunch break deduction
      if (timeEntry.lunchBreak.start) {
        if (timeEntry.lunchBreak.end) {
          breakMinutes += TimeCalculator.calculateLunchBreakMinutes(timeEntry)
        } else {
          // Currently on lunch break
          const lunchStart = TimeCalculator.parseTime(timeEntry.lunchBreak.start)
          breakMinutes += (now.getTime() - lunchStart.getTime()) / (1000 * 60)
        }
      }

      // Short breaks deduction
      timeEntry.shortBreaks.forEach(breakItem => {
        if (breakItem.start) {
          if (breakItem.end) {
            breakMinutes += breakItem.duration
          } else {
            // Currently on a short break
            const breakStart = TimeCalculator.parseTime(breakItem.start)
            breakMinutes += (now.getTime() - breakStart.getTime()) / (1000 * 60)
          }
        }
      })

      const workMinutes = Math.max(0, totalMinutes - breakMinutes)
      return workMinutes / 60
    }
  }, [])

  // Calculate week progress (percentage of week days worked)
  const calculateWeekProgress = useCallback((): number => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const workDaysSoFar = dayOfWeek === 0 ? 0 : Math.min(dayOfWeek, 5) // Count only weekdays up to today
    const totalWorkDays = 5 // Monday to Friday

    return totalWorkDays > 0 ? (workDaysSoFar / totalWorkDays) * 100 : 0
  }, [])

  // Calculate daily goal progress (percentage of 8-hour goal)
  const calculateDailyGoalProgress = useCallback((hours: number): number => {
    const dailyGoal = 8 // hours
    return Math.min((hours / dailyGoal) * 100, 100)
  }, [])

  const calculateStats = useCallback(() => {
    try {
      const user = UserService.getCurrentSession().user
      if (!user) return

      setCurrentUser(user)

      // Get today's time entry
      const todayEntry = TimeEntryStorage.getTodayTimeEntry(user.id)
      let hoursToday = 0
      let currentStatus = TimeEntryStatus.NOT_STARTED
      let isTracking = false
      let onBreak = false
      let breakType = undefined

      if (todayEntry) {
        currentStatus = todayEntry.status
        isTracking = currentStatus === TimeEntryStatus.CLOCKED_IN ||
                    currentStatus === TimeEntryStatus.ON_LUNCH ||
                    currentStatus === TimeEntryStatus.ON_BREAK
        onBreak = currentStatus === TimeEntryStatus.ON_LUNCH || currentStatus === TimeEntryStatus.ON_BREAK

        if (onBreak) {
          breakType = currentStatus === TimeEntryStatus.ON_LUNCH ? 'Lunch' : 'Break'
        }

        if (todayEntry.clockIn) {
          hoursToday = calculateCurrentHours(todayEntry)
        }
      }

      // Get this week's time entries
      const weekEntries = TimeEntryStorage.getWeekTimeEntries(user.id)
      let hoursThisWeek = 0

      weekEntries.forEach(entry => {
        if (entry.clockIn && entry.clockOut) {
          hoursThisWeek += TimeCalculator.calculateWorkHours(entry)
        } else if (entry.date === new Date().toISOString().split('T')[0]) {
          // Include current day's ongoing hours
          hoursThisWeek += hoursToday
        }
      })

      // Calculate team stats
      const allUsers = UserService.getAllUsers()
      let activeCount = 0

      allUsers.forEach(user => {
        const userTodayEntry = TimeEntryStorage.getTodayTimeEntry(user.id)
        if (userTodayEntry?.status === TimeEntryStatus.CLOCKED_IN) {
          activeCount++
        }
      })

      const weekProgress = calculateWeekProgress()
      const dailyGoalProgress = calculateDailyGoalProgress(hoursToday)

      setStats({
        hoursToday,
        hoursThisWeek,
        currentStatus,
        teamActiveCount: activeCount,
        teamTotalCount: allUsers.length,
        lastUpdated: new Date(),
        isTracking,
        onBreak,
        breakType,
        weekProgress,
        dailyGoalProgress
      })

    } catch (error) {
      console.error('Error calculating real-time stats:', error)
    }
  }, [calculateCurrentHours, calculateWeekProgress, calculateDailyGoalProgress])

  // Initial calculation
  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  // Set up real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true)
      calculateStats()
      setTimeout(() => setIsUpdating(false), 300) // Brief animation feedback
    }, updateInterval)

    return () => clearInterval(interval)
  }, [calculateStats, updateInterval])

  // Listen for storage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('vctime_')) {
        calculateStats()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [calculateStats])

  // Manual refresh function
  const refresh = useCallback(() => {
    setIsUpdating(true)
    calculateStats()
    setTimeout(() => setIsUpdating(false), 300)
  }, [calculateStats])

  return {
    ...stats,
    isUpdating,
    refresh,
    currentUser
  }
}