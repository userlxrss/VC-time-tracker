export interface User {
  id: number;
  firstName: string;
  email: string;
  profilePhoto?: string; // Base64 encoded image
  password: string; // Simple hash for demo purposes
}

export interface TimeEntry {
  id: number;
  userId: number;
  date: string; // "2025-11-11"
  clockIn: string; // ISO timestamp
  clockOut: string | null;
  lunchBreakStart: string | null;
  lunchBreakEnd: string | null;
  shortBreaks: Array<{ start: string; end: string | null }>;
  totalHours: number | null;
  status: "clocked_in" | "on_lunch" | "on_break" | "clocked_out" | "auto_closed";
  isLate: boolean;
  notes: string;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  leaveType: "annual" | "sick";
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  daysRequested: number;
  reason: string;
  status: "pending" | "approved" | "denied" | "auto_approved";
  approvedBy: number | null;
}

export interface SalaryPayment {
  id: number;
  userId: number;
  month: string; // "2025-11"
  amount: number; // 32444
  paymentDate: string;
  markedPaidBy: number;
  confirmedByEmployee: boolean;
  confirmedAt: string | null;
}

export interface Notification {
  id: number;
  userId: number;
  type: "leave_submitted" | "leave_approved" | "leave_denied" | "salary_paid" | "salary_confirmed" | "sick_leave" | "salary" | "salary_reminder";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: number;
  relatedType?: "leave" | "salary";
}