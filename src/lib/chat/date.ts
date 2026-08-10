import { formatLocalDate, formatLocalTime } from '@/utils/timezoneUtils';

/**
 * Format a chat timestamp for display.
 * Uses user's local timezone for display while treating inputs as UTC timestamps.
 */
export function formatChatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();

  const isToday =
    formatLocalDate(date, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) ===
    formatLocalDate(now, { year: 'numeric', month: '2-digit', day: '2-digit' });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    formatLocalDate(date, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) ===
    formatLocalDate(yesterday, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  if (isToday) {
    return formatLocalTime(date);
  }
  if (isYesterday) {
    return `Yesterday ${formatLocalTime(date)}`;
  }
  return `${formatLocalDate(date, {
    month: 'short',
    day: 'numeric',
  })} ${formatLocalTime(date)}`;
}
