/**
 * Team Time Tracking Hook for VC Time Tracker
 * Provides real-time team status updates and statistics
 */

import { useState, useEffect, useCallback } from 'react'
import {
  TimeEntry,
  TimeEntryStatus,
  UserProfile,
  HARDCODED_USERS
} from '@/src/types'
import { TimeEntryStorage, CurrentUserStorage } from '@/src/utils/localStorage'
import { UserService } from '@/src/services/userService'
import { TimeCalculator } from '@/src/utils/timeCalculations'

export interface TeamMemberStatus {
  user: UserProfile
  timeEntry: TimeEntry | null
  status: TimeEntryStatus
  currentHours: number
  isActive: boolean
  isOnBreak: boolean
  lastUpdated: Date
}

export interface TeamTimeTrackingState {
  // Team members
  teamMembers: TeamMemberStatus[]

  // Team statistics
  activeCount: number
  totalCount: number
  onLunchCount: number
  onBreakCount: number
  totalHoursToday: number

  // Current user
  currentUser: UserProfile | null

  // Real-time updates
  lastUpdate: Date
  isUpdating: boolean

  // Loading
  isLoading: boolean
  error: string | null
}

export interface TeamTimeTrackingActions {
  refresh: () => void
  getTeamMemberStatus: (userId: string) => TeamMemberStatus | null
  getActiveTeamMembers: () => TeamMemberStatus[]
  getTeamHoursToday: () => number
}

export function useTeamTimeTracking(updateInterval: number = 30000) { // Default 30 seconds
  const [state, setState] = useState<TeamTimeTrackingState>({
    teamMembers: [],
    activeCount: 0,
    totalCount: 0,
    onLunchCount: 0,
    onBreakCount: 0,
    totalHoursToday: 0,
    currentUser: null,
    lastUpdate: new Date(),
    isUpdating: false,
    isLoading: true,
    error: null
  })

  // Calculate current hours for a team member
  const calculateMemberHours = useCallback((timeEntry: TimeEntry | null): number => {
    if (!timeEntry || !timeEntry.clockIn) return 0

    if (timeEntry.clockOut) {
      // Completed day - use calculated hours
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

  // Update team member status
  const updateTeamMemberStatus = useCallback((user: UserProfile): TeamMemberStatus => {
    const timeEntry = TimeEntryStorage.getTodayTimeEntry(user.id)
    const status = timeEntry?.status || TimeEntryStatus.NOT_STARTED
    const currentHours = calculateMemberHours(timeEntry)
    const isActive = status === TimeEntryStatus.CLOCKED_IN
    const isOnBreak = status === TimeEntryStatus.ON_LUNCH || status === TimeEntryStatus.ON_BREAK

    return {
      user,
      timeEntry,
      status,
      currentHours,
      isActive,
      isOnBreak,
      lastUpdated: new Date()
    }
  }, [calculateMemberHours])

  // Load team data
  const loadTeamData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Get current user
      const currentUserSession = UserService.getCurrentSession()
      const currentUser = currentUserSession.user

      // Get all active users
      const allUsers = UserService.getAllUsers()

      // Calculate status for each team member
      const teamMembers = allUsers.map(user => updateTeamMemberStatus(user))

      // Calculate team statistics
      const activeCount = teamMembers.filter(member => member.isActive).length
      const onLunchCount = teamMembers.filter(member => member.status === TimeEntryStatus.ON_LUNCH).length
      const onBreakCount = teamMembers.filter(member => member.status === TimeEntryStatus.ON_BREAK).length
      const totalHoursToday = teamMembers.reduce((total, member) => total + member.currentHours, 0)

      setState(prev => ({
        ...prev,
        teamMembers,
        activeCount,
        totalCount: allUsers.length,
        onLunchCount,
        onBreakCount,
        totalHoursToday,
        currentUser,
        isLoading: false,
        lastUpdate: new Date()
      }))
    } catch (error) {
      console.error('Error loading team data:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load team data',
        isLoading: false
      }))
    }
  }, [updateTeamMemberStatus])

  // Real-time update function
  const updateCurrentTime = useCallback(() => {
    if (state.teamMembers.length > 0) {
      setState(prev => {
        // Update only active members to save performance
        const updatedMembers = prev.teamMembers.map(member => {
          if (member.isActive || member.isOnBreak) {
            return updateTeamMemberStatus(member.user)
          }
          return member
        })

        // Recalculate statistics
        const activeCount = updatedMembers.filter(member => member.isActive).length
        const onLunchCount = updatedMembers.filter(member => member.status === TimeEntryStatus.ON_LUNCH).length
        const onBreakCount = updatedMembers.filter(member => member.status === TimeEntryStatus.ON_BREAK).length
        const totalHoursToday = updatedMembers.reduce((total, member) => total + member.currentHours, 0)

        return {
          ...prev,
          teamMembers: updatedMembers,
          activeCount,
          onLunchCount,
          onBreakCount,
          totalHoursToday,
          lastUpdate: new Date(),
          isUpdating: true
        }
      })

      // Reset updating flag after a brief delay
      setTimeout(() => {
        setState(prev => ({ ...prev, isUpdating: false }))
      }, 300)
    }
  }, [state.teamMembers.length, updateTeamMemberStatus])

  // Get team member status by ID
  const getTeamMemberStatus = useCallback((userId: string): TeamMemberStatus | null => {
    return state.teamMembers.find(member => member.user.id === userId) || null
  }, [state.teamMembers])

  // Get active team members
  const getActiveTeamMembers = useCallback((): TeamMemberStatus[] => {
    return state.teamMembers.filter(member => member.isActive)
  }, [state.teamMembers])

  // Get total team hours today
  const getTeamHoursToday = useCallback((): number => {
    return state.totalHoursToday
  }, [state.totalHoursToday])

  // Refresh team data
  const refresh = useCallback(() => {
    loadTeamData()
  }, [loadTeamData])

  // Actions object
  const actions: TeamTimeTrackingActions = {
    refresh,
    getTeamMemberStatus,
    getActiveTeamMembers,
    getTeamHoursToday
  }

  // Set up real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      updateCurrentTime()
    }, updateInterval)

    return () => clearInterval(interval)
  }, [updateInterval, updateCurrentTime])

  // Listen for storage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('vctime_')) {
        loadTeamData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [loadTeamData])

  // Initial load
  useEffect(() => {
    loadTeamData()
  }, [loadTeamData])

  return {
    ...state,
    ...actions
  }
}