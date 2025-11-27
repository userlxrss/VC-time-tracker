export interface BreakSession {
  id: string;
  userId: string;
  type: 'lunch' | 'short';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  description?: string;
  isActive: boolean;
  date: string; // YYYY-MM-DD format
}

export interface BreakStats {
  totalBreaksToday: number;
  totalBreakTimeToday: number; // in minutes
  lunchBreakTaken: boolean;
  shortBreaksToday: number;
  currentActiveBreak?: BreakSession;
}

export interface BreakState {
  sessions: BreakSession[];
  stats: BreakStats;
  isLoading: boolean;
  isOnBreak: boolean;
  breakTimer: number; // seconds remaining for current break
  currentActiveBreak?: BreakSession;
}

export interface BreakContextType extends BreakState {
  startLunchBreak: (description?: string) => Promise<void>;
  endLunchBreak: () => Promise<void>;
  startShortBreak: (duration: number, description?: string) => Promise<void>;
  pauseShortBreak: () => Promise<void>;
  resumeShortBreak: () => Promise<void>;
  endShortBreak: () => Promise<void>;
  skipBreak: () => Promise<void>;
  getTodaysBreaks: () => BreakSession[];
  getBreaksHistory: (days?: number) => BreakSession[];
  exportBreakData: () => string;
}