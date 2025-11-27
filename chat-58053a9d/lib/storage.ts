import { TimeEntry, LeaveRequest, SalaryPayment, Notification } from "./types";
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

export function getCurrentTimeEntry(userId: number): TimeEntry | null {
  const today = new Date().toISOString().split('T')[0];
  const entries = getTimeEntriesForUser(userId);
  return entries.find(entry =>
    entry.date === today &&
    ["clocked_in", "on_lunch", "on_break"].includes(entry.status)
  ) || null;
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
  return clockInTime.getHours() > 9 ||
         (clockInTime.getHours() === 9 && clockInTime.getMinutes() > 0);
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

export function autoGenerateMonthlySalaries(): void {
  if (typeof window === "undefined") return;

  const today = new Date();
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const workPeriodStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const workPeriodEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

  // Get all active employees with their salaries (ONLY employees, not bosses)
  const employees = [
    { id: 3, name: 'Larina', monthlySalary: 32444 }
    // Add more employees here, but NEVER include Ella (1) or Paul (2) as they are bosses
  ];

  employees.forEach(employee => {
    // Check if salary already exists for current month
    const existingSalary = getSalaryRecordsForEmployee(employee.id).find(
      record => record.paymentMonth === currentMonth
    );

    if (!existingSalary) {
      // Generate new salary record
      const salaryRecord: SalaryRecord = {
        id: `sal_${Date.now()}_${employee.id}`,
        employeeId: employee.id,
        employeeName: employee.name,
        amount: employee.monthlySalary,
        currency: 'PHP',
        paymentMonth: currentMonth,
        workPeriodStart: workPeriodStart.toISOString().split('T')[0],
        workPeriodEnd: workPeriodEnd.toISOString().split('T')[0],
        status: 'pending',
        paidDate: null,
        paidBy: null,
        autoGenerated: true,
        generatedDate: new Date().toISOString(),
        dueDate: `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-05`,
        reminderSent: false,
        employeeNotified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveSalaryRecord(salaryRecord);
    }
  });
}

export function markSalaryAsPaid(salaryId: number, paidBy: number): boolean {
  const records = getSalaryRecords();
  const salaryIndex = records.findIndex(r => r.id === salaryId.toString());

  if (salaryIndex === -1) return false;

  const salary = records[salaryIndex];
  salary.status = 'paid';
  salary.paidDate = new Date().toISOString();
  salary.paidBy = paidBy;
  salary.employeeNotified = true;
  salary.updatedAt = new Date().toISOString();

  saveSalaryRecord(salary);

  // Create notification for employee
  addNotification({
    userId: salary.employeeId,
    type: 'salary',
    title: 'Salary Payment Confirmation',
    message: `Your salary for ${salary.paymentMonth} (₱${salary.amount.toLocaleString()}) has been processed.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  return true;
}

export function sendSalaryReminders(): void {
  if (typeof window === "undefined") return;

  const today = new Date();
  const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

  const upcomingSalaries = getSalaryRecords().filter(record =>
    record.status === 'pending' &&
    !record.reminderSent &&
    new Date(record.dueDate) <= twoDaysFromNow
  );

  upcomingSalaries.forEach(salary => {
    // Create reminder notification for boss (current user)
    const bossId = getCurrentUserId();
    if ([1, 2].includes(bossId)) { // Only for bosses
      addNotification({
        userId: bossId,
        type: 'salary_reminder',
        title: 'Salary Payment Due Soon',
        message: `${salary.employeeName}'s salary (₱${salary.amount.toLocaleString()}) is due in 2 days`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    // Mark reminder as sent
    salary.reminderSent = true;
    salary.updatedAt = new Date().toISOString();
    saveSalaryRecord(salary);
  });
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