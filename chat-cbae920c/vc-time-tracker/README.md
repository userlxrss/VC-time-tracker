# VC Time Tracker - User Detail Pages

A comprehensive user management and time tracking interface built with Next.js 16, React 19, and Tailwind CSS. This system provides full-featured user detail pages with role-based permissions, real-time status updates, and enterprise-grade functionality.

## 🚀 Features

### Core Functionality
- **Dynamic Routing**: Navigate to `/user/[id]` for individual user profiles
- **Role-Based Access Control**: Employees can't edit boss data, managers have elevated permissions
- **Real-Time Status Updates**: Live user status indicators with automatic updates
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Theme Support**: Complete theme switching capability

### User Detail Page Components

#### 1. User Header (`/app/user/[id]/components/UserHeader.tsx`)
- 120px user avatar with status indicator
- User information display (name, role, email, phone, location, department)
- Real-time status updates (online, offline, away, busy)
- Quick action buttons for editing and messaging
- Edit profile button with hover effects

#### 2. Tab Navigation System
- **Time Tracking Tab**: Live time tracking with start/pause/stop functionality
- **Timesheet Tab**: Weekly/monthly timesheet view with export capabilities
- **Leave Tab**: Leave request management with balance tracking
- **Salary Tab**: Payroll history and compensation details
- **Calendar Tab**: Interactive calendar with event management
- **Settings Tab**: User preferences and account settings (own profile only)

#### 3. Permission Management
- **Permission Alerts**: View-only warnings for restricted access
- **Role-Based UI**: Different interfaces based on user roles
- **Access Control**: Employees cannot edit manager information

### Detailed Tab Features

#### Time Tracking Tab
- Live time tracking with start/pause/stop controls
- Project-based time allocation
- Real-time duration display
- Today's time entries with detailed breakdown
- Daily/weekly/monthly statistics
- Editable descriptions and project selection

#### Timesheet Tab
- Weekly calendar view with time entries
- Filtering by status (approved, pending, rejected)
- Search functionality for projects and descriptions
- CSV export capability
- Detailed time entry tables with metadata
- Status tracking for approval workflows

#### Leave Tab
- Leave balance tracking (vacation, sick, personal)
- Leave request form with date picker
- Multiple leave types (vacation, sick, personal, maternity, paternity, unpaid)
- Request status tracking (approved, pending, rejected)
- Automatic duration calculation
- Leave history with detailed information

#### Salary Tab
- Payroll history with detailed breakdown
- Gross/net salary calculations
- Deduction tracking (tax, insurance, retirement)
- Bonus and overtime tracking
- Year-to-date statistics
- Payslip download functionality
- Quick access to tax documents and settings

#### Calendar Tab
- Monthly calendar view with event display
- Event creation and management
- Different event types (meetings, tasks, reminders, leave)
- Event details with attendees and locations
- Day/week/month view switching
- Quick event creation form

#### Settings Tab (Profile Owners Only)
- **Profile Settings**: Name, email, phone, location, bio
- **Notification Preferences**: Email, push, desktop notifications
- **Privacy Settings**: Profile visibility and information sharing
- **Preferences**: Language, timezone, date/time formats
- **Security Settings**: Two-factor auth, session management
- **Password Management**: Secure password change functionality

## 🏗️ Architecture

### Component Hierarchy
```
/app/user/[id]/
├── page.tsx (Main user detail page)
├── components/
│   ├── UserHeader.tsx (Avatar, name, role, status)
│   ├── TabNavigation.tsx (Tab system)
│   ├── StatusIndicator.tsx (Real-time status component)
│   ├── PermissionAlert.tsx (Access control notifications)
│   └── tabs/
│       ├── TimeTrackingTab.tsx
│       ├── TimesheetTab.tsx
│       ├── LeaveTab.tsx
│       ├── SalaryTab.tsx
│       ├── CalendarTab.tsx
│       └── SettingsTab.tsx
```

### State Management
- **Local State**: React useState for component state
- **URL Parameters**: Dynamic user ID routing
- **Real-Time Updates**: useEffect intervals for status changes
- **Permission Logic**: Role-based access control

### Performance Optimizations
- **Lazy Loading**: Tab content loads on demand
- **Memoized Data**: User data caching
- **Optimistic Updates**: Immediate UI feedback
- **Responsive Images**: Proper avatar sizing

## 🛠️ Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Build Tool**: Next.js with Turbopack support

## 🎨 Design System

