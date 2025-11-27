/**
 * Badge Component
 *
 * Reusable badge component for notifications, status indicators,
 * and other small UI elements. Multiple variants and sizes.
 */

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
  onClick,
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-colors duration-200';

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs min-h-[16px]',
    sm: 'px-2 py-0.5 text-xs min-h-[20px]',
    md: 'px-2.5 py-0.5 text-sm min-h-[24px]',
  };

  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  };

  const interactiveClasses = onClick
    ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
    : '';

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${interactiveClasses}
    ${className}
  `;

  return (
    <span className={classes} onClick={onClick}>
      {children}
    </span>
  );
}