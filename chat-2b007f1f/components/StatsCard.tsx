'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: LucideIcon;
  variant?: 'default' | 'gradient' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  animate?: boolean;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default',
  size = 'md',
  color = 'primary',
  className = '',
  animate = true,
  loading = false,
}) => {
  const sizeClasses = {
    sm: {
      card: 'p-4',
      value: 'text-2xl',
      title: 'text-sm',
      icon: 'w-8 h-8',
    },
    md: {
      card: 'p-6',
      value: 'text-3xl',
      title: 'text-base',
      icon: 'w-10 h-10',
    },
    lg: {
      card: 'p-8',
      value: 'text-4xl',
      title: 'text-lg',
      icon: 'w-12 h-12',
    },
  };

  const colorClasses = {
    primary: {
      bg: 'bg-primary-500',
      text: 'text-primary-600 dark:text-primary-400',
      lightBg: 'bg-primary-50 dark:bg-primary-900/20',
    },
    success: {
      bg: 'bg-success-500',
      text: 'text-success-600 dark:text-success-400',
      lightBg: 'bg-success-50 dark:bg-success-900/20',
    },
    warning: {
      bg: 'bg-warning-500',
      text: 'text-warning-600 dark:text-warning-400',
      lightBg: 'bg-warning-50 dark:bg-warning-900/20',
    },
    error: {
      bg: 'bg-accent-500',
      text: 'text-accent-600 dark:text-accent-400',
      lightBg: 'bg-accent-50 dark:bg-accent-900/20',
    },
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0';
      case 'bordered':
        return 'border-2';
      default:
        return '';
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        notation: val > 9999 ? 'compact' : 'standard',
        maximumFractionDigits: 1,
      }).format(val);
    }
    return val;
  };

  const getChangeIcon = () => {
    switch (change?.type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getChangeColor = () => {
    switch (change?.type) {
      case 'increase':
        return 'text-success-600 dark:text-success-400';
      case 'decrease':
        return 'text-accent-600 dark:text-accent-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const cardContent = (
    <CardContent className={cn(sizeClasses[size].card, getVariantClasses(), className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-gray-600 dark:text-gray-400 mb-1', sizeClasses[size].title)}>
            {title}
          </p>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ) : (
            <p className={cn('font-bold text-gray-900 dark:text-white', sizeClasses[size].value)}>
              {formatValue(value)}
            </p>
          )}

          {change && !loading && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn('flex items-center gap-1 text-sm font-medium', getChangeColor())}>
                {getChangeIcon()}
                {Math.abs(change.value)}%
              </span>
              {change.period && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  vs {change.period}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && !loading && (
          <div className={cn(
            'rounded-lg flex items-center justify-center',
            colorClasses[color].lightBg
          )}>
            <Icon className={cn(sizeClasses[size].icon, colorClasses[color].text)} />
          </div>
        )}
      </div>
    </CardContent>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card variant="default" hover="lift" className="h-full">
          {cardContent}
        </Card>
      </motion.div>
    );
  }

  return (
    <Card variant="default" className="h-full">
      {cardContent}
    </Card>
  );
};

// Compact Stats Card for dashboards
interface CompactStatsCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const CompactStatsCard: React.FC<CompactStatsCardProps> = ({
  label,
  value,
  trend,
  color = 'primary',
  className = '',
}) => {
  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-accent-600 dark:text-accent-400',
  };

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  return (
    <div className={cn('p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && (
          <span className={cn('flex items-center gap-1 text-xs font-medium', colorClasses[color])}>
            {getTrendIcon()}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
};

// Stats Grid Component
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  columns = 4,
  gap = 'md',
  className = '',
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Animated Stats Card with number counting effect
interface AnimatedStatsCardProps extends Omit<StatsCardProps, 'animate'> {
  duration?: number;
}

export const AnimatedStatsCard: React.FC<AnimatedStatsCardProps> = ({
  value,
  duration = 2000,
  ...props
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (typeof value !== 'number') return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setDisplayValue(Math.floor(easeOutQuart * value));

      if (now < endTime) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [value, duration]);

  return (
    <StatsCard
      {...props}
      value={typeof value === 'number' ? displayValue : value}
      animate
    />
  );
};

export default StatsCard;