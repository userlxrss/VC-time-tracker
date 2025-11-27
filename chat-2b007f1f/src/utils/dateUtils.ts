/**
 * Date and time utilities for VC Time Tracker
 */

/**
 * Format date according to user preferences
 */
export function formatDate(date: Date, format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'MM/DD/YYYY'): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const paddedDay = day.toString().padStart(2, '0');
  const paddedMonth = month.toString().padStart(2, '0');

  switch (format) {
    case 'MM/DD/YYYY':
      return `${paddedMonth}/${paddedDay}/${year}`;
    case 'DD/MM/YYYY':
      return `${paddedDay}/${paddedMonth}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${paddedMonth}-${paddedDay}`;
    default:
      return `${paddedMonth}/${paddedDay}/${year}`;
  }
}

/**
 * Format time according to user preferences
 */
export function formatTime(date: Date, format: '12h' | '24h' = '12h'): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  if (format === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // 12-hour format
  const displayHours = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Format date and time together
 */
export function formatDateTime(
  date: Date,
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'MM/DD/YYYY',
  timeFormat: '12h' | '24h' = '12h'
): string {
  return `${formatDate(date, dateFormat)} at ${formatTime(date, timeFormat)}`;
}

/**
 * Format duration in minutes to human-readable format
 */
export function formatDuration(minutes: number, includeSeconds: boolean = false): string {
  if (minutes < 0) return '0m';

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
 * Format duration to decimal hours
 */
export function formatDurationToHours(minutes: number): string {
  const hours = minutes / 60;
  return hours.toFixed(2);
}

/**
 * Get the start of a day (midnight)
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of a day (23:59:59.999)
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get the start of a week (Sunday)
 */
export function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of a week (Saturday)
 */
export function getEndOfWeek(date: Date): Date {
  const startOfWeek = getStartOfWeek(date);
  const result = new Date(startOfWeek);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get the start of a month
 */
export function getStartOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of a month
 */
export function getEndOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Subtract weeks from a date
 */
export function subtractWeeks(date: Date, weeks: number): Date {
  return addWeeks(date, -weeks);
}

/**
 * Subtract months from a date
 */
export function subtractMonths(date: Date, months: number): Date {
  return addMonths(date, -months);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if two dates are the same week
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const startOfWeek1 = getStartOfWeek(date1);
  const startOfWeek2 = getStartOfWeek(date2);
  return startOfWeek1.getTime() === startOfWeek2.getTime();
}

/**
 * Check if two dates are the same month
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = subtractDays(new Date(), 1);
  return isSameDay(date, yesterday);
}

/**
 * Check if a date is this week
 */
export function isThisWeek(date: Date): boolean {
  return isSameWeek(date, new Date());
}

/**
 * Check if a date is this month
 */
export function isThisMonth(date: Date): boolean {
  return isSameMonth(date, new Date());
}

/**
 * Get a relative time description
 */
export function getRelativeTimeDescription(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return formatDate(date);
}

/**
 * Get week range for a given date
 */
export function getWeekRange(date: Date): { start: Date; end: Date; label: string } {
  const start = getStartOfWeek(date);
  const end = getEndOfWeek(date);

  const label = `${formatDate(start)} - ${formatDate(end)}`;

  return { start, end, label };
}

/**
 * Get month range for a given date
 */
export function getMonthRange(date: Date): { start: Date; end: Date; label: string } {
  const start = getStartOfMonth(date);
  const end = getEndOfMonth(date);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const label = `${monthNames[start.getMonth()]} ${start.getFullYear()}`;

  return { start, end, label };
}

/**
 * Get working days between two dates (Monday-Friday)
 */
export function getWorkingDaysBetween(startDate: Date, endDate: Date): number {
  let workingDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday-Friday
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

/**
 * Check if a date is a working day
 */
export function isWorkingDay(date: Date, workingDays: number[] = [1, 2, 3, 4, 5]): boolean {
  const dayOfWeek = date.getDay();
  return workingDays.includes(dayOfWeek);
}

/**
 * Get the previous working day
 */
export function getPreviousWorkingDay(date: Date, workingDays: number[] = [1, 2, 3, 4, 5]): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - 1);

  while (!isWorkingDay(result, workingDays)) {
    result.setDate(result.getDate() - 1);
  }

  return result;
}

/**
 * Get the next working day
 */
export function getNextWorkingDay(date: Date, workingDays: number[] = [1, 2, 3, 4, 5]): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);

  while (!isWorkingDay(result, workingDays)) {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

/**
 * Parse time string to Date object
 */
export function parseTimeString(timeString: string, date?: Date): Date {
  const baseDate = date || new Date();

  // Handle different time formats
  const timeFormats = [
    /^([0-1]?[0-9]):([0-5][0-9])\s*([AP]M)$/i, // 12-hour format
    /^([0-1]?[0-9]):([0-5][0-9])$/, // 24-hour format
    /^([0-9])\s*([AP]M)$/i, // 12-hour format without minutes
    /^([0-9]{1,2})$/i // Hour only
  ];

  for (const format of timeFormats) {
    const match = timeString.trim().toUpperCase().match(format);
    if (match) {
      let hours: number, minutes = 0;

      if (format === timeFormats[0]) { // 12-hour format
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        const ampm = match[3];
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      } else if (format === timeFormats[1]) { // 24-hour format
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
      } else if (format === timeFormats[2]) { // 12-hour format without minutes
        hours = parseInt(match[1]);
        const ampm = match[2];
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      } else { // Hour only (24-hour)
        hours = parseInt(match[1]);
      }

      const result = new Date(baseDate);
      result.setHours(hours, minutes, 0, 0);
      return result;
    }
  }

  // If no format matches, return current time
  return new Date(baseDate);
}