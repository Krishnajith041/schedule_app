/**
 * Date helpers – all pure functions, no side effects.
 */

/** Returns today's date as YYYY-MM-DD */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns a Date object set to midnight local time for a YYYY-MM-DD string */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date → YYYY-MM-DD */
export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns true if dateStr is older than 3 calendar months from today */
export function isOlderThan3Months(dateStr: string): boolean {
  const date = parseLocalDate(dateStr);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 3);
  cutoff.setHours(0, 0, 0, 0);
  return date < cutoff;
}

/** 3-month cutoff date (start of day) */
export function threeMonthCutoff(): Date {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 3);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

/** Adds N months to a date */
export function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

/** Adds N days to a date */
export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Adds N weeks to a date */
export function addWeeks(date: Date, n: number): Date {
  return addDays(date, n * 7);
}

/** Days in a month */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** First weekday of month (0=Sun) */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Short month names */
export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
export const SHORT_MONTH_NAMES = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

export const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const DAY_NAMES_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/** Format a date string nicely for display */
export function formatDisplayDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${d.getDate()} ${SHORT_MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/** Check if two YYYY-MM-DD strings are the same day */
export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

/** Compare two YYYY-MM-DD strings */
export function compareDates(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
