/**
 * Comprehensive Error Handling and Validation System
 *
 * Centralized error management with validation, logging, recovery strategies,
 * and user-friendly error messages for the HR Time Tracker.
 */

import { TimeEntry, User, BreakPeriod, TimeEntryStatus } from '../../database-schema';
import { notificationManager } from '../notifications/notificationManager';
import { localStorageManager } from '../storage/localStorageManager';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  STORAGE = 'storage',
  PERMISSION = 'permission',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  USER_INPUT = 'user_input'
}

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly technicalMessage?: string;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly userId?: string;
  public readonly recoverable: boolean;
  public readonly retryCount: number = 0;

  constructor(options: {
    code: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    userMessage: string;
    technicalMessage?: string;
    context?: Record<string, any>;
    userId?: string;
    recoverable?: boolean;
    cause?: Error;
  }) {
    super(options.userMessage);

    this.name = 'AppError';
    this.code = options.code;
    this.category = options.category;
    this.severity = options.severity;
    this.userMessage = options.userMessage;
    this.technicalMessage = options.technicalMessage;
    this.context = options.context;
    this.userId = options.userId;
    this.recoverable = options.recoverable ?? true;
    this.timestamp = new Date();

    if (options.cause) {
      this.cause = options.cause;
    }
  }

  /**
   * Create a copy with incremented retry count
   */
  withRetry(): AppError {
    const copy = new AppError({
      code: this.code,
      category: this.category,
      severity: this.severity,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      context: this.context,
      userId: this.userId,
      recoverable: this.recoverable
    });

    copy.retryCount = this.retryCount + 1;
    return copy;
  }

  /**
   * Check if error should be retried
   */
  shouldRetry(maxRetries: number = 3): boolean {
    return this.recoverable && this.retryCount < maxRetries;
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      severity: this.severity,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      userId: this.userId,
      recoverable: this.recoverable,
      retryCount: this.retryCount,
      stack: this.stack
    };
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(code: string, userMessage: string, field?: string, value?: any) {
    super({
      code,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      userMessage,
      technicalMessage: `Validation failed for field: ${field}`,
      context: { field, value }
    });

    this.name = 'ValidationError';
  }
}

/**
 * Storage error
 */
export class StorageError extends AppError {
  constructor(operation: string, key?: string, cause?: Error) {
    super({
      code: 'STORAGE_ERROR',
      category: ErrorCategory.STORAGE,
      severity: ErrorSeverity.HIGH,
      userMessage: 'Unable to save your data. Please check your browser settings and try again.',
      technicalMessage: `Storage operation failed: ${operation}`,
      context: { operation, key },
      cause
    });

    this.name = 'StorageError';
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  constructor(operation: string, url?: string, status?: number, cause?: Error) {
    super({
      code: 'NETWORK_ERROR',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Connection problem. Please check your internet connection and try again.',
      technicalMessage: `Network operation failed: ${operation}`,
      context: { operation, url, status },
      cause
    });

    this.name = 'NetworkError';
  }
}

/**
 * Permission error
 */
export class PermissionError extends AppError {
  constructor(action: string, resource?: string) {
    super({
      code: 'PERMISSION_DENIED',
      category: ErrorCategory.PERMISSION,
      severity: ErrorSeverity.HIGH,
      userMessage: `You don't have permission to ${action}. Please contact your administrator.`,
      technicalMessage: `Permission denied for action: ${action}`,
      context: { action, resource },
      recoverable: false
    });

    this.name = 'PermissionError';
  }
}

/**
 * Business logic error
 */
export class BusinessLogicError extends AppError {
  constructor(code: string, userMessage: string, context?: Record<string, any>) {
    super({
      code,
      category: ErrorCategory.BUSINESS_LOGIC,
      severity: ErrorSeverity.MEDIUM,
      userMessage,
      context,
      recoverable: true
    });

    this.name = 'BusinessLogicError';
  }
}

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  id: string;
  error: AppError;
  resolved: boolean;
  resolution?: string;
  reportedAt: Date;
  resolvedAt?: Date;
}

/**
 * Validation rule
 */
export interface ValidationRule<T = any> {
  name: string;
  required?: boolean;
  validate: (value: T) => boolean | string;
  message?: string;
}

/**
 * Validation schema
 */
export interface ValidationSchema {
  [key: string]: ValidationRule | ValidationSchema;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableNotifications: boolean;
  maxLogEntries: number;
  enableAutoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableErrorReporting: boolean;
  environment: 'development' | 'staging' | 'production';
}

/**
 * Error Handler implementation
 */
