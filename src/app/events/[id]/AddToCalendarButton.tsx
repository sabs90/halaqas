'use client';

import { Button } from '@/components/ui/Button';
import type { Event } from '@/lib/types';

function escapeICS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function formatICSDateLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function formatICSDateUTC(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
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

function generateSingleEventICS(event: Event): string {
  let startDate: Date;

  if (event.fixed_date && event.fixed_time) {
    startDate = new Date(`${event.fixed_date}T${event.fixed_time}:00`);
  } else if (event.fixed_time) {
    const now = new Date();
    const [h, m] = event.fixed_time.split(':').map(Number);
    now.setHours(h, m, 0, 0);
    startDate = now;
  } else {
    // Fallback: use current date/time
    startDate = new Date();
  }

  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const mosqueName = event.mosque?.name || event.venue_name || '';
  const mosqueAddress = event.mosque?.address || event.venue_address || '';
  const location = mosqueName ? `${mosqueName}${mosqueAddress ? ', ' + mosqueAddress : ''}` : '';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Halaqas//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@halaqas.com`,
    `DTSTART;TZID=Australia/Sydney:${formatICSDateLocal(startDate)}`,
    `DTEND;TZID=Australia/Sydney:${formatICSDateLocal(endDate)}`,
    `SUMMARY:${escapeICS(event.title)}`,
  ];

  if (location) lines.push(`LOCATION:${escapeICS(location)}`);
  const descParts: string[] = [];
  if (event.speaker) descParts.push(`Speaker: ${event.speaker}`);
  if (event.description) descParts.push(event.description);
  if (descParts.length > 0) lines.push(`DESCRIPTION:${escapeICS(descParts.join('\\n\\n'))}`);

  if (event.is_recurring && event.recurrence_pattern) {
    const rrule = getRecurrenceRule(event.recurrence_pattern);
    if (rrule) {
      let rule = rrule;
      if (event.recurrence_end_date) {
        rule += `;UNTIL=${formatICSDateUTC(new Date(event.recurrence_end_date))}`;
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
