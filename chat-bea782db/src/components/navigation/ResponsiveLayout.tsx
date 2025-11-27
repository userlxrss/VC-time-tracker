/**
 * Responsive Layout Component
 *
 * Main layout wrapper that combines header, sidebar, bottom navigation,
 * and mobile menu. Handles responsive behavior and spacing.
 */

import { ReactNode } from 'react';
import { useNavigation } from './NavigationContext';
import { AppHeader } from './AppHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileMenu } from './MobileMenu';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveLayout({ children, className = '' }: ResponsiveLayoutProps) {
  const { isDesktop, isTablet, isMobile, sidebarCollapsed } = useNavigation();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Fixed Header */}
      <AppHeader />

      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Menu */}
      <MobileMenu />

      {/* Main Content Area */}
      <main
        className={`
          pt-16 transition-all duration-300 ease-in-out
          ${isDesktop ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : ''}
          ${isTablet ? 'ml-0' : ''}
          ${isMobile ? 'pb-20' : ''}
        `}
      >
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

/**
 * Page wrapper component for consistent spacing and layout
 */
export function Page({ children, title, className = '' }: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div className={`flex-1 px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {title && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Page content wrapper with maximum width constraints
 */
export function PageContent({ children, className = '' }: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}