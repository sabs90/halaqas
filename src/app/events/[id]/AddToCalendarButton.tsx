'use client';

import { Button } from '@/components/ui/Button';
import type { Event } from '@/lib/types';
import { getEventTime } from '@/lib/prayer-times';

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

function formatUTC(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function formatDateOnly(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

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

function generateSingleEventICS(event: Event): string {
  const durationMs = /\bshort\b/i.test(event.title) ? 10 * 60 * 1000 : 30 * 60 * 1000;

  // Determine reference date
  let refDate: Date;
  if (event.fixed_date) {
    refDate = new Date(event.fixed_date + 'T12:00:00');
  } else if (event.is_recurring && event.recurrence_pattern) {
    refDate = getStartDateForPattern(event.recurrence_pattern);
  } else {
    refDate = new Date();
  }

  // All-day event: has date but no time and not prayer-anchored
  const isAllDay = event.fixed_date && !event.fixed_time
    && !(event.time_mode === 'prayer_anchored' && event.prayer_anchor);

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (!isAllDay) {
    if (event.time_mode === 'prayer_anchored' && event.prayer_anchor) {
      const { calculatedTime } = getEventTime(event.prayer_anchor, event.prayer_offset_minutes || 0, refDate);
      startDate = calculatedTime;
    } else if (event.fixed_time) {
      const [h, m] = event.fixed_time.split(':').map(Number);
      startDate = new Date(refDate);
      startDate.setHours(h, m, 0, 0);
    } else {
      startDate = new Date();
    }
    endDate = new Date(startDate.getTime() + durationMs);
  }

  const mosqueName = event.mosque?.name || event.venue_name || '';
  const mosqueAddress = event.mosque?.address || event.venue_address || '';
  const location = mosqueName ? `${mosqueName}${mosqueAddress ? ', ' + mosqueAddress : ''}` : '';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Halaqas//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    VTIMEZONE,
    'BEGIN:VEVENT',
    `UID:${event.id}@halaqas.com`,
  ];

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
  if (event.speaker) descParts.push(`Speaker: ${event.speaker}`);
  if (event.description) descParts.push(event.description);
  descParts.push('Via halaqas.com — Australian Islamic events directory');
  lines.push(`DESCRIPTION:${escapeICS(descParts.join('\n\n'))}`);

  if (event.is_recurring && event.recurrence_pattern) {
    const rrule = getRecurrenceRule(event.recurrence_pattern);
    if (rrule) {
      let rule = rrule;
      if (event.recurrence_end_date) {
        rule += `;UNTIL=${formatUTC(new Date(event.recurrence_end_date + 'T23:59:59'))}`;
      }
      lines.push(`RRULE:${rule}`);
    }
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function AddToCalendarButton({ event }: { event: Event }) {
  function handleDownload() {
    const ics = generateSingleEventICS(event);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={handleDownload}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="12" y1="14" x2="12" y2="18" />
        <line x1="10" y1="16" x2="14" y2="16" />
      </svg>
      Add to Calendar
    </Button>
  );
}
