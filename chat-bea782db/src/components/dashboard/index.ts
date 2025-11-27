/**
 * Dashboard Components Index
 *
 * Central exports for all dashboard components and related utilities.
 */

// Main Dashboard Components
export { default as EmployeeDashboard } from './EmployeeDashboard';
export { ManagerDashboard } from './ManagerDashboard';

// Dashboard Cards
export { default as RealTimeStatusCard } from './cards/RealTimeStatusCard';
export { default as TodayProgressCard } from './cards/TodayProgressCard';
export { default as ActivityTimelineCard } from './cards/ActivityTimelineCard';
export { default as WeeklySummaryCard } from './cards/WeeklySummaryCard';
export { default as QuickActionsCard } from './cards/QuickActionsCard';

// Dashboard Banners
export { default as FlexibleWorkBanner } from './banners/FlexibleWorkBanner';

// Re-exports for commonly used types
export type {
  DailyWorkSummary,
  WeeklyWorkSummary
} from '../../lib/analytics/overtimeCalculator';