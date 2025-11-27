/**
 * Example usage of StorageManager class
 * Demonstrates various features and patterns
 */

import StorageManager, { DataSchema, MigrationDefinition } from './StorageManager';

// Initialize StorageManager with configuration
const storage = new StorageManager({
  prefix: 'myapp_',
  version: '2.0.0',
  fallbackToMemory: true,
  enableDebug: true,
  maxRetries: 3,
  retryDelay: 100,
  validateOnLoad: true,
  compressionEnabled: false,
});

// Define data schemas for validation
const userSchema: DataSchema = {
  type: 'object',
  required: true,
  properties: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true, min: 2, max: 50 },
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    age: { type: 'number', min: 0, max: 150 },
    isActive: { type: 'boolean', required: true },
    preferences: {
      type: 'object',
      properties: {
        theme: { type: 'string', pattern: /^(light|dark)$/ },
        notifications: { type: 'boolean' },
        language: { type: 'string', min: 2, max: 5 }
      }
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    lastLogin: { type: 'date' }
  }
};

const settingsSchema: DataSchema = {
  type: 'object',
  required: true,
  properties: {
    theme: { type: 'string', pattern: /^(light|dark|auto)$/ },
    autoSave: { type: 'boolean' },
    maxItems: { type: 'number', min: 1, max: 1000 },
    refreshInterval: { type: 'number', min: 5000 }
  }
};

// Add data migrations
const migrations: MigrationDefinition[] = [
  {
    version: '1.1.0',
    description: 'Add user preferences field',
    migrate: (data: any) => {
      if (data && typeof data === 'object' && !data.preferences) {
        data.preferences = {
          theme: 'light',
          notifications: true,
          language: 'en'
        };
      }
      return data;
    }
  },
  {
    version: '1.2.0',
    description: 'Convert isActive string to boolean',
    migrate: (data: any) => {
      if (data && typeof data === 'object' && typeof data.isActive === 'string') {
        data.isActive = data.isActive.toLowerCase() === 'true';
      }
      return data;
    }
  },
  {
    version: '2.0.0',
    description: 'Add tags array and last login date',
    migrate: (data: any) => {
      if (data && typeof data === 'object') {
        data.tags = data.tags || [];
        data.lastLogin = data.lastLogin ? new Date(data.lastLogin) : new Date();
      }
      return data;
    }
  }
];

// Register migrations
migrations.forEach(migration => storage.addMigration(migration));

// Example functions demonstrating StorageManager usage

export async function exampleBasicUsage() {
  console.log('=== Basic Usage Examples ===');

  try {
    // Store user data with validation
    const userData = {
      id: 123,
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
      isActive: true,
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en'
      },
      tags: ['developer', 'javascript'],
      lastLogin: new Date()
    };

    await storage.set('current_user', userData, { schema: userSchema });
    console.log('User data saved successfully');

    // Retrieve user data
    const retrievedUser = await storage.get('current_user', { schema: userSchema });
    console.log('Retrieved user:', retrievedUser);

    // Store with TTL (expires after 1 hour)
    await storage.set('session_token', 'abc123xyz', { ttl: 3600000 });
    console.log('Session token stored with TTL');

    // Get all keys
    const keys = await storage.getKeys();
    console.log('All stored keys:', keys);

  } catch (error) {
    console.error('Basic usage error:', error);
  }
}

