// Timezone utility functions
// Business logic uses UTC, display uses user's local timezone

/**
 * Get today's date in UTC timezone as YYYY-MM-DD string.
 * Use this for API calls and business logic.
 *
 * @param dateInput - Optional date input (defaults to current UTC time)
 * @returns YYYY-MM-DD string in UTC
 */
export function getUtcToday(dateInput?: string | number | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalize any input to a UTC date string (YYYY-MM-DD).
 * Use this whenever you need to send a date to backend APIs.
 */
export function toUtcDateString(input?: string | number | Date): string {
  if (!input) {
    return getUtcToday();
  }
  return getUtcToday(input);
}

/**
 * Get current UTC datetime as Date object.
 * Use this for business logic that needs UTC timestamps.
 *
 * @returns Date object in UTC
 */
export function getUtcNow(): Date {
  return new Date();
}

/**
 * Format date in user's local timezone for display.
 * Converts UTC to user's local timezone.
 *
 * @param dateInput - UTC date/time (string, number, or Date)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in user's local timezone
 */
export function formatLocalDate(
  dateInput: string | number | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(options || {}),
  });
}

/**
 * Format time in user's local timezone for display.
 * Converts UTC to user's local timezone.
 *
 * @param dateInput - UTC date/time (string, number, or Date)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string in user's local timezone
 */
export function formatLocalTime(
  dateInput: string | number | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateInput);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    ...(options || {}),
  });
}

/**
 * Format date and time in user's local timezone for display.
 * Converts UTC to user's local timezone.
 *
 * @param dateInput - UTC date/time (string, number, or Date)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date-time string in user's local timezone
 */
export function formatLocalDateTime(
  dateInput: string | number | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateInput);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(options || {}),
  });
}

// Legacy functions for backward compatibility (deprecated - use formatLocal* functions instead)
// These are kept for existing code that uses them, but will be removed in future versions
const DHAKA_TZ = 'Asia/Dhaka';

/**
 * @deprecated Use formatLocalDate instead. This function formats in Dhaka timezone.
 */
export function formatDhakaDate(
  dateInput: string | number | Date,
  options?: Intl.DateTimeFormatOptions
) {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    timeZone: DHAKA_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(options || {}),
  });
}

/**
 * @deprecated Use formatLocalTime instead. This function formats in Dhaka timezone.
 */
export function formatDhakaTime(
  dateInput: string | number | Date,
  options?: Intl.DateTimeFormatOptions
) {
  const date = new Date(dateInput);
  return date.toLocaleTimeString('en-US', {
    timeZone: DHAKA_TZ,
    hour: '2-digit',
    minute: '2-digit',
    ...(options || {}),
  });
}

/**
 * @deprecated Use formatLocalDateTime instead. This function formats in Dhaka timezone.
 */
export function formatDhakaDateTime(
  dateInput: string | number | Date,
  options?: Intl.DateTimeFormatOptions
) {
  const date = new Date(dateInput);
  return date.toLocaleString('en-US', {
    timeZone: DHAKA_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(options || {}),
  });
}
