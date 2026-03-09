/**
 * UK Timezone Utilities
 * All times in the app should be displayed and compared using Europe/London timezone.
 * This handles both GMT (winter) and BST (summer) automatically.
 */

const UK_TIMEZONE = 'Europe/London';

/**
 * Get the current date/time in UK timezone as a formatted string
 */
export function getNowUK(): Date {
  // Create a date string in UK timezone then parse it back
  const nowStr = new Date().toLocaleString('en-GB', { timeZone: UK_TIMEZONE });
  // Parse "DD/MM/YYYY, HH:mm:ss" format
  const [datePart, timePart] = nowStr.split(', ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Get current UK timestamp in milliseconds (for comparisons)
 */
export function getUKTimestamp(): number {
  return getNowUK().getTime();
}

/**
 * Format a date to UK timezone display
 */
export function formatDateUK(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: UK_TIMEZONE,
    ...options,
  };

  return dateObj.toLocaleString('en-GB', defaultOptions);
}

/**
 * Get date components (day, month, year, hours, minutes) in UK timezone
 */
export function getUKDateParts(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return null;

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(dateObj);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '0';

  return {
    year: parseInt(get('year')),
    month: parseInt(get('month')),
    day: parseInt(get('day')),
    hours: parseInt(get('hour')),
    minutes: parseInt(get('minute')),
    seconds: parseInt(get('second')),
  };
}

/**
 * Convert a date to UK timezone Date object (for comparisons)
 * Note: The returned Date object's internal UTC value won't match UK time,
 * but its local getters (getHours, etc.) will return UK time values.
 */
export function toUKDate(date: Date | string): Date {
  const parts = getUKDateParts(date);
  if (!parts) return new Date(NaN);
  return new Date(parts.year, parts.month - 1, parts.day, parts.hours, parts.minutes, parts.seconds);
}

export { UK_TIMEZONE };
