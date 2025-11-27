/**
 * Sample data initialization for VC Time Tracker
 */

import { User, TimeEntry, Break, UserPreferences } from '../types';
import { dataStorage } from './storage';

/**
 * Generate sample user data
 */
export function createSampleUser(): User {
  return {
    id: generateId(),
    name: 'John Developer',
    email: 'john@venturecapital.com',
    hourlyRate: 75.00,
    currency: 'USD',
    createdAt: new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)), // 90 days ago
    updatedAt: new Date(),
    isActive: true
  };
}

/**
 * Generate sample user preferences
 */
export function createSamplePreferences(userId: string): UserPreferences {
  return {
    userId,
    defaultProject: 'VC Portfolio Analysis',
    defaultTask: 'Due Diligence',
    currency: 'USD',
    hourlyRate: 75.00,
    workingDays: [1, 2, 3, 4, 5], // Monday-Friday
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    notifications: {
      eyeCareReminder: true,
      eyeCareInterval: 20, // 20 minutes
      forgotClockOutReminder: true,
      forgotClockOutDelay: 480, // 8 hours
      weeklyReport: true,
      dailyReport: true
    },
    appearance: {
      theme: 'system',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Generate sample time entries for the past 30 days
 */
export function createSampleTimeEntries(userId: string, count: number = 30): TimeEntry[] {
  const timeEntries: TimeEntry[] = [];
  const projects = [
    'VC Portfolio Analysis',
    'Startup Due Diligence',
    'Investment Committee Meeting',
    'Market Research',
    'Partner Meetings',
    'Financial Modeling',
    'Portfolio Company Support',
    'New Deal Sourcing'
  ];

  const tasks = [
    'Due Diligence',
    'Financial Analysis',
    'Market Research',
    'Team Meetings',
    'Report Writing',
    'Client Calls',
    'Strategic Planning',
    'Data Analysis'
  ];

  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Generate 1-3 time entries per day
    const entriesPerDay = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < entriesPerDay; j++) {
      const clockInHour = 8 + Math.floor(Math.random() * 3); // 8-10 AM start
      const workDuration = 4 + Math.floor(Math.random() * 5); // 4-8 hours
      const breakDuration = Math.floor(Math.random() * 60); // 0-60 minutes break

      const clockIn = new Date(date);
      clockIn.setHours(clockInHour, Math.floor(Math.random() * 60), 0, 0);

      const clockOut = new Date(clockIn);
      clockOut.setMinutes(clockOut.getMinutes() + (workDuration * 60));

      const totalDuration = Math.round((clockOut.getTime() - clockIn.getTime()) / (1000 * 60));
      const totalBreakDuration = Math.min(breakDuration, totalDuration * 0.25); // Max 25% break time

      timeEntries.push({
        id: generateId(),
        userId,
        clockIn,
        clockOut,
        duration: totalDuration,
        totalBreakDuration,
        project: projects[Math.floor(Math.random() * projects.length)],
        task: tasks[Math.floor(Math.random() * tasks.length)],
        notes: generateSampleNotes(),
        isAutomaticClockOut: Math.random() > 0.8, // 20% chance of automatic clock out
        createdAt: clockIn,
        updatedAt: clockOut
      });
    }
  }

  return timeEntries.sort((a, b) => b.clockIn.getTime() - a.clockIn.getTime());
}

/**
 * Generate sample breaks for time entries
 */
export function createSampleBreaks(timeEntries: TimeEntry[]): Break[] {
  const breaks: Break[] = [];
  const breakTypes: Array<'lunch' | 'coffee' | 'meeting' | 'other'> = ['lunch', 'coffee', 'meeting', 'other'];

  const breakNotes = {
    lunch: ['Lunch break', 'Team lunch', 'Client lunch'],
    coffee: ['Coffee break', 'Quick break', 'Stretch break'],
    meeting: ['Team standup', 'Client meeting', 'Partner sync', 'All hands'],
    other: ['Personal errand', 'Phone call', 'Administrative tasks']
  };

  timeEntries.forEach(timeEntry => {
    // Add breaks for 70% of time entries
    if (Math.random() > 0.3 && timeEntry.clockOut) {
      const numBreaks = Math.floor(Math.random() * 3) + 1; // 1-3 breaks per entry

      for (let i = 0; i < numBreaks; i++) {
        const breakType = breakTypes[Math.floor(Math.random() * breakTypes.length)];
        const breakDuration = 15 + Math.floor(Math.random() * 45); // 15-60 minutes

        // Calculate break start time (somewhere during the time entry)
        const entryStart = timeEntry.clockIn.getTime();
        const entryEnd = timeEntry.clockOut.getTime();
        const entryDuration = entryEnd - entryStart;

        // Don't schedule breaks in first or last hour
        const minBreakStart = entryStart + (60 * 60 * 1000);
        const maxBreakStart = entryEnd - (60 * 60 * 1000) - (breakDuration * 60 * 1000);

        if (minBreakStart < maxBreakStart) {
          const breakStart = new Date(minBreakStart + Math.random() * (maxBreakStart - minBreakStart));
          const breakEnd = new Date(breakStart.getTime() + (breakDuration * 60 * 1000));

          const notesForType = breakNotes[breakType];
          const notes = notesForType[Math.floor(Math.random() * notesForType.length)];

          breaks.push({
            id: generateId(),
            timeEntryId: timeEntry.id,
            startTime: breakStart,
            endTime: breakEnd,
            duration: breakDuration,
            type: breakType,
            notes: Math.random() > 0.5 ? notes : undefined,
            createdAt: breakStart,
            updatedAt: breakEnd
          });
        }
      }
    }
  });

  return breaks;
}

/**
 * Generate sample notes
 */
function generateSampleNotes(): string | undefined {
  const notes = [
    undefined,
    'Completed financial analysis for Series A startup',
    'Reviewed pitch deck for B2B SaaS company',
    'Due diligence progress meeting with legal team',
    'Market research on fintech trends',
    'Portfolio company quarterly review preparation',
    'New investment opportunity screening',
    'Partner discussion about emerging markets',
    'Updated financial models for Q4 planning',
    'Client presentation preparation',
    'Competitive analysis completed'
  ];

  return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Initialize app with sample data
 */
export async function initializeSampleData(): Promise<void> {
  try {
    // Check if data already exists
    const existingUser = dataStorage.getUser();
    if (existingUser) {
      console.log('Data already exists, skipping sample data initialization');
      return;
    }

    console.log('Initializing sample data...');

    // Create sample user
    const user = createSampleUser();
    dataStorage.saveUser(user);

    // Create sample preferences
    const preferences = createSamplePreferences(user.id);
    dataStorage.savePreferences(preferences);

    // Create sample time entries
    const timeEntries = createSampleTimeEntries(user.id);
    dataStorage.saveTimeEntries(timeEntries);

    // Create sample breaks
    const breaks = createSampleBreaks(timeEntries);
    dataStorage.saveBreaks(breaks);

    // Set a current time entry for demo purposes (clocked in 2 hours ago)
    const currentTimeEntry: TimeEntry = {
      id: generateId(),
      userId: user.id,
      clockIn: new Date(Date.now() - (2 * 60 * 60 * 1000)), // 2 hours ago
      duration: undefined,
      totalBreakDuration: 0,
      project: 'VC Portfolio Analysis',
      task: 'Due Diligence',
      notes: 'Working on Series B due diligence',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    dataStorage.saveCurrentTimeEntry(currentTimeEntry);

    console.log('Sample data initialized successfully');
    console.log(`Created ${timeEntries.length} time entries and ${breaks.length} breaks`);

  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Clear all sample data
 */
export function clearSampleData(): void {
  try {
    dataStorage.clear();
    console.log('Sample data cleared successfully');
  } catch (error) {
    console.error('Error clearing sample data:', error);
    throw error;
  }
}

/**
 * Get sample statistics for testing
 */
export function getSampleStatistics(): {
  totalEntries: number;
  totalHours: number;
  totalBreaks: number;
  averageWorkday: number;
  projects: Array<{ name: string; hours: number; entries: number }>;
} {
  const timeEntries = dataStorage.getTimeEntries();
  const breaks = dataStorage.getBreaks();

  const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const totalHours = totalMinutes / 60;

  const breakMinutes = breaks.reduce((sum, breakEntry) => sum + (breakEntry.duration || 0), 0);

  // Group by project
  const projectStats = new Map<string, { hours: number; entries: number }>();

  timeEntries.forEach(entry => {
    if (entry.project) {
      const current = projectStats.get(entry.project) || { hours: 0, entries: 0 };
      current.hours += (entry.duration || 0) / 60;
      current.entries += 1;
      projectStats.set(entry.project, current);
    }
  });

  const projects = Array.from(projectStats.entries()).map(([name, stats]) => ({
    name,
    hours: Math.round(stats.hours * 100) / 100,
    entries: stats.entries
  })).sort((a, b) => b.hours - a.hours);

  // Calculate average workday (only count days with entries)
  const workDays = new Set(timeEntries.map(entry => entry.clockIn.toDateString())).size;
  const averageWorkday = workDays > 0 ? totalHours / workDays : 0;

  return {
    totalEntries: timeEntries.length,
    totalHours: Math.round(totalHours * 100) / 100,
    totalBreaks: breaks.length,
    averageWorkday: Math.round(averageWorkday * 100) / 100,
    projects
  };
}

/**
 * Export sample data for backup
 */
export function exportSampleData(): string {
  try {
    const data = dataStorage.exportData();
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting sample data:', error);
    throw error;
  }
}