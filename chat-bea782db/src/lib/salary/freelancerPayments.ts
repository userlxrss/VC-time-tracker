/**
 * Freelancer Payment Calculation Utilities
 *
 * Comprehensive payment calculation system for freelancers with NO government deductions.
 * Features overtime calculation, bonus handling, and transparent payment breakdown.
 */

import {
  User,
  TimeEntry,
  SalaryRecord,
  PaymentStatus,
  InvoiceData,
  PayrollReport
} from '../../database-schema';
import { ManilaTimeManager, TimeCalculations } from '../../database-helpers';

// ==================== CONFIGURATION ====================

/**
 * Freelancer payment configuration
 */
export const FREELANCER_PAYMENT_CONFIG = {
  /** Standard monthly working hours */
  STANDARD_MONTHLY_HOURS: 160,

  /** Overtime rate multiplier */
  OVERTIME_RATE_MULTIPLIER: 1.25,

  /** Currency settings */
  CURRENCY: 'PHP',
  CURRENCY_SYMBOL: '₱',

  /** Payment terms */
  STANDARD_PAYMENT_TERMS: 'Net 30 days',

  /** Invoice numbering */
  INVOICE_PREFIX: 'INV-',

  /** Company information */
  COMPANY_INFO: {
    name: 'Tech Solutions Philippines Inc.',
    address: '123 Business Center, Makati City, Metro Manila, Philippines',
    contact: '+63 2 8123 4567',
    email: 'finance@techsolutions.ph'
  }
} as const;

// ==================== PAYMENT CALCULATION ENGINE ====================

/**
 * Freelancer Payment Calculator
 */
export class FreelancerPaymentCalculator {
  private timeManager = new ManilaTimeManager();

  /**
   * Calculate monthly salary for a freelancer
   */
  calculateMonthlySalary(
    user: User,
    timeEntries: TimeEntry[],
    payPeriodStart: Date,
    payPeriodEnd: Date,
    options: {
      bonusAmount?: number;
      incentiveAmount?: number;
      adjustmentAmount?: number;
      adjustmentReason?: string;
    } = {}
  ): Omit<SalaryRecord, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {

    // Filter time entries within pay period
    const periodEntries = timeEntries.filter(entry => {
      const entryDate = this.timeManager.toManilaTime(entry.clockIn);
      return entryDate >= payPeriodStart && entryDate <= payPeriodEnd;
    });

    // Calculate work metrics
    const workMetrics = this.calculateWorkMetrics(periodEntries);

    // Calculate base salary and overtime
    const paymentCalculation = this.calculateBasePayment(
      workMetrics.totalRegularHours,
      workMetrics.totalOvertimeHours,
      user.hourlyRate || 0
    );

    // Calculate total with additional compensation
    const totalAmount = paymentCalculation.regularAmount +
                       paymentCalculation.overtimeAmount +
                       (options.bonusAmount || 0) +
                       (options.incentiveAmount || 0) +
                       (options.adjustmentAmount || 0);

    return {
      userId: user.id,
      payPeriodStart,
      payPeriodEnd,
      payPeriodMonth: payPeriodStart.getMonth() + 1,
      payPeriodYear: payPeriodStart.getFullYear(),

      // Work summary
      daysWorked: workMetrics.daysWorked,
      totalHours: workMetrics.totalHours,
      totalRegularHours: workMetrics.totalRegularHours,
      totalOvertimeHours: workMetrics.totalOvertimeHours,
      requiredHours: FREELANCER_PAYMENT_CONFIG.STANDARD_MONTHLY_HOURS,

      // Payment calculation
      hourlyRate: user.hourlyRate || 0,
      overtimeRate: (user.hourlyRate || 0) * FREELANCER_PAYMENT_CONFIG.OVERTIME_RATE_MULTIPLIER,

      // Base payment breakdown
      baseSalary: paymentCalculation.regularAmount,
      overtimePay: paymentCalculation.overtimeAmount,
      grossAmount: paymentCalculation.regularAmount + paymentCalculation.overtimeAmount,
      totalAmount,

      // Additional compensation
      bonusAmount: options.bonusAmount,
      incentiveAmount: options.incentiveAmount,
      adjustmentAmount: options.adjustmentAmount,
      adjustmentReason: options.adjustmentReason,

      // Freelancer-specific (NO DEDUCTIONS)
      isFreelancer: user.isFreelancer,
      netAmount: totalAmount, // For freelancers, net = total

      // Status and workflow
      status: PaymentStatus.PENDING,
      generatedBy: 'system',

      // Validation
      isValidated: true,

      // Export status
      exportedToPayroll: false
    };
  }

