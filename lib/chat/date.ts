import { formatLocalDate, formatLocalTime } from '@/Utils/timezoneUtils';

/**
 * Format a chat timestamp for display.
 * Uses user's local timezone for display while treating inputs as UTC timestamps.
 */
export function formatChatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();

  const isToday = formatLocalDate(date) === formatLocalDate(now);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = formatLocalDate(date) === formatLocalDate(yesterday);

  if (isToday) {
    return formatLocalTime(date);
  }
  if (isYesterday) {
    return `Yesterday ${formatLocalTime(date)}`;
  }
  return `${formatLocalDate(date)} ${formatLocalTime(date)}`;
}

