/**
 * Time Tracking React Hooks
 *
 * Comprehensive React hooks for time tracking functionality with
 * real-time updates, error handling, and optimistic UI updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { TimeEntry, TimeEntryStatus, BreakPeriod, User } from '../database-schema';
import { timeEntryManager } from '../lib/timeTracking/timeEntryManager';
import { breakManager } from '../lib/breaks/breakManager';
import { notificationManager } from '../lib/notifications/notificationManager';
import { overtimeCalculator, DailyWorkSummary } from '../lib/analytics/overtimeCalculator';
import { manilaTime } from '../lib/utils/manilaTime';
import { localStorageManager } from '../lib/storage/localStorageManager';
import { errorHandler } from '../lib/errors/errorHandler';

/**
 * Time tracking state
 */
export interface TimeTrackingState {
  user: User | null;
  activeEntry: TimeEntry | null;
  isClockedIn: boolean;
  isOnBreak: boolean;
  currentBreakType: BreakPeriod['type'] | null;
  todayProgress: DailyWorkSummary | null;
  projectedFinishTime: Date | null;
  notifications: any[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Clock in hook return type
 */
export interface UseTimeTrackingReturn extends TimeTrackingState {
  // Clock in/out operations
  clockIn: (notes?: string) => Promise<void>;
  clockOut: () => Promise<void>;

  // Break operations
  startBreak: (type: BreakPeriod['type']) => Promise<void>;
  endBreak: () => Promise<void>;

  // Data operations
  refreshData: () => Promise<void>;
  getWeeklyProgress: () => Promise<any>;
  getMonthlyProgress: () => Promise<any>;

  // Utility operations
  clearError: () => void;
  formatDate: (date: Date, format?: string) => string;
  formatDuration: (hours: number) => string;
}

/**
 * Main time tracking hook
 */
export function useTimeTracking(userId?: string): UseTimeTrackingReturn {
  const [state, setState] = useState<TimeTrackingState>({
    user: null,
    activeEntry: null,
    isClockedIn: false,
    isOnBreak: false,
    currentBreakType: null,
    todayProgress: null,
    projectedFinishTime: null,
    notifications: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  const isMounted = useRef(true);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const syncChannel = useRef<BroadcastChannel | null>(null);

  // Update state helper
  const updateState = useCallback((updates: Partial<TimeTrackingState>) => {
    if (isMounted.current) {
      setState(prev => ({ ...prev, ...updates, lastUpdated: new Date() }));
    }
  }, []);

  // Error handler
  const handleError = useCallback(async (error: Error) => {
    console.error('Time tracking error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    updateState({ error: message });

    try {
      await errorHandler.handleError(error, userId);
    } catch (handlerError) {
      console.error('Error handler failed:', handlerError);
    }
  }, [userId, updateState]);

  // Load initial data
  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      updateState({ isLoading: true, error: null });

      // Load user session
      const user = localStorageManager.getUserSession();
      if (!user) {
        updateState({ isLoading: false });
        return;
      }

      // Load active time entry
      const activeEntry = await timeEntryManager.findActiveEntry(userId);

      // Check if on break
      const isOnBreak = activeEntry ? breakManager.isOnBreak(activeEntry.breaks) : false;
      const currentBreakType = isOnBreak ? breakManager.getCurrentBreakType(activeEntry!.breaks) : null;

      // Load today's progress
      const allEntries = await timeEntryManager.findByUserId(userId, {
        startDate: manilaTime.startOfDay(manilaTime.now()),
        endDate: manilaTime.endOfDay(manilaTime.now())
      });

      const todayProgress = await overtimeCalculator.getTodayProgress(userId, allEntries);

      // Calculate projected finish time
      const projectedFinishTime = activeEntry && todayProgress
        ? await timeEntryManager.getProjectedCompletionTime(userId)
        : null;

      // Load notifications
      const notifications = await notificationManager.findByUserId(userId, { limit: 5 });

      updateState({
        user,
        activeEntry,
        isClockedIn: !!activeEntry,
        isOnBreak,
        currentBreakType,
        todayProgress,
        projectedFinishTime,
        notifications,
        isLoading: false
      });

    } catch (error) {
      await handleError(error as Error);
      updateState({ isLoading: false });
    }
  }, [userId, handleError, updateState]);

  // Setup real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    // Update every minute for progress tracking
    updateInterval.current = setInterval(async () => {
      if (state.isClockedIn && userId) {
        try {
          // Update projected finish time
          const projected = await timeEntryManager.getProjectedCompletionTime(userId);
          if (projected !== state.projectedFinishTime) {
            updateState({ projectedFinishTime: projected });
          }

          // Update today's progress
          const allEntries = await timeEntryManager.findByUserId(userId, {
            startDate: manilaTime.startOfDay(manilaTime.now()),
            endDate: manilaTime.endOfDay(manilaTime.now())
          });

          const todayProgress = await overtimeCalculator.getTodayProgress(userId, allEntries);
          if (JSON.stringify(todayProgress) !== JSON.stringify(state.todayProgress)) {
            updateState({ todayProgress });
          }
        } catch (error) {
          console.error('Real-time update error:', error);
        }
      }
    }, 60000); // Every minute

    // Setup broadcast channel for cross-tab sync
    if (typeof BroadcastChannel !== 'undefined') {
      syncChannel.current = new BroadcastChannel('hr_time_tracker');

      syncChannel.current.addEventListener('message', async (event) => {
        if (event.data.type === 'TIME_ENTRY_UPDATE') {
          await loadData(); // Reload data when changes happen in other tabs
        }
      });
    }

    // Setup storage event listeners
    const handleStorageChange = () => {
      loadData();
    };

    localStorageManager.addEventListener('activeEntryChanged', handleStorageChange);
    localStorageManager.addEventListener('notificationsChanged', handleStorageChange);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
        updateInterval.current = null;
      }

      if (syncChannel.current) {
        syncChannel.current.close();
        syncChannel.current = null;
      }

      localStorageManager.removeEventListener('activeEntryChanged', handleStorageChange);
      localStorageManager.removeEventListener('notificationsChanged', handleStorageChange);
    };
  }, [userId, state.isClockedIn, state.projectedFinishTime, state.todayProgress, loadData, updateState]);

  // Clock in function
  const clockIn = useCallback(async (notes?: string) => {
    if (!userId) {
      await handleError(new Error('User ID is required to clock in'));
      return;
    }

    try {
      updateState({ isLoading: true, error: null });

      const activeEntry = await timeEntryManager.clockIn({
        userId,
        notes
      });

      await notificationManager.success(userId, '✅ Clocked In Successfully',
        `You've clocked in at ${manilaTime.format(activeEntry.clockIn, 'hh:mm A')}`);

      // Update active entry
      const todayProgress = await overtimeCalculator.getTodayProgress(userId, [activeEntry]);

      updateState({
        activeEntry,
        isClockedIn: true,
        isOnBreak: false,
        currentBreakType: null,
        todayProgress,
        isLoading: false
      });

    } catch (error) {
      await handleError(error as Error);
      updateState({ isLoading: false });
    }
  }, [userId, handleError, updateState]);

  // Clock out function
  const clockOut = useCallback(async () => {
    if (!state.activeEntry) {
      await handleError(new Error('No active time entry to clock out'));
      return;
    }

    try {
      updateState({ isLoading: true, error: null });

      const updatedEntry = await timeEntryManager.clockOut(state.activeEntry.id);
      const clockOutTime = manilaTime.format(updatedEntry.clockOut!, 'hh:mm A');

      await notificationManager.success(userId!, '✅ Clocked Out Successfully',
        `You've clocked out at ${clockOutTime}. Total hours: ${updatedEntry.totalHours?.toFixed(2) || '0.00'}`);

      updateState({
        activeEntry: null,
        isClockedIn: false,
        isOnBreak: false,
        currentBreakType: null,
        todayProgress: state.todayProgress ? {
          ...state.todayProgress,
          clockOut: updatedEntry.clockOut,
          totalHours: updatedEntry.totalHours || 0,
          status: updatedEntry.totalHours! >= 8 ? 'complete' : 'incomplete',
          completionPercentage: ((updatedEntry.totalHours || 0) / 8) * 100
        } : null,
        isLoading: false
      });

    } catch (error) {
      await handleError(error as Error);
      updateState({ isLoading: false });
    }
  }, [state.activeEntry, state.todayProgress, userId, handleError, updateState]);

  // Start break function
  const startBreak = useCallback(async (type: BreakPeriod['type']) => {
    if (!state.activeEntry) {
      await handleError(new Error('You must be clocked in to take a break'));
      return;
    }

    try {
      updateState({ isLoading: true, error: null });

      const config = breakManager.getBreakTypeConfig(type);
      if (!config) {
        await handleError(new Error(`Invalid break type: ${type}`));
        return;
      }

      // Check if already on break
      if (breakManager.isOnBreak(state.activeEntry.breaks)) {
        await handleError(new Error('You are already on a break'));
        return;
      }

      const updatedEntry = await timeEntryManager.addBreak(state.activeEntry.id, {
        type,
        isPaid: config.isPaid
      });

      await notificationManager.info(userId!, `☕ ${config.name} Started`,
        `${config.description}. Duration: ${config.defaultDuration} minutes`);

      updateState({
        activeEntry: updatedEntry,
        isOnBreak: true,
        currentBreakType: type,
        isLoading: false
      });

    } catch (error) {
      await handleError(error as Error);
      updateState({ isLoading: false });
    }
  }, [state.activeEntry, userId, handleError, updateState]);

  // End break function
  const endBreak = useCallback(async () => {
    if (!state.activeEntry || !state.isOnBreak) {
      await handleError(new Error('No active break to end'));
      return;
    }

    try {
      updateState({ isLoading: true, error: null });

      // Find active break
      const activeBreaks = state.activeEntry.breaks.filter(b => !b.endTime);
      if (activeBreaks.length === 0) {
        await handleError(new Error('No active break found'));
        return;
      }

      const activeBreak = activeBreaks[0];
      const updatedEntry = await timeEntryManager.endBreak(state.activeEntry.id, activeBreak.id);

      const config = breakManager.getBreakTypeConfig(activeBreak.type);
      await notificationManager.success(userId!, '🏁 Break Ended',
        `${config?.name} ended. Duration: ${activeBreak.duration} minutes`);

      updateState({
        activeEntry: updatedEntry,
        isOnBreak: false,
        currentBreakType: null,
        isLoading: false
      });

    } catch (error) {
      await handleError(error as Error);
      updateState({ isLoading: false });
    }
  }, [state.activeEntry, state.isOnBreak, userId, handleError, updateState]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Get weekly progress
  const getWeeklyProgress = useCallback(async () => {
    if (!userId) return null;

    try {
      const allEntries = await timeEntryManager.findByUserId(userId, {
        startDate: manilaTime.startOfWeek(manilaTime.now()),
        endDate: manilaTime.endOfWeek(manilaTime.now())
      });

      return await overtimeCalculator.getCurrentWeekProgress(userId, allEntries);
    } catch (error) {
      await handleError(error as Error);
      return null;
    }
  }, [userId, handleError]);

  // Get monthly progress
  const getMonthlyProgress = useCallback(async () => {
    if (!userId) return null;

    try {
      const allEntries = await timeEntryManager.findByUserId(userId, {
        startDate: manilaTime.startOfMonth(manilaTime.now()),
        endDate: manilaTime.endOfMonth(manilaTime.now())
      });

      return await overtimeCalculator.getCurrentMonthProgress(userId, allEntries);
    } catch (error) {
      await handleError(error as Error);
      return null;
    }
  }, [userId, handleError]);

  // Clear error function
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Utility functions
  const formatDate = useCallback((date: Date, format: string = 'MMM DD, YYYY hh:mm A') => {
    return manilaTime.format(date, format);
  }, []);

  const formatDuration = useCallback((hours: number) => {
    return manilaTime.formatDuration(hours);
  }, []);

  // Load initial data on mount
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  // Setup real-time updates
  useEffect(() => {
    const cleanup = setupRealTimeUpdates();
    return cleanup;
  }, [setupRealTimeUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    ...state,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    refreshData,
    getWeeklyProgress,
    getMonthlyProgress,
    clearError,
    formatDate,
    formatDuration
  };
}

/**
 * Hook for time entry statistics
 */
export function useTimeEntryStats(userId?: string, period: 'today' | 'week' | 'month' = 'today') {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const entries = await timeEntryManager.findByUserId(userId);

      let dateStart: Date;
      let dateEnd: Date;

      switch (period) {
        case 'today':
          dateStart = manilaTime.startOfDay(manilaTime.now());
          dateEnd = manilaTime.endOfDay(manilaTime.now());
          break;
        case 'week':
          dateStart = manilaTime.startOfWeek(manilaTime.now());
          dateEnd = manilaTime.endOfWeek(manilaTime.now());
          break;
        case 'month':
          dateStart = manilaTime.startOfMonth(manilaTime.now());
          dateEnd = manilaTime.endOfMonth(manilaTime.now());
          break;
      }

      const periodEntries = entries.filter(entry =>
        entry.clockIn >= dateStart && entry.clockIn <= dateEnd
      );

      const statistics = await timeEntryManager.getStatistics(userId, dateStart, dateEnd);

      setStats(statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refetch: loadStats };
}

/**
 * Hook for break management
 */
export function useBreakManagement(userId?: string) {
  const [breaks, setBreaks] = useState<BreakPeriod[]>([]);
  const [activeBreak, setActiveBreak] = useState<BreakPeriod | null>(null);
  const [breakStats, setBreakStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBreaks = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const activeEntry = await timeEntryManager.findActiveEntry(userId);
      if (activeEntry) {
        setBreaks(activeEntry.breaks);
        const activeBreaks = breakManager.getActiveBreaks(activeEntry.breaks);
        setActiveBreak(activeBreaks.length > 0 ? activeBreaks[0] : null);

        const stats = breakManager.calculateBreakStatistics(activeEntry.breaks);
        setBreakStats(stats);
      } else {
        setBreaks([]);
        setActiveBreak(null);
        setBreakStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load breaks');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBreaks();
  }, [loadBreaks]);

  return { breaks, activeBreak, breakStats, loading, error, refetch: loadBreaks };
}

/**
 * Hook for notifications
 */
export function useNotifications(userId?: string, limit: number = 10) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [userNotifications, unread] = await Promise.all([
        notificationManager.findByUserId(userId, { limit }),
        notificationManager.findUnreadCount(userId)
      ]);

      setNotifications(userNotifications);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationManager.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [loadNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await notificationManager.markAllAsRead(userId);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [userId, loadNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Subscribe to notification updates
  useEffect(() => {
    const unsubscribe = notificationManager.subscribe('notification', loadNotifications);
    return unsubscribe;
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: loadNotifications
  };
}