export class ErrorHandler {
  private readonly defaultConfig: ErrorHandlerConfig = {
    enableLogging: true,
    enableNotifications: true,
    maxLogEntries: 1000,
    enableAutoRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    enableErrorReporting: false,
    environment: 'production'
  };

  private config: ErrorHandlerConfig;
  private errorLog: ErrorLogEntry[] = [];
  private retryQueue: Map<string, { operation: Function; error: AppError }> = new Map();
  private validators: Map<string, ValidationSchema> = new Map();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
    this.setupGlobalErrorHandlers();
    this.loadErrorLog();
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new AppError({
        code: 'UNHANDLED_PROMISE_REJECTION',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        userMessage: 'An unexpected error occurred. The issue has been logged.',
        technicalMessage: `Unhandled promise rejection: ${event.reason}`,
        context: { reason: event.reason },
        recoverable: true,
        cause: event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      }));
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(new AppError({
        code: 'UNCAUGHT_ERROR',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.CRITICAL,
        userMessage: 'A critical error occurred. Please refresh the page.',
        technicalMessage: `Uncaught error: ${event.message}`,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        cause: event.error
      }));
    });
  }

  /**
   * Handle an error
   */
  async handleError(error: Error | AppError, userId?: string): Promise<void> {
    const appError = error instanceof AppError ? error : this.convertToAppError(error);

    if (userId) {
      appError.userId = userId;
    }

    // Log the error
    if (this.config.enableLogging) {
      this.logError(appError);
    }

    // Show notification for user
    if (this.config.enableNotifications && appError.severity !== ErrorSeverity.LOW) {
      await this.showErrorNotification(appError);
    }

    // Attempt auto-recovery for recoverable errors
    if (this.config.enableAutoRetry && appError.recoverable && appError.shouldRetry(this.config.maxRetries)) {
      this.scheduleRetry(appError);
    }

    // Report error in production
    if (this.config.enableErrorReporting && this.config.environment === 'production') {
      this.reportError(appError);
    }

    // Log to console in development
    if (this.config.environment === 'development') {
      console.error('App Error:', appError);
    }
  }

  /**
   * Convert generic Error to AppError
   */
  private convertToAppError(error: Error): AppError {
    if (error instanceof AppError) {
      return error;
    }

    // Storage errors
    if (error.message.includes('Storage') || error.message.includes('QuotaExceeded')) {
      return new StorageError('unknown', undefined, error);
    }

    // Network errors
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return new NetworkError('unknown', undefined, undefined, error);
    }

    // Default conversion
    return new AppError({
      code: 'UNKNOWN_ERROR',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: error.message,
      cause: error
    });
  }

  /**
   * Log error to storage
   */
  private logError(error: AppError): void {
    const logEntry: ErrorLogEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      resolved: false,
      reportedAt: new Date()
    };

    this.errorLog.unshift(logEntry);

    // Maintain max log entries
    if (this.errorLog.length > this.config.maxLogEntries) {
      this.errorLog = this.errorLog.slice(0, this.config.maxLogEntries);
    }

    this.saveErrorLog();
  }

  /**
   * Save error log to storage
   */
  private saveErrorLog(): void {
    try {
      localStorage.setItem('hr_tracker_error_log', JSON.stringify(this.errorLog));
    } catch (storageError) {
      console.warn('Failed to save error log:', storageError);
    }
  }

  /**
   * Load error log from storage
   */
  private loadErrorLog(): void {
    try {
      const stored = localStorage.getItem('hr_tracker_error_log');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.errorLog = parsed.map((entry: any) => ({
          ...entry,
          error: new AppError(entry.error),
          reportedAt: new Date(entry.reportedAt),
          resolvedAt: entry.resolvedAt ? new Date(entry.resolvedAt) : undefined
        }));
      }
    } catch (error) {
      console.warn('Failed to load error log:', error);
      this.errorLog = [];
    }
  }

  /**
   * Show error notification
   */
  private async showErrorNotification(error: AppError): Promise<void> {
    const priority = error.severity === ErrorSeverity.CRITICAL ? 'high' : 'medium';

    try {
      await notificationManager.createToast({
        userId: error.userId || 'anonymous',
        title: this.getNotificationTitle(error),
        message: error.userMessage,
        type: this.getNotificationType(error),
        priority: priority as any,
        duration: error.severity === ErrorSeverity.CRITICAL ? 0 : 8000,
        closable: true,
        action: error.recoverable ? {
          label: 'Retry',
          callback: () => this.retryError(error)
        } : undefined
      });
    } catch (notificationError) {
      console.error('Failed to show error notification:', notificationError);
    }
  }

  /**
   * Get notification title based on error
   */
  private getNotificationTitle(error: AppError): string {
    switch (error.category) {
      case ErrorCategory.VALIDATION:
        return '⚠️ Validation Error';
      case ErrorCategory.NETWORK:
        return '🌐 Connection Error';
      case ErrorCategory.STORAGE:
        return '💾 Storage Error';
      case ErrorCategory.PERMISSION:
        return '🔒 Permission Denied';
      case ErrorCategory.BUSINESS_LOGIC:
        return '⚡ Action Failed';
      case ErrorCategory.SYSTEM:
        return '🚨 System Error';
      default:
        return '❌ Error';
    }
  }

  /**
   * Get notification type based on error
   */
  private getNotificationType(error: AppError): any {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'error';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * Schedule retry for recoverable error
   */
  private scheduleRetry(error: AppError): void {
    const retryId = `${error.code}_${Date.now()}`;

    this.retryQueue.set(retryId, {
      operation: async () => {
        // This would be implemented by the calling code
        console.log(`Retrying operation for error: ${error.code}`);
      },
      error: error.withRetry()
    });

    setTimeout(() => {
      const queued = this.retryQueue.get(retryId);
      if (queued) {
        this.retryQueue.delete(retryId);
        // Execute retry logic here
      }
    }, this.config.retryDelay * (error.retryCount + 1));
  }

  /**
   * Manually retry an error
   */
  async retryError(error: AppError): Promise<void> {
    if (!error.recoverable) {
      await this.handleError(new AppError({
        code: 'RETRY_NOT_ALLOWED',
        category: ErrorCategory.BUSINESS_LOGIC,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'This action cannot be retried automatically.',
        technicalMessage: 'Attempted to retry non-recoverable error',
        context: { originalError: error.code }
      }));
      return;
    }

    try {
      // This would be implemented by the specific operation that failed
      console.log(`Manually retrying operation for error: ${error.code}`);

      // Mark error as resolved
      this.resolveError(error);
    } catch (retryError) {
      await this.handleError(retryError instanceof Error ? retryError : new Error(String(retryError)));
    }
  }

  /**
   * Resolve an error
   */
  resolveError(error: AppError, resolution?: string): void {
    const logEntry = this.errorLog.find(entry => entry.error.code === error.code);
    if (logEntry) {
      logEntry.resolved = true;
      logEntry.resolution = resolution || 'Resolved manually';
      logEntry.resolvedAt = new Date();
      this.saveErrorLog();
    }
  }

  /**
   * Report error to external service
   */
  private reportError(error: AppError): void {
    // In a real implementation, this would send to error reporting service
    console.log('Error reported:', error.toJSON());
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Register validation schema
   */
  registerValidationSchema(name: string, schema: ValidationSchema): void {
    this.validators.set(name, schema);
  }

  /**
   * Validate data against schema
   */
  validate(schemaName: string, data: any): { isValid: boolean; errors: string[] } {
    const schema = this.validators.get(schemaName);
    if (!schema) {
      throw new Error(`Validation schema '${schemaName}' not found`);
    }

    const errors: string[] = [];
    this.validateObject(schema, data, '', errors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate object against schema recursively
   */
  private validateObject(schema: ValidationSchema, data: any, path: string, errors: string[]): void {
    Object.entries(schema).forEach(([key, rule]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const value = data?.[key];

      if ('required' in rule && rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${currentPath} is required`);
        return;
      }

      if (value !== undefined && value !== null) {
        if ('validate' in rule) {
          const result = rule.validate(value);
          if (result === false) {
            errors.push(`${currentPath}: ${rule.message || 'Validation failed'}`);
          } else if (typeof result === 'string') {
            errors.push(`${currentPath}: ${result}`);
          }
        } else {
          // Nested schema
          this.validateObject(rule as ValidationSchema, value, currentPath, errors);
        }
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    resolved: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recent: ErrorLogEntry[];
  } {
    const total = this.errorLog.length;
    const resolved = this.errorLog.filter(entry => entry.resolved).length;

    const byCategory = Object.values(ErrorCategory).reduce((acc, category) => {
      acc[category] = this.errorLog.filter(entry => entry.error.category === category).length;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const bySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = this.errorLog.filter(entry => entry.error.severity === severity).length;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const recent = this.errorLog.slice(0, 10);

    return {
      total,
      resolved,
      byCategory,
      bySeverity,
      recent
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
    this.saveErrorLog();
  }

  /**
   * Get error log
   */
  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }
}

// Create and export singleton instance
export const errorHandler = new ErrorHandler();

