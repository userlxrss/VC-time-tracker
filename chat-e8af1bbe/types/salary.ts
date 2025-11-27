export interface User {
  id: number
  name: string
  email: string
  role: string
  department: string
  location: string
  avatar: string
  status: 'online' | 'offline' | 'away' | 'busy'
  hoursThisWeek: number
  timesheetStatus: 'submitted' | 'pending' | 'overdue'
  lastActive: string
}

export interface SalaryPayment {
  id: string
  employeeId: number
  employeeName: string
  amount: number
  currency: string
  month: string // Format: "2025-01"
  workPeriod: string // Format: "January 2025"
  paymentDate: string // Format: "2025-02-25"
  markedAsPaidDate: string | null // When boss marked as paid
  confirmedByEmployeeDate: string | null // When employee confirmed receipt
  status: 'pending' | 'marked_as_paid' | 'confirmed'
  notes: string | null
  markedByBossId: number | null
  markedByBossName: string | null
}

export interface SalaryNotification {
  id: string
  type: 'salary_marked_paid' | 'salary_confirmed'
  employeeId: number
  employeeName: string
  amount: number
  month: string
  timestamp: string
  message: string
  read: boolean
}

export interface SalaryFormData {
  employeeId: number
  employeeName: string
  month: string
  workPeriod: string
  paymentDate: string
  amount: number
  notes: string
}