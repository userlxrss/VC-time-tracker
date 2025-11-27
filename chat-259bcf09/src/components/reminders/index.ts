/**
 * Reminder System Index
 * Exports all reminder components and utilities
 */

export { ReminderProvider, useReminderContext } from './reminder-provider'
export { EyeCareModal } from './eye-care-modal'
export { ReminderSettings } from './reminder-settings'
export { ReminderIntegration, withReminders } from './reminder-integration'
export { ReminderDemo } from './reminder-demo'

// Re-export hook for direct usage
export { useReminders } from '@/src/hooks/useReminders'

// Re-export storage utilities
export { ReminderStorage } from '@/src/utils/reminderStorage'

// Re-export types
export type { ReminderPreferences, ReminderStatus } from '@/src/types/reminder'