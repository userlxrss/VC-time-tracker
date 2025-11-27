import { SAMPLE_TIME_ENTRIES } from '@/types'
import { getTimeEntries } from './timeTracker'

// Initialize sample data if no data exists
export function initializeData() {
  const existingEntries = getTimeEntries()

  if (existingEntries.length === 0) {
    // Only initialize if no data exists
    localStorage.setItem('vcTimeEntries', JSON.stringify(SAMPLE_TIME_ENTRIES))
    console.log('Sample data initialized')
  }
}

// Call this function when the app starts
initializeData()