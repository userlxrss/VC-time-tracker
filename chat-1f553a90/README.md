# VC Time Tracker

A complete authentication system for Villanueva Capital time tracking application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🔐 Authentication System
- **3 Hardcoded Users** with different roles:
  - **Maria Villanueva** (maria@vc.com / maria123) - Boss
  - **Carlos Villanueva** (carlos@vc.com / carlos123) - Boss
  - **Larina Villanueva** (larina@vc.com / larina123) - Employee

### 🎯 Login System
- Beautiful login page with company branding
- Email/password authentication with validation
- Session management using localStorage
- Protected routes that redirect to login if not authenticated
- Persistent sessions across browser refreshes

### 👥 User Management
- **User Data Structure**:
  ```typescript
  interface User {
    id: number;
    name: string;
    email: string;
    role: 'boss' | 'employee';
    profilePhoto?: string;
  }
  ```

### 🛡️ Permission System
- **All authenticated users** can view all time cards
- **Users can only edit** their own time cards
- **Bosses have additional** admin privileges:
  - Can approve time cards
  - Access to admin panel
  - Can view and edit any user's time cards

### 🎨 UI Components
- Modern, responsive design with Tailwind CSS
- Dark mode support with next-themes
- Premium UI components with Radix UI
- Custom VC branding colors
- Animated transitions and hover effects

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom VC theme
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Authentication**: Custom React Context + localStorage
- **Form Handling**: React Hook Form with Zod validation

## Project Structure

```
vc-time-tracker/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout with navigation
│   │   └── page.tsx           # Main dashboard
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Home page (redirects)
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── toaster.tsx
│   ├── providers/             # React providers
│   │   └── theme-provider.tsx
│   └── ProtectedRoute.tsx     # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── lib/
│   ├── types.ts               # TypeScript type definitions
│   ├── auth.ts                # Authentication logic and permissions
│   └── utils.ts               # Utility functions
└── tailwind.config.js         # Tailwind configuration
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vc-time-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Login Credentials

#### Boss Users (Admin Access)
- **Email**: maria@vc.com
- **Password**: maria123

- **Email**: carlos@vc.com
- **Password**: carlos123

#### Employee User
- **Email**: larina@vc.com
- **Password**: larina123

## Authentication Flow

1. **Login**: Users enter credentials on the login page
2. **Validation**: Email/password are validated against hardcoded users
3. **Session**: User data is stored in localStorage for persistence
4. **Protection**: Protected routes check authentication status
5. **Permissions**: Role-based access control throughout the app

## Permission Matrix

| Action | Employee | Boss |
|--------|----------|------|
| View all time cards | ✅ | ✅ |
| Edit own time card | ✅ | ✅ |
| Edit others' time cards | ❌ | ✅ |
| Approve time cards | ❌ | ✅ |
| Access admin panel | ❌ | ✅ |

## Customization

### Adding New Users
1. Update `/lib/auth.ts` - Add user to `USERS` array
2. Add password to `PASSWORDS` object
3. Ensure proper profile photo URL

### Modifying Permissions
1. Edit `/lib/auth.ts` permission functions:
   - `canEditTimeCard()`
   - `canViewAllTimeCards()`
   - `canApproveTimeCards()`

### Styling
1. Update `tailwind.config.js` for theme colors
2. Modify CSS variables in `globals.css`
3. Customize component styles in `/components/ui/`

## Production Considerations

### Security Improvements
- Replace hardcoded users with database authentication
- Implement proper password hashing (bcrypt)
- Add JWT tokens for API authentication
- Implement rate limiting and CSRF protection

### Scalability
- Connect to real database (PostgreSQL/MongoDB)
- Implement proper session management (Redis)
- Add audit logging for time card changes
- Set up proper error handling and monitoring

### Performance
- Implement code splitting for better loading
- Add caching strategies for frequently accessed data
- Optimize images and assets
- Set up CDN for static assets

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## License

This project is proprietary to Villanueva Capital.

---

Built with ❤️ for Villanueva Capital