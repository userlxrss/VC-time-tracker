/**
 * Basic usage examples for VC Time Tracker
 * This file demonstrates how to use the core functionality
 */

import {
  initializeVCTimeTracker,
  TimeEntryService,
  UserService,
  TimeEntryStorage,
  TimeCalculator,
  DateUtils,
  HARDCODED_USERS,
  DEFAULT_CURRENT_USER_ID,
  TimeEntryStatus,
  Permission,
  BreakType
} from '../src/index';

/**
 * Initialize the system and demonstrate basic functionality
 */
export function runBasicExamples(): void {
  console.log('🚀 VC Time Tracker - Basic Usage Examples\n');

  // Initialize the system
  initializeVCTimeTracker();
  console.log('✅ System initialized');

  // Example 1: User Management
  console.log('\n👥 User Management Examples:');
  demonstrateUserManagement();

  // Example 2: Time Entry Operations
  console.log('\n⏰ Time Entry Examples:');
  demonstrateTimeEntryOperations();

  // Example 3: Time Calculations
  console.log('\n🧮 Time Calculation Examples:');
  demonstrateTimeCalculations();

  // Example 4: Date Utilities
  console.log('\n📅 Date Utility Examples:');
  demonstrateDateUtilities();

  // Example 5: Permission System
  console.log('\n🔐 Permission System Examples:');
  demonstratePermissionSystem();
}

/**
 * Demonstrate user management functionality
 */
function demonstrateUserManagement(): void {
  // Get current session
  const session = UserService.getCurrentSession();
  console.log(`Current user: ${session.user.fullName} (${session.user.role})`);
  console.log(`User initials: ${session.user.initials}`);
  console.log(`Department: ${session.user.department || 'N/A'}`);

  // Get all users
  const allUsers = UserService.getAllUsers();
  console.log(`\nTotal users: ${allUsers.length}`);
  allUsers.forEach(user => {
    console.log(`- ${user.fullName} (${user.role}) - ${user.email}`);
  });

  // Switch to boss user
  const switchResult = UserService.switchUser('user-001'); // Maria Villanueva
  if (switchResult.success) {
    console.log(`\nSwitched to: ${switchResult.session?.user.fullName}`);
  }

  // Update user preferences
  const prefResult = UserService.updateCurrentUserPreferences({
    theme: 'dark',
    timeFormat: '24h',
    notifications: {
      email: true,
      browser: true,
      clockInReminder: true,
      clockOutReminder: true
    }
  });
  console.log(`Preferences updated: ${prefResult.success}`);

  // Switch back to default user
  UserService.switchUser(DEFAULT_CURRENT_USER_ID);
}

/**
 * Demonstrate time entry operations
 */
function demonstrateTimeEntryOperations(): void {
  const userId = DEFAULT_CURRENT_USER_ID;
  const today = DateUtils.today();

  console.log(`\nWorking with user: ${userId} for date: ${today}`);

  // Get today's time entry (creates if doesn't exist)
  let entry = TimeEntryService.getTodayTimeEntry(userId);
  console.log(`Initial status: ${entry.status}`);

  // Clock in
  if (!entry.clockIn) {
    const clockInResult = TimeEntryService.clockIn(userId, '09:00');
    if (clockInResult.success) {
      console.log(`✅ Clocked in at: ${clockInResult.entry.clockIn}`);
      entry = clockInResult.entry;
    }
  }

  // Start lunch break
  if (!entry.lunchBreak.start) {
    const lunchResult = TimeEntryService.startLunch(userId, '12:30');
    if (lunchResult.success) {
      console.log(`✅ Lunch break started at: ${lunchResult.entry.lunchBreak.start}`);
      entry = lunchResult.entry;
    }
  }

  // End lunch break
  if (entry.lunchBreak.start && !entry.lunchBreak.end) {
    const endLunchResult = TimeEntryService.endLunch(userId, '13:00');
    if (endLunchResult.success) {
      console.log(`✅ Lunch break ended. Duration: ${endLunchResult.entry.lunchBreak.duration} minutes`);
      entry = endLunchResult.entry;
    }
  }

  // Start a short break
  if (entry.shortBreaks.length === 0) {
    const breakResult = TimeEntryService.startBreak(userId, BreakType.COFFEE_BREAK, '10:30');
    if (breakResult.success) {
      console.log(`✅ Coffee break started at: ${breakResult.entry.shortBreaks[0].start}`);
      entry = breakResult.entry;

      // End the break
      const endBreakResult = TimeEntryService.endBreak(userId, entry.shortBreaks[0].id, '10:45');
      if (endBreakResult.success) {
        console.log(`✅ Break ended. Duration: ${endBreakResult.entry.shortBreaks[0].duration} minutes`);
        entry = endBreakResult.entry;
      }
    }
  }

  // Clock out
  if (!entry.clockOut) {
    const clockOutResult = TimeEntryService.clockOut(userId, '17:30');
    if (clockOutResult.success) {
      console.log(`✅ Clocked out at: ${clockOutResult.entry.clockOut}`);
      console.log(`📊 Total hours worked: ${clockOutResult.entry.totalHours}`);
      entry = clockOutResult.entry;
    }
  }

  // Get current status
  const currentStatus = TimeEntryService.getCurrentStatus(userId);
  console.log(`\nCurrent status: ${currentStatus.status}`);
  console.log(`Is on break: ${currentStatus.isOnBreak}`);
  console.log(`Hours worked so far: ${currentStatus.hoursWorked}`);
}

