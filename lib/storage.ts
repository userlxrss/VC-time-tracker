import { TimeEntry, LeaveRequest, SalaryPayment, Notification, User } from "./types";
import { STORAGE_KEYS, CURRENT_USER_ID } from "./constants";

// Time Entries
export function getTimeEntries(): TimeEntry[] {
  if (typeof window === "undefined") return [];
  const entries = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES);
  return entries ? JSON.parse(entries) : [];
}

export function saveTimeEntry(entry: TimeEntry): void {
  if (typeof window === "undefined") return;
  const entries = getTimeEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);

  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }

  localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries));
}

export function getTimeEntriesForUser(userId: number): TimeEntry[] {
  return getTimeEntries().filter(entry => entry.userId === userId);
}

export function calculateBreakCount(dayEntry: TimeEntry | undefined, debugInfo?: string): number {
  if (!dayEntry) return 0;

  let breakCount = 0;

  // NEW LOGIC: Only count short breaks (lunch breaks are separate, not counted as "breaks")
  if (dayEntry.shortBreaks && Array.isArray(dayEntry.shortBreaks)) {
    breakCount += dayEntry.shortBreaks.length;
  }

  // DEBUG: Log the calculation details
  if (debugInfo) {
    console.log(`${debugInfo} - Break Calculation (SHORT BREAKS ONLY):`, {
      date: dayEntry.date,
      userId: dayEntry.userId,
      lunchBreakStart: dayEntry.lunchBreakStart,
      shortBreaks: dayEntry.shortBreaks,
      shortBreaksLength: dayEntry.shortBreaks?.length || 0,
      finalBreakCount: breakCount,
      note: "Only counting short breaks, not lunch breaks"
    });
  }

  return breakCount;
}

export function getTimeEntryForUserOnDate(userId: number, dateStr: string): TimeEntry | undefined {
  const entries = getTimeEntriesForUser(userId);
  return entries.find(entry => entry.date === dateStr);
}

// Force consistent break calculation for all views
// Force consistent break calculation and data for all views
export function getConsistentTimeEntry(userId: number, dateStr: string, source?: string): { entry: TimeEntry | undefined, breakCount: number } {
  // Always fetch fresh data to avoid caching issues
  const freshEntries = getTimeEntries().filter(entry => entry.userId === userId);
  const dayEntry = freshEntries.find(entry => entry.date === dateStr);

  const breakCount = calculateBreakCount(dayEntry);

  // DEBUG: Log consistency check
  if (source) {
    console.log(`CONSISTENCY CHECK - ${source}:`, {
      userId,
      dateStr,
      dayEntry: dayEntry ? {
        date: dayEntry.date,
        lunchBreakStart: dayEntry.lunchBreakStart,
        shortBreaks: dayEntry.shortBreaks,
        shortBreaksLength: dayEntry.shortBreaks?.length || 0
      } : 'No entry',
      finalBreakCount: breakCount,
      totalEntriesFound: freshEntries.length
    });

    // SPECIAL DEBUG: Pay extra attention to Monday 24/11
    if (dateStr === '2025-11-24' || dateStr.includes('2025-11-24')) {
      console.log(`🚨 MONDAY 24/11 DEBUG - ${source}:`);
      console.log(`  - User ID: ${userId}`);
      console.log(`  - Date String: ${dateStr}`);
      console.log(`  - Final Break Count: ${breakCount}`);
      console.log(`  - Has Entry: ${!!dayEntry}`);
      if (dayEntry) {
        console.log(`  - Lunch Break Start: ${dayEntry.lunchBreakStart || 'NONE'}`);
        console.log(`  - Short Breaks Type: ${typeof dayEntry.shortBreaks}`);
        console.log(`  - Short Breaks Value:`, dayEntry.shortBreaks);
        if (Array.isArray(dayEntry.shortBreaks)) {
          console.log(`  - Short Breaks Count: ${dayEntry.shortBreaks.length}`);
          console.log(`  - Short Breaks Details:`, dayEntry.shortBreaks);
          dayEntry.shortBreaks.forEach((breakItem, index) => {
            console.log(`    ${index + 1}. Start: ${breakItem.startTime || 'N/A'}, End: ${breakItem.endTime || 'N/A'}, Duration: ${breakItem.duration || 'N/A'}`);
          });
        }
      }
      console.log(`  - TOTAL ENTRIES FOUND: ${freshEntries.length}`);
    }
  }

  return { entry: dayEntry, breakCount };
}

export function getConsistentBreakCount(userId: number, dateStr: string, source?: string): number {
  const { breakCount } = getConsistentTimeEntry(userId, dateStr, source);
  return breakCount;
}

