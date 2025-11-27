/**
 * Main entry point for VC Time Tracker
 * Exports all core functionality
 */

// Types
export * from './types';

// Utils
export * from './utils/localStorage';
export * from './utils/timeCalculations';
export * from './utils/dateUtils';

// Services
export * from './services/timeEntryService';
export * from './services/userService';

// Re-export commonly used items for convenience
export {
  // Core types
  TimeEntry,
  UserProfile,
  UserPreferences,
  TimeEntryStatus,
  UserRole,
  Permission,
  BreakType,

  // Hardcoded data
  HARDCODED_USERS,
  DEFAULT_CURRENT_USER_ID,

  // Storage classes
  TimeEntryStorage,
  UserPreferencesStorage,
  CurrentUserStorage,

  // Service classes
  TimeEntryService,
  UserService,

  // Utility classes
  TimeCalculator,
  DateUtils
} from './types';

/**
 * Initialize the VC Time Tracker system
 * Call this once when your application starts
 */
export const initializeVCTimeTracker = (): void => {
  // Initialize storage
  const { initializeStorage } = require('./utils/localStorage');
  initializeStorage();

  // Initialize user service
  const { UserService } = require('./services/userService');
  UserService.initialize();

  // Configure time entry service
  const { TimeEntryService } = require('./services/timeEntryService');
  TimeEntryService.configure({
    autoSave: true,
    validateOnSave: true,
    enableBusinessRuleValidation: true
  });

  console.log('VC Time Tracker initialized successfully');
};

/**
 * Get system health status
 */
export const getSystemHealth = (): {
  storage: { available: boolean; size: any };
  users: { total: number; active: number };
  currentSession: { user: string; valid: boolean };
} => {
  const { DataMigration } = require('./utils/localStorage');
  const { UserService } = require('./services/userService');

  const storage = DataMigration.getStorageSize();
  const userStats = UserService.getUserStatistics();
  const session = UserService.getCurrentSession();

  return {
    storage: {
      available: storage.available > 0,
      size: storage
    },
    users: {
      total: userStats.totalUsers,
      active: userStats.activeUsers
    },
    currentSession: {
      user: session.user.fullName,
      valid: UserService.validateSession(session)
    }
  };
};