/**
 * Demonstrate time calculation utilities
 */
function demonstrateTimeCalculations(): void {
  // Create a sample time entry for calculations
  const sampleEntry = {
    id: 'sample',
    userId: 'user-003',
    date: '2024-01-15',
    clockIn: '09:00',
    clockOut: '17:30',
    lunchBreak: {
      start: '12:30',
      end: '13:00',
      duration: 30
    },
    shortBreaks: [
      {
        id: 'break1',
        start: '10:30',
        end: '10:45',
        duration: 15,
        type: BreakType.COFFEE_BREAK
      },
      {
        id: 'break2',
        start: '15:00',
        end: '15:10',
        duration: 10,
        type: BreakType.SHORT_BREAK
      }
    ],
    status: TimeEntryStatus.CLOCKED_OUT,
    lastModified: new Date().toISOString(),
    modifiedBy: 'user-003'
  };

  // Calculate various time metrics
  const totalHours = TimeCalculator.calculateTotalHours(sampleEntry);
  const workHours = TimeCalculator.calculateWorkHours(sampleEntry);
  const breakHours = TimeCalculator.calculateBreakHours(sampleEntry);
  const overtimeHours = TimeCalculator.calculateOvertimeHours(sampleEntry);
  const regularHours = TimeCalculator.calculateRegularHours(sampleEntry);

  console.log(`Total time at work: ${TimeCalculator.formatHours(totalHours)}`);
  console.log(`Actual work hours: ${TimeCalculator.formatHours(workHours)}`);
  console.log(`Break hours: ${TimeCalculator.formatHours(breakHours)}`);
  console.log(`Regular hours: ${TimeCalculator.formatHours(regularHours)}`);
  console.log(`Overtime hours: ${TimeCalculator.formatHours(overtimeHours)}`);

  // Validate business rules
  const validation = TimeCalculator.validateBusinessRules(sampleEntry);
  console.log(`\nBusiness rule validation:`);
  console.log(`Is valid: ${validation.isValid}`);
  if (validation.warnings.length > 0) {
    console.log(`Warnings: ${validation.warnings.join(', ')}`);
  }

  // Format time examples
  console.log(`\nTime formatting examples:`);
  console.log(`09:00 in 12h format: ${TimeCalculator.formatTimeString('09:00', '12h')}`);
  console.log(`09:00 in 24h format: ${TimeCalculator.formatTimeString('09:00', '24h')}`);
  console.log(`17:30 in 12h format: ${TimeCalculator.formatTimeString('17:30', '12h')}`);
  console.log(`125 minutes formatted: ${TimeCalculator.formatMinutes(125)}`);
}

/**
 * Demonstrate date utility functions
 */
function demonstrateDateUtilities(): void {
  const today = DateUtils.today();
  console.log(`Today: ${today}`);
  console.log(`Formatted: ${DateUtils.formatDate(today, 'DISPLAY')}`);
  console.log(`Relative: ${DateUtils.formatRelativeDate(today)}`);

  // Week information
  const weekInfo = DateUtils.getWeekInfo(today);
  console.log(`\nWeek information:`);
  console.log(`Week ${weekInfo.weekNumber} of ${weekInfo.year}`);
  console.log(`Start: ${weekInfo.start} (${DateUtils.getDayOfWeek(weekInfo.start)})`);
  console.log(`End: ${weekInfo.end} (${DateUtils.getDayOfWeek(weekInfo.end)})`);
  console.log(`Is current week: ${weekInfo.isCurrentWeek}`);

  // Month information
  const monthInfo = DateUtils.getMonthInfo(today);
  console.log(`\nMonth information:`);
  console.log(`${monthInfo.monthName} ${monthInfo.year}`);
  console.log(`Days in month: ${monthInfo.daysInMonth}`);
  console.log(`Start: ${monthInfo.start}`);
  console.log(`End: ${monthInfo.end}`);

  // Date ranges
  console.log(`\nDate range examples:`);
  const thisWeek = DateUtils.getDateRangeForPeriod('thisWeek', today);
  console.log(`This week: ${thisWeek.start} to ${thisWeek.end}`);

  const lastWeek = DateUtils.getDateRangeForPeriod('lastWeek', today);
  console.log(`Last week: ${lastWeek.start} to ${lastWeek.end}`);

  const thisMonth = DateUtils.getDateRangeForPeriod('thisMonth', today);
  console.log(`This month: ${thisMonth.start} to ${thisMonth.end}`);

  // Date manipulation
  console.log(`\nDate manipulation:`);
  console.log(`Today + 7 days: ${DateUtils.addDays(today, 7)}`);
  console.log(`Today - 7 days: ${DateUtils.subtractDays(today, 7)}`);
  console.log(`Is today a weekday: ${DateUtils.isWeekday(today)}`);
  console.log(`Is today a weekend: ${DateUtils.isWeekend(today)}`);
}

