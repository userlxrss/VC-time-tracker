/**
 * Navigation Icons
 *
 * Consistent icon components for navigation using Lucide React icons.
 * Provides proper sizing, accessibility, and interactive states.
 */

import React from 'react';
import {
  Home,
  Clock,
  Calendar,
  CalendarX,
  Wallet,
  Users,
  BarChart3,
  Settings,
  FileText,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  AlertCircle,
} from 'lucide-react';

interface IconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function NavigationIcon({
  Component,
  className = '',
  size = 'md',
  active = false
}: { Component: React.ComponentType<any> } & IconProps) {
  const sizeClass = sizeClasses[size];
  const activeClass = active ? 'text-blue-600' : 'text-gray-500';

  return (
    <Component
      className={`${sizeClass} ${activeClass} ${className}`}
      aria-hidden="true"
    />
  );
}

// Navigation specific icon components
export function HomeIcon(props: IconProps) {
  return <NavigationIcon Component={Home} {...props} />;
}

export function ClockIcon(props: IconProps) {
  return <NavigationIcon Component={Clock} {...props} />;
}

export function CalendarIcon(props: IconProps) {
  return <NavigationIcon Component={Calendar} {...props} />;
}

export function CalendarXIcon(props: IconProps) {
  return <NavigationIcon Component={CalendarX} {...props} />;
}

export function WalletIcon(props: IconProps) {
  return <NavigationIcon Component={Wallet} {...props} />;
}

export function UsersIcon(props: IconProps) {
  return <NavigationIcon Component={Users} {...props} />;
}

export function BarChartIcon(props: IconProps) {
  return <NavigationIcon Component={BarChart3} {...props} />;
}

export function SettingsIcon(props: IconProps) {
  return <NavigationIcon Component={Settings} {...props} />;
}

export function FileTextIcon(props: IconProps) {
  return <NavigationIcon Component={FileText} {...props} />;
}

export function BellIcon(props: IconProps) {
  return <NavigationIcon Component={Bell} {...props} />;
}

export function MoonIcon(props: IconProps) {
  return <NavigationIcon Component={Moon} {...props} />;
}

export function SunIcon(props: IconProps) {
  return <NavigationIcon Component={Sun} {...props} />;
}

export function MenuIcon(props: IconProps) {
  return <NavigationIcon Component={Menu} {...props} />;
}

export function XIcon(props: IconProps) {
  return <NavigationIcon Component={X} {...props} />;
}

export function ChevronLeftIcon(props: IconProps) {
  return <NavigationIcon Component={ChevronLeft} {...props} />;
}

export function ChevronRightIcon(props: IconProps) {
  return <NavigationIcon Component={ChevronRight} {...props} />;
}

export function UserIcon(props: IconProps) {
  return <NavigationIcon Component={User} {...props} />;
}

export function LogOutIcon(props: IconProps) {
  return <NavigationIcon Component={LogOut} {...props} />;
}

export function AlertIcon(props: IconProps) {
  return <NavigationIcon Component={AlertCircle} {...props} />;
}

// Icon mapping for dynamic rendering
export const iconMap: Record<string, React.ComponentType<IconProps>> = {
  Home: HomeIcon,
  Clock: ClockIcon,
  Calendar: CalendarIcon,
  CalendarX: CalendarXIcon,
  Wallet: WalletIcon,
  Users: UsersIcon,
  BarChart3: BarChartIcon,
  Settings: SettingsIcon,
  FileText: FileTextIcon,
  Bell: BellIcon,
  Moon: MoonIcon,
  Sun: SunIcon,
  Menu: MenuIcon,
  X: XIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  User: UserIcon,
  LogOut: LogOutIcon,
  AlertCircle: AlertIcon,
};

export function DynamicNavigationIcon({
  icon,
  ...props
}: { icon: string } & IconProps) {
  const IconComponent = iconMap[icon];

  if (!IconComponent) {
    console.warn(`Icon "${icon}" not found in iconMap`);
    return <HomeIcon {...props} />;
  }

  return <IconComponent {...props} />;
}