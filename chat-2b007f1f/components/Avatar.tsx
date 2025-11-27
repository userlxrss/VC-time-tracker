'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center font-medium text-white overflow-hidden',
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-20 h-20 text-2xl',
        '3xl': 'w-24 h-24 text-3xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg',
        rounded: 'rounded-md',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  email?: string;
  fallback?: string;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  email,
  fallback,
  size,
  shape,
  className = '',
  onClick,
  animate = true,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Generate initials from name or email
  const getInitials = () => {
    if (fallback) return fallback;

    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }

    if (email) {
      return email.charAt(0).toUpperCase();
    }

    return '?';
  };

  // Generate background color based on name or email for consistent colors
  const getBackgroundColor = () => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];

    const seed = name || email || 'default';
    const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

    return colors[index];
  };

  const initials = getInitials();
  const backgroundColor = getBackgroundColor();
  const showFallback = !src || imageError || !imageLoaded;

  const avatarContent = (
    <div
      className={cn(
        avatarVariants({ size, shape }),
        backgroundColor,
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {showFallback ? (
        <span className="select-none">
          {initials}
        </span>
      ) : (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
        />
      )}
    </div>
  );

  if (animate && onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {avatarContent}
      </motion.div>
    );
  }

  return avatarContent;
};

// Avatar Group component
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    email?: string;
    alt?: string;
  }>;
  max?: number;
  size?: AvatarProps['size'];
  shape?: AvatarProps['shape'];
  className?: string;
  showTooltip?: boolean;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 5,
  size = 'md',
  shape = 'circle',
  className = '',
  showTooltip = true,
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'space-x-[-4px]';
      case 'sm': return 'space-x-[-6px]';
      case 'md': return 'space-x-[-8px]';
      case 'lg': return 'space-x-[-10px]';
      case 'xl': return 'space-x-[-12px]';
      case '2xl': return 'space-x-[-16px]';
      case '3xl': return 'space-x-[-20px]';
      default: return 'space-x-[-8px]';
    }
  };

  return (
    <div className={`flex items-center ${getSizeClasses()} ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className="relative border-2 border-white dark:border-gray-800"
          title={showTooltip ? avatar.name || avatar.email : undefined}
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            email={avatar.email}
            alt={avatar.alt}
            size={size}
            shape={shape}
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800',
            avatarVariants({ size, shape })
          )}
          title={`+${remainingCount} more`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

// Avatar with Status
interface AvatarWithStatusProps extends AvatarProps {
  status?: 'online' | 'offline' | 'busy' | 'away' | 'dnd';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  statusSize?: 'sm' | 'md' | 'lg';
}

export const AvatarWithStatus: React.FC<AvatarWithStatusProps> = ({
  status,
  statusPosition = 'bottom-right',
  statusSize = 'sm',
  ...avatarProps
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-success-500';
      case 'offline': return 'bg-gray-400';
      case 'busy': return 'bg-warning-500';
      case 'away': return 'bg-yellow-500';
      case 'dnd': return 'bg-accent-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusSize = () => {
    switch (statusSize) {
      case 'sm': return 'w-2 h-2';
      case 'md': return 'w-3 h-3';
      case 'lg': return 'w-4 h-4';
      default: return 'w-2 h-2';
    }
  };

  const getPositionClasses = () => {
    const baseClasses = 'absolute border-2 border-white dark:border-gray-800 rounded-full';

    switch (statusPosition) {
      case 'bottom-right': return `${baseClasses} bottom-0 right-0`;
      case 'bottom-left': return `${baseClasses} bottom-0 left-0`;
      case 'top-right': return `${baseClasses} top-0 right-0`;
      case 'top-left': return `${baseClasses} top-0 left-0`;
      default: return `${baseClasses} bottom-0 right-0`;
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar {...avatarProps} />
      {status && (
        <div className={cn(getPositionClasses(), getStatusSize(), getStatusColor())}>
          {status === 'online' && (
            <motion.div
              className="w-full h-full bg-success-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;