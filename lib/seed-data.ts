import { TimeEntry, LeaveRequest, SalaryPayment } from './types';
import { STORAGE_KEYS, MONTHLY_SALARY } from './constants';

// Sample data for Larina (userId: 3)
export function seedSampleData() {
  if (typeof window === 'undefined') return;

  // Seed Time Entries for Larina (last 7 days)
  const timeEntries: TimeEntry[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const clockIn = new Date(date);
    clockIn.setHours(8, 45, 0, 0);

    const clockOut = new Date(date);
    clockOut.setHours(17, 30, 0, 0);

    const lunchStart = new Date(date);
    lunchStart.setHours(12, 0, 0, 0);

    const lunchEnd = new Date(date);
    lunchEnd.setHours(13, 0, 0, 0);

    timeEntries.push({
      id: Date.now() + i,
      userId: 3, // Larina
      date: dateStr,
      clockIn: clockIn.toISOString(),
      clockOut: clockOut.toISOString(),
      lunchBreakStart: lunchStart.toISOString(),
      lunchBreakEnd: lunchEnd.toISOString(),
      shortBreaks: [
        {
          start: new Date(date).setHours(15, 0, 0, 0).toString(),
          end: new Date(date).setHours(15, 15, 0, 0).toString()
        }
      ],
      totalHours: 8.75, // 8 hours 45 minutes minus lunch
      status: 'clocked_out',
      isLate: date.getDay() === 2, // Tuesday was late
      notes: i === 2 ? 'Worked on client presentation' : ''
    });
  }

  // Seed Leave Request for Larina
  const leaveRequests: LeaveRequest[] = [
    {
      id: Date.now(),
      userId: 3, // Larina
      leaveType: 'annual',
      startDate: '2025-11-28',
      endDate: '2025-11-28',
      isHalfDay: false,
      daysRequested: 1,
      reason: 'Personal appointment',
      status: 'pending',
      approvedBy: null
    }
  ];

  // Seed Salary Payment for Larina (this month)
  const salaryPayments: SalaryPayment[] = [
    {
      id: Date.now(),
      userId: 3, // Larina
      month: '2025-11',
      amount: MONTHLY_SALARY,
      paymentDate: new Date().toISOString(),
      markedPaidBy: 0, // Not paid yet
      confirmedByEmployee: false,
      confirmedAt: null
    }
  ];

  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(timeEntries));
  localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaveRequests));
  localStorage.setItem(STORAGE_KEYS.SALARY_PAYMENTS, JSON.stringify(salaryPayments));

  console.log('Sample data seeded for Larina!');
  console.log('Time entries:', timeEntries.length);
  console.log('Leave requests:', leaveRequests.length);
  console.log('Salary payments:', salaryPayments.length);
}