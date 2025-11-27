/**
 * Enhanced User Preferences with Reminder Settings
 * Extends the existing UserPreferences interface with eye care and reminder preferences
 */

import { UserPreferences } from '@/src/types'

export interface ReminderPreferences {
  // Eye Care Reminder Settings
  eyeCareEnabled: boolean
  eyeCareInterval: number // in minutes, default 20
  lastEyeCareReminder: string // ISO timestamp

  // Clock Out Reminder Settings
  clockOutReminderEnabled: boolean
  clockOutThreshold: number // in hours, default 10

  // General Reminder Settings
  soundEnabled: boolean
  vibrationEnabled: boolean // for mobile devices
}

export interface ExtendedUserPreferences extends UserPreferences {
  reminders: ReminderPreferences
}

// Default reminder preferences
export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  eyeCareEnabled: true,
  eyeCareInterval: 20,
  lastEyeCareReminder: '',
  clockOutReminderEnabled: true,
  clockOutThreshold: 10,
  soundEnabled: true,
  vibrationEnabled: false
}

// Eye Care Reminder Types
export enum EyeCareReminderType {
  BREAK = 'break',
  EXERCISE = 'exercise',
  HYDRATION = 'hydration'
}

// Reminder Status
export interface ReminderStatus {
  isEyeCareModalOpen: boolean
  eyeCareCountdown: number // in seconds
  lastClockOutCheck: string // ISO timestamp
  activeReminders: string[] // array of active reminder types
}