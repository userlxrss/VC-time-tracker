/**
 * Premium Toast Notification Manager for VC Time Tracker
 * Provides enterprise-grade toast notifications with animations and context-aware messaging
 */

'use client'

import { toast } from 'react-hot-toast'
import { Clock, Coffee, Utensils, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { TimeEntryStatus } from '@/src/types'
import { TimeCalculator } from '@/src/utils/timeCalculations'
import { formatDuration } from '@/src/utils/timeUtils'

// Toast configuration with enterprise styling
const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: 'var(--glass-bg)',
    color: 'var(--foreground)',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
  },
  className: `
    enterprise-card
    border-l-4
    shadow-enterprise-lg
    backdrop-blur-md
    font-medium
    animate-slide-in-right
  `,
  iconTheme: {
    primary: 'rgb(var(--enterprise-primary))',
    secondary: '#ffffff',
  },
}

// Success notification styles
const successStyle = {
  ...toastConfig,
  iconTheme: {
    primary: 'rgb(var(--enterprise-success))',
    secondary: '#ffffff',
  },
  className: `${toastConfig.className} border-l-green-500`,
}

// Error notification styles
const errorStyle = {
  ...toastConfig,
  duration: 6000,
  iconTheme: {
    primary: 'rgb(var(--enterprise-error))',
    secondary: '#ffffff',
  },
  className: `${toastConfig.className} border-l-red-500`,
}

// Warning notification styles
const warningStyle = {
  ...toastConfig,
  iconTheme: {
    primary: 'rgb(var(--enterprise-warning))',
    secondary: '#ffffff',
  },
  className: `${toastConfig.className} border-l-orange-500`,
}

// Info notification styles
const infoStyle = {
  ...toastConfig,
  iconTheme: {
    primary: 'rgb(var(--enterprise-primary))',
    secondary: '#ffffff',
  },
  className: `${toastConfig.className} border-l-blue-500`,
}

// Format time worked for display
const formatTimeWorked = (clockIn: string, clockOut?: string): string => {
  try {
    if (clockOut) {
      const minutes = TimeCalculator.calculateWorkHours({ clockIn, clockOut } as any) * 60
      return formatDuration(minutes)
    } else {
      const now = new Date()
      const clockInTime = TimeCalculator.parseTime(clockIn)
      const minutes = Math.floor((now.getTime() - clockInTime.getTime()) / (1000 * 60))
      return formatDuration(minutes)
    }
  } catch {
    return '0m'
  }
}

// Main Toast Manager Class
export class ToastManager {
  // Clock in notifications
  static clockInSuccess(userName: string = 'You') {
    return toast.success(
      `${userName} clocked in successfully! Have a productive day! 🚀`,
      {
        ...successStyle,
        icon: <CheckCircle className="w-5 h-5" />,
      }
    )
  }

  static clockInError(error: string) {
    return toast.error(
      `Failed to clock in: ${error}`,
      {
        ...errorStyle,
        icon: <XCircle className="w-5 h-5" />,
      }
    )
  }

  // Clock out notifications
  static clockOutSuccess(userName: string = 'You', clockIn: string, clockOut?: string) {
    const timeWorked = formatTimeWorked(clockIn, clockOut)
    return toast.success(
      `${userName} clocked out! Worked ${timeWorked} today. Great job! 🎉`,
      {
        ...successStyle,
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 5000,
      }
    )
  }

  static clockOutError(error: string) {
    return toast.error(
      `Failed to clock out: ${error}`,
      {
        ...errorStyle,
        icon: <XCircle className="w-5 h-5" />,
      }
    )
  }

  // Lunch break notifications
  static lunchStartSuccess(userName: string = 'You') {
    return toast.success(
      `${userName} started lunch break! Enjoy your meal! 🍽️`,
      {
        ...successStyle,
        icon: <Utensils className="w-5 h-5" />,
      }
    )
  }

  static lunchEndSuccess(userName: string = 'You', lunchStart: string, lunchEnd?: string) {
    if (lunchEnd) {
      const lunchDuration = formatTimeWorked(lunchStart, lunchEnd)
      return toast.success(
        `${userName} finished lunch! Break was ${lunchDuration}. Ready to continue? 💪`,
        {
          ...successStyle,
          icon: <CheckCircle className="w-5 h-5" />,
        }
      )
    } else {
      return toast.success(
        `${userName} finished lunch break! Welcome back! 💪`,
        {
          ...successStyle,
          icon: <CheckCircle className="w-5 h-5" />,
        }
      )
    }
  }

  static lunchError(error: string) {
    return toast.error(
      `Lunch break error: ${error}`,
      {
        ...errorStyle,
        icon: <XCircle className="w-5 h-5" />,
      }
    )
  }

