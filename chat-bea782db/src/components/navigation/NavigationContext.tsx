/**
 * Navigation Context
 *
 * Manages navigation state, sidebar collapse, mobile menu, and theme preferences.
 * Provides responsive behavior and cross-tab synchronization.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationContextType {
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Mobile navigation
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  bottomNavVisible: boolean;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Notifications
  notificationCount: number;
  setNotificationCount: (count: number) => void;

  // Screen size detection
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Active navigation tracking
  activePath: string;
  setActivePath: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const location = useLocation();

  // Screen size states
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  // Navigation states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [activePath, setActivePath] = useState(location.pathname);

  // Breakpoint calculations
  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
  const isDesktop = screenSize.width >= 1024;
  const bottomNavVisible = isMobile;

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      setScreenSize({ width: newWidth, height: newHeight });

      // Auto-adjust navigation based on screen size
      if (newWidth < 768) {
        // Mobile: close sidebar, enable bottom nav
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else if (newWidth < 1024) {
        // Tablet: enable collapsible sidebar
        setSidebarCollapsed(true);
        setMobileMenuOpen(false);
      } else {
        // Desktop: full sidebar
        setSidebarOpen(true);
        setMobileMenuOpen(false);
      }
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync active path with location
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const contextValue: NavigationContextType = {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    bottomNavVisible,
    darkMode,
    toggleDarkMode,
    notificationCount,
    setNotificationCount,
    isMobile,
    isTablet,
    isDesktop,
    activePath,
    setActivePath,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}