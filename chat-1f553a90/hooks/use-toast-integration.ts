'use client'

import { useCallback } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { ToastOptions } from '@/lib/toast-types'

/**
 * Integration hook for VC Time Tracker specific toast usage
 * Provides pre-configured toast methods for common app actions
 */
export function useToastIntegration() {
  const toast = useToast()

  // Time tracking toasts
  const clockInSuccess = useCallback((time?: string) => {
    return toast.success(`Clocked in successfully${time ? ` at ${time}` : ''}`, {
      description: 'Your time tracking session has started',
      duration: 4000,
      icon: '⏰',
    })
  }, [toast])

  const clockOutSuccess = useCallback((duration?: string) => {
    return toast.success('Clocked out successfully', {
      description: duration ? `Session duration: ${duration}` : 'Have a great day!',
      duration: 4000,
      icon: '👋',
    })
  }, [toast])

  const clockInError = useCallback((error: string) => {
    return toast.error('Failed to clock in', {
      description: error,
      duration: 6000,
      persistent: true,
      action: {
        label: 'Try Again',
        onClick: () => console.log('Retry clock in'),
      },
    })
  }, [toast])

  const clockOutError = useCallback((error: string) => {
    return toast.error('Failed to clock out', {
      description: error,
      duration: 6000,
      persistent: true,
      action: {
        label: 'Try Again',
        onClick: () => console.log('Retry clock out'),
      },
    })
  }, [toast])

  // Break toasts
  const breakStarted = useCallback((duration?: string) => {
    return toast.info('Break started', {
      description: duration ? `Enjoy your ${duration} break!` : 'Take your time to recharge',
      duration: 3000,
      icon: '☕',
    })
  }, [toast])

  const breakEnded = useCallback(() => {
    return toast.info('Break ended', {
      description: 'Welcome back! Ready to continue working?',
      duration: 3000,
      icon: '💪',
    })
  }, [toast])

  const breakWarning = useCallback(() => {
    return toast.warning('Don\'t forget to clock out!', {
      description: 'You\'ve been working for a while. Consider taking a break if needed.',
      duration: 8000,
      persistent: false,
      sound: true,
      browserNotification: true,
    })
  }, [toast])

  // Eye care reminders
  const eyeCareReminder = useCallback(() => {
    return toast.info('Eye Care Reminder', {
      description: 'Look away from your screen for 20 seconds to reduce eye strain.',
      duration: 5000,
      icon: '👁️',
      sound: true,
    })
  }, [toast])

  // Time card toasts
  const timeCardSubmitted = useCallback((week?: string) => {
    return toast.success('Time card submitted', {
      description: week ? `Time card for ${week} has been submitted for review` : 'Your time card is pending approval',
      duration: 4000,
      browserNotification: true,
    })
  }, [toast])

  const timeCardApproved = useCallback((week?: string) => {
    return toast.success('Time card approved', {
      description: week ? `Time card for ${week} has been approved` : 'Your time card has been approved',
      duration: 4000,
      icon: '✅',
      browserNotification: true,
    })
  }, [toast])

  const timeCardRejected = useCallback((reason?: string) => {
    return toast.error('Time card rejected', {
      description: reason || 'Please review and resubmit your time card',
      duration: 6000,
      persistent: true,
      action: {
        label: 'View Details',
        onClick: () => console.log('View rejected time card'),
      },
    })
  }, [toast])

  // Project toasts
  const projectCreated = useCallback((projectName: string) => {
    return toast.success('Project created', {
      description: `${projectName} has been added to your projects`,
      duration: 3000,
    })
  }, [toast])

  const projectDeleted = useCallback((projectName: string) => {
    return toast.info('Project deleted', {
      description: `${projectName} has been removed from your projects`,
      duration: 3000,
    })
  }, [toast])

  // Theme toasts
  const themeChanged = useCallback((theme: string) => {
    return toast.info('Theme changed', {
      description: `Switched to ${theme} mode`,
      duration: 2000,
      icon: '🎨',
    })
  }, [toast])

  // Data export/import toasts
  const exportSuccess = useCallback((filename: string) => {
    return toast.success('Data exported', {
      description: `Your data has been exported to ${filename}`,
      duration: 4000,
      action: {
        label: 'Download',
        onClick: () => console.log('Download exported file'),
      },
    })
  }, [toast])

  const importSuccess = useCallback((count: number) => {
    return toast.success('Data imported', {
      description: `${count} records have been imported successfully`,
      duration: 4000,
    })
  }, [toast])

  const importError = useCallback((error: string) => {
    return toast.error('Import failed', {
      description: error,
      duration: 6000,
      persistent: true,
    })
  }, [toast])

  // Form validation toasts
  const formError = useCallback((errors: string[]) => {
    return toast.error('Please fix the errors', {
      description: errors.join('. '),
      duration: 5000,
    })
  }, [toast])

  const formSuccess = useCallback((message: string) => {
    return toast.success('Success', {
      description: message,
      duration: 3000,
    })
  }, [toast])

  // Network status toasts
  const onlineStatus = useCallback((isOnline: boolean) => {
    if (isOnline) {
      return toast.success('Connection restored', {
        description: 'You\'re back online',
        duration: 3000,
        icon: '🌐',
      })
    } else {
      return toast.warning('Connection lost', {
        description: 'You\'re currently offline. Some features may be unavailable.',
        duration: 8000,
        persistent: true,
        icon: '⚠️',
      })
    }
  }, [toast])

  // Auto-save toasts
  const autoSave = useCallback(() => {
    return toast.info('Auto-saved', {
      description: 'Your work has been saved automatically',
      duration: 2000,
    })
  }, [toast])

  // Security toasts
  const sessionExpiring = useCallback((minutes: number) => {
    return toast.warning('Session expiring soon', {
      description: `Your session will expire in ${minutes} minutes. Please save your work.`,
      duration: 10000,
      persistent: true,
      sound: true,
      browserNotification: true,
      action: {
        label: 'Extend Session',
        onClick: () => console.log('Extend session'),
      },
    })
  }, [toast])

  const loginSuccess = useCallback((username: string) => {
    return toast.success('Welcome back!', {
      description: `Logged in as ${username}`,
      duration: 3000,
      icon: '🔐',
    })
  }, [toast])

  const logoutSuccess = useCallback(() => {
    return toast.info('Logged out', {
      description: 'You have been logged out successfully',
      duration: 3000,
      icon: '👋',
    })
  }, [toast])

  // Collaboration toasts
  const collaboratorJoined = useCallback((name: string) => {
    return toast.info('Collaborator joined', {
      description: `${name} is now viewing this time card`,
      duration: 4000,
      icon: '👥',
    })
  }, [toast])

  const collaboratorLeft = useCallback((name: string) => {
    return toast.info('Collaborator left', {
      description: `${name} is no longer viewing this time card`,
      duration: 3000,
    })
  }, [toast])

  const timeCardUpdated = useCallback((name: string) => {
    return toast.info('Time card updated', {
      description: `${name} made changes to this time card`,
      duration: 4000,
      icon: '📝',
    })
  }, [toast])

  return {
    // Time tracking
    clockInSuccess,
    clockOutSuccess,
    clockInError,
    clockOutError,
    breakStarted,
    breakEnded,
    breakWarning,
    eyeCareReminder,

    // Time cards
    timeCardSubmitted,
    timeCardApproved,
    timeCardRejected,
    projectCreated,
    projectDeleted,

    // UI/UX
    themeChanged,
    formError,
    formSuccess,
    autoSave,

    // Data operations
    exportSuccess,
    importSuccess,
    importError,

    // Network and sessions
    onlineStatus,
    sessionExpiring,
    loginSuccess,
    logoutSuccess,

    // Collaboration
    collaboratorJoined,
    collaboratorLeft,
    timeCardUpdated,

    // Access to original toast methods
    ...toast,
  }
}