  // Short break notifications
  static breakStartSuccess(userName: string = 'You') {
    return toast.success(
      `${userName} started a break! Take your time! ☕`,
      {
        ...successStyle,
        icon: <Coffee className="w-5 h-5" />,
      }
    )
  }

  static breakEndSuccess(userName: string = 'You', breakStart: string, breakEnd?: string) {
    if (breakEnd) {
      const breakDuration = formatTimeWorked(breakStart, breakEnd)
      return toast.success(
        `${userName} finished their ${breakDuration} break! Welcome back! 🎯`,
        {
          ...successStyle,
          icon: <CheckCircle className="w-5 h-5" />,
        }
      )
    } else {
      return toast.success(
        `${userName} finished their break! Welcome back! 🎯`,
        {
          ...successStyle,
          icon: <CheckCircle className="w-5 h-5" />,
        }
      )
    }
  }

  static breakError(error: string) {
    return toast.error(
      `Break error: ${error}`,
      {
        ...errorStyle,
        icon: <XCircle className="w-5 h-5" />,
      }
    )
  }

  // Status change notifications
  static statusChanged(userName: string, oldStatus: TimeEntryStatus, newStatus: TimeEntryStatus) {
    const statusMessages = {
      [TimeEntryStatus.CLOCKED_IN]: 'is now working',
      [TimeEntryStatus.CLOCKED_OUT]: 'has clocked out',
      [TimeEntryStatus.ON_LUNCH]: 'is on lunch',
      [TimeEntryStatus.ON_BREAK]: 'is on a break',
      [TimeEntryStatus.NOT_STARTED]: 'has not started',
    }

    const message = `${userName} ${statusMessages[newStatus] || 'status updated'}`

    if (newStatus === TimeEntryStatus.CLOCKED_IN) {
      return toast.success(message, {
        ...infoStyle,
        icon: <Clock className="w-5 h-5" />,
      })
    } else if (newStatus === TimeEntryStatus.CLOCKED_OUT) {
      return toast.info(message, {
        ...infoStyle,
        icon: <CheckCircle className="w-5 h-5" />,
      })
    } else {
      return toast(message, {
        ...infoStyle,
        icon: <Coffee className="w-5 h-5" />,
      })
    }
  }

  // Error handling notifications
  static generalError(message: string, error?: Error) {
    const errorMessage = error ? `${message}: ${error.message}` : message
    return toast.error(errorMessage, {
      ...errorStyle,
      icon: <AlertCircle className="w-5 h-5" />,
      duration: 6000,
    })
  }

  // Warning notifications
  static validationWarning(message: string) {
    return toast(message, {
      ...warningStyle,
      icon: <AlertCircle className="w-5 h-5" />,
    })
  }

  // Info notifications
  static info(message: string) {
    return toast(message, {
      ...infoStyle,
      icon: <AlertCircle className="w-5 h-5" />,
    })
  }

  // Loading notifications
  static loading(message: string = 'Processing...') {
    return toast.loading(message, {
      ...toastConfig,
      icon: <Clock className="w-5 h-5 animate-spin" />,
    })
  }

  // Success notification for data operations
  static dataSaved(message: string = 'Changes saved successfully!') {
    return toast.success(message, {
      ...successStyle,
      icon: <CheckCircle className="w-5 h-5" />,
    })
  }

  // Welcome message
  static welcome(userName: string) {
    return toast(
      `Welcome back, ${userName}! Ready to track your time? ⏰`,
      {
        ...infoStyle,
        duration: 3000,
        icon: <Clock className="w-5 h-5" />,
      }
    )
  }

  // Daily summary notification
  static dailySummary(hoursWorked: number, goalHours: number = 8) {
    const percentage = Math.round((hoursWorked / goalHours) * 100)
    const message = hoursWorked >= goalHours
      ? `Daily goal achieved! ${hoursWorked.toFixed(1)}h worked today. Excellent work! 🏆`
      : `Daily progress: ${hoursWorked.toFixed(1)}h of ${goalHours}h goal (${percentage}%). Keep going! 💪`

    return toast(message, {
      ...successStyle,
      duration: 5000,
      icon: hoursWorked >= goalHours ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />,
    })
  }
}

// Export individual toast functions for convenience
export const {
  clockInSuccess,
  clockInError,
  clockOutSuccess,
  clockOutError,
  lunchStartSuccess,
  lunchEndSuccess,
  lunchError,
  breakStartSuccess,
  breakEndSuccess,
  breakError,
  statusChanged,
  generalError,
  validationWarning,
  info,
  loading,
  dataSaved,
  welcome,
  dailySummary,
} = ToastManager

export default ToastManager