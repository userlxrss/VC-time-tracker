import { TimeEntry, User, UserPreferences, QuickStats } from '@/types'

// localStorage keys
const STORAGE_KEYS = {
  TIME_ENTRIES: 'vcTimeEntries',
  USER_PREFERENCES: 'vcUserPreferences'
}

// Generate unique ID for time entries
export function generateId(): number {
  const entries = getTimeEntries()
  const maxId = entries.reduce((max, entry) => Math.max(max, entry.id), 0)
  return maxId + 1
}

// Format today's date as YYYY-MM-DD
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

// === TIME ENTRY OPERATIONS ===

export function saveTimeEntry(entry: TimeEntry): void {
  const entries = getTimeEntries()
  entries.push(entry)
  localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries))
}

export function getTimeEntries(): TimeEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading time entries:', error)
    return []
  }
}

export function updateTimeEntry(updatedEntry: TimeEntry): boolean {
  const entries = getTimeEntries()
  const index = entries.findIndex(e => e.id === updatedEntry.id)
  if (index !== -1) {
    entries[index] = updatedEntry
    localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries))
    return true
  }
  return false
}

export function getTodayTimeEntry(userId: number): TimeEntry | null {
  const entries = getTimeEntries()
  const today = getTodayDateString()
  return entries.find(e => e.userId === userId && e.date === today) || null
}

export function getWeekEntries(userId: number): TimeEntry[] {
  const entries = getTimeEntries()
  const startOfWeek = getMonday(new Date())
  const endOfWeek = getSunday(new Date())

  return entries.filter(e => {
    if (e.userId !== userId) return false
    const entryDate = new Date(e.date)
    return entryDate >= startOfWeek && entryDate <= endOfWeek
  })
}

export function getMonthEntries(userId: number, year: number, month: number): TimeEntry[] {
  const entries = getTimeEntries()

  return entries.filter(e => {
    if (e.userId !== userId) return false
    const entryDate = new Date(e.date)
    return entryDate.getFullYear() === year && entryDate.getMonth() === month
  })
}

// === TIME CALCULATIONS ===

export function calculateTotalHours(entry: TimeEntry): number {
  if (!entry.clockIn) return 0

  // If clocked out, use actual times
  if (entry.clockOut) {
    const workMs = new Date(entry.clockOut).getTime() - new Date(entry.clockIn).getTime()
    const lunchMs = calculateLunchBreakMs(entry)
    const shortBreaksMs = calculateShortBreaksMs(entry)
    const netWorkMs = workMs - lunchMs - shortBreaksMs
    return Math.max(0, netWorkMs / (1000 * 60 * 60))
  }

  // If still clocked in, calculate from clock in to now
  const now = new Date().getTime()
  const clockInTime = new Date(entry.clockIn).getTime()
  const workMs = now - clockInTime
  const lunchMs = calculateLunchBreakMs(entry)
  const shortBreaksMs = calculateShortBreaksMs(entry, now)

  // If currently on break, subtract ongoing break time
  let ongoingBreakMs = 0
  if (entry.status === "on_lunch" && entry.lunchBreakStart && !entry.lunchBreakEnd) {
    ongoingBreakMs = now - new Date(entry.lunchBreakStart).getTime()
  } else if (entry.status === "on_break" && entry.shortBreaks.length > 0) {
    const activeBreak = entry.shortBreaks[entry.shortBreaks.length - 1]
    if (activeBreak && !activeBreak.end) {
      ongoingBreakMs = now - new Date(activeBreak.start).getTime()
    }
  }

  const netWorkMs = workMs - lunchMs - shortBreaksMs - ongoingBreakMs
  return Math.max(0, netWorkMs / (1000 * 60 * 60))
}

export function calculateLunchBreakMs(entry: TimeEntry): number {
  if (entry.lunchBreakStart && entry.lunchBreakEnd) {
    return new Date(entry.lunchBreakEnd).getTime() - new Date(entry.lunchBreakStart).getTime()
  }
  return 0
}

export function calculateShortBreaksMs(entry: TimeEntry, currentTime?: number): number {
  let totalMs = 0
  const now = currentTime || new Date().getTime()

  entry.shortBreaks.forEach(brk => {
    if (brk.end) {
      totalMs += new Date(brk.end).getTime() - new Date(brk.start).getTime()
    } else {
      // Ongoing break
      totalMs += now - new Date(brk.start).getTime()
    }
  })

  return totalMs
}

