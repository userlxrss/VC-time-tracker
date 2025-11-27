import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

interface GradientCardProps {
  title: string;
  children: React.ReactNode;
  gradient?: 'aurora' | 'sunset' | 'ocean' | 'forest' | 'cosmic';
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

const gradients = {
  aurora: {
    subtle: 'from-blue-900/20 via-purple-900/20 to-cyan-900/20',
    medium: 'from-blue-800/30 via-purple-800/30 to-cyan-800/30',
    strong: 'from-blue-700/40 via-purple-700/40 to-cyan-700/40'
  },
  sunset: {
    subtle: 'from-orange-900/20 via-red-900/20 to-pink-900/20',
    medium: 'from-orange-800/30 via-red-800/30 to-pink-800/30',
    strong: 'from-orange-700/40 via-red-700/40 to-pink-700/40'
  },
  ocean: {
    subtle: 'from-blue-900/20 via-cyan-900/20 to-teal-900/20',
    medium: 'from-blue-800/30 via-cyan-800/30 to-teal-800/30',
    strong: 'from-blue-700/40 via-cyan-700/40 to-teal-700/40'
  },
  forest: {
    subtle: 'from-green-900/20 via-emerald-900/20 to-teal-900/20',
    medium: 'from-green-800/30 via-emerald-800/30 to-teal-800/30',
    strong: 'from-green-700/40 via-emerald-700/40 to-teal-700/40'
  },
  cosmic: {
    subtle: 'from-purple-900/20 via-pink-900/20 to-indigo-900/20',
    medium: 'from-purple-800/30 via-pink-800/30 to-indigo-800/30',
    strong: 'from-purple-700/40 via-pink-700/40 to-indigo-700/40'
  }
};

export const GradientCard: React.FC<GradientCardProps> = ({
  title,
  children,
  gradient = 'aurora',
  intensity = 'medium',
  className
}) => {
  const gradientClass = gradients[gradient][intensity];

  return (
    <Card
      variant="elevated"
      className={cn('relative overflow-hidden', className)}
    >
      {/* Animated gradient background */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-70',
          gradientClass
        )}
      />

      {/* Moving highlight effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />

      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <CardHeader className="border-slate-700/30 relative z-10">
        <CardTitle className="text-xl text-slate-100">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10">
        {children}
      </CardContent>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full opacity-50" />

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Card>
  );
};