'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ToastProvider'
import { getUserPreferences, saveUserPreferences, getTodayTimeEntry } from '@/utils/timeTracker'

export function useEyeCareReminder(userId: number) {
  const [showEyeCareModal, setShowEyeCareModal] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    // Check eye care reminder every minute
    const reminderInterval = setInterval(() => {
      checkEyeCareReminder()
    }, 60000) // Check every minute

    return () => clearInterval(reminderInterval)
  }, [userId])

  const checkEyeCareReminder = () => {
    const prefs = getUserPreferences(userId)
    const entry = getTodayTimeEntry(userId)

    // Only remind if eye care is enabled and user is clocked in
    if (!prefs.eyeCareEnabled || !entry || entry.status !== 'clocked_in') {
      return
    }

    const now = new Date()
    const lastReminder = prefs.lastReminderTime ? new Date(prefs.lastReminderTime) : new Date(0)
    const minutesSinceReminder = (now.getTime() - lastReminder.getTime()) / (1000 * 60)

    // If it's time for a reminder
    if (minutesSinceReminder >= prefs.eyeCareInterval) {
      showEyeCareReminder()
      updateLastReminderTime(userId, now.toISOString())
    }
  }

  const showEyeCareReminder = () => {
    // Show modal
    setShowEyeCareModal(true)

    // Also show a toast notification
    addToast({
      message: 'Time for an eye care break! Look at something 20 feet away for 20 seconds 👁️',
      type: 'info',
      duration: 5000
    })

    // Try to show browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Eye Care Reminder', {
        body: 'Time to rest your eyes! Look at something 20 feet away for 20 seconds.',
        icon: '/favicon.ico'
      })
    }
  }

  const updateLastReminderTime = (userId: number, time: string) => {
    const prefs = getUserPreferences(userId)
    saveUserPreferences({
      ...prefs,
      lastReminderTime: time
    })
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        addToast({
          message: 'Browser notifications enabled for eye care reminders! 🎉',
          type: 'success'
        })
      }
    }
  }

  const toggleEyeCare = (enabled: boolean, interval?: number) => {
    const prefs = getUserPreferences(userId)
    saveUserPreferences({
      ...prefs,
      eyeCareEnabled: enabled,
      eyeCareInterval: interval || prefs.eyeCareInterval
    })

    if (enabled) {
      addToast({
        message: `Eye care reminders enabled! You'll be reminded every ${interval || prefs.eyeCareInterval} minutes.`,
        type: 'success'
      })
      requestNotificationPermission()
    } else {
      addToast({
        message: 'Eye care reminders disabled',
        type: 'info'
      })
    }
  }

  const handleCloseModal = () => {
    setShowEyeCareModal(false)
  }

  return {
    showEyeCareModal,
    handleCloseModal,
    toggleEyeCare,
    requestNotificationPermission
  }
}