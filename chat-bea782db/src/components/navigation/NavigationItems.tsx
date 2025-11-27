/**
 * Navigation Items Configuration
 *
 * Defines navigation structure with role-based visibility and routing.
 * Used across header, sidebar, and bottom navigation components.
 */

import { UserRole } from '../../../database-schema';
import { useAuth } from '../../context/AuthContext';

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  label?: string;
  badge?: number;
  requiredRole?: UserRole;
  managerOnly?: boolean;
  adminOnly?: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export function useNavigationItems(): NavigationItem[] {
  const { user } = useAuth();
  const userRole = user?.role as UserRole || UserRole.EMPLOYEE;
  const isManager = userRole === UserRole.MANAGER;
  const isAdmin = userRole === UserRole.ADMIN;

  const baseNavigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'Home',
      label: 'Main dashboard with overview',
    },
    {
      name: 'Time Tracking',
      href: '/time-tracking',
      icon: 'Clock',
      label: 'Track work hours and breaks',
      badge: 0, // Will be updated dynamically
    },
    {
      name: 'Timesheet',
      href: '/timesheet',
      icon: 'Calendar',
      label: 'View and edit timesheets',
    },
    {
      name: 'Leave Management',
      href: '/leave',
      icon: 'CalendarX',
      label: 'Request and manage leave',
      badge: 2, // Example: pending requests
    },
  ];

  const salaryNavigation: NavigationItem[] = [
    {
      name: 'Salary',
      href: '/salary',
      icon: 'Wallet',
      label: 'View salary and payments',
    },
  ];

  const managerNavigation: NavigationItem[] = [
    {
      name: 'Team',
      href: '/team',
      icon: 'Users',
      label: 'Manage team members',
      managerOnly: true,
      badge: isManager ? 5 : 0, // Example: pending approvals
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: 'BarChart3',
      label: 'View team analytics',
      managerOnly: true,
    },
  ];

  const adminNavigation: NavigationItem[] = [
    {
      name: 'Settings',
      href: '/settings',
      icon: 'Settings',
      label: 'System administration',
      adminOnly: true,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: 'FileText',
      label: 'Generate reports',
      adminOnly: true,
    },
  ];

  // Combine navigation based on user role
  let navigation = [...baseNavigation];

  // Add salary navigation for all users
  navigation = [...navigation, ...salaryNavigation];

  // Add manager navigation if user is manager or admin
  if (isManager || isAdmin) {
    navigation = [...navigation, ...managerNavigation];
  }

  // Add admin navigation if user is admin
  if (isAdmin) {
    navigation = [...navigation, ...adminNavigation];
  }

  return navigation;
}

export function useMobileNavigationItems(): NavigationItem[] {
  const allItems = useNavigationItems();

  // Filter for mobile-optimized navigation
  return allItems.filter(item => !item.desktopOnly);
}

export function useDesktopNavigationItems(): NavigationItem[] {
  const allItems = useNavigationItems();

  // Filter for desktop navigation
  return allItems.filter(item => !item.mobileOnly);
}