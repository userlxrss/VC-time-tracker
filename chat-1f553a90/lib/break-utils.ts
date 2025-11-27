import { BreakSession } from './break-types';

export function formatBreakTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatBreakDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function getBreakTypeIcon(type: 'lunch' | 'short'): string {
  return type === 'lunch' ? '🍽️' : '☕';
}

export function getBreakTypeLabel(type: 'lunch' | 'short'): string {
  return type === 'lunch' ? 'Lunch Break' : 'Short Break';
}

export function getBreakTypeColor(type: 'lunch' | 'short'): string {
  return type === 'lunch'
    ? 'text-orange-600 dark:text-orange-400'
    : 'text-blue-600 dark:text-blue-400';
}

export function getBreakTypeBgColor(type: 'lunch' | 'short'): string {
  return type === 'lunch'
    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
}

export function calculateBreakEfficiency(workMinutes: number, breakMinutes: number): number {
  if (workMinutes === 0) return 0;
  return Math.round((workMinutes / (workMinutes + breakMinutes)) * 100);
}

export function getRecommendedBreakTime(workStreakMinutes: number): number {
  // Suggest longer breaks after longer work periods
  if (workStreakMinutes >= 240) return 15; // 4+ hours -> 15 min break
  if (workStreakMinutes >= 180) return 10; // 3+ hours -> 10 min break
  if (workStreakMinutes >= 120) return 5;  // 2+ hours -> 5 min break
  return 0; // Less than 2 hours, no break recommended
}

export function validateBreakTime(breakType: 'lunch' | 'short', minutes: number): { valid: boolean; message?: string } {
  if (minutes <= 0) {
    return { valid: false, message: 'Break duration must be positive' };
  }

  if (breakType === 'lunch') {
    if (minutes < 30) {
      return { valid: false, message: 'Lunch break must be at least 30 minutes' };
    }
    if (minutes > 90) {
      return { valid: false, message: 'Lunch break cannot exceed 90 minutes' };
    }
  } else {
    if (minutes < 5) {
      return { valid: false, message: 'Short break must be at least 5 minutes' };
    }
    if (minutes > 30) {
      return { valid: false, message: 'Short break cannot exceed 30 minutes' };
    }
  }

  return { valid: true };
}

export function generateBreakReport(sessions: BreakSession[]): {
  totalBreaks: number;
  totalMinutes: number;
  averageBreakLength: number;
  lunchBreaksTaken: number;
  shortBreaksTaken: number;
  mostCommonBreakTime: string;
} {
  const totalBreaks = sessions.length;
  const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const averageBreakLength = totalBreaks > 0 ? totalMinutes / totalBreaks : 0;
  const lunchBreaksTaken = sessions.filter(s => s.type === 'lunch').length;
  const shortBreaksTaken = sessions.filter(s => s.type === 'short').length;

  // Find most common break time
  const breakTimes = sessions
    .filter(s => s.duration)
    .map(s => s.duration!)
    .sort((a, b) => {
      const countA = sessions.filter(s => s.duration === a).length;
      const countB = sessions.filter(s => s.duration === b).length;
      return countB - countA;
    });

  const mostCommonBreakTime = breakTimes.length > 0 ? formatBreakDuration(breakTimes[0]) : 'N/A';

  return {
    totalBreaks,
    totalMinutes,
    averageBreakLength: Math.round(averageBreakLength),
    lunchBreaksTaken,
    shortBreaksTaken,
    mostCommonBreakTime,
  };
}

export function createBreakNotification(breakSession: BreakSession): Notification {
  return {
    id: `break-${breakSession.id}`,
    title: `${getBreakTypeLabel(breakSession.type)} ${breakSession.isActive ? 'Started' : 'Ended'}`,
    body: breakSession.isActive
      ? `You're now on ${getBreakTypeLabel(breakSession.type).toLowerCase()}`
      : `${getBreakTypeLabel(breakSession.type)} completed (${formatBreakDuration(breakSession.duration || 0)})`,
    icon: getBreakTypeIcon(breakSession.type),
    timestamp: breakSession.isActive ? breakSession.startTime : breakSession.endTime!,
  };
}

// Browser notification compatibility
export function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    return Notification.requestPermission();
  }
  return Promise.resolve('denied');
}

export function showBreakNotification(message: string, options: NotificationOptions = {}): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(message, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }
}