# HR Time Tracker Database Schema

A comprehensive TypeScript database schema for an HR time tracker web application focused on flexible work culture, with real-time synchronization and enterprise-level scalability.

## 🚀 Features

- **Role-based Access Control**: Employee, Manager, Admin, and Freelancer roles
- **Flexible Time Tracking**: Focus on total hours rather than rigid schedules
- **Leave Management**: Complete approval workflow with balance tracking
- **Freelancer Payments**: No government deductions, simplified payment structure
- **Real-time Notifications**: Toast notifications with cross-tab synchronization
- **Manila Time Support**: All timestamps in Asia/Manila timezone (UTC+8)
- **Production Ready**: Scalable architecture with proper validation and error handling

## 📁 Project Structure

```
/
├── database-schema.ts          # Core TypeScript interfaces and types
├── database-helpers.ts         # Validation, utilities, and implementations
├── sample-implementations.ts   # Mock repositories and usage examples
└── README.md                   # This documentation
```

## 🗂️ Core Entities

### User Schema
Manages employee information with role-based access control and employment details.

**Key Fields:**
- `employeeId`: Unique employee identifier
- `role`: EMPLOYEE | MANAGER | ADMIN | FREELANCER
- `employmentStatus`: FULL_TIME | PART_TIME | CONTRACT | FREELANCE | INTERN
- `isFreelancer`: Boolean flag for payment processing
- `preferredWorkingHours`: Daily work hour preferences
- `managerId`: Reporting structure

### Time Entry Schema
Tracks clock-in/out times with break periods and approval workflow.

**Key Fields:**
- `clockIn`/`clockOut`: Manila Time timestamps
- `status`: ACTIVE | COMPLETED | PENDING | OVERDUE | REJECTED | APPROVED
- `breaks`: Array of break periods (lunch, short breaks, etc.)
- `totalHours`: Calculated work hours excluding breaks
- `approvedBy`: Manager approval for disputed entries

### Leave Request Schema
Manages leave requests with approval workflow and balance tracking.

**Key Fields:**
- `type`: VACATION | SICK | PERSONAL | MATERNITY | PATERNITY | UNPAID | WORK_FROM_HOME
- `status`: PENDING | APPROVED | REJECTED | CANCELLED
- `totalDays`: Calculated leave duration
- `usePaidLeave`: Whether to deduct from balance

### Salary Record Schema
Handles freelancer payments without government deductions.

**Key Fields:**
- `hourlyRate`: Per-hour payment rate
- `totalAmount`: Gross payment (no deductions)
- `status`: PENDING | APPROVED | PAID | OVERDUE | CANCELLED
- `paymentMethod`: Bank account, GCash, etc.

### Notification Schema
Real-time notifications with cross-tab synchronization.

**Key Fields:**
- `type`: INFO | SUCCESS | WARNING | ERROR | TIME_REMINDER | LEAVE_UPDATE | PAYMENT_UPDATE
- `priority`: LOW | MEDIUM | HIGH | URGENT
- `channel`: TOAST | INBOX | EMAIL | PUSH
- `requiresSync`: Cross-tab synchronization flag

## 🔧 Usage Examples

### Basic Setup

```typescript
import { User, UserRole, TimeEntry, TimeEntryStatus } from './database-schema';
import { ValidationHelper, ManilaTimeManager } from './database-helpers';
import { TimeTrackerService } from './sample-implementations';

// Initialize timezone manager
const timeManager = new ManilaTimeManager();

// Create a new user
const userData = {
  employeeId: 'EMP001',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  email: 'juan.delacruz@company.com',
  passwordHash: 'hashed_password',
  role: UserRole.EMPLOYEE,
  employmentStatus: EmploymentStatus.FULL_TIME,
  department: 'Engineering',
  position: 'Software Developer',
  hireDate: new Date('2023-01-15'),
  preferredWorkingHours: {
    monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8,
    saturday: 0, sunday: 0
  },
  canWorkFromHome: true,
  flexibleSchedule: true,
  timeZone: 'Asia/Manila',
  isFreelancer: false,
  directReports: []
};

// Validate before creating
const validation = ValidationHelper.validateUser(userData);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  return;
}

// Clock in workflow
const timeEntry = await timeTrackerService.clockIn(user.id, 'Starting my workday');
console.log('Clocked in at:', timeManager.format(timeEntry.clockIn, '12h'));
```

