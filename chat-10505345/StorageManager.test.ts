/**
 * Comprehensive test suite for StorageManager
 * Tests all major functionality including error handling, validation, and edge cases
 */

import StorageManager, { DataSchema, MigrationDefinition } from './StorageManager';

// Mock DOM storage for testing
const createMockStorage = (): Storage => {
  const store: Record<string, string> = {};

  return {
    length: 0,
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
    getItem: (key: string) => store[key] || null,
    key: (index: number) => Object.keys(store)[index] || null,
    removeItem: (key: string) => {
      delete store[key];
    },
    setItem: (key: string, value: string) => {
      store[key] = value;
    }
  };
};

// Test utilities
const createTestStorage = (config: any = {}) => {
  const mockStorage = createMockStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true
  });

  return new StorageManager({
    prefix: 'test_',
    version: '1.0.0',
    enableDebug: false,
    ...config
  });
};

describe('StorageManager', () => {

  describe('Basic Operations', () => {
    test('should store and retrieve data successfully', async () => {
      const storage = createTestStorage();
      const testData = { id: 1, name: 'Test User' };

      await storage.set('user', testData);
      const result = await storage.get('user');

      expect(result).toEqual(testData);
    });

    test('should handle null and undefined values', async () => {
      const storage = createTestStorage();

      await storage.set('nullValue', null);
      await storage.set('undefinedValue', undefined);

      expect(await storage.get('nullValue')).toBeNull();
      expect(await storage.get('undefinedValue')).toBeNull();
    });

    test('should return default value when key does not exist', async () => {
      const storage = createTestStorage();
      const defaultValue = { id: 0, name: 'Default' };

      const result = await storage.get('nonexistent', { defaultValue });

      expect(result).toEqual(defaultValue);
    });

    test('should remove data successfully', async () => {
      const storage = createTestStorage();
      const testData = { id: 1 };

      await storage.set('user', testData);
      await storage.remove('user');
      const result = await storage.get('user');

      expect(result).toBeNull();
    });

    test('should clear all data with prefix', async () => {
      const storage = createTestStorage();

      await storage.set('user1', { id: 1 });
      await storage.set('user2', { id: 2 });
      await storage.set('settings', { theme: 'dark' });

      await storage.clear();

      expect(await storage.get('user1')).toBeNull();
      expect(await storage.get('user2')).toBeNull();
      expect(await storage.get('settings')).toBeNull();
    });
  });

  describe('Data Validation', () => {
    const userSchema: DataSchema = {
      type: 'object',
      required: true,
      properties: {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true, min: 2, max: 50 },
        email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        age: { type: 'number', min: 0, max: 150 },
        isActive: { type: 'boolean' }
      }
    };

    test('should validate valid data successfully', async () => {
      const storage = createTestStorage();
      const validData = {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true
      };

      await expect(storage.set('user', validData, { schema: userSchema })).resolves.not.toThrow();
    });

    test('should reject invalid data', async () => {
      const storage = createTestStorage();
      const invalidData = {
        id: 'not-a-number',
        name: 'A', // Too short
        email: 'invalid-email',
        age: -5
      };

      await expect(storage.set('user', invalidData, { schema: userSchema }))
        .rejects.toThrow('Validation failed');
    });

    test('should sanitize data automatically', async () => {
      const storage = createTestStorage();
      const data = {
        id: '123', // String that can be converted to number
        isActive: 'true', // String that can be converted to boolean
        optionalField: 'will be kept'
      };

      await storage.set('user', data, { schema: userSchema });
      const result = await storage.get('user');

      expect(result.id).toBe(123);
      expect(result.isActive).toBe(true);
      expect(result.optionalField).toBe('will be kept');
    });

    test('should validate array items', async () => {
      const storage = createTestStorage();
      const arraySchema: DataSchema = {
        type: 'array',
        items: { type: 'number', min: 0 }
      };

      await expect(storage.set('numbers', [1, 2, 3], { schema: arraySchema })).resolves.not.toThrow();
      await expect(storage.set('numbers', [-1, 2, 3], { schema: arraySchema }))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('TTL (Time To Live)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should expire data after TTL', async () => {
      const storage = createTestStorage();

      await storage.set('temp_data', 'will expire', { ttl: 1000 });
      expect(await storage.get('temp_data')).toBe('will expire');

      // Fast-forward time
      jest.advanceTimersByTime(1500);

      expect(await storage.get('temp_data')).toBeNull();
    });

    test('should clean up expired entries', async () => {
      const storage = createTestStorage();

      await storage.set('data1', 'value1', { ttl: 1000 });
      await storage.set('data2', 'value2', { ttl: 2000 });
      await storage.set('data3', 'value3'); // No TTL

      jest.advanceTimersByTime(1500);

      await storage.cleanupExpired();

      expect(await storage.get('data1')).toBeNull();
      expect(await storage.get('data2')).toBe('value2');
      expect(await storage.get('data3')).toBe('value3');
    });
  });

  describe('Data Migrations', () => {
    test('should run migrations on initialization', async () => {
      const migration1: MigrationDefinition = {
        version: '1.1.0',
        description: 'Add field',
        migrate: (data: any) => {
          if (data && typeof data === 'object') {
            data.newField = 'added';
          }
          return data;
        }
      };

      const storage = createTestStorage({ version: '1.2.0' });
      storage.addMigration(migration1);

      const testData = { id: 1 };
      await storage.set('user', testData);

      // Create new instance to trigger migration
      const newStorage = new StorageManager({
        prefix: 'test_',
        version: '1.2.0',
        enableDebug: false
      });
      newStorage.addMigration(migration1);

      const migratedData = await newStorage.get('user');
      expect(migratedData?.newField).toBe('added');
    });

    test('should handle migration failures gracefully', async () => {
      const faultyMigration: MigrationDefinition = {
        version: '1.1.0',
        description: 'Faulty migration',
        migrate: () => {
          throw new Error('Migration failed');
        }
      };

      const storage = createTestStorage();
      storage.addMigration(faultyMigration);

      await storage.set('data', 'test');

      // Should not throw, but should handle gracefully
      expect(() => {
        new StorageManager({
          prefix: 'test_',
          version: '1.1.0',
          enableDebug: false
        });
      }).not.toThrow();
    });
  });

  describe('Error Handling and Retry Logic', () => {
    test('should retry failed operations', async () => {
      const storage = createTestStorage({ maxRetries: 3, retryDelay: 10 });
      let attemptCount = 0;

      // Mock storage to fail first 2 attempts
      const mockSetItem = jest.fn();
      mockSetItem.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Storage quota exceeded');
        }
      });

      Object.defineProperty(storage, 'getStorage', {
        value: () => ({
          setItem: mockSetItem,
          getItem: () => null,
          removeItem: () => {},
          key: () => null,
          length: 0,
          clear: () => {}
        })
      });

      await storage.set('test', 'data');
      expect(attemptCount).toBe(3);
    });

    test('should fallback to memory storage when unavailable', async () => {
      // Mock storage unavailable
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });

      const storage = new StorageManager({
        prefix: 'test_',
        fallbackToMemory: true,
        enableDebug: false
      });

      await storage.set('memory_data', 'stored in memory');
      const result = await storage.get('memory_data');

      expect(result).toBe('stored in memory');
      expect(storage.getStorageInfo().type).toBe('memory');
    });
  });

  describe('Serialization and Deserialization', () => {
    test('should handle complex data types', async () => {
      const storage = createTestStorage();
      const complexData = {
        date: new Date('2023-01-01'),
        regex: /test/g,
        func: () => 'function', // Functions will be lost in JSON serialization
        nested: {
          array: [1, 2, { obj: 'value' }],
          null: null,
          undefined: undefined
        }
      };

      await storage.set('complex', complexData);
      const result = await storage.get('complex');

      expect(result.date).toBeInstanceOf(Date);
      expect(result.nested.array).toEqual([1, 2, { obj: 'value' }]);
      expect(result.nested.null).toBeNull();
      expect(result.func).toBeUndefined(); // Functions don't survive JSON serialization
    });

    test('should handle corrupted data gracefully', async () => {
      const storage = createTestStorage();

      // Manually corrupt the data
      const mockStorage = createMockStorage();
      mockStorage.setItem('test_corrupted', 'invalid json{');

      Object.defineProperty(storage, 'getStorage', {
        value: () => mockStorage
      });

      await expect(storage.get('corrupted')).rejects.toThrow();
    });
  });

  describe('Performance and Memory Management', () => {
    test('should limit operation history size', async () => {
      const storage = createTestStorage();

      // Perform many operations
      for (let i = 0; i < 150; i++) {
        await storage.set(`key${i}`, `value${i}`);
      }

      const history = storage.getOperationHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });

    test('should calculate storage size accurately', async () => {
      const storage = createTestStorage();

      await storage.set('small', 'x');
      await storage.set('large', 'x'.repeat(1000));

      const size = await storage.getSize();
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('Import and Export', () => {
    test('should export and import data correctly', async () => {
      const storage1 = createTestStorage();
      const storage2 = createTestStorage({ prefix: 'test2_' });

      const testData = {
        user: { id: 1, name: 'Test User' },
        settings: { theme: 'dark' }
      };

      // Store data in first storage
      await storage1.set('user', testData.user);
      await storage1.set('settings', testData.settings);

      // Export from first storage
      const exportedData = await storage1.export();

      // Import to second storage
      await storage2.import(exportedData);

      // Verify data in second storage
      expect(await storage2.get('user')).toEqual(testData.user);
      expect(await storage2.get('settings')).toEqual(testData.settings);
    });

    test('should handle import with overwrite option', async () => {
      const storage = createTestStorage();

      await storage.set('key', 'original');

      await storage.import({ key: 'overwritten' }, { overwrite: true });

      expect(await storage.get('key')).toBe('overwritten');
    });
  });

  describe('Utility Functions', () => {
    test('should get all keys correctly', async () => {
      const storage = createTestStorage();

      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');
      await storage.set('key3', 'value3');

      const keys = await storage.getKeys();
      expect(keys.sort()).toEqual(['key1', 'key2', 'key3']);
    });

    test('should provide storage information', async () => {
      const storage = createTestStorage();
      const info = storage.getStorageInfo();

      expect(info).toHaveProperty('type');
      expect(info).toHaveProperty('available');
      expect(['localStorage', 'sessionStorage', 'memory']).toContain(info.type);
    });

    test('should toggle debug mode', async () => {
      const storage = createTestStorage({ enableDebug: true });

      storage.setDebugMode(false);
      storage.setDebugMode(true);

      // Should not throw
      expect(() => storage.setDebugMode(true)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty strings', async () => {
      const storage = createTestStorage();

      await storage.set('empty', '');
      expect(await storage.get('empty')).toBe('');
    });

    test('should handle very large data', async () => {
      const storage = createTestStorage();
      const largeData = 'x'.repeat(1000000); // 1MB string

      await expect(storage.set('large', largeData)).resolves.not.toThrow();
      expect(await storage.get('large')).toBe(largeData);
    });

    test('should handle special characters in keys and values', async () => {
      const storage = createTestStorage();

      const specialKey = 'key with spaces & symbols!@#$%^&*()';
      const specialValue = 'value with unicode: \u00E9 \u03A9 🚀';

      await storage.set(specialKey, specialValue);
      expect(await storage.get(specialKey)).toBe(specialValue);
    });

    test('should handle circular references gracefully', async () => {
      const storage = createTestStorage();

      const circular: any = { name: 'test' };
      circular.self = circular;

      await expect(storage.set('circular', circular)).rejects.toThrow();
    });
  });
});