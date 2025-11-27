/**
 * StorageManager - A robust data persistence system for web applications
 * Handles window.storage API with comprehensive error handling, validation, and fallback mechanisms
 */

export interface StorageConfig {
  prefix?: string;
  version?: string;
  fallbackToMemory?: boolean;
  enableDebug?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  validateOnLoad?: boolean;
  compressionEnabled?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

export interface StorageOperation {
  key: string;
  operation: 'set' | 'get' | 'remove' | 'clear';
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface DataSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';
  required?: boolean;
  nullable?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  properties?: Record<string, DataSchema>;
  items?: DataSchema;
}

export interface MigrationDefinition {
  version: string;
  description: string;
  migrate: (data: any) => any;
  rollback?: (data: any) => any;
}

export class StorageManager {
  private config: Required<StorageConfig>;
  private memoryStorage: Map<string, any> = new Map();
  private operationHistory: StorageOperation[] = [];
  private migrations: MigrationDefinition[] = [];
  private isStorageAvailable: boolean = false;
  private storageType: 'localStorage' | 'sessionStorage' | 'memory' = 'memory';

  constructor(config: StorageConfig = {}) {
    this.config = {
      prefix: config.prefix || 'app_',
      version: config.version || '1.0.0',
      fallbackToMemory: config.fallbackToMemory ?? true,
      enableDebug: config.enableDebug ?? false,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 100,
      validateOnLoad: config.validateOnLoad ?? true,
      compressionEnabled: config.compressionEnabled ?? false,
    };

    this.initializeStorage();
  }

  /**
   * Initialize storage and check availability
   */
  private initializeStorage(): void {
    this.isStorageAvailable = this.checkStorageAvailability();
    this.debugLog('Storage availability:', this.isStorageAvailable);

    if (!this.isStorageAvailable && this.config.fallbackToMemory) {
      this.debugLog('Falling back to memory storage');
      this.storageType = 'memory';
    } else if (this.isStorageAvailable) {
      this.storageType = typeof window !== 'undefined' && 'localStorage' in window
        ? 'localStorage'
        : 'sessionStorage';
    }

    this.loadStoredVersion();
    this.runMigrations();
  }

  /**
   * Check if storage is available and functional
   */
  private checkStorageAvailability(): boolean {
    if (typeof window === 'undefined') return false;

    const testKey = '__storage_test__';
    try {
      const storage = window.localStorage || window.sessionStorage;
      if (!storage) return false;

      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      this.debugLog('Storage not available:', error);
      return false;
    }
  }

  /**
   * Get the appropriate storage object
   */
  private getStorage(): Storage | Map<string, any> {
    if (this.storageType === 'memory') {
      return this.memoryStorage;
    }

    if (typeof window !== 'undefined') {
      return window.localStorage || window.sessionStorage;
    }

    return this.memoryStorage;
  }

  /**
   * Generate full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  /**
   * Serialize data for storage
   */
  private serialize(data: any): string {
    try {
      const payload = {
        data,
        version: this.config.version,
        timestamp: Date.now(),
      };

      let serialized = JSON.stringify(payload);

      if (this.config.compressionEnabled) {
        // Basic compression - replace common patterns
        serialized = serialized.replace(/\\n/g, '\n')
                              .replace(/\\t/g, '\t')
                              .replace(/\s+/g, ' ');
      }

      return serialized;
    } catch (error) {
      this.debugLog('Serialization error:', error);
      throw new Error(`Failed to serialize data: ${error}`);
    }
  }

  /**
   * Deserialize data from storage
   */
  private deserialize(serialized: string): any {
    try {
      const payload = JSON.parse(serialized);

      if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid data format');
      }

      return payload.data;
    } catch (error) {
      this.debugLog('Deserialization error:', error);
      throw new Error(`Failed to deserialize data: ${error}`);
    }
  }

