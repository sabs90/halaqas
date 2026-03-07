import { cache } from 'react';
import { getServiceClient } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/tracking-server';
import { EventTypeTag, AudienceTag } from '@/components/events/EventTypeTag';
import { getEventTime } from '@/lib/prayer-times';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import type { Event } from '@/lib/types';
import { ReportButton } from './ReportButton';
import { AddToCalendarButton } from './AddToCalendarButton';
import { WhatsAppShareButton } from './WhatsAppShareButton';

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string }>;
}

const getEvent = cache(async (id: string) => {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('id', id)
    .single();
  return data as Event | null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: 'Event Not Found' };

  const mosqueName = event.mosque?.name || event.venue_name || '';
  return {
    title: event.title,
    description: `${event.title} at ${mosqueName}`,
    openGraph: {
      title: `Halaqas — ${event.title}`,
      description: `${event.title} at ${mosqueName}`,
    },
  };
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

const RECURRENCE_LABELS: Record<string, string> = {
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

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  void trackServerEvent('event_view', {
    event_id: id,
    mosque_id: event.mosque_id || undefined,
  });

  const mosqueName = event.mosque?.name || event.venue_name || 'Unknown venue';
  const mosqueAddress = event.mosque?.address || event.venue_address || '';
  const shareText = `${event.title} at ${mosqueName} — ${getTimeDisplay(event)}`;
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://halaqas.com'}/events/${event.id}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-primary transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to events
      </Link>

      <article className="bg-white border border-sand-dark rounded-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <EventTypeTag type={event.event_type} />
            {event.is_kids && <AudienceTag kind="kids" />}
            {event.is_family && <AudienceTag kind="family" />}
          </div>
          {event.is_recurring && event.recurrence_pattern && (
            <span className="text-xs font-medium text-warm-gray">
              {RECURRENCE_LABELS[event.recurrence_pattern] || event.recurrence_pattern}
            </span>
          )}
        </div>

        <h1 className="text-[28px] font-bold text-charcoal leading-tight">{event.title}</h1>

        {event.mosque_id && event.mosque ? (
          <Link href={`/mosques/${event.mosque_id}`} className="text-base font-semibold text-secondary hover:text-secondary-dark transition-colors">
            {mosqueName}
          </Link>
        ) : (
          <p className="text-base font-semibold text-secondary">{mosqueName}</p>
        )}

        {mosqueAddress && (
          <p className="text-sm text-warm-gray flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {mosqueAddress}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-warm-gray">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {getTimeDisplay(event)}
          </span>
          {event.fixed_date && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {new Date(event.fixed_date + 'T00:00:00').toLocaleDateString('en-AU', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {event.language.charAt(0).toUpperCase() + event.language.slice(1)}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {{ mixed: 'Both', brothers: 'Brothers', sisters: 'Sisters' }[event.gender] || event.gender}
          </span>
        </div>

        {event.speaker && (
          <div className="pt-2 border-t border-sand-dark">
            <p className="text-sm">
              <span className="text-stone">Speaker: </span>
              <span className="text-charcoal font-semibold">{event.speaker}</span>
            </p>
          </div>
        )}

        {event.description && (
          <div className="pt-2 border-t border-sand-dark">
            <p className="text-sm text-warm-gray leading-relaxed">{event.description}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <AddToCalendarButton event={event} />
          <WhatsAppShareButton url={whatsappUrl} eventId={event.id} mosqueId={event.mosque_id || undefined} />
          <ReportButton eventId={event.id} />
        </div>

        {event.flyer_image_url && (
          <div className="pt-2 border-t border-sand-dark">
            <Image
              src={event.flyer_image_url}
              alt={`Flyer for ${event.title}`}
              width={600}
              height={800}
              className="rounded-card max-w-full h-auto"
              sizes="(max-width: 672px) 100vw, 600px"
            />
          </div>
        )}
      </article>
    </div>
  );
}