export function formatHours(totalHours: number): string {
  if (!totalHours || totalHours <= 0) return "0h 0m"

  const hours = Math.floor(totalHours)
  const minutes = Math.round((totalHours - hours) * 60)

  return `${hours}h ${minutes}m`
}

// === DATE UTILITIES ===

export function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

export function getSunday(date: Date): Date {
  const monday = getMonday(date)
  return new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// === USER PREFERENCES ===

export function getUserPreferences(userId: number): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    const allPrefs = stored ? JSON.parse(stored) : {}

    return {
      userId,
      eyeCareEnabled: true,
      eyeCareInterval: 20,
      lastReminderTime: null,
      ...allPrefs[userId]
    }
  } catch (error) {
    console.error('Error loading user preferences:', error)
    return {
      userId,
      eyeCareEnabled: true,
      eyeCareInterval: 20,
      lastReminderTime: null
    }
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    const allPrefs = stored ? JSON.parse(stored) : {}

    allPrefs[prefs.userId] = prefs
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(allPrefs))
  } catch (error) {
    console.error('Error saving user preferences:', error)
  }
}

// === QUICK STATS CALCULATIONS ===

export function calculateQuickStats(userId: number, allUsers: User[]): QuickStats {
  const todayEntry = getTodayTimeEntry(userId)
  const weekEntries = getWeekEntries(userId)
  const monthEntries = getMonthEntries(userId, new Date().getFullYear(), new Date().getMonth())

  // Hours today
  let hoursToday = 0
  if (todayEntry) {
    hoursToday = calculateTotalHours(todayEntry)
  }

  // Hours this week
  let hoursThisWeek = 0
  weekEntries.forEach(entry => {
    if (entry.totalHours) {
      hoursThisWeek += entry.totalHours
    } else {
      hoursThisWeek += calculateTotalHours(entry)
    }
  })

  // Status
  let status: "Clocked In" | "On Break" | "Clocked Out" = "Clocked Out"
  let statusColor: "green" | "orange" | "gray" = "gray"

  if (todayEntry) {
    switch (todayEntry.status) {
      case "clocked_in":
        status = "Clocked In"
        statusColor = "green"
        break
      case "on_lunch":
      case "on_break":
        status = "On Break"
        statusColor = "orange"
        break
      case "clocked_out":
        status = "Clocked Out"
        statusColor = "gray"
        break
    }
  }

  // Team active count
  let activeCount = 0
  allUsers.forEach(user => {
    const userEntry = getTodayTimeEntry(user.id)
    if (userEntry && userEntry.status === "clocked_in") {
      activeCount++
    }
  })

  return {
    hoursToday: formatHours(hoursToday),
    hoursThisWeek: formatHours(hoursThisWeek),
    status,
    teamActive: `${activeCount}/${allUsers.length} Active`,
    statusColor
  }
}

// === INITIALIZE SAMPLE DATA ===

export function initializeSampleData(): void {
  const existing = getTimeEntries()
  if (existing.length === 0) {
    // Import and use sample data
    const { SAMPLE_TIME_ENTRIES } = require('@/types')
    localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(SAMPLE_TIME_ENTRIES))
  }
}

// === UTILITY FUNCTIONS ===

export function getCurrentUser(): User | null {
  // For now, return hardcoded user. In real app, this would come from auth
  const { HARD_CODED_USERS, DEFAULT_CURRENT_USER_ID } = require('@/types')
  return HARD_CODED_USERS.find(user => user.id === DEFAULT_CURRENT_USER_ID) || null
}

export function getAllUsers(): User[] {
  const { HARD_CODED_USERS } = require('@/types')
  return HARD_CODED_USERS
}

export function getUserById(userId: number): User | null {
  const { HARD_CODED_USERS } = require('@/types')
  return HARD_CODED_USERS.find(user => user.id === userId) || null
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function formatDuration(startTime: string, endTime: string): string {
  const duration = new Date(endTime).getTime() - new Date(startTime).getTime()
  const minutes = Math.floor(duration / (1000 * 60))

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}