/**
 * Demonstrate permission system
 */
function demonstratePermissionSystem(): void {
  const employee = UserService.getUserById('user-003'); // Larina
  const boss = UserService.getUserById('user-001');     // Maria

  if (!employee || !boss) {
    console.log('❌ Could not find users for permission demo');
    return;
  }

  console.log(`\nPermission examples:`);
  console.log(`\nEmployee (${employee.fullName}):`);
  console.log(`- Can edit own time: ${UserService.hasPermission(employee.id, Permission.EDIT_OWN_TIME)}`);
  console.log(`- Can view all time: ${UserService.hasPermission(employee.id, Permission.VIEW_ALL_TIME)}`);
  console.log(`- Can edit all time: ${UserService.hasPermission(employee.id, Permission.EDIT_ALL_TIME)}`);
  console.log(`- Can approve time: ${UserService.hasPermission(employee.id, Permission.APPROVE_TIME)}`);

  console.log(`\nBoss (${boss.fullName}):`);
  console.log(`- Can edit own time: ${UserService.hasPermission(boss.id, Permission.EDIT_OWN_TIME)}`);
  console.log(`- Can view all time: ${UserService.hasPermission(boss.id, Permission.VIEW_ALL_TIME)}`);
  console.log(`- Can edit all time: ${UserService.hasPermission(boss.id, Permission.EDIT_ALL_TIME)}`);
  console.log(`- Can approve time: ${UserService.hasPermission(boss.id, Permission.APPROVE_TIME)}`);

  // Card control examples
  console.log(`\nCard control examples:`);
  console.log(`- Employee can control their own card: ${UserService.canControlUserCard(employee.id, employee.id)}`);
  console.log(`- Employee can control boss's card: ${UserService.canControlUserCard(employee.id, boss.id)}`);
  console.log(`- Boss can control employee's card: ${UserService.canControlUserCard(boss.id, employee.id)}`);
  console.log(`- Boss can control their own card: ${UserService.canControlUserCard(boss.id, boss.id)}`);

  // Card viewing examples
  console.log(`\nCard viewing examples:`);
  console.log(`- Employee can view boss's card: ${UserService.canViewUserCard(employee.id, boss.id)}`);
  console.log(`- Boss can view employee's card: ${UserService.canViewUserCard(boss.id, employee.id)}`);
}

/**
 * Demonstrate data querying and analytics
 */
export function demonstrateDataQueries(): void {
  console.log('\n📊 Data Query Examples:');

  const userId = DEFAULT_CURRENT_USER_ID;

  // Get time entries for different periods
  const today = DateUtils.today();
  const weekEntries = TimeEntryStorage.getWeekTimeEntries(userId);
  const monthEntries = TimeEntryStorage.getMonthTimeEntries(userId);

  console.log(`\nTime entry summary for ${UserService.getUserById(userId)?.fullName}:`);
  console.log(`This week entries: ${weekEntries.length}`);
  console.log(`This month entries: ${monthEntries.length}`);

  // Calculate summaries
  const weekSummary = TimeCalculator.calculateWeekSummary(weekEntries);
  console.log(`\nThis week summary:`);
  console.log(`- Total days: ${weekSummary.totalDays}`);
  console.log(`- Worked days: ${weekSummary.workedDays}`);
  console.log(`- Total hours: ${TimeCalculator.formatHours(weekSummary.totalHours)}`);
  console.log(`- Average hours per day: ${TimeCalculator.formatHours(weekSummary.averageHours)}`);
  console.log(`- Overtime hours: ${TimeCalculator.formatHours(weekSummary.overtimeHours)}`);

  // Get system health
  const health = require('../src/index').getSystemHealth();
  console.log(`\nSystem health:`);
  console.log(`- Storage available: ${health.storage.available}`);
  console.log(`- Active users: ${health.users.active}`);
  console.log(`- Current user session: ${health.currentSession.user} (valid: ${health.currentSession.valid})`);
}

// Run examples if this file is executed directly
if (require.main === module) {
  runBasicExamples();
  demonstrateDataQueries();
}