### Time Tracking Workflow

```typescript
// 1. Clock in
const timeEntry = await timeTrackerService.clockIn(userId);

// 2. Add lunch break
const lunchBreak = await timeTrackerService.addBreak(userId, 'lunch');

// 3. End lunch break
await timeTrackerService.endBreak(userId, lunchBreak.breaks[0].id);

// 4. Clock out
const completedEntry = await timeTrackerService.clockOut(userId);

console.log(`Worked ${completedEntry.totalHours?.toFixed(2)} hours today`);
```

### Leave Request Management

```typescript
// Create a leave request
const leaveRequest = await timeTrackerService.createLeaveRequest(
  userId,
  LeaveType.VACATION,
  new Date('2024-02-01'),
  new Date('2024-02-05'),
  'Family vacation to Boracay'
);

// Manager approval
await leaveRequestRepository.approve(leaveRequest.id, managerId);
```

### Cross-tab Synchronization

```typescript
// Local storage for active session
const storageHelper = new LocalStorageHelper();

// Save active time entry
storageHelper.saveActiveEntry(activeEntry);

// Get notifications across tabs
const notifications = storageHelper.getNotifications();

// Cross-tab sync manager
const syncManager = new CrossTabSyncManager();
syncManager.addListener('CLOCK_IN', (event) => {
  console.log('User clocked in from another tab:', event);
});
```

## 🎯 Validation Rules

### User Validation
- **Name**: 2-50 characters, letters, spaces, hyphens, apostrophes only
- **Email**: Valid email format, must be unique
- **Phone**: Philippine format (+63XXXXXXXXX or 0XXXXXXXXX)
- **Employee ID**: 3-20 characters, uppercase letters, numbers, hyphens only
- **Hourly Rate**: 0-10,000 range (for freelancers)

### Time Entry Validation
- **Clock In**: Cannot be more than 5 minutes in the future
- **Clock Out**: Must be after clock in, maximum 24 hours duration
- **Notes**: Maximum 500 characters

### Leave Request Validation
- **Dates**: Cannot be in the past for new requests, max 365 days in future
- **Duration**: 0.5 to 365 days maximum
- **Reason**: 10-1000 characters required

## 🕐 Timezone Handling

All timestamps are handled in Manila Time (Asia/Manila, UTC+8):

```typescript
const timeManager = new ManilaTimeManager();

// Get current Manila time
const now = timeManager.now();

// Convert any date to Manila time
const manilaTime = timeManager.toManilaTime(new Date());

// Format for display
const formatted = timeManager.format(now, '12h'); // 12-hour format

// Check if date is today in Manila timezone
const isToday = timeManager.isToday(now);
```

## 🔄 Cross-tab Synchronization

The system supports real-time synchronization across browser tabs:

```typescript
// Sync event types
type SyncEventType = 'CLOCK_IN' | 'CLOCK_OUT' | 'ADD_BREAK' | 'END_BREAK' | 'NOTIFICATION_READ';

// Broadcast events to other tabs
syncManager.broadcastEvent('CLOCK_IN', userId, timeEntryData);

// Listen for events from other tabs
syncManager.addListener('CLOCK_IN', (event) => {
  // Update UI when user clocks in from another tab
});
```

## 💾 Local Storage Management

Key localStorage items for offline support:

