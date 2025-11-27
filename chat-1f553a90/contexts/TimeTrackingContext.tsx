'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  TimeTrackingEntry,
  TimeStats,
  WeeklyReport,
  MonthlyReport,
  clockIn,
  clockOut,
  startLunchBreak,
  endLunchBreak,
  startShortBreak,
  endShortBreak,
  getTodayTimeEntry,
  getTimeStats,
  getWeeklyReport,
  getMonthlyReport,
  getAllUsersTimeStats,
  timeTracker,
  TimeTrackingStatus
} from '@/lib/timeTracking';

interface TimeTrackingContextType {
  // Current user time entry
  todayEntry: TimeTrackingEntry | null;
  timeStats: TimeStats;

  // Actions
  handleClockIn: () => Promise<{ success: boolean; error?: string }>;
  handleClockOut: () => Promise<{ success: boolean; error?: string }>;
  handleStartLunchBreak: () => Promise<{ success: boolean; error?: string }>;
  handleEndLunchBreak: () => Promise<{ success: boolean; error?: string }>;
  handleStartShortBreak: () => Promise<{ success: boolean; error?: string }>;
  handleEndShortBreak: () => Promise<{ success: boolean; error?: string }>;

  // Live timer
  currentSessionDuration: string;
  liveHoursToday: number;

  // Reports
  getWeeklyReportData: (weekStart: string) => WeeklyReport;
  getMonthlyReportData: (month: string) => MonthlyReport;

  // Refresh function
  refreshTimeData: () => void;

  // Loading states
  isLoading: boolean;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};

interface TimeTrackingProviderProps {
  children: ReactNode;
  userId: number;
}

export const TimeTrackingProvider: React.FC<TimeTrackingProviderProps> = ({ children, userId }) => {
  const [todayEntry, setTodayEntry] = useState<TimeTrackingEntry | null>(null);
  const [timeStats, setTimeStats] = useState<TimeStats>({
    todayHours: 0,
    weekHours: 0,
    monthHours: 0,
    currentStatus: 'not_started',
    isClockedIn: false,
    currentSessionStart: null,
  });
  const [currentSessionDuration, setCurrentSessionDuration] = useState<string>('00:00:00');
  const [liveHoursToday, setLiveHoursToday] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh all time data
  const refreshTimeData = useCallback(() => {
    try {
      const entry = getTodayTimeEntry(userId);
      const stats = getTimeStats(userId);

      setTodayEntry(entry);
      setTimeStats(stats);

      if (entry && entry.clockIn) {
        setLiveHoursToday(timeTracker.calculateHours(entry));
      }
    } catch (error) {
      console.error('Failed to refresh time data:', error);
    }
  }, [userId]);

  // Initial data load
  useEffect(() => {
    setIsLoading(true);
    refreshTimeData();
    setIsLoading(false);
  }, [refreshTimeData]);

  // Live timer effect
  useEffect(() => {
    if (!todayEntry?.clockIn || todayEntry.status === 'clocked_out') {
      setCurrentSessionDuration('00:00:00');
      return;
    }

    const updateTimer = () => {
      if (todayEntry.clockIn) {
        const now = new Date();
        const clockInTime = new Date(todayEntry.clockIn);
        const diff = now.getTime() - clockInTime.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCurrentSessionDuration(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );

        // Update live hours
        const liveEntry = getTodayTimeEntry(userId);
        if (liveEntry) {
          setLiveHoursToday(timeTracker.calculateHours(liveEntry));
        }
      }
    };

    // Update immediately
    updateTimer();

    // Set up interval for live updates
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [todayEntry, userId]);

  const handleClockIn = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const entry = clockIn(userId);
      setTodayEntry(entry);
      setTimeStats(getTimeStats(userId));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clock in';
      console.error('Clock in error:', error);
      return { success: false, error: errorMessage };
    }
  };

  const handleClockOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const entry = clockOut(userId);
      setTodayEntry(entry);
      setTimeStats(getTimeStats(userId));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clock out';
      console.error('Clock out error:', error);
      return { success: false, error: errorMessage };
    }
  };

  const handleStartLunchBreak = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const entry = startLunchBreak(userId);
      setTodayEntry(entry);
      setTimeStats(getTimeStats(userId));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start lunch break';
      console.error('Start lunch break error:', error);
      return { success: false, error: errorMessage };
    }
  };

  const handleEndLunchBreak = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const entry = endLunchBreak(userId);
      setTodayEntry(entry);
      setTimeStats(getTimeStats(userId));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end lunch break';
      console.error('End lunch break error:', error);
      return { success: false, error: errorMessage };
    }
  };

  const handleStartShortBreak = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const entry = startShortBreak(userId);
      setTodayEntry(entry);
      setTimeStats(getTimeStats(userId));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start short break';
      console.error('Start short break error:', error);
      return { success: false, error: errorMessage };
    }
  };

  const handleEndShortBreak = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const entry = endShortBreak(userId);
      setTodayEntry(entry);
      setTimeStats(getTimeStats(userId));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end short break';
      console.error('End short break error:', error);
      return { success: false, error: errorMessage };
    }
  };

  const getWeeklyReportData = (weekStart: string): WeeklyReport => {
    return getWeeklyReport(userId, weekStart);
  };

  const getMonthlyReportData = (month: string): MonthlyReport => {
    return getMonthlyReport(userId, month);
  };

  const value: TimeTrackingContextType = {
    todayEntry,
    timeStats,
    handleClockIn,
    handleClockOut,
    handleStartLunchBreak,
    handleEndLunchBreak,
    handleStartShortBreak,
    handleEndShortBreak,
    currentSessionDuration,
    liveHoursToday,
    getWeeklyReportData,
    getMonthlyReportData,
    refreshTimeData,
    isLoading,
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

// Hook for getting all users' time stats (useful for admins/bosses)
export const useAllUsersTimeStats = () => {
  const [allStats, setAllStats] = useState<Map<number, TimeStats>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const refreshAllStats = useCallback(() => {
    setIsLoading(true);
    try {
      const stats = getAllUsersTimeStats();
      setAllStats(stats);
    } catch (error) {
      console.error('Failed to get all users time stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllStats();
  }, [refreshAllStats]);

  return { allStats, refreshAllStats, isLoading };
};