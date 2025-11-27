/**
 * Time Tracking Components Index
 * Exports all time tracking components and hooks for easy import
 */

// Components
export { TimeTracker } from './time-tracker'
export { EnhancedUserCard } from './enhanced-user-card'
export { TeamDashboard } from './team-dashboard'
export { TimeTrackingDemo } from './time-tracking-demo'

// Hooks
export { useTimeTracking } from '../../hooks/useTimeTracking'
export { useTeamTimeTracking } from '../../hooks/useTeamTimeTracking'
export { useRealTimeStats } from '../../hooks/useRealTimeStats'

// Types (re-export for convenience)
export {
  TimeEntry,
  TimeEntryStatus,
  ShortBreak,
  BreakType,
  UserProfile,
  UserRole,
  TimeCalculator,
  UserService,
  TimeEntryService
} from '../../src/types'

// Utils (re-export for convenience)
export {
  TimeEntryStorage,
  UserPreferencesStorage,
  CurrentUserStorage
} from '../../src/utils/localStorage'

// Default export
export default {
  TimeTracker,
  EnhancedUserCard,
  TeamDashboard,
  TimeTrackingDemo,
  useTimeTracking,
  useTeamTimeTracking,
  useRealTimeStats
}