export async function exampleAdvancedUsage() {
  console.log('=== Advanced Usage Examples ===');

  try {
    // Store complex nested data
    const appState = {
      user: {
        profile: {
          id: 1,
          name: 'Alice',
          settings: {
            theme: 'dark',
            language: 'en-US',
            features: {
              beta: true,
              analytics: false
            }
          }
        },
        sessions: [
          { id: 'sess1', started: new Date(), lastActivity: new Date() },
          { id: 'sess2', started: new Date(), lastActivity: new Date() }
        ]
      },
      cache: {
        posts: [1, 2, 3, 4, 5],
        comments: { 1: ['Nice!', 'Great post'], 2: ['Interesting'] }
      }
    };

    await storage.set('app_state', appState);
    console.log('Complex app state stored');

    // Get storage info
    const storageInfo = storage.getStorageInfo();
    console.log('Storage info:', storageInfo);

    // Export all data
    const exportedData = await storage.export();
    console.log('Exported data keys:', Object.keys(exportedData));

    // Import data (simulate backup restore)
    const backupData = {
      'backup_user': { id: 999, name: 'Backup User', email: 'backup@example.com' },
      'backup_settings': { theme: 'light', autoSave: false }
    };

    await storage.import(backupData, { overwrite: false });
    console.log('Backup data imported');

    // Cleanup expired entries
    await storage.cleanupExpired();
    console.log('Cleanup completed');

  } catch (error) {
    console.error('Advanced usage error:', error);
  }
}

export async function exampleErrorHandling() {
  console.log('=== Error Handling Examples ===');

  try {
    // Try to store invalid data
    const invalidUser = {
      id: 'not-a-number', // Should be number
      name: '', // Too short
      email: 'invalid-email', // Invalid format
      age: -5, // Below minimum
      isActive: 'yes' // Should be boolean
    };

    await storage.set('invalid_user', invalidUser, { schema: userSchema });
  } catch (error) {
    console.log('Expected validation error:', error.message);
  }

  try {
    // Try to get with schema validation
    await storage.set('partial_user', { id: 123 }, { schema: userSchema });
  } catch (error) {
    console.log('Expected validation error for missing required fields:', error.message);
  }

  // Demonstrate operation history
  const history = storage.getOperationHistory();
  console.log('Operation history (last 5):', history.slice(-5));
}

export async function examplePerformanceOptimization() {
  console.log('=== Performance Optimization Examples ===');

  try {
    // Batch operations example
    const batchData = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      value: Math.random() * 1000
    }));

    // Store each item (in a real app, you might want to batch these)
    const startTime = Date.now();

    for (let i = 0; i < batchData.length; i++) {
      await storage.set(`user_${i}`, batchData[i]);
    }

    const endTime = Date.now();
    console.log(`Stored ${batchData.length} items in ${endTime - startTime}ms`);

    // Get storage size
    const size = await storage.getSize();
    console.log(`Storage size: ${size} characters`);

    // Memory management example - clear old data
    const keys = await storage.getKeys();
    console.log(`Total keys stored: ${keys.length}`);

  } catch (error) {
    console.error('Performance optimization error:', error);
  }
}

export async function examplePersistenceAcrossRefreshes() {
  console.log('=== Persistence Example ===');

  try {
    // This would typically be called on app initialization
    const persistedSettings = await storage.get('app_settings', {
      schema: settingsSchema,
      defaultValue: {
        theme: 'light',
        autoSave: true,
        maxItems: 100,
        refreshInterval: 30000
      }
    });

    console.log('Loaded persisted settings:', persistedSettings);

    // Update settings (these will persist across page refreshes)
    const updatedSettings = {
      ...persistedSettings,
      theme: 'dark',
      maxItems: 200
    };

    await storage.set('app_settings', updatedSettings, { schema: settingsSchema });
    console.log('Settings updated and will persist');

  } catch (error) {
    console.error('Persistence example error:', error);
  }
}

// Utility function to demonstrate comprehensive testing
export async function runAllExamples() {
  console.log('Running StorageManager Examples...\n');

  await exampleBasicUsage();
  console.log('\n');

  await exampleAdvancedUsage();
  console.log('\n');

  await exampleErrorHandling();
  console.log('\n');

  await examplePerformanceOptimization();
  console.log('\n');

  await examplePersistenceAcrossRefreshes();

  console.log('\nAll examples completed!');
}

// Export the configured storage instance for use in other parts of the app
export { storage };

// Export schemas for reuse
export { userSchema, settingsSchema };