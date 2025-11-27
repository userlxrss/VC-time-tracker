/**
 * Real-time timer functions for VC Time Tracker
 */

import { TimerState, TimeEntry } from '../types';

/**
 * Timer class for managing real-time time tracking
 */
export class Timer {
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private lastPauseTime: number = 0;
  private isPaused: boolean = false;
  private callbacks: {
    onTick?: (milliseconds: number) => void;
    onPause?: () => void;
    onResume?: () => void;
    onStop?: (totalMilliseconds: number) => void;
  } = {};

  constructor() {
    // Clean up on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stop();
      });
    }
  }

  /**
   * Set callback functions for timer events
   */
  setCallbacks(callbacks: {
    onTick?: (milliseconds: number) => void;
    onPause?: () => void;
    onResume?: () => void;
    onStop?: (totalMilliseconds: number) => void;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Start the timer
   */
  start(): void {
    if (this.intervalId) return; // Already running

    this.startTime = Date.now() - this.pausedTime;
    this.pausedTime = 0;
    this.isPaused = false;

    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        const elapsed = Date.now() - this.startTime;
        this.callbacks.onTick?.(elapsed);
      }
    }, 1000); // Update every second
  }

  /**
   * Pause the timer
   */
  pause(): void {
    if (!this.intervalId || this.isPaused) return;

    this.isPaused = true;
    this.lastPauseTime = Date.now();
    this.callbacks.onPause?.();
  }

  /**
   * Resume the timer
   */
  resume(): void {
    if (!this.intervalId || !this.isPaused) return;

    const pauseDuration = Date.now() - this.lastPauseTime;
    this.pausedTime += pauseDuration;
    this.isPaused = false;
    this.callbacks.onResume?.();
  }

  /**
   * Stop the timer and return total elapsed time
   */
  stop(): number {
    if (!this.intervalId) return this.pausedTime;

    const totalElapsed = this.isPaused
      ? this.pausedTime
      : Date.now() - this.startTime;

    clearInterval(this.intervalId);
    this.intervalId = null;
    this.callbacks.onStop?.(totalElapsed);

    // Reset timer state
    this.startTime = 0;
    this.pausedTime = 0;
    this.lastPauseTime = 0;
    this.isPaused = false;

    return totalElapsed;
  }

  /**
   * Get current elapsed time in milliseconds
   */
  getElapsedTime(): number {
    if (!this.intervalId) return 0;

    return this.isPaused
      ? this.pausedTime
      : Date.now() - this.startTime;
  }

  /**
   * Get current elapsed time in minutes
   */
  getElapsedMinutes(): number {
    return Math.round(this.getElapsedTime() / (1000 * 60));
  }

  /**
   * Check if timer is running
   */
  isRunning(): boolean {
    return this.intervalId !== null && !this.isPaused;
  }

  /**
   * Check if timer is paused
   */
  isTimerPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Get formatted time string
   */
  getFormattedTime(): string {
    const elapsedMs = this.getElapsedTime();
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Timer manager for handling timer state persistence
 */
export class TimerManager {
  private timer: Timer;
  private storageKey = 'vct_timer_state';
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.timer = new Timer();
    this.loadTimerState();
    this.setupAutoSync();
  }

  /**
   * Setup automatic state synchronization
   */
  private setupAutoSync(): void {
    // Sync state every 30 seconds
    this.syncInterval = setInterval(() => {
      this.saveTimerState();
    }, 30000);
  }

  /**
   * Load timer state from localStorage
   */
  private loadTimerState(): void {
    try {
      const state = localStorage.getItem(this.storageKey);
      if (state) {
        const timerState: TimerState = JSON.parse(state);

        // Restore timer state if it was running
        if (timerState.isRunning && timerState.startTime) {
          const startTime = new Date(timerState.startTime).getTime();
          const pausedTime = timerState.pausedTime || 0;
          const currentTime = Date.now();
          const elapsed = currentTime - startTime + pausedTime;

          // Don't restore if too much time has passed (user might have closed browser)
          const maxPauseTime = 24 * 60 * 60 * 1000; // 24 hours
          if (elapsed < maxPauseTime) {
            this.timer.setCallbacks({
              onTick: (milliseconds) => {
                this.saveTimerState();
              }
            });

            // Simulate starting the timer from the previous state
            this.timer.start();
          } else {
            // Clear stale timer state
            localStorage.removeItem(this.storageKey);
          }
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Save timer state to localStorage
   */
  private saveTimerState(): void {
    try {
      const state: TimerState = {
        isRunning: this.timer.isRunning(),
        startTime: this.timer.isRunning() ? new Date() : undefined,
        pausedTime: this.timer.getElapsedTime(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }

  /**
   * Start time tracking
   */
  startClockIn(timeEntry: TimeEntry): void {
    this.timer.setCallbacks({
      onTick: (milliseconds) => {
        this.saveTimerState();
        // Update time entry in real-time if needed
        this.onTimeUpdate(milliseconds);
      },
      onStop: (totalMilliseconds) => {
        this.clearTimerState();
        this.onTimeStop(totalMilliseconds, timeEntry);
      }
    });

    this.timer.start();
    this.saveTimerState();
  }

  /**
   * Stop time tracking
   */
  stopClockOut(): number {
    const totalMilliseconds = this.timer.stop();
    this.clearTimerState();
    return totalMilliseconds;
  }

  /**
   * Handle timer updates (called every second)
   */
  private onTimeUpdate(milliseconds: number): void {
    // Dispatch custom event for UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('timerUpdate', {
        detail: {
          milliseconds,
          minutes: Math.round(milliseconds / (1000 * 60)),
          formatted: this.timer.getFormattedTime()
        }
      }));
    }
  }

  /**
   * Handle timer stop
   */
  private onTimeStop(totalMilliseconds: number, timeEntry: TimeEntry): void {
    // Dispatch custom event for timer stop
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('timerStop', {
        detail: {
          totalMilliseconds,
          minutes: Math.round(totalMilliseconds / (1000 * 60)),
          timeEntry
        }
      }));
    }
  }

  /**
   * Clear timer state from localStorage
   */
  private clearTimerState(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing timer state:', error);
    }
  }

  /**
   * Get current timer status
   */
  getStatus(): {
    isRunning: boolean;
    isPaused: boolean;
    elapsedMinutes: number;
    formattedTime: string;
  } {
    return {
      isRunning: this.timer.isRunning(),
      isPaused: this.timer.isTimerPaused(),
      elapsedMinutes: this.timer.getElapsedMinutes(),
      formattedTime: this.timer.getFormattedTime()
    };
  }

  /**
   * Pause the timer
   */
  pause(): void {
    this.timer.pause();
    this.saveTimerState();
  }

  /**
   * Resume the timer
   */
  resume(): void {
    this.timer.resume();
    this.saveTimerState();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.timer.stop();
  }
}

