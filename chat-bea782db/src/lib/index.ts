/**
 * HR Time Tracking Engine - Main Export
 *
 * Comprehensive time tracking system with clock in/out functionality,
 * break management, real-time updates, and analytics.
 *
 * Features:
 * - Real-time clock in/out with Manila Time timezone
 * - Comprehensive break management (lunch, short breaks, extended breaks)
 * - Cross-tab synchronization
 * - Overtime calculation and daily progress tracking
 * - Toast notifications and real-time updates
 * - LocalStorage with data validation
 * - Error handling and recovery
 * - React hooks for easy integration
 * - Production-ready with enterprise features
 */

// Core Engine
export { TimeTrackingEngine, timeTrackingEngine } from './core/timeTrackingEngine';
export type {
  TimeTrackingEngineConfig,
  EngineStatus,
  TimeTrackingSession,
  RealTimeUpdate,
  ExportOptions
} from './core/timeTrackingEngine';

// Database Schema
export * from '../database-schema';

// Storage Management
export { LocalStorageManager, localStorageManager } from './storage/localStorageManager';

// Time Utilities
export { ManilaTimeUtilsImpl, manilaTime } from './utils/manilaTime';

// Break Management
export { BreakManager, breakManager } from './breaks/breakManager';
export type {
  BreakTypeConfig,
  BreakStatistics,
  BreakValidationResult
} from './breaks/breakManager';

// Time Entry Management
export { TimeEntryManager, timeEntryManager } from './timeTracking/timeEntryManager';
export type {
  CreateTimeEntryOptions,
  UpdateTimeEntryOptions,
  TimeEntryFilters,
  TimeEntryStatistics,
  TimeEntryValidationResult,
  DailyProgress
} from './timeTracking/timeEntryManager';

// Notification System
export { NotificationManager, notificationManager } from './notifications/notificationManager';
export type {
  ToastConfig,
  CreateNotificationOptions,
  NotificationSubscription,
  ToastState
} from './notifications/notificationManager';

// Analytics and Overtime
export { OvertimeCalculator, overtimeCalculator } from './analytics/overtimeCalculator';
export type {
  OvertimePolicy,
  DailyWorkSummary,
  WeeklyWorkSummary,
  MonthlyWorkSummary,
  WorkProgressMetrics
} from './analytics/overtimeCalculator';

// Error Handling
export {
  ErrorHandler,
  errorHandler,
  AppError,
  ValidationError,
  StorageError,
  NetworkError,
  PermissionError,
  BusinessLogicError
} from './errors/errorHandler';
export type {
  ErrorLogEntry,
  ValidationRule,
  ValidationSchema,
  ErrorHandlerConfig
} from './errors/errorHandler';
export {
  ErrorSeverity,
  ErrorCategory
} from './errors/errorHandler';

// Validation Schemas
export {
  userValidationSchema,
  timeEntryValidationSchema,
  breakPeriodValidationSchema,
  leaveRequestValidationSchema,
  salaryRecordValidationSchema,
  notificationValidationSchema,
  validationSchemas
} from './validation/schemas';
export {
  validateCanClockIn,
  validateCanClockOut,
  validateCanStartBreak,
  validateCanEndBreak,
  validateTimeEntryDuration,
  validateLeaveBalance,
  validateSalaryCalculations
} from './validation/schemas';

// React Hooks
export {
  useTimeTracking,
  useTimeEntryStats,
  useBreakManagement,
  useNotifications
} from '../hooks/useTimeTracking';
export type {
  UseTimeTrackingReturn,
  TimeTrackingState
} from '../hooks/useTimeTracking';

// ==================== QUICK START GUIDE ====================

/**
 * Quick Start Example:
 *
 * ```typescript
 * import { timeTrackingEngine, useTimeTracking } from '@/lib';
 *
 * // Initialize the engine
 * await timeTrackingEngine.initialize();
 *
 * // Set user session
 * await timeTrackingEngine.setUserSession(user);
 *
 * // Clock in
 * const timeEntry = await timeTrackingEngine.clockIn({
 *   notes: 'Starting my day!'
 * });
 *
 * // Take a break
 * await timeTrackingEngine.startBreak('lunch');
 *
 * // End break
 * await timeTrackingEngine.endBreak();
 *
 * // Clock out
 * await timeTrackingEngine.clockOut();
 *
 * // Use React hook in components
 * function TimeTracker() {
 *   const {
 *     isClockedIn,
 *     isOnBreak,
 *     activeEntry,
 *     todayProgress,
 *     clockIn,
 *     clockOut,
 *     startBreak,
 *     endBreak
 *   } = useTimeTracking();
 *
 *   return (
 *     <div>
 *       {isClockedIn ? (
 *         <button onClick={clockOut}>Clock Out</button>
 *       ) : (
 *         <button onClick={clockIn}>Clock In</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

// ==================== ENTERPRISE FEATURES ====================

/**
 * Enterprise Features Included:
 *
 * 1. **Flexible Work Philosophy**: Focus on results (8 hours), not schedules
 * 2. **Real-time Synchronization**: Cross-tab updates and broadcast channels
 * 3. **Comprehensive Validation**: Business logic rules and data integrity
 * 4. **Error Recovery**: Automatic retry and graceful degradation
 * 5. **Performance Optimized**: Efficient storage usage and cleanup
 * 6. **Production Ready**: Logging, monitoring, and analytics
 * 7. **Accessibility**: WCAG compliant components and keyboard navigation
 * 8. **Internationalization**: Manila Time support with timezone handling
 * 9. **Security**: Input validation and XSS protection
 * 10. **Scalability**: Designed for enterprise deployment
 */

// ==================== API REFERENCE ====================

/**
 * Core API:
 *
 * - `timeTrackingEngine.initialize(userId)` - Initialize the system
 * - `timeTrackingEngine.clockIn(options)` - Clock in user
 * - `timeTrackingEngine.clockOut(options)` - Clock out user
 * - `timeTrackingEngine.startBreak(type)` - Start a break
 * - `timeTrackingEngine.endBreak()` - End current break
 * - `timeTrackingEngine.getTodayProgress()` - Get today's progress
 * - `timeTrackingEngine.exportData(options)` - Export time data
 *
 * React Hooks:
 *
 * - `useTimeTracking(userId)` - Main time tracking hook
 * - `useTimeEntryStats(userId, period)` - Statistics hook
 * - `useBreakManagement(userId)` - Break management hook
 * - `useNotifications(userId)` - Notifications hook
 *
 * Utilities:
 *
 * - `manilaTime` - Manila time utilities
 * - `notificationManager` - Toast notification system
 * - `breakManager` - Break management system
 * - `errorHandler` - Error handling system
 */