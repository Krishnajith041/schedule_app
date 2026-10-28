import type { CateringEvent, RecurrenceRule } from '../types';
import { parseLocalDate, toDateStr, addDays, addWeeks, addMonths } from './dates';

const MAX_HORIZON_MONTHS = 3;

/**
 * Expand a recurring event into an array of occurrence date strings (YYYY-MM-DD).
 * The base date is always included as the first occurrence.
 * Results are capped at MAX_HORIZON_MONTHS from today.
 */
export function expandRecurrence(event: CateringEvent): string[] {
  if (!event.recurrence) return [event.date];

  const rule: RecurrenceRule = event.recurrence;
  const base = parseLocalDate(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = addMonths(today, MAX_HORIZON_MONTHS);

  // Determine hard end date
  let endDate: Date | null = null;
  if (rule.endDate) {
    endDate = parseLocalDate(rule.endDate);
  }

  const dates: string[] = [];
  let current = new Date(base);
  let count = 0;
  const maxOccurrences = rule.occurrences ?? 500;

  while (true) {
    // Stop if past horizon
    if (current > horizon) break;
    // Stop if past end date
    if (endDate && current > endDate) break;
    // Stop if hit occurrence limit
    if (count >= maxOccurrences) break;

    // For weekly recurrence, check daysOfWeek
    if (rule.frequency === 'weekly' && rule.daysOfWeek && rule.daysOfWeek.length > 0) {
      // Instead of stepping by interval weeks each time,
      // we walk week by week within each interval period
      // Build a "week window" approach: advance 1 day at a time within the interval window
      // Actually: standard approach — find next occurrence by advancing 1 day
      // Re-implement properly below
      break; // placeholder — handled separately
    }

    dates.push(toDateStr(current));
    count++;

    // Advance
    switch (rule.frequency) {
      case 'daily':
        current = addDays(current, rule.interval);
        break;
      case 'weekly':
        current = addWeeks(current, rule.interval);
        break;
      case 'monthly':
        current = addMonths(current, rule.interval);
        break;
    }
  }

  // Handle weekly with specific days of week
  if (rule.frequency === 'weekly' && rule.daysOfWeek && rule.daysOfWeek.length > 0) {
    return expandWeeklyWithDays(event, rule, base, horizon, endDate);
  }

  return dates;
}

function expandWeeklyWithDays(
  _event: CateringEvent,
  rule: RecurrenceRule,
  base: Date,
  horizon: Date,
  endDate: Date | null
): string[] {
  const dates: string[] = [];
  const daysOfWeek = rule.daysOfWeek!.slice().sort((a, b) => a - b);
  const maxOccurrences = rule.occurrences ?? 500;

  // Start from the Monday of the week containing base date
  // Actually start from base date and walk forward
  let current = new Date(base);
  // Go to start of week (Sunday)
  const dayOfWeek = current.getDay();
  current = addDays(current, -dayOfWeek); // rewind to Sunday

  let intervalWeekStart = new Date(current);

  while (true) {
    if (current > horizon) break;
    if (endDate && current > endDate) break;
    if (dates.length >= maxOccurrences) break;

    // Check if we're still in the current interval window
    const weeksSinceStart = Math.round((current.getTime() - intervalWeekStart.getTime()) / (7 * 86400000));
    const weekInInterval = weeksSinceStart % rule.interval;

    if (weekInInterval === 0) {
      // This week is an active week — check each day
      for (const dow of daysOfWeek) {
        const candidate = addDays(current, dow);
        if (candidate < base) continue; // before base
        if (candidate > horizon) break;
        if (endDate && candidate > endDate) break;
        if (dates.length >= maxOccurrences) break;
        dates.push(toDateStr(candidate));
      }
    }

    // Advance by 1 week
    current = addWeeks(current, 1);
  }

  return dates.sort();
}

/**
 * Get all occurrences of a recurring event that fall on a specific date.
 */
export function getOccurrencesOnDate(event: CateringEvent, dateStr: string): boolean {
  if (event.date === dateStr) return true;
  if (!event.recurrence) return false;
  const occurrences = expandRecurrence(event);
  return occurrences.includes(dateStr);
}

/**
 * Get all future occurrences (today and onwards) for an event.
 */
export function getFutureOccurrences(event: CateringEvent): { date: string; event: CateringEvent }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  if (!event.recurrence) {
    if (event.date >= todayStr) return [{ date: event.date, event }];
    return [];
  }

  const occurrences = expandRecurrence(event);
  return occurrences
    .filter(d => d >= todayStr)
    .map(d => ({ date: d, event }));
}
