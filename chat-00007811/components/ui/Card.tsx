import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'glow' | 'stat' | 'insight';
  interactive?: boolean;
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const variantStyles = {
      default: `
        relative bg-slate-800/50 backdrop-blur-sm
        border border-white/5 rounded-xl
        shadow-2xl shadow-black/40
        transition-all duration-300 ease-out
        hover:border-blue-500/20 hover:scale-[1.02]
      `,
      glass: `
        relative bg-slate-800/30 backdrop-blur-md
        border border-white/10 rounded-xl
        shadow-2xl shadow-black/30
        transition-all duration-300 ease-out
        hover:border-purple-500/30 hover:scale-[1.02]
      `,
      elevated: `
        relative bg-slate-800/60 backdrop-blur-sm
        border border-slate-700/60 rounded-xl
        shadow-2xl shadow-black/40
        transition-all duration-300 ease-out
        hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)]
      `,
      glow: `
        relative bg-slate-800/70 backdrop-blur-sm
        border border-blue-500/20 rounded-xl
        shadow-xl shadow-blue-500/10
        transition-all duration-300 ease-out
        hover:shadow-2xl hover:shadow-blue-500/20
        hover:border-blue-500/40
      `,
      stat: `
        relative bg-gradient-to-br from-slate-800/80 to-slate-900/80
        backdrop-blur-sm border border-slate-700/40 rounded-xl
        shadow-xl shadow-black/30
        transition-all duration-300 ease-out
        hover:shadow-2xl hover:shadow-black/40
        hover:scale-[1.02]
      `,
      insight: `
        relative bg-slate-800/60 backdrop-blur-md
        border border-purple-500/20 rounded-xl
        shadow-xl shadow-purple-500/10
        transition-all duration-300 ease-out
        hover:shadow-2xl hover:shadow-purple-500/20
        hover:border-purple-500/40
        hover:scale-[1.02]
      `
    };

    const interactiveStyles = interactive ? `
      hover:border-blue-500/30 hover:scale-105 hover:shadow-2xl
      hover:shadow-blue-500/10 cursor-pointer
      active:scale-[0.98]
    ` : '';

    return (
      <div
        ref={ref}
        className={cn(
          variantStyles[variant],
          interactiveStyles,
          'p-6',
          className
        )}
        {...props}
      >
        {/* Inner glow effect for premium cards */}
        {(variant === 'glow' || variant === 'insight') && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-10 pointer-events-none" />
        )}

        {/* Top highlight line */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-[1px] rounded-t-xl opacity-30 pointer-events-none",
            variant === 'glow' ? "bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" :
            variant === 'insight' ? "bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" :
            "bg-gradient-to-r from-transparent via-slate-500/30 to-transparent"
          )}
        />

        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };