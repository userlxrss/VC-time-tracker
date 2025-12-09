import { TimeEntry, LeaveRequest, SalaryRecord, User } from './types';

// ==================== SALARY FUNCTIONS ====================

export function getSalaryRecords(): SalaryRecord[] {
  if (typeof window === "undefined") return [];
  const records = localStorage.getItem('vc_salary_records');
  return records ? JSON.parse(records) : [];
}

export function getSalaryRecordsForEmployee(employeeId: number): SalaryRecord[] {
  const allRecords = getSalaryRecords();
  return allRecords.filter(record => record.userId === employeeId || record.employeeId === employeeId);
}

export function saveSalaryRecord(record: SalaryRecord): void {
  const records = getSalaryRecords();
  const existingIndex = records.findIndex(r => r.id === record.id);

  if (existingIndex >= 0) {
    records[existingIndex] = { ...records[existingIndex], ...record };
  } else {
    records.push(record);
  }

  localStorage.setItem('vc_salary_records', JSON.stringify(records));
}

export function confirmSalaryPayment(paymentId: number): { success: boolean; message: string } {
  const records = getSalaryRecords();
  const payment = records.find(r => r.id === paymentId);

  if (!payment) {
    return { success: false, message: 'Payment not found' };
  }

  payment.status = 'paid';
  payment.confirmedByEmployee = true;
  payment.paidDate = new Date().toISOString();

  localStorage.setItem('vc_salary_records', JSON.stringify(records));

  return { success: true, message: 'Payment confirmed successfully' };
}

export function getCurrentMonthSalary(userId: number): SalaryRecord | null {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const records = getSalaryRecordsForEmployee(userId);

  return records.find(record => {
    if (record.type !== 'Salary') return false;
    const recordDate = new Date(record.dueDate);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  }) || null;
}

// ==================== TIME ENTRY FUNCTIONS ====================

export function getTimeEntries(): TimeEntry[] {
  if (typeof window === "undefined") return [];
  const entries = localStorage.getItem('vc_time_entries');
  return entries ? JSON.parse(entries) : [];
}

export function saveTimeEntry(entry: TimeEntry): void {
  const entries = getTimeEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);

  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }

  localStorage.setItem('vc_time_entries', JSON.stringify(entries));
}

// ==================== LEAVE REQUEST FUNCTIONS ====================

export function getLeaveRequests(): LeaveRequest[] {
  if (typeof window === "undefined") return [];
  const requests = localStorage.getItem('vc_leave_requests');
  return requests ? JSON.parse(requests) : [];
}

export function getLeaveRequestsForUser(userId: number): LeaveRequest[] {
  return getLeaveRequests().filter(request => request.userId === userId);
}

export function saveLeaveRequest(request: LeaveRequest): void {
  const requests = getLeaveRequests();
  const existingIndex = requests.findIndex(r => r.id === request.id);

  if (existingIndex >= 0) {
    requests[existingIndex] = request;
  } else {
    requests.push(request);
  }

  localStorage.setItem('vc_leave_requests', JSON.stringify(requests));
}

// ==================== INITIALIZE CORRECT DATA ====================