export function getCurrentTimeEntry(userId: number): TimeEntry | null {
  const today = new Date().toISOString().split('T')[0];
  const entries = getTimeEntriesForUser(userId);
  return entries.find(entry =>
    entry.date === today &&
    ["clocked_in", "on_lunch", "on_break"].includes(entry.status)
  ) || null;
}

// Auto-close stale sessions (24 hours without clock-out)
export function autoCloseStaleEntries(): void {
  if (typeof window === "undefined") return;

  const entries = getTimeEntries();
  const now = new Date();
  const MAX_SESSION_HOURS = 24;
  let hasChanges = false;

  entries.forEach(entry => {
    // Only check entries that are still active (not clocked out or auto closed)
    if (['clocked_in', 'on_lunch', 'on_break'].includes(entry.status)) {
      const clockInTime = new Date(entry.clockIn);
      const hoursSinceClockIn = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceClockIn >= MAX_SESSION_HOURS) {
        // Auto-close this entry
        const autoClockOut = new Date(clockInTime.getTime() + MAX_SESSION_HOURS * 60 * 60 * 1000);
        entry.clockOut = autoClockOut.toISOString();
        entry.status = 'auto_closed';
        entry.totalHours = MAX_SESSION_HOURS;

        // Add system note about auto-closure
        const systemNote = `[System] Auto-closed after 24 hours without clock-out`;
        entry.notes = entry.notes ? `${systemNote}\n${entry.notes}` : systemNote;

        // Close any open breaks
        if (entry.lunchBreakStart && !entry.lunchBreakEnd) {
          entry.lunchBreakEnd = autoClockOut.toISOString();
        }
        entry.shortBreaks = entry.shortBreaks.map(b => ({
          ...b,
          end: b.end || autoClockOut.toISOString()
        }));

        hasChanges = true;

        // Create notification for employee
        const notification: Notification = {
          id: Date.now(),
          userId: entry.userId,
          type: 'salary_reminder',
          title: 'Session Auto-Closed',
          message: `Your session from ${new Date(entry.date).toLocaleDateString()} was automatically closed after 24 hours. Please remember to clock out.`,
          isRead: false,
          createdAt: now.toISOString()
        };
        saveNotification(notification);
      }
    }
  });

  if (hasChanges) {
    localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries));
  }
}

// Leave Requests
export function getLeaveRequests(): LeaveRequest[] {
  if (typeof window === "undefined") return [];
  const requests = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
  return requests ? JSON.parse(requests) : [];
}

export function saveLeaveRequest(request: LeaveRequest): void {
  if (typeof window === "undefined") return;
  const requests = getLeaveRequests();
  const existingIndex = requests.findIndex(r => r.id === request.id);

  if (existingIndex >= 0) {
    requests[existingIndex] = request;
  } else {
    requests.push(request);
  }

  localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(requests));
}

export function getLeaveRequestsForUser(userId: number): LeaveRequest[] {
  return getLeaveRequests().filter(request => request.userId === userId);
}

export function getPendingLeaveRequests(): LeaveRequest[] {
  return getLeaveRequests().filter(request => request.status === "pending");
}

// Salary Payments
export function getSalaryPayments(): SalaryPayment[] {
  if (typeof window === "undefined") return [];
  const payments = localStorage.getItem(STORAGE_KEYS.SALARY_PAYMENTS);
  return payments ? JSON.parse(payments) : [];
}

export function saveSalaryPayment(payment: SalaryPayment): void {
  if (typeof window === "undefined") return;
  const payments = getSalaryPayments();
  const existingIndex = payments.findIndex(p => p.id === payment.id);

  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }

  localStorage.setItem(STORAGE_KEYS.SALARY_PAYMENTS, JSON.stringify(payments));
}

export function getSalaryPaymentsForUser(userId: number): SalaryPayment[] {
  return getSalaryPayments().filter(payment => payment.userId === userId);
}

// Notifications
export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const notifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return notifications ? JSON.parse(notifications) : [];
}

export function saveNotification(notification: Notification): void {
  if (typeof window === "undefined") return;
  const notifications = getNotifications();
  const existingIndex = notifications.findIndex(n => n.id === notification.id);

  if (existingIndex >= 0) {
    notifications[existingIndex] = notification;
  } else {
    notifications.push(notification);
  }

  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export function getUnreadNotificationsForUser(userId: number): Notification[] {
  return getNotifications().filter(n => n.userId === userId && !n.isRead);
}

export function markNotificationAsRead(notificationId: number): void {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
}

// Theme
export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(STORAGE_KEYS.THEME) as "light" | "dark") || "light";
}

export function setTheme(theme: "light" | "dark"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// Current User
export function getCurrentUserId(): number {
  if (typeof window === "undefined") return CURRENT_USER_ID;
  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userId ? parseInt(userId) : CURRENT_USER_ID;
}

export function getCurrentUser() {
  const userId = getCurrentUserId();
  return USERS.find(u => u.id === userId);
}

export function setCurrentUserId(userId: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId.toString());
}

