export interface User {
  id: number;
  name: string;
  email: string;
  role: 'boss' | 'employee';
  profilePhoto?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Legacy time entry interface (for backward compatibility)
export interface TimeEntry {
  id: string;
  userId: number;
  project: string;
  description: string;
  hours: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeCard {
  id: string;
  userId: number;
  user: User;
  weekStartDate: string;
  entries: TimeEntry[];
  totalHours: number;
  status: 'draft' | 'submitted' | 'approved';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: number;
}

// New time tracking interfaces
export interface TimeTrackingEntry {
  id: string;
  userId: number;
  date: string; // YYYY-MM-DD format
  clockIn: string | null; // ISO timestamp
  clockOut: string | null; // ISO timestamp
  lunchBreakStart: string | null;
  lunchBreakEnd: string | null;
  shortBreaks: ShortBreak[];
  totalHours: number | null; // calculated
  status: 'clocked_in' | 'on_break' | 'clocked_out' | 'not_started';
  createdAt: string;
  updatedAt: string;
}

export interface ShortBreak {
  id: string;
  start: string; // ISO timestamp
  end: string | null;
  duration: number | null; // in minutes
}

export interface TimeStats {
  todayHours: number;
  weekHours: number;
  monthHours: number;
  currentStatus: TimeTrackingEntry['status'];
  isClockedIn: boolean;
  currentSessionStart: string | null;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  entries: TimeTrackingEntry[];
  totalHours: number;
  dailyBreakdown: Array<{
    date: string;
    hours: number;
    status: TimeTrackingEntry['status'];
  }>;
}

export interface MonthlyReport {
  month: string; // YYYY-MM format
  entries: TimeTrackingEntry[];
  totalHours: number;
  weeklyBreakdown: WeeklyReport[];
  averageDailyHours: number;
  daysWorked: number;
}

export interface UserPreferences {
  eyeCareEnabled: boolean;
  eyeCareInterval: number; // minutes
  lastReminderTime: string; // ISO timestamp
}

export interface ReminderState {
  showEyeCareModal: boolean;
  countdownSeconds: number;
  countdownActive: boolean;
}

export interface ClockInStatus {
  isClockedIn: boolean;
  clockInTime?: string; // ISO timestamp
}

export type TimeTrackingStatus = TimeTrackingEntry['status'];