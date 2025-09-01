/**
 * Date and Time utility functions for consistent handling across the app
 *
 * This utility prevents timezone issues where entries appear on the wrong day
 * by always using local timezone for user-facing dates and times.
 */

/**
 * Get local date string in YYYY-MM-DD format
 * This ensures we're using the user's local timezone, not UTC
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get local time string in HH:MM:SS format
 * This ensures we're using the user's local timezone, not UTC
 */
export function getLocalTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Get current local date and time for database storage
 * Returns an object with separate date and time strings
 */
export function getLocalDateTime(date: Date = new Date()) {
  return {
    date: getLocalDateString(date),
    time: getLocalTimeString(date),
  };
}

/**
 * Get today's date string in YYYY-MM-DD format (local timezone)
 */
export function getTodayDateString(): string {
  return getLocalDateString(new Date());
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return getLocalDateString(date1) === getLocalDateString(date2);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date string represents today
 */
export function isDateStringToday(dateString: string): boolean {
  return dateString === getTodayDateString();
}

/**
 * Format date for display (e.g., "Today", "Yesterday", or "Jan 15")
 */
export function formatDateForDisplay(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return 'Today';
  } else if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatTimeForDisplay(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Parse date string (YYYY-MM-DD) to Date object in local timezone
 */
export function parseDateString(dateString: string): Date {
  // Parse as local date by adding time component to prevent timezone conversion
  return new Date(dateString + 'T00:00:00');
}

/**
 * Create a local Date object from date and time strings
 */
export function parseDateTime(dateString: string, timeString: string): Date {
  return new Date(`${dateString}T${timeString}`);
}

/**
 * Get meal type based on current time
 */
export function getCurrentMealType(): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 11) {
    return 'breakfast';
  } else if (hour >= 11 && hour < 16) {
    return 'lunch';
  } else if (hour >= 16 && hour < 22) {
    return 'dinner';
  } else {
    return 'snack';
  }
}

/**
 * Add days to a date string
 */
export function addDaysToDateString(dateString: string, days: number): string {
  const date = parseDateString(dateString);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

/**
 * Get days difference between two date strings
 */
export function getDaysDifference(startDate: string, endDate: string): number {
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date string represents yesterday
 */
export function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === getLocalDateString(yesterday);
}
