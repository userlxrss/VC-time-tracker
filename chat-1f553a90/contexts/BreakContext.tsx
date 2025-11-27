'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { BreakSession, BreakStats, BreakContextType, BreakState } from '@/lib/break-types';

const BreakContext = createContext<BreakContextType | undefined>(undefined);

export const useBreak = () => {
  const context = useContext(BreakContext);
  if (context === undefined) {
    throw new Error('useBreak must be used within a BreakProvider');
  }
  return context;
};

interface BreakProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'vc-break-sessions';
const ACTIVE_BREAK_KEY = 'vc-active-break';

export const BreakProvider: React.FC<BreakProviderProps> = ({ children }) => {
  // Mock user data for demo purposes - memoized to prevent recreation
  const mockUser = useMemo(() => ({ id: 'demo-user-id', name: 'Demo User' }), []);
  const [state, setState] = useState<BreakState>({
    sessions: [],
    stats: {
      totalBreaksToday: 0,
      totalBreakTimeToday: 0,
      lunchBreakTaken: false,
      shortBreaksToday: 0,
    },
    isLoading: true,
    isOnBreak: false,
    breakTimer: 0,
  });

  // Helper function to recalculate stats - declared early for proper dependency resolution
  const recalculateStats = useCallback((sessions: BreakSession[], currentActiveBreak?: BreakSession) => {
    const today = new Date().toISOString().split('T')[0];
    const todaysSessions = sessions.filter(session => session.date === today);

    const stats: BreakStats = {
      totalBreaksToday: todaysSessions.length,
      totalBreakTimeToday: todaysSessions.reduce((sum, session) => sum + (session.duration || 0), 0),
      lunchBreakTaken: todaysSessions.some(session => session.type === 'lunch'),
      shortBreaksToday: todaysSessions.filter(session => session.type === 'short').length,
      currentActiveBreak,
    };

    return stats;
  }, []);

  // Save break sessions to localStorage - declared early for dependency resolution
  const saveBreakData = useCallback((sessions: BreakSession[], activeBreak?: BreakSession) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      if (activeBreak) {
        localStorage.setItem(ACTIVE_BREAK_KEY, JSON.stringify(activeBreak));
      } else {
        localStorage.removeItem(ACTIVE_BREAK_KEY);
      }
    } catch (error) {
      console.error('Failed to save break data:', error);
    }
  }, []);

  // Load break sessions from localStorage
  useEffect(() => {
    if (!mockUser) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const loadBreakData = () => {
      try {
        const storedSessions = localStorage.getItem(STORAGE_KEY);
        const activeBreakData = localStorage.getItem(ACTIVE_BREAK_KEY);

        let sessions: BreakSession[] = storedSessions ? JSON.parse(storedSessions) : [];
        let currentActiveBreak: BreakSession | undefined;

        // Handle active break from previous session
        if (activeBreakData) {
          const activeBreak = JSON.parse(activeBreakData);
          if (activeBreak.userId === mockUser.id) {
            // Check if break is still valid (not too old)
            const now = new Date();
            const breakStart = new Date(activeBreak.startTime);
            const hoursSinceStart = (now.getTime() - breakStart.getTime()) / (1000 * 60 * 60);

            if (hoursSinceStart < 24) { // Break is still valid if less than 24 hours old
              currentActiveBreak = {
                ...activeBreak,
                startTime: new Date(activeBreak.startTime),
                endTime: activeBreak.endTime ? new Date(activeBreak.endTime) : undefined,
              };

              // Calculate remaining time
              if (currentActiveBreak.isActive && currentActiveBreak.type === 'short') {
                const elapsed = (now.getTime() - breakStart.getTime()) / 1000; // seconds
                const totalDuration = currentActiveBreak.duration || 0;
                const remaining = Math.max(0, (totalDuration * 60) - elapsed);

                setState(prev => ({
                  ...prev,
                  isOnBreak: true,
                  breakTimer: Math.floor(remaining),
                  currentActiveBreak,
                }));
              }
            }
          }
        }

        // Convert date strings back to Date objects and filter by user
        sessions = sessions
          .filter(session => session.userId === mockUser.id)
          .map(session => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : undefined,
          }));

        const stats = recalculateStats(sessions, currentActiveBreak);

        setState(prev => ({
          ...prev,
          sessions,
          stats,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Failed to load break data:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadBreakData();
  }, [mockUser, recalculateStats]);

  // Timer effect for break countdown
  useEffect(() => {
    if (!state.isOnBreak || state.breakTimer <= 0) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.breakTimer <= 1) {
          // Break ended automatically
          if (prev.currentActiveBreak?.type === 'short') {
            const endTime = new Date();
            const duration = Math.round((endTime.getTime() - prev.currentActiveBreak.startTime.getTime()) / (1000 * 60));

            const updatedSessions = prev.sessions.map(session =>
              session.id === prev.currentActiveBreak?.id
                ? { ...session, endTime, duration, isActive: false }
                : session
            );

            const updatedStats = recalculateStats(updatedSessions);

            // Clean up any paused break data
            localStorage.removeItem('vc-paused-break');
            saveBreakData(updatedSessions, undefined);

            return {
              ...prev,
              breakTimer: 0,
              isOnBreak: false,
              currentActiveBreak: undefined,
              sessions: updatedSessions,
              stats: updatedStats,
            };
          }
          return { ...prev, breakTimer: 0, isOnBreak: false };
        }
        return { ...prev, breakTimer: prev.breakTimer - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isOnBreak, state.breakTimer, recalculateStats, saveBreakData]);

  const createBreakSession = useCallback((type: 'lunch' | 'short', duration?: number): BreakSession => {
    if (!mockUser) throw new Error('User not authenticated');

    const now = new Date();
    return {
      id: `break-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId: mockUser.id,
      type,
      startTime: now,
      duration,
      isActive: true,
      date: now.toISOString().split('T')[0],
    };
  }, [mockUser]);

  const updateBreakSession = useCallback((sessionId: string, updates: Partial<BreakSession>) => {
    setState(prev => {
      const updatedSessions = prev.sessions.map(session =>
        session.id === sessionId ? { ...session, ...updates } : session
      );

      const updatedActiveBreak = prev.currentActiveBreak?.id === sessionId
        ? { ...prev.currentActiveBreak, ...updates }
        : prev.currentActiveBreak;

      saveBreakData(updatedSessions, updatedActiveBreak);

      return {
        ...prev,
        sessions: updatedSessions,
        currentActiveBreak: updatedActiveBreak,
      };
    });
  }, [saveBreakData]);

  const startLunchBreak = useCallback(async (description?: string) => {
    if (!mockUser) throw new Error('User not authenticated');

    setState(prev => {
      // Check if user is already on a break
      if (prev.isOnBreak) {
        throw new Error('Already on a break');
      }

      // Check if lunch break already taken today
      if (prev.stats.lunchBreakTaken) {
        throw new Error('Lunch break already taken today');
      }

      const session = createBreakSession('lunch');
      if (description) {
        session.description = description;
      }

      saveBreakData([...prev.sessions, session], session);

      return {
        ...prev,
        sessions: [...prev.sessions, session],
        isOnBreak: true,
        currentActiveBreak: session,
      };
    });
  }, [mockUser, createBreakSession, saveBreakData]);

  const endLunchBreak = useCallback(async () => {
    setState(prev => {
      if (!prev.currentActiveBreak || prev.currentActiveBreak.type !== 'lunch') {
        throw new Error('No active lunch break');
      }

      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - prev.currentActiveBreak.startTime.getTime()) / (1000 * 60));

      const updatedSessions = prev.sessions.map(session =>
        session.id === prev.currentActiveBreak?.id
          ? { ...session, endTime, duration, isActive: false }
          : session
      );

      const updatedStats = recalculateStats(updatedSessions);
      saveBreakData(updatedSessions, undefined);

      return {
        ...prev,
        isOnBreak: false,
        breakTimer: 0,
        currentActiveBreak: undefined,
        sessions: updatedSessions,
        stats: updatedStats,
      };
    });
  }, [recalculateStats, saveBreakData]);

  const startShortBreak = useCallback(async (duration: number, description?: string) => {
    if (!mockUser) throw new Error('User not authenticated');

    setState(prev => {
      if (prev.isOnBreak) {
        throw new Error('Already on a break');
      }

      const session = createBreakSession('short', duration);
      if (description) {
        session.description = description;
      }

      saveBreakData([...prev.sessions, session], session);

      return {
        ...prev,
        sessions: [...prev.sessions, session],
        isOnBreak: true,
        breakTimer: duration * 60,
        currentActiveBreak: session,
      };
    });
  }, [mockUser, createBreakSession, saveBreakData]);

  const pauseShortBreak = useCallback(async () => {
    setState(prev => {
      if (!prev.currentActiveBreak || prev.currentActiveBreak.type !== 'short' || !prev.isOnBreak) {
        throw new Error('No active short break to pause');
      }

      // Store pause state in localStorage
      const pauseData = {
        sessionId: prev.currentActiveBreak.id,
        pausedAt: new Date().toISOString(),
        remainingTime: prev.breakTimer,
      };

      localStorage.setItem('vc-paused-break', JSON.stringify(pauseData));

      return { ...prev, isOnBreak: false };
    });
  }, []);

  const resumeShortBreak = useCallback(async () => {
    const pauseDataStr = localStorage.getItem('vc-paused-break');
    if (!pauseDataStr) {
      throw new Error('No paused break found');
    }

    try {
      const { sessionId, remainingTime } = JSON.parse(pauseDataStr);

      setState(prev => {
        const session = prev.sessions.find(s => s.id === sessionId);
        if (!session) {
          throw new Error('Break session not found');
        }

        localStorage.removeItem('vc-paused-break');

        return {
          ...prev,
          isOnBreak: true,
          breakTimer: remainingTime,
          currentActiveBreak: session,
        };
      });
    } catch (error) {
      console.error('Failed to resume break:', error);
      localStorage.removeItem('vc-paused-break');
      throw error;
    }
  }, []);

  const endShortBreak = useCallback(async () => {
    setState(prev => {
      if (!prev.currentActiveBreak || prev.currentActiveBreak.type !== 'short') {
        throw new Error('No active short break');
      }

      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - prev.currentActiveBreak.startTime.getTime()) / (1000 * 60));

      const updatedSessions = prev.sessions.map(session =>
        session.id === prev.currentActiveBreak?.id
          ? { ...session, endTime, duration, isActive: false }
          : session
      );

      const updatedStats = recalculateStats(updatedSessions);

      // Clean up any paused break data
      localStorage.removeItem('vc-paused-break');
      saveBreakData(updatedSessions, undefined);

      return {
        ...prev,
        isOnBreak: false,
        breakTimer: 0,
        currentActiveBreak: undefined,
        sessions: updatedSessions,
        stats: updatedStats,
      };
    });
  }, [recalculateStats, saveBreakData]);

  const skipBreak = useCallback(async () => {
    setState(prev => {
      if (!prev.currentActiveBreak) {
        throw new Error('No active break to skip');
      }

      if (prev.currentActiveBreak.type === 'lunch') {
        endLunchBreak();
      } else {
        endShortBreak();
      }

      return prev; // No state change, the actual change happens in the end functions
    });
  }, [endLunchBreak, endShortBreak]);

  const getTodaysBreaks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.sessions.filter(session => session.date === today);
  }, [state.sessions]);

  const getBreaksHistory = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return state.sessions
      .filter(session => new Date(session.date) >= cutoffDate)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [state.sessions]);

  const exportBreakData = useCallback(() => {
    return JSON.stringify({
      sessions: state.sessions,
      stats: state.stats,
      exportedAt: new Date().toISOString(),
      userId: mockUser?.id,
    }, null, 2);
  }, [state.sessions, state.stats, mockUser?.id]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo((): BreakContextType => ({
    ...state,
    startLunchBreak,
    endLunchBreak,
    startShortBreak,
    pauseShortBreak,
    resumeShortBreak,
    endShortBreak,
    skipBreak,
    getTodaysBreaks,
    getBreaksHistory,
    exportBreakData,
  }), [
    state,
    startLunchBreak,
    endLunchBreak,
    startShortBreak,
    pauseShortBreak,
    resumeShortBreak,
    endShortBreak,
    skipBreak,
    getTodaysBreaks,
    getBreaksHistory,
    exportBreakData,
  ]);

  return (
    <BreakContext.Provider value={value}>
      {children}
    </BreakContext.Provider>
  );
};