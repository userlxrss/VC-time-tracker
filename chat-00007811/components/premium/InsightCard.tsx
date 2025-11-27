import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  title: string;
  insight: string;
  confidence?: number;
  category?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const categoryColors = {
  performance: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  security: 'bg-red-500/10 text-red-400 border-red-500/20',
  optimization: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  info: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
};

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  insight,
  confidence,
  category = 'info',
  trend,
  icon,
  actions,
  className
}) => {
  const categoryColor = categoryColors[category as keyof typeof categoryColors] || categoryColors.info;

  return (
    <Card variant="insight" className={cn('relative overflow-hidden group', className)}>
      {/* Animated gradient border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

      {/* Pulsing glow effect */}
      <div className="absolute inset-0 rounded-xl bg-purple-500/5 animate-pulse" />

      <CardHeader className="border-slate-700/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0 text-purple-400">
                {icon}
              </div>
            )}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {trend && (
            <div className="flex-shrink-0">
              <span className="text-2xl">
                {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-slate-300 leading-relaxed mb-4">
          {insight}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {category && (
              <span className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-full border',
                categoryColor
              )}>
                {category}
              </span>
            )}
            {confidence && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-slate-400">Confidence:</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-full',
                        i < Math.round(confidence / 20)
                          ? 'bg-purple-400'
                          : 'bg-slate-600'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </CardContent>

      {/* Hover overlay with subtle gradient */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
};