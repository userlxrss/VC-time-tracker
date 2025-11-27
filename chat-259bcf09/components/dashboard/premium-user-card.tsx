/**
 * Premium User Card for VC Time Tracker
 * Enterprise-grade user card with advanced functionality
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile, UserRole, DEFAULT_CURRENT_USER_ID, HARDCODED_USERS } from '@/src/types/user';
import { TimeEntry, TimeEntryStatus, getCurrentTimeString, getCurrentDateString, createEmptyTimeEntry } from '@/src/types/timeEntry';
import { TimeCalculator } from '@/src/utils/timeCalculations';
import { Clock, Users, Calendar, TrendingUp, PlayCircle, PauseCircle, Square, Coffee, Eye } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

// Props interface
interface PremiumUserCardProps {
  user: UserProfile;
  timeEntry?: TimeEntry;
  isCurrentUser: boolean;
  onClockIn?: (userId: string) => void;
  onClockOut?: (userId: string) => void;
  onStartLunch?: (userId: string) => void;
  onEndLunch?: (userId: string) => void;
  onStartBreak?: (userId: string) => void;
  onEndBreak?: (userId: string) => void;
  onViewDetails?: (userId: string) => void;
}

// Status indicator component
const StatusIndicator: React.FC<{ status: TimeEntryStatus; isLive?: boolean }> = ({ status, isLive = false }) => {
  const statusConfig = {
    [TimeEntryStatus.NOT_STARTED]: { color: 'bg-gray-500', label: 'Not Started', icon: '⚪' },
    [TimeEntryStatus.CLOCKED_IN]: { color: 'bg-green-500', label: 'Clocked In', icon: '🟢' },
    [TimeEntryStatus.ON_LUNCH]: { color: 'bg-orange-500', label: 'On Lunch', icon: '🟠' },
    [TimeEntryStatus.ON_BREAK]: { color: 'bg-orange-500', label: 'On Break', icon: '🟠' },
    [TimeEntryStatus.CLOCKED_OUT]: { color: 'bg-gray-500', label: 'Clocked Out', icon: '⚪' },
    [TimeEntryStatus.PENDING_APPROVAL]: { color: 'bg-yellow-500', label: 'Pending Approval', icon: '🟡' },
    [TimeEntryStatus.APPROVED]: { color: 'bg-blue-500', label: 'Approved', icon: '🔵' },
    [TimeEntryStatus.REJECTED]: { color: 'bg-red-500', label: 'Rejected', icon: '🔴' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${config.color} ${isLive ? 'animate-pulse' : ''}`} />
        {isLive && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping`} />
        )}
      </div>
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

// Stats display component
const StatsDisplay: React.FC<{ timeEntry?: TimeEntry; user: UserProfile }> = ({ timeEntry, user }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate today's stats
  const todayStats = useMemo(() => {
    if (!timeEntry) {
      return { todayHours: 0, weekHours: 0, monthHours: 0 };
    }

    const summary = TimeCalculator.getTimeSummary(timeEntry);
    const todayHours = summary.workHours;

    // Mock week and month calculations (would be replaced with actual data service)
    const weekHours = todayHours * 3; // Mock calculation
    const monthHours = todayHours * 15; // Mock calculation

    return { todayHours, weekHours, monthHours };
  }, [timeEntry, currentTime]);

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  };

  return (
    <div className="grid grid-cols-3 gap-4 py-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-medium">TODAY</span>
        </div>
        <div className="text-lg font-bold text-primary">
          {formatHours(todayStats.todayHours)}
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium">THIS WEEK</span>
        </div>
        <div className="text-lg font-bold text-primary">
          {formatHours(todayStats.weekHours)}
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
          <Users className="w-4 h-4" />
          <span className="text-xs font-medium">THIS MONTH</span>
        </div>
        <div className="text-lg font-bold text-primary">
          {formatHours(todayStats.monthHours)}
        </div>
      </div>
    </div>
  );
};

// Action buttons component
const ActionButtons: React.FC<{
  user: UserProfile;
  timeEntry?: TimeEntry;
  isCurrentUser: boolean;
  onClockIn?: (userId: string) => void;
  onClockOut?: (userId: string) => void;
  onStartLunch?: (userId: string) => void;
  onEndLunch?: (userId: string) => void;
  onStartBreak?: (userId: string) => void;
  onEndBreak?: (userId: string) => void;
  onViewDetails?: (userId: string) => void;
}> = ({
  user,
  timeEntry,
  isCurrentUser,
  onClockIn,
  onClockOut,
  onStartLunch,
  onEndLunch,
  onStartBreak,
  onEndBreak,
  onViewDetails
}) => {
  const status = timeEntry?.status || TimeEntryStatus.NOT_STARTED;

  // Get primary action button based on status and user
  const getPrimaryAction = () => {
    if (!isCurrentUser) {
      return (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onViewDetails?.(user.id)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      );
    }

    switch (status) {
      case TimeEntryStatus.NOT_STARTED:
        return (
          <Button
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => onClockIn?.(user.id)}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Clock In
          </Button>
        );

      case TimeEntryStatus.CLOCKED_IN:
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
              onClick={() => onStartLunch?.(user.id)}
            >
              <Coffee className="w-4 h-4 mr-1" />
              Lunch
            </Button>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              onClick={() => onStartBreak?.(user.id)}
            >
              <PauseCircle className="w-4 h-4 mr-1" />
              Break
            </Button>
          </div>
        );

      case TimeEntryStatus.ON_LUNCH:
        return (
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => onEndLunch?.(user.id)}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            End Lunch
          </Button>
        );

      case TimeEntryStatus.ON_BREAK:
        return (
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => onEndBreak?.(user.id)}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            End Break
          </Button>
        );

      case TimeEntryStatus.CLOCKED_OUT:
        return (
          <Button
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => onClockIn?.(user.id)}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Clock In
          </Button>
        );

      default:
        return (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onViewDetails?.(user.id)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        );
    }
  };

  return (
    <div className="mt-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {getPrimaryAction()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Main Premium User Card component
export const PremiumUserCard: React.FC<PremiumUserCardProps> = ({
  user,
  timeEntry,
  isCurrentUser,
  onClockIn,
  onClockOut,
  onStartLunch,
  onEndLunch,
  onStartBreak,
  onEndBreak,
  onViewDetails,
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Determine border color based on role and current user
  const getBorderColor = () => {
    if (isCurrentUser) return 'border-green-500 shadow-green-500/20';
    if (user.role === UserRole.BOSS) return 'border-blue-500 shadow-blue-500/20';
    return 'border-border shadow-border/20';
  };

  // Role badge color
  const getRoleBadgeColor = () => {
    switch (user.role) {
      case UserRole.BOSS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case UserRole.EMPLOYEE:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const status = timeEntry?.status || TimeEntryStatus.NOT_STARTED;
  const isLive = status === TimeEntryStatus.CLOCKED_IN || status === TimeEntryStatus.ON_LUNCH || status === TimeEntryStatus.ON_BREAK;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`h-full`}
    >
      <Card className={`h-full min-h-[360px] relative overflow-hidden transition-all duration-300 ${
        isCurrentUser ? 'border-2' : 'border'
      } ${getBorderColor()} ${
        isHovered ? 'shadow-xl' : 'shadow-lg'
      } ${
        theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-white'
      }`}>
        {/* Glassmorphism effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-black/5 dark:to-transparent pointer-events-none" />

        <CardHeader className="pb-4">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className={`text-xl font-bold ${
                  isCurrentUser ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  user.role === UserRole.BOSS ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator ring */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background ${
                status === TimeEntryStatus.CLOCKED_IN ? 'bg-green-500 animate-pulse' :
                status === TimeEntryStatus.ON_LUNCH || status === TimeEntryStatus.ON_BREAK ? 'bg-orange-500' :
                'bg-gray-500'
              }`} />
            </div>

            {/* User info */}
            <div className="space-y-2">
              <h3 className={`text-xl font-bold ${isCurrentUser ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                {user.fullName}
                {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
              </h3>
              <Badge className={getRoleBadgeColor()}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              <StatusIndicator status={status} isLive={isLive} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Stats */}
          <StatsDisplay timeEntry={timeEntry} user={user} />

          {/* Action Buttons */}
          <ActionButtons
            user={user}
            timeEntry={timeEntry}
            isCurrentUser={isCurrentUser}
            onClockIn={onClockIn}
            onClockOut={onClockOut}
            onStartLunch={onStartLunch}
            onEndLunch={onEndLunch}
            onStartBreak={onStartBreak}
            onEndBreak={onEndBreak}
            onViewDetails={onViewDetails}
          />
        </CardContent>

        {/* Subtle glow effect for current user */}
        {isCurrentUser && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
        )}
      </Card>
    </motion.div>
  );
};

export default PremiumUserCard;