### Color Palette
- **Primary**: Blue-500 (#3B82F6)
- **Success**: Green-500 (#10B981)
- **Warning**: Yellow-500 (#F59E0B)
- **Error**: Red-500 (#EF4444)
- **Neutral**: Gray scales for backgrounds and text

### Component Patterns
- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Consistent sizing, color-coded actions
- **Forms**: Proper labels, focus states, validation styling
- **Tables**: Striped rows, hover effects, responsive design
- **Modals**: Overlay backgrounds, focus management

## 🔐 Security & Permissions

### Role-Based Access Control
- **Employee Role**: Can edit own profile, view others (read-only)
- **Boss Role**: Can edit own profile and employee data, full access
- **Cross-Role Protection**: Employees cannot access boss settings

### Data Protection
- **Input Validation**: Form validation on all inputs
- **Type Safety**: TypeScript for compile-time error prevention
- **Secure Routing**: Dynamic route protection
- **Permission Checks**: Server-side validation ready

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (single column, stacked layouts)
- **Tablet**: 768px - 1024px (two-column layouts)
- **Desktop**: > 1024px (full multi-column layouts)

### Mobile Optimizations
- Touch-friendly buttons and controls
- Proper text sizing and spacing
- Swipeable tab navigation
- Collapsible menus and sidebars

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation
```bash
cd vc-time-tracker
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

## 📁 File Structure

```
vc-time-tracker/
├── app/
│   ├── constants/
│   │   └── users.ts          # User data and types
│   ├── user/
│   │   └── [id]/
│   │       ├── page.tsx      # Main user detail page
│   │       └── components/
│   │           ├── UserHeader.tsx
│   │           ├── TabNavigation.tsx
│   │           ├── StatusIndicator.tsx
│   │           ├── PermissionAlert.tsx
│   │           └── tabs/
│   │               ├── TimeTrackingTab.tsx
│   │               ├── TimesheetTab.tsx
│   │               ├── LeaveTab.tsx
│   │               ├── SalaryTab.tsx
│   │               ├── CalendarTab.tsx
│   │               └── SettingsTab.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Main dashboard
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## 🎯 Usage Examples

### Navigating to User Profiles
```typescript
// Direct navigation
router.push('/user/1')  // Maria's profile
router.push('/user/3')  // Larina's profile (own profile)
```

### Role-Based Access
```typescript
// Permission logic
const canEdit = isOwnProfile || (currentUser?.role === 'boss' && viewedUser?.role === 'employee')
```

### Real-Time Status Updates
```typescript
// Status indicator with real-time updates
<StatusIndicator status={status} size="md" />
```

## 🔧 Customization

### Adding New Tabs
1. Create tab component in `/app/user/[id]/components/tabs/`
2. Add tab type to TabType union
3. Update navigation in page.tsx
4. Implement permission logic as needed

### Modifying User Data
1. Update `/app/constants/users.ts`
2. Add new fields to User type
3. Update components to display new data
4. Implement form fields for editing

### Customizing Permissions
1. Modify permission logic in page.tsx
2. Update PermissionAlert component
3. Add role-specific UI elements
4. Test access controls thoroughly

## 📈 Performance Considerations

### Optimizations Implemented
- Component lazy loading
- Efficient state management
- Minimal re-renders
- Optimized images and assets
- CSS-in-JS with Tailwind

### Monitoring
- React DevTools for component profiling
- Next.js built-in analytics
- Performance monitoring ready
- Bundle size optimization

## 🎨 Theming

### Dark Mode Support
- Complete dark theme implementation
- Tailwind CSS dark mode variants
- System preference detection
- Manual theme toggle
- Persistent theme storage

### Custom Colors
- Easily customizable through Tailwind config
- Consistent color usage across components
- Accessibility-compliant contrast ratios
- Brand color integration ready

## 🧪 Testing Considerations

### Test Coverage Areas
- Navigation and routing
- Permission-based access control
- Form validation and submission
- Real-time status updates
- Responsive design breakpoints
- Theme switching functionality

### Recommended Testing Tools
- Jest for unit testing
- React Testing Library for component testing
- Cypress for end-to-end testing
- Storybook for component documentation

## 📚 Documentation

### Component Documentation
- Comprehensive JSDoc comments
- TypeScript interface definitions
- Prop usage examples
- Accessibility considerations

### API Integration Ready
- Mock data implementation
- API call structure prepared
- Error handling patterns
- Loading states implemented

## 🚀 Deployment

### Build Process
- Optimized production builds
- Static asset optimization
- Code splitting enabled
- Environment variable support

### Production Considerations
- Environment configuration
- Security headers
- Performance monitoring
- Error tracking integration

---

This comprehensive user detail page system provides enterprise-grade functionality with modern web development best practices. The architecture is scalable, maintainable, and ready for production deployment with full TypeScript support and responsive design.