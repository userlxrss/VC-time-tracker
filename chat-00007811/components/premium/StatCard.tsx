import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  gradient?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  className?: string;
}

const gradients = {
  blue: 'from-blue-600/20 to-cyan-600/20',
  purple: 'from-purple-600/20 to-pink-600/20',
  green: 'from-green-600/20 to-emerald-600/20',
  red: 'from-red-600/20 to-rose-600/20',
  orange: 'from-orange-600/20 to-amber-600/20'
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  gradient = 'blue',
  className
}) => {
  return (
    <Card variant="stat" className={cn('relative overflow-hidden', className)}>
      {/* Gradient background overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-50',
          gradients[gradient]
        )}
      />

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full" />

      <CardContent className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-100 tracking-tight">
              {value}
            </p>
            {change && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    'text-sm font-medium flex items-center',
                    change.isPositive ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {change.isPositive ? '↑' : '↓'} {change.value}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 ml-4 text-slate-500">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};