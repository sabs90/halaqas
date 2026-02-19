import type { Event, Mosque } from './types';
import { getEventTime } from './prayer-times';

function escapeICS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function formatICSDateLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
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

export function generateICS(events: Event[], mosque: Mosque): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Halaqas//EN',
    `X-WR-CALNAME:${escapeICS(mosque.name)} — Halaqas`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    let startDate: Date;
    let endDate: Date;

    if (event.time_mode === 'prayer_anchored' && event.prayer_anchor) {
      const refDate = event.fixed_date ? new Date(event.fixed_date) : new Date();
      const { calculatedTime } = getEventTime(event.prayer_anchor, event.prayer_offset_minutes || 0, refDate);
      startDate = calculatedTime;
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default
    } else if (event.fixed_date && event.fixed_time) {
      startDate = new Date(`${event.fixed_date}T${event.fixed_time}:00`);
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    } else {
      continue; // Skip events without enough time info
    }

    const location = event.mosque_id
      ? `${mosque.name}, ${mosque.address}`
      : event.venue_name
        ? `${event.venue_name}, ${event.venue_address || ''}`
        : '';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@halaqas.com`);
    lines.push(`DTSTART;TZID=Australia/Sydney:${formatICSDateLocal(startDate)}`);
    lines.push(`DTEND;TZID=Australia/Sydney:${formatICSDateLocal(endDate)}`);
    lines.push(`SUMMARY:${escapeICS(event.title)}`);
    if (location) lines.push(`LOCATION:${escapeICS(location)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    lines.push(`URL:${process.env.NEXT_PUBLIC_SITE_URL || 'https://halaqas.com'}/events/${event.id}`);

    if (event.is_recurring && event.recurrence_pattern) {
      const rrule = getRecurrenceRule(event.recurrence_pattern);
      if (rrule) {
        let rule = rrule;
        if (event.recurrence_end_date) {
          const end = new Date(event.recurrence_end_date);
          rule += `;UNTIL=${formatICSDate(end)}`;
        }
        lines.push(`RRULE:${rule}`);
      }
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
