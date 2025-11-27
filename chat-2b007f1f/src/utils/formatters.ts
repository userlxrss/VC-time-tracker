/**
 * Helper functions for formatting hours, durations, and other data
 */

import { formatDuration } from './dateUtils';

/**
 * Format minutes to decimal hours (e.g., 150 minutes -> 2.5 hours)
 */
export function formatMinutesToDecimalHours(minutes: number): string {
  const hours = minutes / 60;
  return hours.toFixed(2);
}

/**
 * Format minutes to hours and minutes (e.g., 150 minutes -> "2h 30m")
 */
export function formatMinutesToHoursMinutes(minutes: number): string {
  if (minutes < 0) return '0h 0m';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format minutes to time format (e.g., 150 minutes -> "2:30")
 */
export function formatMinutesToTime(minutes: number, showSeconds: boolean = false): string {
  if (minutes < 0) return '0:00';

  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutesRemaining = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    if (showSeconds) {
      return `${hours}:${minutesRemaining.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${hours}:${minutesRemaining.toString().padStart(2, '0')}`;
  }

  if (showSeconds) {
    return `${minutesRemaining}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutesRemaining}:00`;
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  includeSymbol: boolean = true
): string {
  const formatted = value.toFixed(decimals);
  return includeSymbol ? `${formatted}%` : formatted;
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return original if format is not recognized
  return phoneNumber;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(
  number: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  } catch (error) {
    return number.toString();
  }
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatMilliseconds(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }

  return `${seconds}s`;
}

/**
 * Format time range
 */
export function formatTimeRange(
  startTime: Date,
  endTime: Date,
  timeFormat: '12h' | '24h' = '12h'
): string {
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (timeFormat === '24h') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // 12-hour format
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Format date range
 */
export function formatDateRange(
  startDate: Date,
  endDate: Date,
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'MM/DD/YYYY'
): string {
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const paddedDay = day.toString().padStart(2, '0');
    const paddedMonth = month.toString().padStart(2, '0');

    switch (dateFormat) {
      case 'MM/DD/YYYY':
        return `${paddedMonth}/${paddedDay}/${year}`;
      case 'DD/MM/YYYY':
        return `${paddedDay}/${paddedMonth}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${paddedMonth}-${paddedDay}`;
      default:
        return `${paddedMonth}/${paddedDay}/${year}`;
    }
  };

  // If same day, just return the date
  if (startDate.toDateString() === endDate.toDateString()) {
    return formatDate(startDate);
  }

  // If same month and year, use format like "Jan 1-15, 2024"
  if (startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[startDate.getMonth()]} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
  }

  // Different months, use full format
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Format week range
 */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatDate = (date: Date) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  };

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${formatDate(weekStart)}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
  }

  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
}

/**
 * Format month range (full month)
 */
export function formatMonthRange(date: Date): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(Math.abs(diffMs) / (1000 * 60));
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);

  const isFuture = diffMs > 0;

  const formatUnit = (value: number, unit: string) => {
    return `${value} ${unit}${value !== 1 ? 's' : ''} ${isFuture ? 'from now' : 'ago'}`;
  };

  if (Math.abs(diffMs) < 60000) {
    return isFuture ? 'in a moment' : 'just now';
  }

  if (diffMinutes < 60) {
    return formatUnit(diffMinutes, 'minute');
  }

  if (diffHours < 24) {
    return formatUnit(diffHours, 'hour');
  }

  if (diffDays < 7) {
    return formatUnit(diffDays, 'day');
  }

  if (diffWeeks < 4) {
    return formatUnit(diffWeeks, 'week');
  }

  if (diffMonths < 12) {
    return formatUnit(diffMonths, 'month');
  }

  return formatUnit(diffYears, 'year');
}

/**
 * Format list of items with proper grammar
 */
export function formatList(items: string[], conjunction: string = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
}

/**
 * Format name (capitalize, proper spacing)
 */
export function formatName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format email address (lowercase, trim)
 */
export function formatEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Format project or task name (title case)
 */
export function formatProjectName(name: string): string {
  const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'in', 'of'];

  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (index === 0 || !minorWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format a list of time entries into a readable summary
 */
export function formatTimeEntriesSummary(timeEntries: Array<{
  project?: string;
  duration?: number;
  task?: string;
}>): string {
  if (timeEntries.length === 0) return 'No time entries';

  const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const uniqueProjects = [...new Set(timeEntries.map(entry => entry.project).filter(Boolean))];

  const totalHours = totalMinutes / 60;
  const hoursText = totalHours.toFixed(1);

  if (uniqueProjects.length === 0) {
    return `${hoursText} hours worked`;
  }

  if (uniqueProjects.length === 1) {
    return `${hoursText} hours on ${uniqueProjects[0]}`;
  }

  return `${hoursText} hours across ${uniqueProjects.length} projects`;
}