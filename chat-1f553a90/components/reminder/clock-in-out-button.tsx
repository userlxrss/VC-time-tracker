'use client';

import React from 'react';
import { Clock, Clock4, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReminder } from '@/contexts/ReminderContext';
import { Badge } from '@/components/ui/badge';

export function ClockInOutButton() {
  const { clockInStatus, clockIn, clockOut } = useReminder();

  const handleClockIn = () => {
    clockIn();
  };

  const handleClockOut = () => {
    clockOut();
  };

  if (!clockInStatus.isClockedIn) {
    return (
      <Button
        onClick={handleClockIn}
        variant="default"
        size="sm"
        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-premium-md"
      >
        <Play className="h-4 w-4 mr-2" />
        Clock In
      </Button>
    );
  }

  // Calculate hours worked for display
  const hoursWorked = clockInStatus.clockInTime
    ? ((new Date().getTime() - new Date(clockInStatus.clockInTime).getTime()) / (1000 * 60 * 60)).toFixed(1)
    : '0.0';

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
      >
        <Clock className="h-3 w-3 mr-1" />
        {hoursWorked}h
      </Badge>
      <Button
        onClick={handleClockOut}
        variant="outline"
        size="sm"
        className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        <Square className="h-4 w-4 mr-2" />
        Clock Out
      </Button>
    </div>
  );
}