export function initializeCorrectSalaryData(): void {
  // Check if data already exists
  const existing = getSalaryRecords();

  if (existing.length > 0) {
    console.log('Salary data already exists, skipping initialization');
    return;
  }

  console.log('Initializing correct salary data for Larina...');

  // THE CORRECT DATA
  const correctData: SalaryRecord[] = [
    {
      id: 1,
      userId: 3,
      employeeId: 3,
      type: 'Reimburse',
      description: 'Walking Pad',
      amount: 3859.00,
      workPeriodStart: null,
      workPeriodEnd: null,
      dueDate: '2025-11-12',
      paidDate: '2025-11-12',
      status: 'paid',
      confirmedByEmployee: true,
      createdAt: '2025-11-12T00:00:00.000Z',
    },
    {
      id: 2,
      userId: 3,
      employeeId: 3,
      type: 'Salary',
      description: 'October 2025 Salary',
      amount: 32444.00,
      workPeriodStart: '2025-09-24',
      workPeriodEnd: '2025-10-23',
      dueDate: '2025-10-25',
      paidDate: '2025-10-25',
      status: 'paid',
      confirmedByEmployee: true,
      createdAt: '2025-10-25T00:00:00.000Z',
    },
    {
      id: 3,
      userId: 3,
      employeeId: 3,
      type: 'Salary',
      description: 'September 2025 Salary',
      amount: 32444.00,
      workPeriodStart: '2025-08-24',
      workPeriodEnd: '2025-09-23',
      dueDate: '2025-09-25',
      paidDate: '2025-09-25',
      status: 'paid',
      confirmedByEmployee: true,
      createdAt: '2025-09-25T00:00:00.000Z',
    },
    {
      id: 4,
      userId: 3,
      employeeId: 3,
      type: 'Reimburse',
      description: 'Monitor',
      amount: 4639.00,
      workPeriodStart: null,
      workPeriodEnd: null,
      dueDate: '2025-09-17',
      paidDate: '2025-09-17',
      status: 'paid',
      confirmedByEmployee: true,
      createdAt: '2025-09-17T00:00:00.000Z',
    },
    {
      id: 5,
      userId: 3,
      employeeId: 3,
      type: 'Reimburse',
      description: 'Ergonomic Chair',
      amount: 5611.00,
      workPeriodStart: null,
      workPeriodEnd: null,
      dueDate: '2025-09-09',
      paidDate: '2025-09-09',
      status: 'paid',
      confirmedByEmployee: true,
      createdAt: '2025-09-09T00:00:00.000Z',
    },
    {
      id: 6,
      userId: 3,
      employeeId: 3,
      type: 'Reimburse',
      description: 'Standing Desk',
      amount: 5186.00,
      workPeriodStart: null,
      workPeriodEnd: null,
      dueDate: '2025-09-09',
      paidDate: '2025-09-09',
      status: 'paid',
      confirmedByEmployee: true,
      createdAt: '2025-09-09T00:00:00.000Z',
    },
  ];

  // Save to localStorage
  localStorage.setItem('vc_salary_records', JSON.stringify(correctData));

  console.log('✅ Correct salary data initialized successfully!');
  console.log('Records:', correctData.length);
}

// ==================== USER FUNCTIONS ====================

export function getUserProfile(userId: number): User | null {
  return null; // Simplified for salary data restoration
}

export function saveUserProfile(user: User): void {
  // Simplified for salary data restoration
}

export function updateUserPassword(userId: number, password: string): void {
  // Simplified for salary data restoration
}

export function getCurrentUserId(): number {
  if (typeof window === "undefined") return 1;
  const userId = localStorage.getItem('vc_current_user_id');
  return userId ? parseInt(userId) : 1;
}

export function setCurrentUserId(userId: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem('vc_current_user_id', userId.toString());
}

export function getTimeEntriesForUser(userId: number): TimeEntry[] {
  return getTimeEntries().filter(entry => entry.userId === userId);
}

export function getUnreadNotificationsForUser(userId: number): any[] {
  return []; // Simplified for salary data restoration
}

export function getNotifications(): any[] {
  return []; // Simplified for salary data restoration
}

export function markNotificationAsRead(notificationId: string): void {
  // Simplified for salary data restoration
}

export function getPendingLeaveRequests(): LeaveRequest[] {
  return getLeaveRequests().filter(request => request.status === 'pending');
}

export function getPendingSalaries(): SalaryRecord[] {
  return getSalaryRecords().filter(record => record.status === 'pending');
}

export function getSalaryPaymentsForUser(userId: number): SalaryRecord[] {
  return getSalaryRecordsForEmployee(userId);
}

// ==================== THEME FUNCTIONS ====================

export function getTheme(): string {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem('vc_theme') || "light";
}

