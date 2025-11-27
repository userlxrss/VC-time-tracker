# StorageManager - Robust Data Persistence System

A production-ready data persistence system for web applications using the window.storage API with comprehensive error handling, validation, and fallback mechanisms.

## Features

- ✅ **Robust Storage Operations**: Set, get, remove, and clear data with automatic retry logic
- ✅ **Data Validation**: Schema-based validation with automatic data sanitization
- ✅ **TTL Support**: Time-to-live functionality for temporary data storage
- ✅ **Data Migrations**: Version-controlled data migration system
- ✅ **Error Handling**: Comprehensive error handling with fallback to memory storage
- ✅ **Serialization**: Automatic JSON serialization/deserialization with type preservation
- ✅ **Performance**: Optimized for large datasets with memory management
- ✅ **Debugging**: Built-in debugging and operation history tracking
- ✅ **Import/Export**: Backup and restore functionality
- ✅ **TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

```typescript
import StorageManager from './StorageManager';
```

## Quick Start

```typescript
// Initialize StorageManager
const storage = new StorageManager({
  prefix: 'myapp_',
  version: '1.0.0',
  enableDebug: true,
  fallbackToMemory: true
});

// Store data
await storage.set('user', { id: 1, name: 'John' });

// Retrieve data
const user = await storage.get('user');
console.log(user); // { id: 1, name: 'John' }

// Store with TTL (expires after 1 hour)
await storage.set('session', 'token123', { ttl: 3600000 });
```

## Configuration Options

```typescript
interface StorageConfig {
  prefix?: string;              // Key prefix for namespacing (default: 'app_')
  version?: string;             // App version for migrations (default: '1.0.0')
  fallbackToMemory?: boolean;   // Fall back to memory if storage unavailable (default: true)
  enableDebug?: boolean;        // Enable debug logging (default: false)
  maxRetries?: number;          // Max retry attempts for failed operations (default: 3)
  retryDelay?: number;          // Delay between retries in ms (default: 100)
  validateOnLoad?: boolean;     // Validate data when loading (default: true)
  compressionEnabled?: boolean; // Enable basic compression (default: false)
}
```

## Data Validation

Define schemas to validate and sanitize your data:

```typescript
const userSchema: DataSchema = {
  type: 'object',
  required: true,
  properties: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true, min: 2, max: 50 },
    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    age: { type: 'number', min: 0, max: 150 },
    isActive: { type: 'boolean' },
    preferences: {
      type: 'object',
      properties: {
        theme: { type: 'string', pattern: /^(light|dark)$/ },
        notifications: { type: 'boolean' }
      }
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    lastLogin: { type: 'date' }
  }
};

// Store with validation
await storage.set('user', userData, { schema: userSchema });

// Get with validation
const user = await storage.get('user', { schema: userSchema });
```

### Schema Types

- `string`: Text data with optional min/max length and pattern validation
- `number`: Numeric data with optional min/max value validation
- `boolean`: Boolean values (automatically converts truthy/falsy values)
- `date`: Date objects (automatically converts valid date strings)
- `object`: Nested objects with property validation
- `array`: Arrays with item type validation

## TTL (Time To Live)

Store data that automatically expires:

```typescript
// Store data for 5 minutes
await storage.set('temp_data', data, { ttl: 300000 });

// Data will be null after 5 minutes
const data = await storage.get('temp_data'); // null after expiration

// Manually clean up expired entries
await storage.cleanupExpired();
```

## Data Migrations

Handle data structure changes across app versions:

```typescript
// Define migrations
const migrations: MigrationDefinition[] = [
  {
    version: '1.1.0',
    description: 'Add user preferences field',
    migrate: (data: any) => {
      if (data && typeof data === 'object' && !data.preferences) {
        data.preferences = {
          theme: 'light',
          notifications: true
        };
      }
      return data;
    }
  },
  {
    version: '2.0.0',
    description: 'Convert legacy user format',
    migrate: (data: any) => {
      if (data && typeof data === 'object') {
        data.id = parseInt(data.userId) || data.id;
        data.fullName = `${data.firstName} ${data.lastName}`.trim();
        delete data.userId;
        delete data.firstName;
        delete data.lastName;
      }
      return data;
    },
    rollback: (data: any) => {
      // Optional rollback function
      if (data && typeof data === 'object') {
        data.userId = data.id;
        data.firstName = data.fullName?.split(' ')[0] || '';
        data.lastName = data.fullName?.split(' ').slice(1).join(' ') || '';
        delete data.id;
        delete data.fullName;
      }
      return data;
    }
  }
];

// Register migrations
migrations.forEach(migration => storage.addMigration(migration));
```

## CRUD Operations

### Create/Update

```typescript
// Simple set
await storage.set('key', value);

// With validation and TTL
await storage.set('user', userData, {
  schema: userSchema,
  ttl: 86400000 // 24 hours
});
```

### Read

```typescript
// Simple get
const value = await storage.get('key');

// With default value
const user = await storage.get('user', {
  defaultValue: { id: 0, name: 'Guest' }
});

// With validation
const user = await storage.get('user', {
  schema: userSchema,
  defaultValue: defaultUser
});
```

### Delete

```typescript
// Remove single key
await storage.remove('key');

// Clear all data with prefix
await storage.clear();
```

## Advanced Features

### Import/Export

```typescript
// Export all data
const backup = await storage.export();
console.log('Backup data:', backup);

// Import data (with optional overwrite)
await storage.import(backup, { overwrite: true });

// Import with validation
await storage.import(backup, {
  overwrite: false,
  schema: {
    users: userSchema,
    settings: settingsSchema
  }
});
```

### Storage Information

