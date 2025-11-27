'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 hover:bg-primary-600 text-white focus-visible:ring-primary-500 shadow-sm hover:shadow-md',
        secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white focus-visible:ring-gray-500',
        outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:ring-gray-500',
        ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500',
        link: 'text-primary-500 hover:text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500',
        danger: 'bg-accent-500 hover:bg-accent-600 text-white focus-visible:ring-accent-500 shadow-sm hover:shadow-md',
        success: 'bg-success-500 hover:bg-success-600 text-white focus-visible:ring-success-500 shadow-sm hover:shadow-md',
        warning: 'bg-warning-500 hover:bg-warning-600 text-white focus-visible:ring-warning-500 shadow-sm hover:shadow-md',
        gradient: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white focus-visible:ring-primary-500 shadow-md hover:shadow-lg',
        glass: 'border border-white/20 dark:border-gray-700/30 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-gray-800/20 focus-visible:ring-white/50',
      },
      size: {
        xs: 'h-8 px-3 text-xs',
        sm: 'h-9 px-4 text-sm',
        md: 'h-10 px-5 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  animate?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      disabled,
      as: Component = 'button',
      animate = true,
      ...props
    },
    ref
  ) => {
    const MotionComponent = motion[Component as keyof typeof motion] as any;

    const buttonContent = (
      <>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && LeftIcon && <LeftIcon className="w-4 h-4" />}
        <span>{children}</span>
        {!isLoading && RightIcon && <RightIcon className="w-4 h-4" />}
      </>
    );

    const buttonClasses = cn(
      buttonVariants({ variant, size, fullWidth }),
      className
    );

    if (animate && Component === 'button') {
      return (
        <MotionComponent
          ref={ref}
          className={buttonClasses}
          disabled={disabled || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          {...(Component === 'button' ? props : {})}
        >
          {buttonContent}
        </MotionComponent>
      );
    }

    if (Component === 'button') {
      return (
        <button
          ref={ref}
          className={buttonClasses}
          disabled={disabled || isLoading}
          {...props}
        >
          {buttonContent}
        </button>
      );
    }

    return (
      <MotionComponent
        ref={ref}
        className={buttonClasses}
        {...(Component !== 'button' ? props : {})}
      >
        {buttonContent}
      </MotionComponent>
    );
  }
);

Button.displayName = 'Button';

// Button group component
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'joined' | 'separated';
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  variant = 'joined',
  size = 'md'
}) => {
  const variantClasses = {
    joined: 'flex -space-x-px',
    separated: 'flex gap-2',
  };

  const sizeClasses = {
    sm: '',
    md: '',
    lg: '',
  };

  return (
    <div className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;

          let roundedClasses = '';
          if (variant === 'joined') {
            if (isFirst && isLast) {
              roundedClasses = '';
            } else if (isFirst) {
              roundedClasses = 'rounded-r-none';
            } else if (isLast) {
              roundedClasses = 'rounded-l-none';
            } else {
              roundedClasses = 'rounded-none';
            }
          }

          return React.cloneElement(child, {
            className: `${child.props.className || ''} ${roundedClasses}`,
          });
        }
        return child;
      })}
    </div>
  );

// IconButton component
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: LucideIcon;
  tooltip?: string;
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  tooltip,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
    xl: 'p-4',
  };

  return (
    <motion.button
      className={`${buttonVariants({ variant, size })} ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      <Icon size={16} />
      {tooltip && (
        <span className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {tooltip}
        </span>
      )}
    </motion.button>
  );
};

export default Button;