export function setTheme(theme: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem('vc_theme', theme);

  // Apply theme to document
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// ==================== UTILITY FUNCTIONS ====================

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString()}`;
}

// ==================== TIME ENTRY HELPER FUNCTIONS ====================

export function getConsistentTimeEntry(userId: number, date: string): { entry: TimeEntry | null; breakCount: number } {
  const entries = getTimeEntries();
  const entry = entries.find(e => e.userId === userId && e.date === date);

  if (!entry) {
    return { entry: null, breakCount: 0 };
  }

  // Calculate break count
  const breakCount = (entry.shortBreaks || []).length;

  return {
    entry: { ...entry },
    breakCount
  };
}

export function getCurrentTimeEntry(userId: number): TimeEntry | null {
  const entries = getTimeEntries();
  const today = new Date().toISOString().split('T')[0];

  return entries.find(e =>
    e.userId === userId &&
    e.date === today &&
    e.status !== 'clocked_out'
  ) || null;
}

export function calculateBreakCount(entry: TimeEntry): number {
  if (!entry) return 0;
  return (entry.shortBreaks || []).length;
}

// ==================== LEAVE REQUEST HELPER FUNCTIONS ====================

export function approveLeaveRequest(requestId: number, approverId: number): void {
  const requests = getLeaveRequests();
  const request = requests.find(r => r.id === requestId);

  if (request) {
    request.status = 'approved';
    request.approvedBy = approverId;
    localStorage.setItem('vc_leave_requests', JSON.stringify(requests));
  }
}

export function denyLeaveRequest(requestId: number, approverId: number): void {
  const requests = getLeaveRequests();
  const request = requests.find(r => r.id === requestId);

  if (request) {
    request.status = 'denied';
    request.approvedBy = approverId;
    localStorage.setItem('vc_leave_requests', JSON.stringify(requests));
  }
}

// ==================== SALARY HELPER FUNCTIONS ====================

export function getPendingSalaryPayments(userId?: number): SalaryRecord[] {
  const records = userId ? getSalaryRecordsForEmployee(userId) : getSalaryRecords();
  return records.filter(r => r.status === 'pending');
}

export function markSalaryAsPaid(salaryId: number): void {
  const records = getSalaryRecords();
  const salary = records.find(r => r.id === salaryId);

  if (salary) {
    salary.status = 'paid';
    salary.paidDate = new Date().toISOString();
    localStorage.setItem('vc_salary_records', JSON.stringify(records));
  }
}

// ==================== USER HELPER FUNCTIONS ====================

export function getUsersWithStatus(): User[] {
  // This would normally fetch from a users table
  // For now, return empty array or mock data
  return [];
}

// ==================== ADDITIONAL UTILITY FUNCTIONS ====================

export function formatTime(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function calculateHoursWorked(clockIn: string, clockOut?: string): number {
  if (!clockIn || !clockOut) return 0;
  const clockInTime = new Date(clockIn).getTime();
  const clockOutTime = new Date(clockOut).getTime();
  return Math.max(0, (clockOutTime - clockInTime) / (1000 * 60 * 60));
}

export function isLateArrival(clockIn: string, expectedTime: string = '09:00'): boolean {
  if (!clockIn) return false;
  const clockInTime = new Date(clockIn);
  const [hours, minutes] = expectedTime.split(':').map(Number);
  const expectedDateTime = new Date(clockInTime);
  expectedDateTime.setHours(hours, minutes, 0, 0);
  return clockInTime > expectedDateTime;
}

export function addNotification(notification: any): void {
  // Simplified notification system
  const notifications = JSON.parse(localStorage.getItem('vc_notifications') || '[]');
  notifications.push({
    ...notification,
    id: generateId(),
    createdAt: new Date().toISOString(),
    read: false
  });
  localStorage.setItem('vc_notifications', JSON.stringify(notifications));
}

export function saveSalaryPayment(payment: any): void {
  // Alias for saveSalaryRecord to maintain compatibility
  saveSalaryRecord(payment);
}

export function getSalaryPayments(): SalaryRecord[] {
  return getSalaryRecords();
}

export function saveNotification(notification: any): void {
  // Alias for addNotification to maintain compatibility
  addNotification(notification);
}

export function updateLeaveRequest(requestId: number, updates: Partial<LeaveRequest>): void {
  const requests = getLeaveRequests();
  const index = requests.findIndex(r => r.id === requestId);

  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    localStorage.setItem('vc_leave_requests', JSON.stringify(requests));
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes === 0) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

// ==================== AUTO-CLOSE STALE ENTRIES ====================

export function autoCloseStaleEntries(): void {
  if (typeof window === "undefined") return;

  const entries = getTimeEntries();
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  let modified = false;

  entries.forEach(entry => {
    const entryDate = new Date(entry.date);

    // If entry is from yesterday or earlier and still not clocked out
    if (entryDate < yesterday && entry.status !== 'clocked_out' && !entry.clockOut) {
      // Auto-close the entry
      entry.clockOut = new Date(entryDate.toDateString() + ' 17:00:00').toISOString(); // Close at 5 PM
      entry.status = 'clocked_out';

      // Calculate total hours
      const clockInTime = new Date(entry.clockIn).getTime();
      const clockOutTime = new Date(entry.clockOut).getTime();
      const hours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
      entry.totalHours = Math.max(0, hours);

      modified = true;
    }
  });

  if (modified) {
    localStorage.setItem('vc_time_entries', JSON.stringify(entries));
    console.log('Auto-closed stale time entries');
  }
}