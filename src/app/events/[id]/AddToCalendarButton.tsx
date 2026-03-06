'use client';

import { useState, useRef, useEffect } from 'react';
import type { Event } from '@/lib/types';
import { getEventTime } from '@/lib/prayer-times';
import { trackEvent } from '@/lib/tracking';

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

function nextDayISO(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
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

interface EventDates {
  startDate: Date | null;
  endDate: Date | null;
  isAllDay: boolean;
  location: string;
  description: string;
}

function getEventDates(event: Event): EventDates {
  const durationMs = /\bshort\b/i.test(event.title) ? 10 * 60 * 1000 : 30 * 60 * 1000;

  let refDate: Date;
  if (event.fixed_date) {
    refDate = new Date(event.fixed_date + 'T12:00:00');
  } else if (event.is_recurring && event.recurrence_pattern) {
    refDate = getStartDateForPattern(event.recurrence_pattern);
  } else {
    refDate = new Date();
  }

  const isAllDay = !!(event.fixed_date && !event.fixed_time
    && !(event.time_mode === 'prayer_anchored' && event.prayer_anchor));

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

  const descParts: string[] = [];
  if (event.speaker) descParts.push(`Speaker: ${event.speaker}`);
  if (event.description) descParts.push(event.description);
  descParts.push('Via halaqas.com');
  const description = descParts.join('\n\n');

  return { startDate, endDate, isAllDay, location, description };
}

function generateSingleEventICS(event: Event): string {
  const { startDate, endDate, isAllDay, location, description } = getEventDates(event);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Halaqas//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    VTIMEZONE,
    'BEGIN:VEVENT',
    `UID:${event.id}@halaqas.com`,
    `DTSTAMP:${formatUTC(new Date())}`,
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
  lines.push(`DESCRIPTION:${escapeICS(description)}`);
  lines.push(`URL:${process.env.NEXT_PUBLIC_SITE_URL || 'https://halaqas.com'}/events/${event.id}`);

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

function getGoogleCalendarUrl(event: Event): string {
  const { startDate, endDate, isAllDay, location, description } = getEventDates(event);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
  });

  if (isAllDay) {
    params.set('dates', `${formatDateOnly(event.fixed_date!)}/${nextDay(event.fixed_date!)}`);
  } else if (startDate && endDate) {
    params.set('dates', `${formatUTC(startDate)}/${formatUTC(endDate)}`);
  }

  if (location) params.set('location', location);
  if (description) params.set('details', description);

  if (event.is_recurring && event.recurrence_pattern) {
    const rrule = getRecurrenceRule(event.recurrence_pattern);
    if (rrule) {
      let rule = rrule;
      if (event.recurrence_end_date) {
        rule += `;UNTIL=${formatUTC(new Date(event.recurrence_end_date + 'T23:59:59'))}`;
      }
      params.set('recur', `RRULE:${rule}`);
    }
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getOutlookUrl(event: Event): string {
  const { startDate, endDate, isAllDay, location, description } = getEventDates(event);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
  });

  if (isAllDay) {
    params.set('startdt', event.fixed_date!);
    params.set('enddt', nextDayISO(event.fixed_date!));
    params.set('allday', 'true');
  } else if (startDate && endDate) {
    params.set('startdt', startDate.toISOString());
    params.set('enddt', endDate.toISOString());
  }

  if (location) params.set('location', location);
  if (description) params.set('body', description);

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

export function AddToCalendarButton({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleDownload() {
    trackEvent('calendar_download_event', { event_id: event.id, mosque_id: event.mosque_id || undefined });
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
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 text-sm font-semibold px-[22px] py-[10px] rounded-button transition-colors bg-white text-charcoal border border-sand-dark hover:text-primary hover:border-primary"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="14" x2="12" y2="18" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
        Add to Calendar
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-sand-dark rounded-card shadow-lg py-1 min-w-[200px]">
          <button
            onClick={handleDownload}
            className="w-full px-4 py-2.5 text-left text-sm text-charcoal hover:bg-sand flex items-center gap-3 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0 text-warm-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download .ics file
          </button>
          <a
            href={getGoogleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent('calendar_google_event', { event_id: event.id, mosque_id: event.mosque_id || undefined });
              setOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-charcoal hover:bg-sand flex items-center gap-3 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M18.316 5.684H24v12.632h-5.684V5.684z" fill="#1967D2"/>
              <path d="M5.684 18.316H0V5.684h5.684v12.632z" fill="#188038"/>
              <path d="M18.316 24V18.316H5.684V24h12.632z" fill="#1967D2"/>
              <path d="M5.684 5.684V0h12.632v5.684H5.684z" fill="#EA4335"/>
              <path d="M18.316 5.684H24V0h-5.684v5.684z" fill="#1A73E8"/>
              <path d="M18.316 18.316H24V24h-5.684v-5.684z" fill="#34A853"/>
              <path d="M0 18.316h5.684V24H0v-5.684z" fill="#0D652D"/>
              <path d="M0 0h5.684v5.684H0V0z" fill="#FBBC04"/>
              <path d="M8.5 16.2c-.6-.4-1-.9-1.3-1.6l1.3-.5c.1.4.4.7.6.9.3.2.6.3 1 .3.4 0 .8-.1 1-.4.3-.2.4-.5.4-.9 0-.4-.2-.7-.4-.9-.3-.2-.6-.4-1.1-.4h-.7v-1.2h.6c.4 0 .7-.1 1-.3.2-.2.4-.5.4-.8 0-.3-.1-.6-.4-.8-.2-.2-.5-.3-.9-.3-.4 0-.7.1-.9.3-.2.2-.4.5-.5.8l-1.2-.5c.2-.5.5-1 .9-1.3.5-.3 1-.5 1.6-.5.5 0 .9.1 1.3.3.4.2.7.5.9.8.2.4.3.7.3 1.1 0 .4-.1.8-.3 1.1-.2.3-.5.6-.9.7v.1c.4.2.8.4 1 .8.3.3.4.7.4 1.2 0 .5-.1.9-.3 1.3-.2.4-.6.7-1 .9-.4.2-.9.3-1.5.3-.6 0-1.2-.2-1.7-.5zm6.6-.1V9.3l-1.5.5-.4-1.2 2.2-.8h1.1v8.3h-1.4z" fill="#4285F4"/>
            </svg>
            Google Calendar
          </a>
          <a
            href={getOutlookUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent('calendar_outlook_event', { event_id: event.id, mosque_id: event.mosque_id || undefined });
              setOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-charcoal hover:bg-sand flex items-center gap-3 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M24 7.387v10.478c0 .23-.08.424-.238.582a.793.793 0 0 1-.582.238h-8.494V6.567h8.494c.23 0 .424.08.582.238.159.159.238.352.238.582z" fill="#0364B8"/>
              <path d="M16.275 6.567v12.118H8.69V17.09l-1.59-.82v2.415H.82a.793.793 0 0 1-.582-.238A.793.793 0 0 1 0 17.865V7.387c0-.23.08-.424.238-.582A.793.793 0 0 1 .82 6.567H7.1v1.596l1.59-.82V6.567h7.585z" fill="#0A2767"/>
              <path d="M16.275 6.567H8.69v5.06l2.385 1.23 5.2-2.67V6.567z" fill="#28A8EA"/>
              <path d="M8.69 11.627v5.463h7.585v-5.463L11.075 12.857 8.69 11.627z" fill="#0078D4"/>
              <path d="M16.275 10.187l-7.585 1.44v5.463h7.585V10.187z" fill="#50D9FF"/>
              <path d="M14.18 18.685H8.69v-1.595h7.585v1.595h-2.095z" fill="#0364B8"/>
              <path d="M7.1 8.163 8.69 7.343v10.747L7.1 17.27V8.163z" fill="#0A2767" opacity=".5"/>
              <path d="M9.496 19.504H1.23a.793.793 0 0 1-.582-.238.793.793 0 0 1-.238-.582v-1.594h9.086v2.414z" fill="#1490DF"/>
              <path d="M.41 17.09v1.594c0 .452.367.82.82.82h8.266v-2.414H.41z" fill="#28A8EA"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M1.64 9.76a3.45 3.45 0 0 1 1.344-1.37 3.72 3.72 0 0 1 1.92-.504c.67 0 1.28.164 1.83.493.55.329.983.78 1.3 1.353.317.574.476 1.212.476 1.914 0 .726-.165 1.38-.495 1.962a3.57 3.57 0 0 1-1.344 1.371 3.62 3.62 0 0 1-1.875.503 3.72 3.72 0 0 1-1.898-.493 3.5 3.5 0 0 1-1.31-1.353c-.32-.574-.48-1.212-.48-1.914 0-.721.178-1.376.533-1.962zm1.368 3.236c.324.47.777.705 1.36.705.584 0 1.038-.235 1.362-.706.324-.47.486-1.06.486-1.768 0-.713-.162-1.305-.486-1.776-.324-.47-.778-.706-1.362-.706-.583 0-1.036.236-1.36.706-.323.471-.485 1.063-.485 1.776 0 .708.162 1.299.485 1.769z" fill="white"/>
            </svg>
            Outlook (web)
          </a>
        </div>
      )}
    </div>
  );
}