```typescript
const STORAGE_KEYS = {
  USER: 'hr_tracker_user',                    // Current user session
  ACTIVE_TIME_ENTRY: 'hr_tracker_active_entry', // Active time entry
  NOTIFICATIONS: 'hr_tracker_notifications',   // User notifications
  LAST_SYNC: 'hr_tracker_last_sync',          // Last sync timestamp
  TAB_ID: 'hr_tracker_tab_id',                // Current browser tab ID
  SETTINGS: 'hr_tracker_settings'             // User preferences
};
```

## 📊 Calculations

### Time Calculations
```typescript
// Calculate total hours (excluding breaks)
const totalHours = TimeCalculations.calculateTotalHours(timeEntry);

// Calculate overtime hours (default 8-hour limit)
const overtimeHours = TimeCalculations.calculateOvertimeHours(timeEntry);

// Calculate leave duration in days
const leaveDays = TimeCalculations.calculateLeaveDays(startDate, endDate);
```

### Payroll Calculations
```typescript
// Calculate freelancer payment
const payroll = TimeCalculations.calculatePayroll(
  regularHours,      // 160 hours
  overtimeHours,     // 20 hours
  hourlyRate,        // 500 PHP
  1.5                // Overtime rate
);

// Result:
// {
//   regularAmount: 80000,    // 160 * 500
//   overtimeAmount: 15000,   // 20 * 500 * 1.5
//   grossAmount: 95000       // Total (no deductions)
// }
```

## 🏗️ Repository Pattern

The system uses a repository pattern for data access:

```typescript
interface UserRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, updates: Partial<User>): Promise<User>;
  // ... other CRUD operations
}

// Implementation for different databases
class PostgreSQLUserRepository implements UserRepository { }
class MongoDBUserRepository implements UserRepository { }
class MockUserRepository implements UserRepository { } // For testing
```

## 🚀 Production Considerations

### Database Integration
- **PostgreSQL**: Recommended for production with proper indexing
- **MongoDB**: Alternative for document-based storage
- **Supabase**: Great for rapid development with real-time features
- **Redis**: For session management and caching

### Performance Optimization
- Index on frequently queried fields (userId, dates, status)
- Connection pooling for database connections
- Caching for frequently accessed data
- Pagination for large datasets

### Security
- Password hashing with bcrypt
- JWT tokens for authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting for API endpoints

### Backup Strategy
```typescript
// Daily backups for critical data
const backupSchedule = {
  users: 'daily',
  timeEntries: 'daily',
  leaveRequests: 'daily',
  salaryRecords: 'weekly',
  notifications: 'daily' // Can be purged after 30 days
};
```

## 🧪 Testing

The schema includes mock implementations for testing:

```typescript
// Use mock repositories for unit tests
const mockUserRepo = new MockUserRepository();
const mockTimeEntryRepo = new MockTimeEntryRepository();

// Test scenarios
describe('TimeTrackerService', () => {
  it('should clock in user successfully', async () => {
    const timeEntry = await service.clockIn(userId);
    expect(timeEntry.status).toBe(TimeEntryStatus.ACTIVE);
  });

  it('should prevent duplicate clock in', async () => {
    await service.clockIn(userId);
    await expect(service.clockIn(userId)).rejects.toThrow('already clocked in');
  });
});
```

## 📝 Best Practices

### Error Handling
- Always validate input before processing
- Use try-catch blocks for async operations
- Provide meaningful error messages
- Log errors for debugging

### Performance
- Use pagination for large datasets
- Implement proper database indexing
- Cache frequently accessed data
- Optimize queries for common use cases

### Security
- Never store passwords in plain text
- Validate all user inputs
- Use HTTPS for all communications
- Implement proper authentication and authorization

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper JSDoc comments
3. Include validation for new fields
4. Write tests for new functionality
5. Update documentation for changes

## 📄 License

This schema is designed for educational and commercial use. Feel free to adapt it to your specific needs.

---

**Note**: This schema is designed to be database-agnostic. You can implement the repository interfaces for your preferred database (PostgreSQL, MongoDB, Supabase, etc.) while maintaining the same TypeScript interfaces for type safety and consistency.