// Utility functions
export function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let days = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
      days++;
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function isLateArrival(clockInTime: Date): boolean {
  // Flexible work schedule - no fixed start time, focus on total hours worked
  return false;
}

export function calculateHoursWorked(clockIn: Date, clockOut: Date, lunchMinutes: number = 0, breakMinutes: number = 0): number {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const totalMinutes = diffMinutes - lunchMinutes - breakMinutes;
  return Math.max(0, totalMinutes / 60);
}

export function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes.toString().padStart(2, '0')}m`;
}

// Salary Management Functions - AUTOMATED SYSTEM
export interface SalaryRecord {
  id: string;
  employeeId: number;
  employeeName: string;
  amount: number;
  currency: string;
  paymentMonth: string;
  workPeriodStart: string;
  workPeriodEnd: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate: string | null;
  paidBy: number | null;
  autoGenerated: boolean;
  generatedDate: string;
  dueDate: string;
  reminderSent: boolean;
  employeeNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

export function getSalaryRecords(): SalaryRecord[] {
  if (typeof window === "undefined") return [];
  const records = localStorage.getItem('salary_records');
  return records ? JSON.parse(records) : [];
}

export function saveSalaryRecord(record: SalaryRecord): void {
  if (typeof window === "undefined") return;
  const records = getSalaryRecords();
  const existingIndex = records.findIndex(r => r.id === record.id);

  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }

  localStorage.setItem('salary_records', JSON.stringify(records));
}

export function getSalaryRecordsForEmployee(employeeId: number): SalaryRecord[] {
  return getSalaryRecords().filter(record => record.employeeId === employeeId);
}

export function getCurrentMonthSalary(employeeId: number): SalaryRecord | null {
  const today = new Date();
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const records = getSalaryRecordsForEmployee(employeeId);
  return records.find(record => record.paymentMonth === currentMonth) || null;
}

export function getPendingSalaries(): SalaryRecord[] {
  return getSalaryRecords().filter(record => record.status === 'pending');
}

export function getOverdueSalaries(): SalaryRecord[] {
  const today = new Date();
  return getSalaryRecords().filter(record =>
    record.status === 'pending' && new Date(record.dueDate) < today
  );
}

export function addNotification(notification: Omit<Notification, 'id'>): void {
  if (typeof window === "undefined") return;

  const newNotification: Notification = {
    ...notification,
    id: generateId()
  };

  saveNotification(newNotification);
}

export function updateLeaveRequest(leaveId: number, action: 'approve' | 'deny', approvedBy: number): boolean {
  const requests = getLeaveRequests();
  const requestIndex = requests.findIndex(r => r.id === leaveId);

  if (requestIndex === -1) return false;

  const request = requests[requestIndex];
  request.status = action === 'approve' ? 'approved' : 'denied';
  request.approvedBy = approvedBy;
  request.updatedAt = new Date().toISOString();

  saveLeaveRequest(request);

  // Create notification for employee
  addNotification({
    userId: request.userId,
    type: 'leave',
    title: `Leave Request ${action === 'approve' ? 'Approved' : 'Denied'}`,
    message: `Your leave request for ${formatDate(request.startDate)} - ${formatDate(request.endDate)} has been ${action === 'approve' ? 'approved' : 'denied'}.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  return true;
}
// Production cleanup functions
export function clearProductionData() {
  if (typeof window === "undefined") return;

  // Clear timesheet data
  localStorage.removeItem(STORAGE_KEYS.TIME_ENTRIES);

  // Clear leave request data
  localStorage.removeItem(STORAGE_KEYS.LEAVE_REQUESTS);

  // Clear salary payment data (but keep salary_records for sample data)
  localStorage.removeItem(STORAGE_KEYS.SALARY_PAYMENTS);

  // Clear notifications
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
}

// User Profile Management
export function getUserProfiles(): Record<number, User> {
  if (typeof window === "undefined") return {};
  const profiles = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
  return profiles ? JSON.parse(profiles) : {};
}

export function saveUserProfile(userId: number, updates: Partial<User>): void {
  if (typeof window === "undefined") return;

  const profiles = getUserProfiles();

  // Get base user data from constants or existing profile
  const baseUser = profiles[userId] || {
    id: userId,
    firstName: '',
    email: '',
    password: ''
  };

  // Merge updates
  const updatedUser = { ...baseUser, ...updates, id: userId };

  // Save to profiles
  profiles[userId] = updatedUser;
  localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));
}

export function getUserProfile(userId: number): User | null {
  const profiles = getUserProfiles();
  return profiles[userId] || null;
}

export function updateUserPassword(userId: number, newPassword: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    saveUserProfile(userId, { password: newPassword });
    return true;
  } catch (error) {
    console.error('Failed to update password:', error);
    return false;
  }
}
