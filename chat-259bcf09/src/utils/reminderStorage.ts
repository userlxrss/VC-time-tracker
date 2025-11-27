/**
 * Reminder Storage Utilities
 * Handles localStorage operations for reminder preferences
 */

import { ReminderPreferences, DEFAULT_REMINDER_PREFERENCES } from '@/src/types/reminder'

export const REMINDER_STORAGE_KEY = 'vctime_reminder_preferences'

export class ReminderStorage {
  /**
   * Save reminder preferences to localStorage
   */
  static saveReminderPreferences(preferences: ReminderPreferences): boolean {
    try {
      localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(preferences))
      return true
    } catch (error) {
      console.error('Error saving reminder preferences:', error)
      return false
    }
  }

  /**
   * Load reminder preferences from localStorage
   */
  static loadReminderPreferences(): ReminderPreferences {
    try {
      const stored = localStorage.getItem(REMINDER_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to ensure all properties exist
        return { ...DEFAULT_REMINDER_PREFERENCES, ...parsed }
      }
      return DEFAULT_REMINDER_PREFERENCES
    } catch (error) {
      console.error('Error loading reminder preferences:', error)
      return DEFAULT_REMINDER_PREFERENCES
    }
  }

  /**
   * Update specific reminder preferences
   */
  static updateReminderPreferences(updates: Partial<ReminderPreferences>): ReminderPreferences {
    const current = this.loadReminderPreferences()
    const updated = { ...current, ...updates }
    this.saveReminderPreferences(updated)
    return updated
  }

  /**
   * Reset reminder preferences to defaults
   */
  static resetToDefaults(): ReminderPreferences {
    this.saveReminderPreferences(DEFAULT_REMINDER_PREFERENCES)
    return DEFAULT_REMINDER_PREFERENCES
  }

  /**
   * Clear all reminder preferences
   */
  static clearReminderPreferences(): boolean {
    try {
      localStorage.removeItem(REMINDER_STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Error clearing reminder preferences:', error)
      return false
    }
  }

  /**
   * Get last eye care reminder timestamp
   */
  static getLastEyeCareReminder(): string {
    const preferences = this.loadReminderPreferences()
    return preferences.lastEyeCareReminder || ''
  }

  /**
   * Update last eye care reminder timestamp
   */
  static updateLastEyeCareReminder(timestamp: string): boolean {
    return this.updateReminderPreferences({ lastEyeCareReminder: timestamp }) !== null
  }

  /**
   * Check if eye care reminders are enabled
   */
  static isEyeCareEnabled(): boolean {
    const preferences = this.loadReminderPreferences()
    return preferences.eyeCareEnabled
  }

  /**
   * Check if clock out reminders are enabled
   */
  static isClockOutReminderEnabled(): boolean {
    const preferences = this.loadReminderPreferences()
    return preferences.clockOutReminderEnabled
  }

  /**
   * Get eye care interval in minutes
   */
  static getEyeCareInterval(): number {
    const preferences = this.loadReminderPreferences()
    return preferences.eyeCareInterval
  }

  /**
   * Get clock out reminder threshold in hours
   */
  static getClockOutThreshold(): number {
    const preferences = this.loadReminderPreferences()
    return preferences.clockOutThreshold
  }
}