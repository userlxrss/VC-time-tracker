/**
 * Salary Management Service
 *
 * Comprehensive service for managing salary records, payroll processing,
 * and salary-related operations for the HR Time Tracker.
 */

import {
  User,
  TimeEntry,
  SalaryRecord,
  PaymentStatus,
  SalaryGenerationConfig,
  PayrollBatch,
  Notification,
  NotificationType,
  NotificationPriority
} from '../../database-schema';
import {
  FreelancerPaymentCalculator,
  FreelancerInvoiceGenerator,
  PayrollExportUtils
} from './freelancerPayments';
import { LocalStorageHelper } from '../../database-helpers';

// ==================== STORAGE KEYS ====================

const SALARY_STORAGE_KEYS = {
  SALARY_RECORDS: 'hr_salary_records',
  PAYROLL_BATCHES: 'hr_payroll_batches',
  GENERATION_CONFIG: 'hr_salary_generation_config',
  NOTIFICATIONS: 'hr_salary_notifications'
} as const;

// ==================== INTERFACES ====================

export interface SalaryServiceOptions {
  enableAutoGeneration?: boolean;
  enableNotifications?: boolean;
  enableValidation?: boolean;
}

export interface SalaryGenerationResult {
  success: boolean;
  recordsGenerated: number;
  errors: string[];
  warnings: string[];
  generatedRecords: SalaryRecord[];
}

export interface SalaryConfirmationOptions {
  confirmAs?: string; // Manager ID
  notes?: string;
  sendNotification?: boolean;
}

// ==================== SALARY SERVICE ====================

/**
 * Main Salary Management Service
 */
export class SalaryService {
  private calculator: FreelancerPaymentCalculator;
  private invoiceGenerator: FreelancerInvoiceGenerator;
  private exportUtils: PayrollExportUtils;
  private storage: LocalStorageHelper;
  private options: SalaryServiceOptions;

  constructor(options: SalaryServiceOptions = {}) {
    this.calculator = new FreelancerPaymentCalculator();
    this.invoiceGenerator = new FreelancerInvoiceGenerator();
    this.exportUtils = new PayrollExportUtils();
    this.storage = new LocalStorageHelper();
    this.options = {
      enableAutoGeneration: true,
      enableNotifications: true,
      enableValidation: true,
      ...options
    };
  }

  // ==================== SALARY RECORD CRUD ====================

  /**
   * Get all salary records for a user
   */
  async getSalaryRecords(
    userId: string,
    options: {
      year?: number;
      month?: number;
      status?: PaymentStatus;
      limit?: number;
    } = {}
  ): Promise<SalaryRecord[]> {
    const records = this.getAllSalaryRecords();

    return records
      .filter(record => {
        // User filter
        if (record.userId !== userId) return false;

        // Year filter
        if (options.year && record.payPeriodYear !== options.year) return false;

        // Month filter
        if (options.month && record.payPeriodMonth !== options.month) return false;

        // Status filter
        if (options.status && record.status !== options.status) return false;

        return true;
      })
      .sort((a, b) => b.payPeriodStart.getTime() - a.payPeriodStart.getTime())
      .slice(0, options.limit || undefined);
  }

  /**
   * Get all salary records (for managers/admins)
   */
  async getAllSalaryRecordsForManagement(
    options: {
      year?: number;
      month?: number;
      status?: PaymentStatus;
      department?: string;
      limit?: number;
    } = {}
  ): Promise<SalaryRecord[]> {
    const records = this.getAllSalaryRecords();

    return records
      .filter(record => {
        // Year filter
        if (options.year && record.payPeriodYear !== options.year) return false;

        // Month filter
        if (options.month && record.payPeriodMonth !== options.month) return false;

        // Status filter
        if (options.status && record.status !== options.status) return false;

        return true;
      })
      .sort((a, b) => b.payPeriodStart.getTime() - a.payPeriodStart.getTime())
      .slice(0, options.limit || undefined);
  }

  /**
   * Get salary record by ID
   */
  async getSalaryRecordById(recordId: string): Promise<SalaryRecord | null> {
    const records = this.getAllSalaryRecords();
    return records.find(record => record.id === recordId) || null;
  }