  /**
   * Validate data against schema
   */
  private validateData(data: any, schema?: DataSchema): ValidationResult {
    if (!schema) {
      return { isValid: true, errors: [], sanitizedData: data };
    }

    const errors: string[] = [];
    let sanitizedData = data;

    // Type validation
    if (schema.required && (data === null || data === undefined)) {
      errors.push(`${schema.type} is required`);
    }

    if (data !== null && data !== undefined) {
      switch (schema.type) {
        case 'string':
          if (typeof data !== 'string') {
            sanitizedData = String(data);
          }
          if (schema.min && sanitizedData.length < schema.min) {
            errors.push(`String must be at least ${schema.min} characters`);
          }
          if (schema.max && sanitizedData.length > schema.max) {
            errors.push(`String must not exceed ${schema.max} characters`);
          }
          if (schema.pattern && !schema.pattern.test(sanitizedData)) {
            errors.push(`String does not match required pattern`);
          }
          break;

        case 'number':
          const num = Number(data);
          if (isNaN(num)) {
            errors.push('Value must be a valid number');
          } else {
            sanitizedData = num;
            if (schema.min !== undefined && sanitizedData < schema.min) {
              errors.push(`Number must be at least ${schema.min}`);
            }
            if (schema.max !== undefined && sanitizedData > schema.max) {
              errors.push(`Number must not exceed ${schema.max}`);
            }
          }
          break;

        case 'boolean':
          sanitizedData = Boolean(data);
          break;

        case 'date':
          const date = new Date(data);
          if (isNaN(date.getTime())) {
            errors.push('Invalid date format');
          } else {
            sanitizedData = date;
          }
          break;

        case 'object':
          if (typeof data !== 'object' || Array.isArray(data)) {
            errors.push('Value must be an object');
          } else if (schema.properties) {
            const objResult = this.validateObject(data, schema.properties);
            errors.push(...objResult.errors);
            sanitizedData = objResult.sanitizedData;
          }
          break;

        case 'array':
          if (!Array.isArray(data)) {
            errors.push('Value must be an array');
          } else if (schema.items) {
            const arrayErrors: string[] = [];
            sanitizedData = data.map((item, index) => {
              const result = this.validateData(item, schema.items);
              if (!result.isValid) {
                arrayErrors.push(`Item ${index}: ${result.errors.join(', ')}`);
              }
              return result.sanitizedData;
            });
            errors.push(...arrayErrors);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData,
    };
  }

  /**
   * Validate object properties
   */
  private validateObject(obj: any, properties: Record<string, DataSchema>): ValidationResult {
    const errors: string[] = [];
    const sanitizedObj: any = {};

    for (const [key, schema] of Object.entries(properties)) {
      const result = this.validateData(obj[key], schema);
      if (!result.isValid) {
        errors.push(`${key}: ${result.errors.join(', ')}`);
      } else {
        sanitizedObj[key] = result.sanitizedData;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitizedObj,
    };
  }

  /**
   * Execute storage operation with retry logic
   */
  private async executeOperation<T>(
    operation: () => T,
    operationType: string,
    key: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = operation();
        this.recordOperation(key, operationType as any, true);
        return result;
      } catch (error) {
        lastError = error as Error;
        this.debugLog(`Operation ${operationType} failed (attempt ${attempt}):`, error);

        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    this.recordOperation(key, operationType as any, false, lastError?.message);
    throw lastError || new Error(`Operation ${operationType} failed after ${this.config.maxRetries} attempts`);
  }

  /**
   * Record operation in history
   */
  private recordOperation(
    key: string,
    operation: StorageOperation['operation'],
    success: boolean,
    error?: string
  ): void {
    const record: StorageOperation = {
      key: this.getFullKey(key),
      operation,
      timestamp: Date.now(),
      success,
      error,
    };

    this.operationHistory.push(record);

    // Keep only last 100 operations
    if (this.operationHistory.length > 100) {
      this.operationHistory.shift();
    }

    this.debugLog('Operation recorded:', record);
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Debug logging
   */
  private debugLog(...args: any[]): void {
    if (this.config.enableDebug) {
      console.log('[StorageManager]', ...args);
    }
  }

  /**
   * Load stored version
   */
  private loadStoredVersion(): void {
    try {
      const storedVersion = this.get('__version__', { persist: false });
      if (storedVersion !== null && storedVersion !== this.config.version) {
        this.debugLog('Version mismatch:', { stored: storedVersion, current: this.config.version });
      }
    } catch (error) {
      this.debugLog('Failed to load version:', error);
    }
  }

  /**
   * Run migrations if needed
   */
  private runMigrations(): void {
    if (this.migrations.length === 0) return;

    try {
      const lastMigration = this.get('__last_migration__', { persist: false });

      for (const migration of this.migrations) {
        if (!lastMigration || this.compareVersions(migration.version, lastMigration) > 0) {
          this.debugLog('Running migration:', migration.version);
          this.migrateData(migration);
          this.set('__last_migration__', migration.version, { persist: false });
        }
      }
    } catch (error) {
      this.debugLog('Migration failed:', error);
    }
  }

  /**
   * Migrate stored data
   */
  private migrateData(migration: MigrationDefinition): void {
    const storage = this.getStorage();

    if (storage instanceof Map) return;

    const keys = Object.keys(storage);
    for (const key of keys) {
      if (key.startsWith(this.config.prefix)) {
        try {
          const data = this.get(key.replace(this.config.prefix, ''), { persist: false });
          if (data !== null) {
            const migratedData = migration.migrate(data);
            this.set(key.replace(this.config.prefix, ''), migratedData, { persist: false });
          }
        } catch (error) {
          this.debugLog(`Migration failed for key ${key}:`, error);
        }
      }
    }
  }

  /**
   * Compare version strings
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  // Public API Methods

  /**
   * Set data in storage
   */
  public async set<T>(
    key: string,
    data: T,
    options: {
      schema?: DataSchema;
      persist?: boolean;
      ttl?: number; // Time to live in milliseconds
    } = {}
  ): Promise<void> {
    const { schema, persist = true, ttl } = options;

    return this.executeOperation(
      () => {
        // Validate data
        const validation = this.validateData(data, schema);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        const serialized = this.serialize(validation.sanitizedData);
        const fullKey = this.getFullKey(key);
        const storage = this.getStorage();

        if (storage instanceof Map) {
          storage.set(fullKey, serialized);
        } else {
          storage.setItem(fullKey, serialized);
        }

        // Set TTL if provided
        if (ttl) {
          this.set(`${key}_ttl`, Date.now() + ttl, { persist: false });
        }

        this.debugLog('Data set successfully:', { key, size: serialized.length });
      },
      'set',
      key
    );
  }

  /**
   * Get data from storage
   */
  public async get<T>(
    key: string,
    options: {
      schema?: DataSchema;
      persist?: boolean;
      defaultValue?: T;
    } = {}
  ): Promise<T | null> {
    const { schema, persist = true, defaultValue } = options;

    return this.executeOperation(
      () => {
        const fullKey = this.getFullKey(key);
        const storage = this.getStorage();

        // Check TTL
        const ttlKey = `${key}_ttl`;
        const ttl = this.get(ttlKey, { persist: false });
        if (ttl && Date.now() > ttl) {
          this.remove(ttlKey, { persist: false });
          this.remove(key, { persist: false });
          return defaultValue ?? null;
        }

        let serialized: string | null;

        if (storage instanceof Map) {
          serialized = storage.get(fullKey) || null;
        } else {
          serialized = storage.getItem(fullKey);
        }

        if (serialized === null) {
          return defaultValue ?? null;
        }

        const data = this.deserialize(serialized);

        // Validate on load if enabled
        if (this.config.validateOnLoad && schema) {
          const validation = this.validateData(data, schema);
          if (!validation.isValid) {
            this.debugLog('Loaded data validation failed:', validation.errors);
            return defaultValue ?? null;
          }
          return validation.sanitizedData;
        }

        return data;
      },
      'get',
      key
    );
  }

  /**
   * Remove data from storage
   */
  public async remove(
    key: string,
    options: { persist?: boolean } = {}
  ): Promise<void> {
    const { persist = true } = options;

    return this.executeOperation(
      () => {
        const fullKey = this.getFullKey(key);
        const storage = this.getStorage();

        if (storage instanceof Map) {
          storage.delete(fullKey);
        } else {
          storage.removeItem(fullKey);
        }

        // Also remove TTL if exists
        const ttlKey = `${key}_ttl`;
        this.remove(ttlKey, { persist: false });

        this.debugLog('Data removed successfully:', key);
      },
      'remove',
      key
    );
  }

  /**
   * Clear all data with prefix
   */
  public async clear(options: { persist?: boolean } = {}): Promise<void> {
    const { persist = true } = options;

    return this.executeOperation(
      () => {
        const storage = this.getStorage();

        if (storage instanceof Map) {
          storage.clear();
        } else {
          const keys = Object.keys(storage);
          for (const key of keys) {
            if (key.startsWith(this.config.prefix)) {
              storage.removeItem(key);
            }
          }
        }

        this.debugLog('Storage cleared successfully');
      },
      'clear',
      '*'
    );
  }

  /**
   * Get all keys with prefix
   */
  public async getKeys(): Promise<string[]> {
    const storage = this.getStorage();
    const keys: string[] = [];

    if (storage instanceof Map) {
      for (const key of storage.keys()) {
        if (key.startsWith(this.config.prefix)) {
          keys.push(key.replace(this.config.prefix, ''));
        }
      }
    } else {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.config.prefix)) {
          keys.push(key.replace(this.config.prefix, ''));
        }
      }
    }

    return keys;
  }

  /**
   * Get storage size (approximate)
   */
  public async getSize(): Promise<number> {
    const storage = this.getStorage();
    let size = 0;

    if (storage instanceof Map) {
      for (const [key, value] of storage.entries()) {
        size += key.length + String(value).length;
      }
    } else {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key);
          size += key.length + (value?.length || 0);
        }
      }
    }

    return size;
  }

  /**
   * Export all data
   */
  public async export(): Promise<Record<string, any>> {
    const keys = await this.getKeys();
    const exportData: Record<string, any> = {};

    for (const key of keys) {
      const data = await this.get(key);
      if (data !== null) {
        exportData[key] = data;
      }
    }

    return exportData;
  }

  /**
   * Import data
   */
  public async import(
    data: Record<string, any>,
    options: {
      overwrite?: boolean;
      schema?: Record<string, DataSchema>;
    } = {}
  ): Promise<void> {
    const { overwrite = false, schema } = options;

    for (const [key, value] of Object.entries(data)) {
      if (overwrite) {
        await this.set(key, value, { schema: schema?.[key] });
      } else {
        const existing = await this.get(key);
        if (existing === null) {
          await this.set(key, value, { schema: schema?.[key] });
        }
      }
    }

    this.debugLog('Data import completed');
  }

  /**
   * Add migration
   */
  public addMigration(migration: MigrationDefinition): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => this.compareVersions(a.version, b.version));
  }

  /**
   * Get operation history
   */
  public getOperationHistory(): StorageOperation[] {
    return [...this.operationHistory];
  }

  /**
   * Get storage info
   */
  public getStorageInfo(): {
    type: string;
    available: boolean;
    size: number;
    keyCount: number;
  } {
    return {
      type: this.storageType,
      available: this.isStorageAvailable,
      size: 0, // Would need async call to get actual size
      keyCount: this.memoryStorage.size,
    };
  }

  /**
   * Enable/disable debug mode
   */
  public setDebugMode(enabled: boolean): void {
    this.config.enableDebug = enabled;
  }

  /**
   * Cleanup expired TTL entries
   */
  public async cleanupExpired(): Promise<void> {
    const keys = await this.getKeys();

    for (const key of keys) {
      const ttl = await this.get(`${key}_ttl`, { persist: false });
      if (ttl && Date.now() > ttl) {
        await this.remove(key);
        await this.remove(`${key}_ttl`);
      }
    }
  }
}

export default StorageManager;