  /**
   * Calculate work metrics from time entries
   */
  private calculateWorkMetrics(timeEntries: TimeEntry[]) {
    const totalHours = timeEntries.reduce((sum, entry) => {
      return sum + TimeCalculations.calculateTotalHours(entry);
    }, 0);

    const regularHours = Math.min(totalHours, FREELANCER_PAYMENT_CONFIG.STANDARD_MONTHLY_HOURS);
    const overtimeHours = Math.max(0, totalHours - FREELANCER_PAYMENT_CONFIG.STANDARD_MONTHLY_HOURS);

    // Count unique days worked
    const uniqueDays = new Set(
      timeEntries.map(entry =>
        this.timeManager.toManilaTime(entry.clockIn).toDateString()
      )
    ).size;

    return {
      daysWorked: uniqueDays,
      totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      totalRegularHours: Math.round(regularHours * 100) / 100,
      totalOvertimeHours: Math.round(overtimeHours * 100) / 100
    };
  }

  /**
   * Calculate base payment with overtime
   */
  private calculateBasePayment(
    regularHours: number,
    overtimeHours: number,
    hourlyRate: number
  ) {
    const regularAmount = regularHours * hourlyRate;
    const overtimeAmount = overtimeHours * hourlyRate * FREELANCER_PAYMENT_CONFIG.OVERTIME_RATE_MULTIPLIER;

    return {
      regularAmount: Math.round(regularAmount * 100) / 100,
      overtimeAmount: Math.round(overtimeAmount * 100) / 100
    };
  }

  /**
   * Generate payment breakdown explanation
   */
  generatePaymentBreakdown(salaryRecord: SalaryRecord): string[] {
    const breakdown = [
      `Base Hours: ${salaryRecord.totalRegularHours}h @ ${FREELANCER_PAYMENT_CONFIG.CURRENCY_SYMBOL}${salaryRecord.hourlyRate.toFixed(2)}/hour = ${FREELANCER_PAYMENT_CONFIG.CURRENCY_SYMBOL}${salaryRecord.baseSalary.toFixed(2)}`,
    ];

    if (salaryRecord.totalOvertimeHours > 0) {
      breakdown.push(`Overtime: ${salaryRecord.totalOvertimeHours}h @ ${FREELANCER_PAYMENT_CONFIG.CURRENCY_SYMBOL}${salaryRecord.overtimeRate.toFixed(2)}/hour = ${FREELANCER_PAYMENT_CONFIG.CURRENCY_SYMBOL}${salaryRecord.overtimePay.toFixed(2)}`);
    }

    if (salaryRecord.bonusAmount && salaryRecord.bonusAmount > 0) {
      breakdown.push(`Bonus: ${FREELANCER_PAYMENT_CONFIG.CURRENCY_SYMBOL}${salaryRecord.bonusAmount.toFixed(2)}`);
    }

    if (salaryRecord.incentiveAmount && salaryRecord.incentiveAmount > 0) {
      breakdown.push(`Incentive: ${FREELANCER_PAYMENT_CONFIG.CURRENCY_SYMBOL}${salaryRecord.incentiveAmount.toFixed(2)}`);
    }

    if (salaryRecord.adjustmentAmount && salaryRecord.adjustmentAmount !== 0) {
      const adjustmentType = salaryRecord.adjustmentAmount > 0 ? 'Adjustment' : 'Deduction';
      breakdown.push(`${adjustmentType}: ${FREELANCER_PAYMENT_CONFIG.CURRENCY_SYMBOL}${Math.abs(salaryRecord.adjustmentAmount).toFixed(2)}${salaryRecord.adjustmentReason ? ` (${salaryRecord.adjustmentReason})` : ''}`);
    }

    breakdown.push(`TOTAL PAYMENT: ${FREELANCER_PAYMENT_CONFIG.CURRENCY_SYMBOL}${salaryRecord.totalAmount.toFixed(2)}`);
    breakdown.push(`Status: ${this.formatPaymentStatus(salaryRecord.status)}`);
    breakdown.push(`Note: Freelancer - No tax withholding or government deductions`);

    return breakdown;
  }

