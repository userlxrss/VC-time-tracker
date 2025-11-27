'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'relative overflow-hidden rounded-xl border transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        elevated: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl',
        outlined: 'border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        ghost: 'border-transparent bg-gray-50 dark:bg-gray-800/50',
        glass: 'border-white/20 dark:border-gray-700/30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md',
        gradient: 'border-transparent bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
        success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
        warning: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
        error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-1 hover:shadow-lg',
        glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
        scale: 'hover:scale-[1.02]',
        border: 'hover:border-primary-300 dark:hover:border-primary-600',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hover: 'none',
    },
  }
);

interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  onClick?: () => void;
  animate?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant, size, hover, as: Component = 'div', onClick, animate = true, ...props }, ref) => {
    const MotionComponent = motion[Component as keyof typeof motion] as any;

    const cardContent = (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, hover }), className)}
        onClick={onClick}
        {...(Component !== 'div' ? {} : props)}
      >
        {children}
      </div>
    );

    if (animate && (hover === 'lift' || hover === 'scale' || hover === 'glow')) {
      return (
        <MotionComponent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          whileHover={hover === 'lift' ? { y: -4 } : hover === 'scale' ? { scale: 1.02 } : {}}
          {...props}
        >
          {cardContent}
        </MotionComponent>
      );
    }

    return cardContent;
  }
);

Card.displayName = 'Card';

// Card subcomponents
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold',
  };

  return (
    <h3 className={`${sizeClasses[size]} text-gray-900 dark:text-white mb-2 ${className}`}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => (
  <p className={`text-gray-600 dark:text-gray-400 text-sm ${className}`}>
    {children}
  </p>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

// Advanced card with shimmer loading effect
interface CardWithShimmerProps extends CardProps {
  isLoading?: boolean;
}

export const CardWithShimmer: React.FC<CardWithShimmerProps> = ({ children, isLoading = false, ...props }) => (
  <Card {...props}>
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    ) : (
      children
    )}
  </Card>
);

export default Card;