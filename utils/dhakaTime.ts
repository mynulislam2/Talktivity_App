// Utility for formatting dates/times in Dhaka timezone

const DHAKA_TZ = 'Asia/Dhaka';

export function formatDhakaDate(dateInput: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    timeZone: DHAKA_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(options || {})
  });
}

export function formatDhakaTime(dateInput: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(dateInput);
  return date.toLocaleTimeString('en-US', {
    timeZone: DHAKA_TZ,
    hour: '2-digit',
    minute: '2-digit',
    ...(options || {})
  });
}

export function formatDhakaDateTime(dateInput: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(dateInput);
  return date.toLocaleString('en-US', {
    timeZone: DHAKA_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(options || {})
  });
} 