  /**
   * Format payment status for display
   */
  private formatPaymentStatus(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'Pending Manager Confirmation';
      case PaymentStatus.APPROVED:
        return 'Confirmed - Awaiting Payment';
      case PaymentStatus.PAID:
        return 'Paid';
      case PaymentStatus.OVERDUE:
        return 'Payment Overdue';
      default:
        return status;
    }
  }

  /**
   * Validate salary record
   */
  validateSalaryRecord(salaryRecord: SalaryRecord): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (salaryRecord.totalHours < 0) {
      errors.push('Total hours cannot be negative');
    }

    if (salaryRecord.hourlyRate <= 0) {
      errors.push('Hourly rate must be positive');
    }

    if (salaryRecord.totalAmount < 0) {
      errors.push('Total amount cannot be negative');
    }

    // Logical validation
    const calculatedBase = salaryRecord.totalRegularHours * salaryRecord.hourlyRate;
    const calculatedOvertime = salaryRecord.totalOvertimeHours * salaryRecord.overtimeRate;
    const calculatedGross = calculatedBase + calculatedOvertime;

    const tolerance = 0.01; // Small tolerance for floating point rounding
    if (Math.abs(salaryRecord.baseSalary - calculatedBase) > tolerance) {
      errors.push('Base salary calculation mismatch');
    }

    if (Math.abs(salaryRecord.overtimePay - calculatedOvertime) > tolerance) {
      errors.push('Overtime pay calculation mismatch');
    }

    if (Math.abs(salaryRecord.grossAmount - calculatedGross) > tolerance) {
      errors.push('Gross amount calculation mismatch');
    }

    // Freelancer validation
    if (salaryRecord.isFreelancer && salaryRecord.netAmount !== salaryRecord.totalAmount) {
      errors.push('Freelancer net amount must equal total amount (no deductions)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// ==================== INVOICE GENERATION ====================

/**
 * Invoice Generator for Freelancers
 */
export class FreelancerInvoiceGenerator {
  private timeManager = new ManilaTimeManager();

  /**
   * Generate invoice data from salary record
   */
  generateInvoiceData(
    salaryRecord: SalaryRecord,
    user: User,
    options: {
      invoiceNumber?: string;
      dueDate?: Date;
    } = {}
  ): InvoiceData {
    const invoiceNumber = options.invoiceNumber || this.generateInvoiceNumber();
    const dueDate = options.dueDate || this.calculateDueDate(salaryRecord.payPeriodEnd);

    return {
      invoiceNumber,
      invoiceDate: this.timeManager.now(),
      dueDate,

      // Company information
      ...FREELANCER_PAYMENT_CONFIG.COMPANY_INFO,

      // Freelancer information
      freelancerName: `${user.firstName} ${user.lastName}`,
      freelancerAddress: 'Philippines', // Would be stored in user profile
      freelancerEmail: user.email,

      // Service details
      serviceDescription: 'Professional Services - Freelancer Contract',
      payPeriod: this.formatPayPeriod(salaryRecord.payPeriodStart, salaryRecord.payPeriodEnd),

      // Financial breakdown
      regularHours: salaryRecord.totalRegularHours,
      regularRate: salaryRecord.hourlyRate,
      regularAmount: salaryRecord.baseSalary,
      overtimeHours: salaryRecord.totalOvertimeHours,
      overtimeRate: salaryRecord.overtimeRate,
      overtimeAmount: salaryRecord.overtimePay,
      bonusAmount: salaryRecord.bonusAmount || 0,
      totalAmount: salaryRecord.totalAmount,
      currency: FREELANCER_PAYMENT_CONFIG.CURRENCY,

      // Payment information
      paymentMethod: user.paymentMethod || 'Bank Transfer',
      paymentTerms: FREELANCER_PAYMENT_CONFIG.STANDARD_PAYMENT_TERMS,

      // Notes
      notes: `Thank you for your excellent work this period! Total hours worked: ${salaryRecord.totalHours}h across ${salaryRecord.daysWorked} days.`,
      taxNote: 'Freelancer - No tax withholding applied'
    };
  }

  /**
   * Generate unique invoice number
   */
  private generateInvoiceNumber(): string {
    const now = this.timeManager.now();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `${FREELANCER_PAYMENT_CONFIG.INVOICE_PREFIX}${year}${month}${day}-${random}`;
  }

  /**
   * Calculate invoice due date
   */
  private calculateDueDate(payPeriodEnd: Date): Date {
    const dueDate = new Date(payPeriodEnd);
    dueDate.setDate(dueDate.getDate() + 30); // Net 30 days
    return dueDate;
  }

  /**
   * Format pay period for invoice
   */
  private formatPayPeriod(startDate: Date, endDate: Date): string {
    const options = { year: 'numeric', month: 'short', day: 'numeric' } as const;
    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  }
}

// ==================== EXPORT UTILITIES ====================

/**
 * Payroll Export Utilities
 */
export class PayrollExportUtils {
  /**
   * Generate payroll report data
   */
  generatePayrollReport(
    salaryRecords: SalaryRecord[],
    users: User[],
    reportType: 'monthly' | 'quarterly' | 'yearly' | 'custom',
    startDate: Date,
    endDate: Date
  ): PayrollReport {
    const reportId = `PAYROLL-${Date.now()}`;
    const now = new Date();

    // Filter records within period
    const periodRecords = salaryRecords.filter(record =>
      record.payPeriodStart >= startDate && record.payPeriodEnd <= endDate
    );

    // Calculate summary statistics
    const summary = this.calculateSummaryStatistics(periodRecords);

    // Department breakdown
    const departmentBreakdown = this.calculateDepartmentBreakdown(periodRecords, users);

    // Employee details
    const employeeDetails = this.calculateEmployeeDetails(periodRecords, users);

    return {
      reportId,
      reportName: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Payroll Report`,
      reportType,
      generatedAt: now,
      generatedBy: 'system',
      startDate,
      endDate,
      ...summary,
      departmentBreakdown,
      employeeDetails
    };
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummaryStatistics(salaryRecords: SalaryRecord[]) {
    const totalEmployees = new Set(salaryRecords.map(r => r.userId)).size;
    const totalHours = salaryRecords.reduce((sum, r) => sum + r.totalHours, 0);
    const totalRegularHours = salaryRecords.reduce((sum, r) => sum + r.totalRegularHours, 0);
    const totalOvertimeHours = salaryRecords.reduce((sum, r) => sum + r.totalOvertimeHours, 0);
    const totalPayroll = salaryRecords.reduce((sum, r) => sum + r.totalAmount, 0);

    const averageHourlyRate = totalRegularHours > 0
      ? salaryRecords.reduce((sum, r) => sum + r.hourlyRate, 0) / salaryRecords.length
      : 0;

    // Status breakdown
    const statusCount = salaryRecords.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<PaymentStatus, number>);

    return {
      totalEmployees,
      totalHours: Math.round(totalHours * 100) / 100,
      totalRegularHours: Math.round(totalRegularHours * 100) / 100,
      totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
      totalPayroll: Math.round(totalPayroll * 100) / 100,
      averageHourlyRate: Math.round(averageHourlyRate * 100) / 100,
      pendingCount: statusCount[PaymentStatus.PENDING] || 0,
      confirmedCount: statusCount[PaymentStatus.APPROVED] || 0,
      paidCount: statusCount[PaymentStatus.PAID] || 0,
      overdueCount: statusCount[PaymentStatus.OVERDUE] || 0
    };
  }

  /**
   * Calculate department breakdown
   */
  private calculateDepartmentBreakdown(salaryRecords: SalaryRecord[], users: User[]) {
    const deptMap = new Map<string, {
      employeeCount: number;
      totalHours: number;
      totalPayroll: number;
    }>();

    salaryRecords.forEach(record => {
      const user = users.find(u => u.id === record.userId);
      const dept = user?.department || 'Unknown';

      if (!deptMap.has(dept)) {
        deptMap.set(dept, { employeeCount: 0, totalHours: 0, totalPayroll: 0 });
      }

      const deptData = deptMap.get(dept)!;
      deptData.employeeCount += 1;
      deptData.totalHours += record.totalHours;
      deptData.totalPayroll += record.totalAmount;
    });

    return Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      employeeCount: data.employeeCount,
      totalHours: Math.round(data.totalHours * 100) / 100,
      totalPayroll: Math.round(data.totalPayroll * 100) / 100
    }));
  }

  /**
   * Calculate employee details
   */
  private calculateEmployeeDetails(salaryRecords: SalaryRecord[], users: User[]) {
    return salaryRecords.map(record => {
      const user = users.find(u => u.id === record.userId);
      return {
        employeeId: user?.employeeId || 'Unknown',
        employeeName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        department: user?.department || 'Unknown',
        position: user?.position || 'Unknown',
        hours: record.totalHours,
        overtimeHours: record.totalOvertimeHours,
        hourlyRate: record.hourlyRate,
        totalAmount: record.totalAmount,
        status: record.status
      };
    });
  }

  /**
   * Export to CSV format
   */
  exportToCSV(payrollReport: PayrollReport): string {
    const headers = [
      'Employee ID', 'Name', 'Department', 'Position',
      'Hours', 'Overtime Hours', 'Hourly Rate', 'Total Amount', 'Status'
    ];

    const rows = payrollReport.employeeDetails.map(emp => [
      emp.employeeId,
      emp.employeeName,
      emp.department,
      emp.position,
      emp.hours.toString(),
      emp.overtimeHours.toString(),
      `₱${emp.hourlyRate.toFixed(2)}`,
      `₱${emp.totalAmount.toFixed(2)}`,
      emp.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Export to Excel (placeholder for xlsx library integration)
   */
  async exportToExcel(payrollReport: PayrollReport): Promise<Blob> {
    // This would use the 'xlsx' library to create an Excel file
    // For now, return CSV as blob
    const csvContent = this.exportToCSV(payrollReport);
    return new Blob([csvContent], { type: 'text/csv' });
  }
}

// ==================== EXPORTS ====================

export {
  FreelancerPaymentCalculator,
  FreelancerInvoiceGenerator,
  PayrollExportUtils,
  FREELANCER_PAYMENT_CONFIG
};