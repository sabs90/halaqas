'use client';

import Link from 'next/link';
import type { Event } from '@/lib/types';
import { EventTypeTag } from './EventTypeTag';
import { getEventTime, formatPrayerTime } from '@/lib/prayer-times';

function formatRecurrence(pattern: string | null): string | null {
  if (!pattern) return null;
  const labels: Record<string, string> = {
    'every_monday': 'Every Monday',
    'every_tuesday': 'Every Tuesday',
    'every_wednesday': 'Every Wednesday',
    'every_thursday': 'Every Thursday',
    'every_friday': 'Every Friday',
    'every_saturday': 'Every Saturday',
    'every_sunday': 'Every Sunday',
    'daily': 'Daily',
    'daily_ramadan': 'Daily (Ramadan)',
    'weekly': 'Weekly',
    'fortnightly': 'Fortnightly',
    'monthly': 'Monthly',
  };
  return labels[pattern] || pattern;
}

function getTimeDisplay(event: Event): string {
  if (event.time_mode === 'prayer_anchored' && event.prayer_anchor) {
    const { label } = getEventTime(event.prayer_anchor, event.prayer_offset_minutes || 0);
    return label;
  }
  if (event.fixed_time) {
    const [h, m] = event.fixed_time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return 'Time TBA';
}

function getDateDisplay(event: Event): string | null {
  if (event.fixed_date) {
    return new Date(event.fixed_date + 'T00:00:00').toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }
  return null;
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isStale = event.status === 'archived' ||
    (event.is_recurring && event.last_confirmed_at &&
      new Date().getTime() - new Date(event.last_confirmed_at).getTime() > 90 * 24 * 60 * 60 * 1000);

  const mosqueName = event.mosque?.name || event.venue_name || 'Unknown venue';
  const recurrenceLabel = event.is_recurring ? formatRecurrence(event.recurrence_pattern) : null;
  const dateStr = getDateDisplay(event);

  return (
    <Link href={`/events/${event.id}`} className="block">
      <article
        className={`bg-white border rounded-card p-5 transition-all hover:border-primary hover:shadow-card-hover ${
          isStale ? 'border-dashed border-sand-dark opacity-60' : 'border-sand-dark'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <EventTypeTag type={event.event_type} />
          {recurrenceLabel && (
            <span className="flex items-center gap-1 text-xs font-medium text-warm-gray">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
              </svg>
              {recurrenceLabel}
            </span>
          )}
          {!recurrenceLabel && dateStr && (
            <span className="text-xs font-medium text-warm-gray">{dateStr}</span>
          )}
        </div>

        <h3 className="mt-3 text-[17px] font-bold text-charcoal leading-snug">{event.title}</h3>
        <p className="mt-1 text-[13px] font-semibold text-secondary">{mosqueName}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-medium text-warm-gray">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {getTimeDisplay(event)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {event.language.charAt(0).toUpperCase() + event.language.slice(1)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {event.gender.charAt(0).toUpperCase() + event.gender.slice(1)}
          </span>
        </div>

        {event.speaker && (
          <>
            <hr className="mt-3 border-sand-dark" />
            <p className="mt-2 text-xs">
              <span className="text-stone">Speaker: </span>
              <span className="text-charcoal font-medium">{event.speaker}</span>
            </p>
          </>
        )}

        {isStale && (
          <p className="mt-2 text-[11px] font-semibold text-secondary">
            ⚠ May no longer be running
          </p>
        )}
      </article>
    </Link>
  );
}
