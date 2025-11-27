import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  badge?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  interactive?: boolean;
  className?: string;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  description,
  children,
  badge,
  action,
  interactive = true,
  className
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <Card
      variant="glass"
      interactive={interactive}
      className={cn(
        'group cursor-pointer relative overflow-hidden',
        'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-blue-500/5 before:to-purple-500/5 before:opacity-0 before:transition-opacity before:duration-300',
        'hover:before:opacity-100',
        isPressed && 'scale-[0.98]',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive gradient border on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="border-slate-700/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-blue-300 transition-colors duration-200">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-slate-400 mt-1 group-hover:text-slate-300 transition-colors duration-200">
                {description}
              </p>
            )}
          </div>
          {badge && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        {children}

        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              'mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all duration-200',
              'border border-slate-600 hover:border-blue-500/50',
              'bg-slate-700/50 hover:bg-blue-500/10',
              'text-slate-200 hover:text-blue-300',
              'hover:shadow-lg hover:shadow-blue-500/10'
            )}
          >
            {action.label}
          </button>
        )}
      </CardContent>

      {/* Subtle inner glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
};