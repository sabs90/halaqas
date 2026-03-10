/**
 * Shared recurrence utilities — consolidates duplicated logic from
 * ics-generator.ts, AddToCalendarButton.tsx, EventCard.tsx, event detail page,
 * admin review, and admin health.
 */

const DAY_ABBR_ICS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const RRULE_MAP: Record<string, string> = {
  every_monday: 'FREQ=WEEKLY;BYDAY=MO',
  every_tuesday: 'FREQ=WEEKLY;BYDAY=TU',
  every_wednesday: 'FREQ=WEEKLY;BYDAY=WE',
  every_thursday: 'FREQ=WEEKLY;BYDAY=TH',
  every_friday: 'FREQ=WEEKLY;BYDAY=FR',
  every_saturday: 'FREQ=WEEKLY;BYDAY=SA',
  every_sunday: 'FREQ=WEEKLY;BYDAY=SU',
  daily: 'FREQ=DAILY',
  daily_ramadan: 'FREQ=DAILY',
  weekly: 'FREQ=WEEKLY',
  fortnightly: 'FREQ=WEEKLY;INTERVAL=2',
  monthly: 'FREQ=MONTHLY',
};

const DAY_MAP: Record<string, number> = {
  every_sunday: 0, every_monday: 1, every_tuesday: 2, every_wednesday: 3,
  every_thursday: 4, every_friday: 5, every_saturday: 6,
};

const LABEL_MAP: Record<string, string> = {
  every_monday: 'Every Monday',
  every_tuesday: 'Every Tuesday',
  every_wednesday: 'Every Wednesday',
  every_thursday: 'Every Thursday',
  every_friday: 'Every Friday',
  every_saturday: 'Every Saturday',
  every_sunday: 'Every Sunday',
  daily: 'Daily',
  daily_ramadan: 'Daily (Ramadan)',
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
};

/** Returns an RRULE string (without the "RRULE:" prefix or UNTIL). */
export function getRecurrenceRule(
  pattern: string,
  recurrenceDays?: number[] | null,
): string | null {
  if (pattern === 'custom' && recurrenceDays && recurrenceDays.length > 0) {
    const byDay = recurrenceDays
      .slice()
      .sort((a, b) => a - b)
      .map(d => DAY_ABBR_ICS[d])
      .join(',');
    return `FREQ=WEEKLY;BYDAY=${byDay}`;
  }
  return RRULE_MAP[pattern] || null;
}

/**
 * For recurring events with no fixed_date, pick the nearest future date
 * that falls on a matching day of the week.
 */
export function getStartDateForPattern(
  pattern: string,
  recurrenceDays?: number[] | null,
): Date {
  const now = new Date();

  if (pattern === 'custom' && recurrenceDays && recurrenceDays.length > 0) {
    const currentDay = now.getDay();
    // Find the nearest matching day (today or later)
    const sorted = recurrenceDays.slice().sort((a, b) => a - b);
    let diff = Infinity;
    for (const d of sorted) {
      const delta = (d - currentDay + 7) % 7;
      if (delta < diff) diff = delta;
    }
    if (diff !== Infinity) now.setDate(now.getDate() + diff);
    return now;
  }

  const targetDay = DAY_MAP[pattern];
  if (targetDay !== undefined) {
    const currentDay = now.getDay();
    const diff = (targetDay - currentDay + 7) % 7;
    now.setDate(now.getDate() + diff);
  }
  return now;
}

/** Returns a human-readable label like "Every Mon, Tue, Wed". */
export function formatRecurrenceLabel(
  pattern: string | null,
  recurrenceDays?: number[] | null,
): string | null {
  if (!pattern) return null;

  if (pattern === 'custom' && recurrenceDays && recurrenceDays.length > 0) {
    const names = recurrenceDays
      .slice()
      .sort((a, b) => a - b)
      .map(d => DAY_NAMES_SHORT[d]);
    return `Every ${names.join(', ')}`;
  }

  return LABEL_MAP[pattern] || pattern.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
