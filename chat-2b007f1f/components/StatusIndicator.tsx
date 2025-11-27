'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusVariants = cva(
  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
  {
    variants: {
      status: {
        online: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
        offline: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        busy: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
        away: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        dnd: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
        active: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
        inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        pending: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
        completed: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
        failed: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
        loading: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
      },
    },
    defaultVariants: {
      status: 'online',
      size: 'md',
    },
  }
);

interface StatusIndicatorProps extends VariantProps<typeof statusVariants> {
  label?: string;
  showPulse?: boolean;
  showDot?: boolean;
  className?: string;
  animate?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size,
  label,
  showPulse = true,
  showDot = true,
  className = '',
  animate = true,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
      case 'active':
      case 'completed':
        return 'bg-success-500';
      case 'offline':
      case 'inactive':
        return 'bg-gray-400';
      case 'busy':
      case 'pending':
      case 'loading':
        return 'bg-warning-500';
      case 'away':
        return 'bg-yellow-500';
      case 'dnd':
      case 'failed':
        return 'bg-accent-500';
      default:
        return 'bg-gray-400';
    }
  };

  const dotElement = (
    <div className="relative">
      <div
        className={`w-2 h-2 rounded-full ${getStatusColor()}`}
      />
      {showPulse && animate && (
        <motion.div
          className={`absolute inset-0 w-2 h-2 rounded-full ${getStatusColor()}`}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );

  return (
    <div
      className={cn(statusVariants({ status, size }), className)}
    >
      {showDot && dotElement}
      {label && <span>{label}</span>}
    </div>
  );
};

// Pulse Dot Component
interface PulseDotProps {
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulseDot: React.FC<PulseDotProps> = ({
  color = 'primary',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-accent-500',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <motion.div
        className={cn('absolute inset-0 rounded-full', colorClasses[color])}
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className={cn('relative w-full h-full rounded-full', colorClasses[color])} />
    </div>
  );
};

// Live Indicator Component
interface LiveIndicatorProps {
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  label = 'LIVE',
  showLabel = true,
  className = ''
}) => {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className="relative">
        <div className="w-2 h-2 bg-accent-500 rounded-full" />
        <motion.div
          className="absolute inset-0 w-2 h-2 bg-accent-500 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};

// Progress Indicator
interface ProgressIndicatorProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showPercentage = false,
  className = ''
}) => {
  const percentage = Math.round((value / max) * 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-accent-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={`relative w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full ${colorClasses[color]} origin-left`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: percentage / 100 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block text-center">
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;