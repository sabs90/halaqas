import type { Event, Mosque } from './types';
import { getEventTime } from './prayer-times';

const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Australia/Sydney',
  'BEGIN:STANDARD',
  'DTSTART:19700405T030000',
  'RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=4',
  'TZOFFSETFROM:+1100',
  'TZOFFSETTO:+1000',
  'TZNAME:AEST',
  'END:STANDARD',
  'BEGIN:DAYLIGHT',
  'DTSTART:19701004T020000',
  'RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=10',
  'TZOFFSETFROM:+1000',
  'TZOFFSETTO:+1100',
  'TZNAME:AEDT',
  'END:DAYLIGHT',
  'END:VTIMEZONE',
].join('\r\n');

function escapeICS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Format a Date in Australia/Sydney local time as ICS: YYYYMMDDTHHmmSS */
function formatSydneyLocal(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '00';
  return `${get('year')}${get('month')}${get('day')}T${get('hour')}${get('minute')}${get('second')}`;
}

/** Format a Date as UTC ICS timestamp: YYYYMMDDTHHmmSSZ */
function formatUTC(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Format as DATE-only (no time component) for all-day events: YYYYMMDD */
function formatDateOnly(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

/** Add one day to an ISO date string, return YYYYMMDD */
function nextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function getRecurrenceRule(pattern: string): string | null {
  const rules: Record<string, string> = {
    'every_monday': 'FREQ=WEEKLY;BYDAY=MO',
    'every_tuesday': 'FREQ=WEEKLY;BYDAY=TU',
    'every_wednesday': 'FREQ=WEEKLY;BYDAY=WE',
    'every_thursday': 'FREQ=WEEKLY;BYDAY=TH',
    'every_friday': 'FREQ=WEEKLY;BYDAY=FR',
    'every_saturday': 'FREQ=WEEKLY;BYDAY=SA',
    'every_sunday': 'FREQ=WEEKLY;BYDAY=SU',
    'daily': 'FREQ=DAILY',
    'daily_ramadan': 'FREQ=DAILY',
    'weekly': 'FREQ=WEEKLY',
    'fortnightly': 'FREQ=WEEKLY;INTERVAL=2',
    'monthly': 'FREQ=MONTHLY',
  };
  return rules[pattern] || null;
}

/** For recurring events with no fixed_date, pick a start date that falls on the correct day of the week */
function getStartDateForPattern(pattern: string): Date {
  const dayMap: Record<string, number> = {
    every_sunday: 0, every_monday: 1, every_tuesday: 2, every_wednesday: 3,
    every_thursday: 4, every_friday: 5, every_saturday: 6,
  };
  const targetDay = dayMap[pattern];
  const now = new Date();
  if (targetDay !== undefined) {
    const currentDay = now.getDay();
    const diff = (targetDay - currentDay + 7) % 7;
    now.setDate(now.getDate() + diff);
  }
  return now;
}

export function generateICS(events: Event[], mosque: Mosque): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Halaqas//EN',
    `X-WR-CALNAME:${escapeICS(mosque.name)} — Halaqas`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    VTIMEZONE,
  ];

  for (const event of events) {
    let startDate: Date;
    let endDate: Date;

    const durationMs = /\bshort\b/i.test(event.title) ? 10 * 60 * 1000 : 30 * 60 * 1000;

    // Determine reference date: explicit date, or derived from recurrence day, or today
    let refDate: Date;
    if (event.fixed_date) {
      refDate = new Date(event.fixed_date + 'T12:00:00');
    } else if (event.is_recurring && event.recurrence_pattern) {
      refDate = getStartDateForPattern(event.recurrence_pattern);
    } else {
      refDate = new Date();
    }

    // All-day event: has a date but no time and not prayer-anchored
    const isAllDay = event.fixed_date && !event.fixed_time
      && !(event.time_mode === 'prayer_anchored' && event.prayer_anchor);

    if (!isAllDay) {
      if (event.time_mode === 'prayer_anchored' && event.prayer_anchor) {
        const { calculatedTime } = getEventTime(event.prayer_anchor, event.prayer_offset_minutes || 0, refDate);
        startDate = calculatedTime;
        endDate = new Date(startDate.getTime() + durationMs);
      } else if (event.fixed_time) {
        const [h, m] = event.fixed_time.split(':').map(Number);
        startDate = new Date(refDate);
        startDate.setHours(h, m, 0, 0);
        endDate = new Date(startDate.getTime() + durationMs);
      } else {
        continue; // Skip events without enough time info
      }
    }

    const location = event.mosque_id
      ? `${mosque.name}, ${mosque.address}`
      : event.venue_name
        ? `${event.venue_name}, ${event.venue_address || ''}`
        : '';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@halaqas.com`);
    if (isAllDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatDateOnly(event.fixed_date!)}`);
      lines.push(`DTEND;VALUE=DATE:${nextDay(event.fixed_date!)}`);
    } else {
      lines.push(`DTSTART;TZID=Australia/Sydney:${formatSydneyLocal(startDate!)}`);
      lines.push(`DTEND;TZID=Australia/Sydney:${formatSydneyLocal(endDate!)}`);
    }
    lines.push(`SUMMARY:${escapeICS(event.title)}`);
    if (location) lines.push(`LOCATION:${escapeICS(location)}`);
    const descParts: string[] = [];
    if (event.description) descParts.push(event.description);
    descParts.push('Via halaqas.com — Australian Islamic events directory');
    lines.push(`DESCRIPTION:${escapeICS(descParts.join('\n\n'))}`);
    lines.push(`URL:${process.env.NEXT_PUBLIC_SITE_URL || 'https://halaqas.com'}/events/${event.id}`);

    if (event.is_recurring && event.recurrence_pattern) {
      const rrule = getRecurrenceRule(event.recurrence_pattern);
      if (rrule) {
        let rule = rrule;
        if (event.recurrence_end_date) {
          const end = new Date(event.recurrence_end_date + 'T23:59:59');
          rule += `;UNTIL=${formatUTC(end)}`;
        }
        lines.push(`RRULE:${rule}`);
      }
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
