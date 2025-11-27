// VC Time Tracker Data Models - Based on Detailed Requirements

export interface User {
  id: number
  name: string
  email: string
  role: "boss" | "employee"
  profilePhoto?: string | null
}

export interface ShortBreak {
  start: string // ISO string
  end?: string | null // ISO string, null if ongoing
}

export interface TimeEntry {
  id: number
  userId: number
  date: string // "YYYY-MM-DD" format
  clockIn: string // ISO string
  clockOut?: string | null // ISO string, null if still clocked in
  lunchBreakStart?: string | null // ISO string
  lunchBreakEnd?: string | null // ISO string
  shortBreaks: ShortBreak[]
  totalHours?: number | null // calculated on clock out
  status: "clocked_in" | "clocked_out" | "on_lunch" | "on_break"
}

export interface UserPreferences {
  userId: number
  eyeCareEnabled: boolean
  eyeCareInterval: number // minutes
  lastReminderTime?: string // ISO string
}

export interface QuickStats {
  hoursToday: string // "6h 30m"
  hoursThisWeek: string // "32h 15m"
  status: "Clocked In" | "On Break" | "Clocked Out"
  teamActive: string // "2/3 Active"
  statusColor: "green" | "orange" | "gray"
}

export interface TimerState {
  isRunning: boolean
  startTime: number | null
  elapsed: number
  pausedTime: number
}

// Hardcoded users as specified in requirements
export const HARD_CODED_USERS: User[] = [
  {
    id: 1,
    name: "Maria Villanueva",
    email: "maria@vc.com",
    role: "boss",
    profilePhoto: null
  },
  {
    id: 2,
    name: "Carlos Villanueva",
    email: "carlos@vc.com",
    role: "boss",
    profilePhoto: null
  },
  {
    id: 3,
    name: "Larina Villanueva",
    email: "larina@vc.com",
    role: "employee",
    profilePhoto: null
  }
]

// Current logged-in user (Larina by default as specified)
export const DEFAULT_CURRENT_USER_ID = 3

// Sample time entries for testing
export const SAMPLE_TIME_ENTRIES: TimeEntry[] = [
  // Maria - Completed day
  {
    id: 1,
    userId: 1,
    date: "2025-11-11",
    clockIn: "2025-11-11T08:30:00.000Z",
    clockOut: "2025-11-11T17:00:00.000Z",
    lunchBreakStart: "2025-11-11T12:30:00.000Z",
    lunchBreakEnd: "2025-11-11T13:30:00.000Z",
    shortBreaks: [
      { start: "2025-11-11T15:00:00.000Z", end: "2025-11-11T15:10:00.000Z" }
    ],
    totalHours: 7.33,
    status: "clocked_out"
  },
  // Carlos - Currently clocked in
  {
    id: 2,
    userId: 2,
    date: "2025-11-11",
    clockIn: "2025-11-11T09:00:00.000Z",
    clockOut: null,
    lunchBreakStart: "2025-11-11T12:00:00.000Z",
    lunchBreakEnd: "2025-11-11T13:00:00.000Z",
    shortBreaks: [],
    totalHours: null,
    status: "clocked_in"
  },
  // Larina - Clocked out
  {
    id: 3,
    userId: 3,
    date: "2025-11-11",
    clockIn: "2025-11-11T09:00:00.000Z",
    clockOut: "2025-11-11T17:30:00.000Z",
    lunchBreakStart: "2025-11-11T13:00:00.000Z",
    lunchBreakEnd: "2025-11-11T14:00:00.000Z",
    shortBreaks: [
      { start: "2025-11-11T15:30:00.000Z", end: "2025-11-11T15:45:00.000Z" }
    ],
    totalHours: 7.25,
    status: "clocked_out"
  }
]