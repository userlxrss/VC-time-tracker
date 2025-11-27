'use client'

import { useEffect } from 'react'
import { useToast } from '@/components/ToastProvider'
import { getTimeEntries, getAllUsers, updateUserEntry } from '@/utils/timeTracker'

export function useForgotClockOutReminder() {
  const { addToast } = useToast()

  useEffect(() => {
    // Check every hour for users who forgot to clock out
    const checkInterval = setInterval(() => {
      checkForgotClockOut()
    }, 3600000) // Check every hour

    // Also check once when component mounts
    checkForgotClockOut()

    return () => clearInterval(checkInterval)
  }, [])

  const checkForgotClockOut = () => {
    const entries = getTimeEntries()
    const users = getAllUsers()
    const now = new Date()

    entries.forEach(entry => {
      // Skip if already clocked out
      if (entry.clockOut) return

      const clockIn = new Date(entry.clockIn)
      const hoursSinceClockIn = (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60)

      // If clocked in for more than 10 hours, show reminder
      if (hoursSinceClockIn > 10) {
        const user = users.find(u => u.id === entry.userId)
        if (user) {
          showClockOutReminder(user, entry)
        }
      }
    })
  }

  const showClockOutReminder = (user: any, entry: any) => {
    const hoursWorked = Math.floor((new Date().getTime() - new Date(entry.clockIn).getTime()) / (1000 * 60 * 60))

    addToast({
      message: `${user.name}, don't forget to clock out! You've been working for ${hoursWorked} hours. ⏰`,
      type: 'warning',
      duration: 10000,
      action: {
        label: 'Clock Out Now',
        onClick: () => handleClockOut(user.id, entry.id)
      }
    })

    // Try to show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Clock Out Reminder', {
        body: `${user.name}, you've been working for ${hoursWorked} hours. Don't forget to clock out!`,
        icon: '/favicon.ico',
        tag: `clock-out-${user.id}-${entry.date}` // Prevent duplicate notifications
      })
    }
  }

  const handleClockOut = async (userId: number, entryId: number) => {
    try {
      const now = new Date()
      // This would need to be implemented - update the specific time entry
      // For now, just show a message
      addToast({
        message: 'Clock out functionality would be implemented here',
        type: 'info'
      })
    } catch (error) {
      addToast({
        message: 'Failed to clock out. Please try again.',
        type: 'error'
      })
    }
  }

  return {
    checkForgotClockOut
  }
}