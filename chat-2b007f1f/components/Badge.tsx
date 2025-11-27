'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Crown, Shield, Star, Zap, Trophy, Medal, Gem, Briefcase } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
        secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
        warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
        error: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        gradient: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
        outline: 'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300',
        glass: 'border border-white/20 dark:border-gray-700/30 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm text-gray-900 dark:text-white',
      },
      size: {
        xs: 'px-2 py-0.5 text-[10px]',
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  animate?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant,
  size,
  icon,
  animate = false,
  removable = false,
  onRemove,
}) => {
  const badgeContent = (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Remove badge"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </>
  );

  const badgeElement = (
    <div className={cn(badgeVariants({ variant, size }), className)}>
      {badgeContent}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {badgeElement}
      </motion.div>
    );
  }

  return badgeElement;
};

// Role Badge Component
interface RoleBadgeProps {
  role: 'admin' | 'manager' | 'investor' | 'founder' | 'associate' | 'analyst' | 'partner' | 'advisor' | 'intern' | 'vip';
  className?: string;
  size?: BadgeProps['size'];
  showIcon?: boolean;
  animate?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  className = '',
  size = 'sm',
  showIcon = true,
  animate = false,
}) => {
  const getRoleInfo = () => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          variant: 'error' as const,
          icon: <Crown size={12} />,
        };
      case 'manager':
        return {
          label: 'Manager',
          variant: 'primary' as const,
          icon: <Shield size={12} />,
        };
      case 'investor':
        return {
          label: 'Investor',
          variant: 'success' as const,
          icon: <Trophy size={12} />,
        };
      case 'founder':
        return {
          label: 'Founder',
          variant: 'warning' as const,
          icon: <Star size={12} />,
        };
      case 'associate':
        return {
          label: 'Associate',
          variant: 'default' as const,
          icon: <Briefcase size={12} />,
        };
      case 'analyst':
        return {
          label: 'Analyst',
          variant: 'info' as const,
          icon: <Medal size={12} />,
        };
      case 'partner':
        return {
          label: 'Partner',
          variant: 'gradient' as const,
          icon: <Gem size={12} />,
        };
      case 'advisor':
        return {
          label: 'Advisor',
          variant: 'secondary' as const,
          icon: <Zap size={12} />,
        };
      case 'intern':
        return {
          label: 'Intern',
          variant: 'outline' as const,
          icon: <Briefcase size={12} />,
        };
      case 'vip':
        return {
          label: 'VIP',
          variant: 'gradient' as const,
          icon: <Crown size={12} />,
        };
      default:
        return {
          label: 'User',
          variant: 'default' as const,
          icon: null,
        };
    }
  };

  const { label, variant, icon } = getRoleInfo();

  return (
    <Badge
      variant={variant}
      size={size}
      icon={showIcon ? icon : undefined}
      animate={animate}
      className={className}
    >
      {label}
    </Badge>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'archived';
  className?: string;
  size?: BadgeProps['size'];
  animate?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'sm',
  animate = false,
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          variant: 'success' as const,
        };
      case 'inactive':
        return {
          label: 'Inactive',
          variant: 'secondary' as const,
        };
      case 'pending':
        return {
          label: 'Pending',
          variant: 'warning' as const,
        };
      case 'approved':
        return {
          label: 'Approved',
          variant: 'success' as const,
        };
      case 'rejected':
        return {
          label: 'Rejected',
          variant: 'error' as const,
        };
      case 'archived':
        return {
          label: 'Archived',
          variant: 'outline' as const,
        };
      default:
        return {
          label: 'Unknown',
          variant: 'default' as const,
        };
    }
  };

  const { label, variant } = getStatusInfo();

  return (
    <Badge
      variant={variant}
      size={size}
      animate={animate}
      className={className}
    >
      {label}
    </Badge>
  );
};

// Count Badge Component
interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeProps['variant'];
  size?: BadgeProps['size'];
  className?: string;
  showZero?: boolean;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  variant = 'error',
  size = 'xs',
  className = '',
  showZero = false,
}) => {
  if (!showZero && count === 0) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge
      variant={variant}
      size={size}
      className={cn('min-w-[20px] justify-center', className)}
    >
      {displayCount}
    </Badge>
  );
};

// Badge Group Component
interface BadgeGroupProps {
  badges: Array<{
    label: string;
    variant?: BadgeProps['variant'];
    icon?: React.ReactNode;
  }>;
  max?: number;
  size?: BadgeProps['size'];
  className?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  badges,
  max = 3,
  size = 'sm',
  className = '',
}) => {
  const visibleBadges = badges.slice(0, max);
  const remainingCount = badges.length - max;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleBadges.map((badge, index) => (
        <Badge
          key={index}
          variant={badge.variant || 'default'}
          size={size}
          icon={badge.icon}
          animate
        >
          {badge.label}
        </Badge>
      ))}

      {remainingCount > 0 && (
        <Badge variant="outline" size={size}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};

export default Badge;