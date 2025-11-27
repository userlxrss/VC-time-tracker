/**
 * Test data utilities for VC Time Tracker
 * Helps create sample time entries for testing the quick stats component
 */

import { TimeEntry, TimeEntryStatus, ShortBreak } from '@/src/types'
import { TimeEntryStorage } from '@/src/utils/localStorage'
import { HARDCODED_USERS } from '@/src/types'

export const createSampleTimeEntries = () => {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Get start of week (Monday)
  const startOfWeek = new Date()
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
  startOfWeek.setDate(diff)
  const monday = startOfWeek.toISOString().split('T')[0]

  const sampleEntries: TimeEntry[] = []

  // Sample entry for Larina (current user) - Today (clocked in)
  const larinaTodayEntry: TimeEntry = {
    id: `time-user-003-${today}`,
    userId: 'user-003',
    date: today,
    clockIn: '09:00',
    clockOut: undefined, // Still clocked in
    lunchBreak: {
      start: '12:30',
      end: '13:00',
      duration: 30
    },
    shortBreaks: [
      {
        id: `break-time-user-003-${today}-1`,
        start: '10:30',
        end: '10:45',
        duration: 15,
        type: 'coffee_break' as any
      }
    ],
    status: TimeEntryStatus.CLOCKED_IN,
    notes: 'Working on dashboard improvements',
    lastModified: new Date().toISOString(),
    modifiedBy: 'user-003'
  }
  sampleEntries.push(larinaTodayEntry)

  // Sample entry for Maria - Today (clocked in)
  const mariaTodayEntry: TimeEntry = {
    id: `time-user-001-${today}`,
    userId: 'user-001',
    date: today,
    clockIn: '08:30',
    clockOut: undefined,
    lunchBreak: {
      start: '12:00',
      end: '12:45',
      duration: 45
    },
    shortBreaks: [],
    status: TimeEntryStatus.CLOCKED_IN,
    notes: 'Board meeting preparation',
    lastModified: new Date().toISOString(),
    modifiedBy: 'user-001'
  }
  sampleEntries.push(mariaTodayEntry)

  // Sample entry for Carlos - Today (on lunch)
  const carlosTodayEntry: TimeEntry = {
    id: `time-user-002-${today}`,
    userId: 'user-002',
    date: today,
    clockIn: '09:15',
    clockOut: undefined,
    lunchBreak: {
      start: '12:00',
      end: undefined, // Still on lunch
      duration: undefined
    },
    shortBreaks: [
      {
        id: `break-time-user-002-${today}-1`,
        start: '11:00',
        end: '11:15',
        duration: 15,
        type: 'coffee_break' as any
      }
    ],
    status: TimeEntryStatus.ON_LUNCH,
    notes: 'Client calls in the morning',
    lastModified: new Date().toISOString(),
    modifiedBy: 'user-002'
  }
  sampleEntries.push(carlosTodayEntry)

  // Yesterday's entry for Larina (completed)
  const larinaYesterdayEntry: TimeEntry = {
    id: `time-user-003-${yesterday}`,
    userId: 'user-003',
    date: yesterday,
    clockIn: '08:45',
    clockOut: '17:30',
    lunchBreak: {
      start: '12:30',
      end: '13:15',
      duration: 45
    },
    shortBreaks: [
      {
        id: `break-time-user-003-${yesterday}-1`,
        start: '10:00',
        end: '10:20',
        duration: 20,
        type: 'coffee_break' as any
      },
      {
        id: `break-time-user-003-${yesterday}-2`,
        start: '15:30',
        end: '15:45',
        duration: 15,
        type: 'personal' as any
      }
    ],
    status: TimeEntryStatus.CLOCKED_OUT,
    notes: 'Completed project documentation',
    lastModified: new Date().toISOString(),
    modifiedBy: 'user-003'
  }
  sampleEntries.push(larinaYesterdayEntry)

  // Add some entries for the rest of the week
  const weekDays = []
  for (let i = 1; i < 5; i++) {
    const date = new Date(monday)
    date.setDate(date.getDate() + i)
    if (date.toISOString().split('T')[0] !== today &&
        date.toISOString().split('T')[0] !== yesterday) {
      weekDays.push(date.toISOString().split('T')[0])
    }
  }

  weekDays.forEach((date, index) => {
    const weekEntry: TimeEntry = {
      id: `time-user-003-${date}`,
      userId: 'user-003',
      date: date,
      clockIn: '09:00',
      clockOut: '17:30',
      lunchBreak: {
        start: '12:30',
        end: '13:00',
        duration: 30
      },
      shortBreaks: [
        {
          id: `break-time-user-003-${date}-1`,
          start: '10:30',
          end: '10:45',
          duration: 15,
          type: 'coffee_break' as any
        }
      ],
      status: TimeEntryStatus.CLOCKED_OUT,
      notes: `Work day ${index + 1}`,
      lastModified: new Date().toISOString(),
      modifiedBy: 'user-003'
    }
    sampleEntries.push(weekEntry)
  })

  return sampleEntries
}

export const loadTestData = () => {
  console.log('Loading test data for Quick Stats...')

  const sampleEntries = createSampleTimeEntries()

  // Clear existing data
  TimeEntryStorage.saveTimeEntry = (entry: TimeEntry): boolean => {
    const entries = TimeEntryStorage.getAllTimeEntries()
    const existingIndex = entries.findIndex(e => e.id === entry.id)

    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }

    // Save to localStorage (simplified version)
    try {
      localStorage.setItem('vctime_time_entries', JSON.stringify(entries))
      return true
    } catch (error) {
      console.error('Error saving time entry:', error)
      return false
    }
  }

  // Save all sample entries
  sampleEntries.forEach(entry => {
    TimeEntryStorage.saveTimeEntry(entry)
  })

  console.log(`Loaded ${sampleEntries.length} sample time entries`)
  console.log('Sample data includes:')
  console.log('- Larina (user-003): Clocked in today')
  console.log('- Maria (user-003): Clocked in today')
  console.log('- Carlos (user-002): On lunch today')
  console.log('- Previous week entries for weekly stats')

  return sampleEntries
}

export const clearTestData = () => {
  console.log('Clearing test data...')
  try {
    localStorage.removeItem('vctime_time_entries')
    console.log('Test data cleared')
  } catch (error) {
    console.error('Error clearing test data:', error)
  }
}

// Export function for use in browser console
if (typeof window !== 'undefined') {
  (window as any).loadTestData = loadTestData
  (window as any).clearTestData = clearTestData
}