```typescript
// Get storage info
const info = storage.getStorageInfo();
console.log(info);
// {
//   type: 'localStorage',
//   available: true,
//   size: 0,
//   keyCount: 5
// }

// Get all keys
const keys = await storage.getKeys();
console.log('Stored keys:', keys);

// Get storage size
const size = await storage.getSize();
console.log('Storage size:', size, 'bytes');
```

### Operation History

```typescript
// Get recent operations
const history = storage.getOperationHistory();
console.log('Last 5 operations:', history.slice(-5));

// Operation format:
// {
//   key: 'app_user',
//   operation: 'set',
//   timestamp: 1635724800000,
//   success: true,
//   error?: string
// }
```

### Debug Mode

```typescript
// Enable debug logging
storage.setDebugMode(true);

// Debug logs will show:
// - Storage availability
// - Operation attempts and retries
// - Validation errors
// - Migration progress
// - Performance metrics
```

## Error Handling

StorageManager includes comprehensive error handling:

```typescript
try {
  await storage.set('key', data, { schema: validationSchema });
} catch (error) {
  if (error.message.includes('Validation failed')) {
    // Handle validation errors
    console.error('Data validation failed:', error.message);
  } else if (error.message.includes('Storage quota')) {
    // Handle storage quota exceeded
    console.error('Storage full, consider cleanup');
  } else if (error.message.includes('Operation')) {
    // Handle operation failures (with retries)
    console.error('Storage operation failed:', error.message);
  }
}
```

### Automatic Retry Logic

Failed operations are automatically retried with exponential backoff:

- **Default retries**: 3 attempts
- **Retry delay**: 100ms (increases with each attempt)
- **Fallback**: Memory storage if browser storage is unavailable

## Performance Optimization

### Memory Management

```typescript
// Clean up expired entries
await storage.cleanupExpired();

// Limit operation history (automatic)
// History is automatically truncated to last 100 operations

// Monitor storage size
const size = await storage.getSize();
if (size > 5000000) { // 5MB
  console.warn('Storage size is large, consider cleanup');
}
```

### Batch Operations

For optimal performance with multiple operations:

```typescript
// Good: Sequential operations with error handling
const batchData = Array.from({ length: 100 }, (_, i) => ({ id: i, value: data[i] }));

for (const item of batchData) {
  try {
    await storage.set(`item_${item.id}`, item);
  } catch (error) {
    console.error(`Failed to store item ${item.id}:`, error);
  }
}
```

## Browser Compatibility

StorageManager works in all modern browsers and gracefully degrades:

- **localStorage**: Preferred for persistent storage
- **sessionStorage**: Fallback for session-based storage
- **Memory Storage**: Final fallback when browser storage is unavailable

### Feature Detection

```typescript
const info = storage.getStorageInfo();

if (info.type === 'memory') {
  console.warn('Using memory storage - data will not persist across page reloads');
}

if (!info.available) {
  console.error('No storage available - app may not function properly');
}
```

## Best Practices

### 1. Use Prefixes for Namespacing

```typescript
// Good: Use app-specific prefixes
const appStorage = new StorageManager({ prefix: 'myapp_v2_' });

// Bad: No prefix (potential conflicts)
const badStorage = new StorageManager();
```

### 2. Define Schemas for All Data

```typescript
// Good: Comprehensive schema
const userSchema: DataSchema = {
  type: 'object',
  required: true,
  properties: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true, min: 1, max: 100 },
    email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  }
};

await storage.set('user', userData, { schema: userSchema });
```

### 3. Handle Errors Gracefully

```typescript
// Good: Comprehensive error handling
try {
  await storage.set('critical_data', data, { schema: criticalSchema });
} catch (error) {
  // Log error for debugging
  console.error('Storage error:', error);

  // Try fallback strategy
  try {
    await storage.set('critical_data_backup', data);
  } catch (backupError) {
    // Final fallback - in-memory storage
    criticalDataMemoryCache = data;
  }
}
```

### 4. Use TTL for Temporary Data

```typescript
// Good: Temporary data with TTL
await storage.set('auth_token', token, { ttl: 3600000 }); // 1 hour

// Bad: Temporary data without cleanup plan
await storage.set('auth_token', token); // Never expires
```

### 5. Plan for Migrations

```typescript
// Good: Version-controlled migrations
const storage = new StorageManager({
  prefix: 'myapp_',
  version: '2.1.0' // Always update version when schema changes
});

// Register all migrations
allMigrations.forEach(migration => storage.addMigration(migration));
```

## Testing

The package includes comprehensive tests. Run them with:

```bash
npm test
```

Tests cover:
- Basic CRUD operations
- Data validation and sanitization
- TTL functionality
- Data migrations
- Error handling and retry logic
- Performance and memory management
- Edge cases and error conditions

## API Reference

### Constructor

```typescript
new StorageManager(config?: StorageConfig)
```

### Methods

#### Data Operations
- `set<T>(key: string, data: T, options?: SetOptions): Promise<void>`
- `get<T>(key: string, options?: GetOptions): Promise<T | null>`
- `remove(key: string, options?: RemoveOptions): Promise<void>`
- `clear(options?: ClearOptions): Promise<void>`

#### Utility Methods
- `getKeys(): Promise<string[]>`
- `getSize(): Promise<number>`
- `export(): Promise<Record<string, any>>`
- `import(data: Record<string, any>, options?: ImportOptions): Promise<void>`
- `cleanupExpired(): Promise<void>`

#### Configuration
- `addMigration(migration: MigrationDefinition): void`
- `setDebugMode(enabled: boolean): void`
- `getOperationHistory(): StorageOperation[]`
- `getStorageInfo(): StorageInfo`

## License

MIT License - feel free to use in commercial and personal projects.