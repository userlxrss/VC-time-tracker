# TimeTracker Pro - HR Time Tracking Application

A professional, enterprise-grade HR time tracking application built with Next.js 14, TypeScript, and Tailwind CSS. Features a modern, responsive design with comprehensive employee management capabilities.

## Features

### Core UI Components
- **Dashboard Layout**: Professional layout with sidebar navigation and top navbar
- **User Cards**: Interactive employee cards with avatars, status indicators, and role badges
- **Quick Stats**: Animated statistics cards with trend indicators
- **Theme Toggle**: Smooth dark/light mode switching
- **Notification System**: Dropdown with real-time notifications
- **Search & Filtering**: Advanced search with department and status filters

### Navigation & Layout
- **Responsive Sidebar**: Collapsible navigation with nested menu items
- **Top Navigationbar**: Search bar, notifications, theme toggle, user menu
- **Mobile Optimization**: Fully responsive design with mobile menu
- **Accessibility**: ARIA labels and keyboard navigation support

### Professional Design
- **Enterprise-Grade Styling**: Clean, professional visual design
- **Smooth Animations**: Fade-in, slide-in, and hover effects
- **Dark Mode**: Complete dark theme implementation
- **Status Indicators**: Real-time user status (online, offline, away, busy)
- **Role-Based Badges**: Color-coded department and role indicators

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom configuration
- **Icons**: Heroicons for consistent iconography
- **UI Components**: Custom component library with reusable patterns

## File Structure

```
├── app/
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard page
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Home page with redirect
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── DashboardLayout.tsx       # Main layout wrapper
│   ├── NotificationButton.tsx    # Notification dropdown
│   ├── QuickStats.tsx           # Statistics cards
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── ThemeToggle.tsx          # Dark mode toggle
│   ├── TopNavbar.tsx            # Header navigation
│   ├── UserCard.tsx             # Individual user card
│   └── UserCardsGrid.tsx        # User grid with filters
├── lib/
│   └── utils.ts                 # Utility functions
└── ... configuration files
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd time-tracker-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Component Architecture

### Core Components

#### UserCard
- Displays employee information with avatar, status, and role
- Supports compact and full view modes
- Interactive hover effects and smooth animations

#### DashboardLayout
- Wraps all pages with consistent layout
- Handles responsive sidebar and navigation
- Provides theme context

#### QuickStats
- Animated statistics display
- Support for trend indicators
- Responsive grid layout

#### ThemeToggle
- Smooth dark/light mode switching
- Persists user preference
- Accessible toggle button

### Styling System

#### Color Palette
- **Primary**: Professional blue (#3b82f6)
- **Success**: Green for positive indicators (#10b981)
- **Warning**: Amber for warnings (#f59e0b)
- **Danger**: Red for errors (#ef4444)
- **Gray**: Neutral grays (#f3f4f6 to #111827)

#### Typography
- **Font**: Inter for modern, clean text
- **Weights**: Consistent font weights for hierarchy
- **Sizes**: Responsive font sizes for accessibility

#### Animations
- **Fade In**: Smooth appearance animations
- **Slide In**: Directional entrance effects
- **Hover States**: Interactive feedback
- **Loading States**: Professional loading indicators

## Customization

### Adding New Colors
Extend the Tailwind config with additional brand colors:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        primary: '#your-color',
        secondary: '#your-color',
      }
    }
  }
}
```

### Component Themes
Components support dark mode automatically through Tailwind's dark mode classes:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  // Content
</div>
```

## Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Key responsive features:
- Collapsible mobile sidebar
- Adaptive grid layouts
- Touch-friendly interface elements

## Performance Optimizations

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components load as needed
- **Bundle Size**: Optimized dependencies
- **Caching**: Built-in Next.js caching strategies

## Accessibility

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant colors
- **Focus States**: Clear focus indicators
- **Semantic HTML**: Proper heading hierarchy

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Test on multiple screen sizes
4. Ensure dark mode compatibility
5. Update documentation as needed

## License

This project is licensed under the MIT License.