/**
 * Create a singleton timer manager instance
 */
export const timerManager = new TimerManager();

/**
 * Utility function to get live duration for a time entry
 */
export function getLiveDuration(timeEntry: TimeEntry): {
  totalMinutes: number;
  isLive: boolean;
  formattedDuration: string;
} {
  const now = new Date();

  if (!timeEntry.clockOut) {
    // Time entry is still active
    const totalMinutes = Math.round((now.getTime() - timeEntry.clockIn.getTime()) / (1000 * 60));
    return {
      totalMinutes,
      isLive: true,
      formattedDuration: formatDuration(totalMinutes)
    };
  }

  // Time entry is completed
  const totalMinutes = Math.round((timeEntry.clockOut.getTime() - timeEntry.clockIn.getTime()) / (1000 * 60));
  return {
    totalMinutes,
    isLive: false,
    formattedDuration: formatDuration(totalMinutes)
  };
}

/**
 * Format duration helper (re-exported from dateUtils)
 */
function formatDuration(minutes: number): string {
  if (minutes < 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculate live productivity (including current time entry)
 */
export function calculateLiveProductivity(
  currentTimeEntry: TimeEntry | null,
  breaks: any[]
): {
  currentDuration: number;
  currentBreakDuration: number;
  productiveMinutes: number;
  efficiency: number;
} {
  if (!currentTimeEntry) {
    return {
      currentDuration: 0,
      currentBreakDuration: 0,
      productiveMinutes: 0,
      efficiency: 0
    };
  }

  const liveDuration = getLiveDuration(currentTimeEntry);
  const currentDuration = liveDuration.totalMinutes;

  // Calculate active break duration for current time entry
  const activeBreaks = breaks.filter(
    b => b.timeEntryId === currentTimeEntry.id && !b.endTime
  );

  const currentBreakDuration = activeBreaks.reduce((total, breakEntry) => {
    const breakStart = new Date(breakEntry.startTime);
    const breakMinutes = Math.round((new Date().getTime() - breakStart.getTime()) / (1000 * 60));
    return total + breakMinutes;
  }, 0);

  const productiveMinutes = Math.max(0, currentDuration - currentBreakDuration);
  const efficiency = currentDuration > 0 ? Math.round((productiveMinutes / currentDuration) * 100) : 0;

  return {
    currentDuration,
    currentBreakDuration,
    productiveMinutes,
    efficiency
  };
}