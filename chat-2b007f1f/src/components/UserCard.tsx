'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ToastProvider'
import {
  Clock,
  Calendar,
  CalendarRange,
  Play,
  Stop,
  Coffee,
  Pause,
  Check,
  Eye,
  Loader2
} from 'lucide-react'
import {
  User,
  TimeEntry,
  ShortBreak,
  getTodayTimeEntry,
  saveTimeEntry,
  updateTimeEntry,
  calculateTotalHours,
  getWeekEntries,
  getMonthEntries,
  formatHours,
  formatDuration,
  getUserInitials,
  generateId,
  getTodayDateString
} from '@/utils/timeTracker'

interface UserCardProps {
  user: User
  isCurrentUser: boolean
  onUpdate: () => void
}

export function UserCard({ user, isCurrentUser, onUpdate }: UserCardProps) {
  const [todayEntry, setTodayEntry] = useState<TimeEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [breakTimer, setBreakTimer] = useState(0)
  const [weekHours, setWeekHours] = useState(0)
  const [monthHours, setMonthHours] = useState(0)
  const { addToast } = useToast()

  useEffect(() => {
    loadUserData()

    // Set up real-time updates for current user
    if (isCurrentUser) {
      const interval = setInterval(() => {
        loadUserData()
      }, 60000) // Update every minute

      // Set up break timer updates
      const breakInterval = setInterval(() => {
        if (todayEntry && (todayEntry.status === 'on_lunch' || todayEntry.status === 'on_break')) {
          updateBreakTimer()
        }
      }, 1000) // Update every second

      return () => {
        clearInterval(interval)
        clearInterval(breakInterval)
      }
    }
  }, [user.id, isCurrentUser, todayEntry?.status])

  const loadUserData = () => {
    const entry = getTodayTimeEntry(user.id)
    setTodayEntry(entry)

    // Calculate weekly and monthly hours
    const weekEntries = getWeekEntries(user.id)
    const weekTotal = weekEntries.reduce((total, weekEntry) => {
      return total + (weekEntry.totalHours || calculateTotalHours(weekEntry))
    }, 0)
    setWeekHours(weekTotal)

    const monthEntries = getMonthEntries(user.id, new Date().getFullYear(), new Date().getMonth())
    const monthTotal = monthEntries.reduce((total, monthEntry) => {
      return total + (monthEntry.totalHours || calculateTotalHours(monthEntry))
    }, 0)
    setMonthHours(monthTotal)

    // Update break timer if on break
    if (entry && (entry.status === 'on_lunch' || entry.status === 'on_break')) {
      updateBreakTimer()
    }
  }

  const updateBreakTimer = () => {
    if (!todayEntry) return

    const now = new Date().getTime()

    if (todayEntry.status === 'on_lunch' && todayEntry.lunchBreakStart) {
      const elapsed = now - new Date(todayEntry.lunchBreakStart).getTime()
      setBreakTimer(Math.floor(elapsed / 1000))
    } else if (todayEntry.status === 'on_break' && todayEntry.shortBreaks.length > 0) {
      const activeBreak = todayEntry.shortBreaks[todayEntry.shortBreaks.length - 1]
      if (activeBreak && !activeBreak.end) {
        const elapsed = now - new Date(activeBreak.start).getTime()
        setBreakTimer(Math.floor(elapsed / 1000))
      }
    }
  }

  const formatBreakTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'boss':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'employee':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return 'bg-green-500'
      case 'on_lunch':
      case 'on_break':
        return 'bg-orange-500'
      case 'clocked_out':
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'clocked_in':
        return 'Clocked In'
      case 'on_lunch':
        return 'On Lunch Break'
      case 'on_break':
        return 'On Short Break'
      case 'clocked_out':
      default:
        return 'Clocked Out'
    }
  }

  const handleClockIn = async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      const newEntry: TimeEntry = {
        id: generateId(),
        userId: user.id,
        date: getTodayDateString(),
        clockIn: now.toISOString(),
        clockOut: null,
        lunchBreakStart: null,
        lunchBreakEnd: null,
        shortBreaks: [],
        totalHours: null,
        status: 'clocked_in'
      }

      saveTimeEntry(newEntry)
      setTodayEntry(newEntry)

      // Show success message (would use toast in real implementation)
      alert('Clocked in successfully! Have a productive day! 🚀')

      onUpdate()
    } catch (error) {
      console.error('Error clocking in:', error)
      alert('Failed to clock in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!todayEntry) return

    setIsLoading(true)
    try {
      const now = new Date()
      const updatedEntry = {
        ...todayEntry,
        clockOut: now.toISOString(),
        totalHours: calculateTotalHours(todayEntry),
        status: 'clocked_out' as const
      }

      updateTimeEntry(updatedEntry)
      setTodayEntry(updatedEntry)

      const hours = formatHours(updatedEntry.totalHours || 0)
      alert(`Clocked out! You worked ${hours} today. Great job! 🎉`)

      onUpdate()
    } catch (error) {
      console.error('Error clocking out:', error)
      alert('Failed to clock out. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartLunch = async () => {
    if (!todayEntry) return

    setIsLoading(true)
    try {
      const now = new Date()

      // Check if already on lunch
      if (todayEntry.lunchBreakStart && !todayEntry.lunchBreakEnd) {
        alert('You are already on lunch break!')
        return
      }

      // Check if lunch already taken
      if (todayEntry.lunchBreakEnd) {
        alert('You have already taken your lunch break today!')
        return
      }

      const updatedEntry = {
        ...todayEntry,
        lunchBreakStart: now.toISOString(),
        status: 'on_lunch' as const
      }

      updateTimeEntry(updatedEntry)
      setTodayEntry(updatedEntry)

      alert('Enjoy your lunch! 🍽️')
      onUpdate()
    } catch (error) {
      console.error('Error starting lunch:', error)
      alert('Failed to start lunch break. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndLunch = async () => {
    if (!todayEntry || !todayEntry.lunchBreakStart) return

    setIsLoading(true)
    try {
      const now = new Date()
      const updatedEntry = {
        ...todayEntry,
        lunchBreakEnd: now.toISOString(),
        status: 'clocked_in' as const
      }

      updateTimeEntry(updatedEntry)
      setTodayEntry(updatedEntry)

      const duration = formatDuration(todayEntry.lunchBreakStart, now.toISOString())
      alert(`Lunch break ended. Duration: ${duration} ⏱️`)

      onUpdate()
    } catch (error) {
      console.error('Error ending lunch:', error)
      alert('Failed to end lunch break. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartBreak = async () => {
    if (!todayEntry) return

    setIsLoading(true)
    try {
      const now = new Date()
      const newBreak: ShortBreak = {
        start: now.toISOString(),
        end: null
      }

      const updatedEntry = {
        ...todayEntry,
        shortBreaks: [...todayEntry.shortBreaks, newBreak],
        status: 'on_break' as const
      }

      updateTimeEntry(updatedEntry)
      setTodayEntry(updatedEntry)

      alert('Break started. Take your time! ☕')
      onUpdate()
    } catch (error) {
      console.error('Error starting break:', error)
      alert('Failed to start break. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndBreak = async () => {
    if (!todayEntry || todayEntry.shortBreaks.length === 0) return

    setIsLoading(true)
    try {
      const now = new Date()
      const updatedEntry = { ...todayEntry }

      // Find the active break (last one with no end time)
      const activeBreak = updatedEntry.shortBreaks[updatedEntry.shortBreaks.length - 1]
      if (activeBreak && !activeBreak.end) {
        activeBreak.end = now.toISOString()
      }

      updatedEntry.status = 'clocked_in'
      updateTimeEntry(updatedEntry)
      setTodayEntry(updatedEntry)

      const duration = formatDuration(activeBreak.start, now.toISOString())
      alert(`Break ended. Duration: ${duration}`)

      onUpdate()
    } catch (error) {
      console.error('Error ending break:', error)
      alert('Failed to end break. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = () => {
    alert('Detailed view coming in Phase 2! 👀')
  }

  const calculateTodayHours = (): number => {
    if (!todayEntry) return 0
    return calculateTotalHours(todayEntry)
  }

  const renderActionButtons = () => {
    if (!isCurrentUser) {
      return (
        <Button
          onClick={handleViewDetails}
          variant="outline"
          className="w-full h-12 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      )
    }

    // Current user's buttons based on status
    if (!todayEntry || todayEntry.status === 'clocked_out') {
      return (
        <Button
          onClick={handleClockIn}
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Clock In
        </Button>
      )
    }

    if (todayEntry.status === 'clocked_in') {
      return (
        <div className="space-y-3">
          <Button
            onClick={handleClockOut}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Stop className="w-4 h-4 mr-2" />
            )}
            Clock Out
          </Button>
          <div className="flex space-x-2">
            <Button
              onClick={handleStartLunch}
              disabled={isLoading}
              variant="outline"
              className="flex-1 h-11 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <Coffee className="w-4 h-4 mr-1" />
              Lunch
            </Button>
            <Button
              onClick={handleStartBreak}
              disabled={isLoading}
              variant="outline"
              className="flex-1 h-11 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Pause className="w-4 h-4 mr-1" />
              Break
            </Button>
          </div>
        </div>
      )
    }

    if (todayEntry.status === 'on_lunch') {
      return (
        <Button
          onClick={handleEndLunch}
          disabled={isLoading}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          End Lunch Break
          <span className="ml-2 text-sm">({formatBreakTime(breakTimer)})</span>
        </Button>
      )
    }

    if (todayEntry.status === 'on_break') {
      return (
        <Button
          onClick={handleEndBreak}
          disabled={isLoading}
          className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          End Break
          <span className="ml-2 text-sm">({formatBreakTime(breakTimer)})</span>
        </Button>
      )
    }

    return null
  }

  return (
    <Card
      className={`
        relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        ${isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
      `}
    >
      {/* Card Content */}
      <div className="p-6">
        {/* Header Section - Profile */}
        <div className="text-center mb-4">
          <div className="relative inline-block mb-3">
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl
              ${user.role === 'boss'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                : 'bg-gradient-to-r from-green-500 to-green-600'
              }
            `}>
              {getUserInitials(user.name)}
            </div>
            {todayEntry && (
              <div className={`
                absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800
                ${getStatusDotColor(todayEntry.status)}
                ${todayEntry.status === 'clocked_in' ? 'animate-pulse' : ''}
              `} />
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {user.name}
          </h3>

          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
            {user.role === 'boss' ? 'Boss' : 'Employee'}
          </span>

          {/* Status Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-3">
            <div className={`w-2 h-2 rounded-full ${getStatusDotColor(todayEntry?.status || 'clocked_out')} ${todayEntry?.status === 'clocked_in' ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {getStatusText(todayEntry?.status || 'clocked_out')}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

        {/* Stats Section */}
        <div className="space-y-3 mb-4">
          {/* Today's Hours */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatHours(calculateTodayHours())}
            </span>
          </div>

          {/* This Week */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatHours(weekHours)}
            </span>
          </div>

          {/* This Month */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CalendarRange className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
            </div>
            <span className="font-bold text-gray-700 dark:text-gray-300">
              {formatHours(monthHours)}
            </span>
          </div>
        </div>

        {/* Action Section */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {renderActionButtons()}
        </div>
      </div>
    </Card>
  )
}