  /**
   * Create or update salary record
   */
  async saveSalaryRecord(record: SalaryRecord): Promise<SalaryRecord> {
    const records = this.getAllSalaryRecords();
    const existingIndex = records.findIndex(r => r.id === record.id);

    // Validate record if enabled
    if (this.options.enableValidation) {
      const validation = this.calculator.validateSalaryRecord(record);
      if (!validation.isValid) {
        throw new Error(`Salary record validation failed: ${validation.errors.join(', ')}`);
      }
    }

    const updatedRecord = {
      ...record,
      updatedAt: new Date()
    };

    if (existingIndex >= 0) {
      records[existingIndex] = updatedRecord;
    } else {
      records.push(updatedRecord);
    }

    this.saveSalaryRecords(records);
    return updatedRecord;
  }

  /**
   * Delete salary record
   */
  async deleteSalaryRecord(recordId: string): Promise<boolean> {
    const records = this.getAllSalaryRecords();
    const filteredRecords = records.filter(r => r.id !== recordId);

    if (filteredRecords.length === records.length) {
      return false; // Record not found
    }

    this.saveSalaryRecords(filteredRecords);
    return true;
  }

  // ==================== SALARY GENERATION ====================

  /**
   * Generate monthly salary records
   */
  async generateMonthlySalaries(
    users: User[],
    timeEntries: TimeEntry[],
    year: number,
    month: number,
    options: {
      skipExisting?: boolean;
      generateOnlyForFreelancers?: boolean;
    } = {}
  ): Promise<SalaryGenerationResult> {
    const result: SalaryGenerationResult = {
      success: true,
      recordsGenerated: 0,
      errors: [],
      warnings: [],
      generatedRecords: []
    };

    try {
      // Calculate pay period
      const { startDate, endDate } = this.getPayPeriodDates(year, month);

      // Filter users based on options
      const targetUsers = options.generateOnlyForFreelancers
        ? users.filter(user => user.isFreelancer)
        : users;

      for (const user of targetUsers) {
        try {
          // Check if record already exists
          if (options.skipExisting) {
            const existingRecord = await this.getExistingSalaryRecord(user.id, year, month);
            if (existingRecord) {
              result.warnings.push(`Salary record already exists for ${user.firstName} ${user.lastName}`);
              continue;
            }
          }

          // Generate salary record
          const salaryRecord = this.calculator.calculateMonthlySalary(
            user,
            timeEntries,
            startDate,
            endDate
          );

          // Add system fields
          const completeRecord: SalaryRecord = {
            ...salaryRecord,
            id: this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Save record
          await this.saveSalaryRecord(completeRecord);
          result.recordsGenerated++;
          result.generatedRecords.push(completeRecord);

          // Send notification if enabled
          if (this.options.enableNotifications) {
            await this.sendSalaryGenerationNotification(user, completeRecord);
          }

        } catch (error) {
          const errorMsg = `Failed to generate salary for ${user.firstName} ${user.lastName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          result.success = false;
        }
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Auto-generate salaries for current month
   */
  async autoGenerateCurrentMonthSalaries(
    users: User[],
    timeEntries: TimeEntry[]
  ): Promise<SalaryGenerationResult> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Get generation configuration
    const config = this.getGenerationConfig();

    if (!config.autoGenerateMonthly) {
      return {
        success: false,
        recordsGenerated: 0,
        errors: ['Auto-generation is disabled'],
        warnings: [],
        generatedRecords: []
      };
    }

    return this.generateMonthlySalaries(users, timeEntries, year, month, {
      skipExisting: true,
      generateOnlyForFreelancers: false
    });
  }

  // ==================== PAYMENT WORKFLOW ====================

  /**
   * Confirm salary record (manager action)
   */
  async confirmSalaryRecord(
    recordId: string,
    options: SalaryConfirmationOptions = {}
  ): Promise<SalaryRecord> {
    const record = await this.getSalaryRecordById(recordId);
    if (!record) {
      throw new Error('Salary record not found');
    }

    if (record.status !== PaymentStatus.PENDING) {
      throw new Error(`Cannot confirm record with status: ${record.status}`);
    }

    const updatedRecord: SalaryRecord = {
      ...record,
      status: PaymentStatus.APPROVED,
      confirmedBy: options.confirmAs,
      confirmedAt: new Date(),
      notes: options.notes || record.notes,
      updatedAt: new Date()
    };

    const savedRecord = await this.saveSalaryRecord(updatedRecord);

    // Send notification if enabled
    if (this.options.enableNotifications && options.sendNotification !== false) {
      await this.sendSalaryConfirmationNotification(savedRecord);
    }

    return savedRecord;
  }

  /**
   * Mark salary record as paid
   */
  async markSalaryAsPaid(
    recordId: string,
    paymentData: {
      paymentDate: Date;
      paymentMethod: string;
      transactionId?: string;
      processedBy: string;
    }
  ): Promise<SalaryRecord> {
    const record = await this.getSalaryRecordById(recordId);
    if (!record) {
      throw new Error('Salary record not found');
    }

    if (record.status !== PaymentStatus.APPROVED) {
      throw new Error(`Cannot mark as paid record with status: ${record.status}`);
    }

    const updatedRecord: SalaryRecord = {
      ...record,
      status: PaymentStatus.PAID,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.transactionId,
      processedBy: paymentData.processedBy,
      updatedAt: new Date()
    };

    const savedRecord = await this.saveSalaryRecord(updatedRecord);

    // Send notification if enabled
    if (this.options.enableNotifications) {
      await this.sendSalaryPaidNotification(savedRecord);
    }

    return savedRecord;
  }

  /**
   * Bulk confirm salary records
   */
  async bulkConfirmSalaryRecords(
    recordIds: string[],
    options: SalaryConfirmationOptions = {}
  ): Promise<{ success: number; errors: string[] }> {
    let success = 0;
    const errors: string[] = [];

    for (const recordId of recordIds) {
      try {
        await this.confirmSalaryRecord(recordId, options);
        success++;
      } catch (error) {
        errors.push(`Failed to confirm record ${recordId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success, errors };
  }

  // ==================== PAYROLL BATCHES ====================

  /**
   * Create payroll batch
   */
  async createPayrollBatch(
    name: string,
    year: number,
    month: number,
    recordIds?: string[]
  ): Promise<PayrollBatch> {
    const { startDate, endDate } = this.getPayPeriodDates(year, month);

    // Get records for the period
    const periodRecords = recordIds
      ? await Promise.all(recordIds.map(id => this.getSalaryRecordById(id)))
      : await this.getAllSalaryRecordsForManagement({ year, month });

    const validRecords = periodRecords.filter((r): r is SalaryRecord => r !== undefined);

    const batch: PayrollBatch = {
      id: this.generateId(),
      batchId: `BATCH-${Date.now()}`,
      batchName: name,
      payPeriodStart: startDate,
      payPeriodEnd: endDate,
      totalEmployees: new Set(validRecords.map(r => r.userId)).size,
      totalAmount: validRecords.reduce((sum, r) => sum + r.totalAmount, 0),
      confirmedCount: validRecords.filter(r => r.status === PaymentStatus.APPROVED).length,
      paidCount: validRecords.filter(r => r.status === PaymentStatus.PAID).length,
      pendingCount: validRecords.filter(r => r.status === PaymentStatus.PENDING).length,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.savePayrollBatch(batch);
    return batch;
  }

  /**
   * Get payroll batches
   */
  async getPayrollBatches(): Promise<PayrollBatch[]> {
    return this.getAllPayrollBatches()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // ==================== INVOICES ====================

  /**
   * Generate invoice for salary record
   */
  async generateInvoice(
    recordId: string,
    user: User,
    options?: {
      invoiceNumber?: string;
      dueDate?: Date;
    }
  ) {
    const record = await this.getSalaryRecordById(recordId);
    if (!record) {
      throw new Error('Salary record not found');
    }

    return this.invoiceGenerator.generateInvoiceData(record, user, options);
  }

  // ==================== EXPORT ====================

  /**
   * Generate payroll report
   */
  async generatePayrollReport(
    year: number,
    month: number,
    users: User[],
    reportType: 'monthly' | 'quarterly' | 'yearly' | 'custom' = 'monthly'
  ) {
    const records = await this.getAllSalaryRecordsForManagement({ year, month });
    const { startDate, endDate } = this.getPayPeriodDates(year, month);

    return this.exportUtils.generatePayrollReport(
      records,
      users,
      reportType,
      startDate,
      endDate
    );
  }

  // ==================== PRIVATE METHODS ====================

  private getAllSalaryRecords(): SalaryRecord[] {
    try {
      const stored = localStorage.getItem(SALARY_STORAGE_KEYS.SALARY_RECORDS);
      const records = stored ? JSON.parse(stored) : [];
      return records.map((record: any) => this.convertDates(record));
    } catch (error) {
      console.error('Failed to load salary records:', error);
      return [];
    }
  }

  private saveSalaryRecords(records: SalaryRecord[]): void {
    try {
      localStorage.setItem(
        SALARY_STORAGE_KEYS.SALARY_RECORDS,
        JSON.stringify(records)
      );
    } catch (error) {
      console.error('Failed to save salary records:', error);
    }
  }

  private getAllPayrollBatches(): PayrollBatch[] {
    try {
      const stored = localStorage.getItem(SALARY_STORAGE_KEYS.PAYROLL_BATCHES);
      const batches = stored ? JSON.parse(stored) : [];
      return batches.map((batch: any) => this.convertDates(batch));
    } catch (error) {
      console.error('Failed to load payroll batches:', error);
      return [];
    }
  }

  private savePayrollBatch(batch: PayrollBatch): void {
    try {
      const batches = this.getAllPayrollBatches();
      const existingIndex = batches.findIndex(b => b.id === batch.id);

      if (existingIndex >= 0) {
        batches[existingIndex] = batch;
      } else {
        batches.push(batch);
      }

      localStorage.setItem(
        SALARY_STORAGE_KEYS.PAYROLL_BATCHES,
        JSON.stringify(batches)
      );
    } catch (error) {
      console.error('Failed to save payroll batch:', error);
    }
  }

  private getGenerationConfig(): SalaryGenerationConfig {
    try {
      const stored = localStorage.getItem(SALARY_STORAGE_KEYS.GENERATION_CONFIG);
      return stored ? JSON.parse(stored) : {
        autoGenerateMonthly: true,
        generateOnLastDay: true,
        generationTime: '23:00',
        requireManagerApproval: true,
        validateHours: true,
        minimumHoursRequired: 0,
        notifyOnGeneration: true,
        notifyOnConfirmation: true,
        notifyOnPayment: true,
        prorateNewHires: true,
        prorateTerminations: true,
        prorationMethod: 'daily'
      };
    } catch (error) {
      console.error('Failed to load generation config:', error);
      return {} as SalaryGenerationConfig;
    }
  }

  private async getExistingSalaryRecord(
    userId: string,
    year: number,
    month: number
  ): Promise<SalaryRecord | null> {
    const records = await this.getSalaryRecords(userId, { year, month });
    return records[0] || null;
  }

  private getPayPeriodDates(year: number, month: number): { startDate: Date; endDate: Date } {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month
    return { startDate, endDate };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private convertDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj;
    if (typeof obj !== 'object') return obj;

    const converted = { ...obj };
    for (const key in converted) {
      if (key.includes('Date') || key.includes('At')) {
        converted[key] = new Date(converted[key]);
      } else if (typeof converted[key] === 'object') {
        converted[key] = this.convertDates(converted[key]);
      }
    }
    return converted;
  }

  private async sendSalaryGenerationNotification(user: User, record: SalaryRecord): Promise<void> {
    const notification: Notification = {
      id: this.generateId(),
      userId: user.id,
      title: 'Salary Record Generated',
      message: `Your salary record for ${record.payPeriodMonth}/${record.payPeriodYear} has been generated. Amount: ₱${record.totalAmount.toFixed(2)}`,
      type: NotificationType.PAYMENT_UPDATE,
      priority: NotificationPriority.MEDIUM,
      isRead: false,
      channel: 'inbox',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.storage.addNotification(notification);
  }

  private async sendSalaryConfirmationNotification(record: SalaryRecord): Promise<void> {
    const notification: Notification = {
      id: this.generateId(),
      userId: record.userId,
      title: 'Salary Confirmed',
      message: `Your salary of ₱${record.totalAmount.toFixed(2)} for ${record.payPeriodMonth}/${record.payPeriodYear} has been confirmed and is awaiting payment.`,
      type: NotificationType.PAYMENT_UPDATE,
      priority: NotificationPriority.HIGH,
      isRead: false,
      channel: 'inbox',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.storage.addNotification(notification);
  }

  private async sendSalaryPaidNotification(record: SalaryRecord): Promise<void> {
    const notification: Notification = {
      id: this.generateId(),
      userId: record.userId,
      title: 'Salary Paid',
      message: `Your salary of ₱${record.totalAmount.toFixed(2)} has been paid! Transaction ID: ${record.transactionId || 'N/A'}`,
      type: NotificationType.PAYMENT_UPDATE,
      priority: NotificationPriority.HIGH,
      isRead: false,
      channel: 'inbox',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.storage.addNotification(notification);
  }
}

// ==================== EXPORTS ====================

export { SalaryService };