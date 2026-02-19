import { getServiceClient } from '@/lib/supabase';
import { EventTypeTag } from '@/components/events/EventTypeTag';
import { Button } from '@/components/ui/Button';
import { getEventTime } from '@/lib/prayer-times';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Event } from '@/lib/types';
import { ReportButton } from './ReportButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

async function getEvent(id: string) {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('id', id)
    .single();
  return data as Event | null;
}

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

  const mosqueName = event.mosque?.name || event.venue_name || 'Unknown venue';
  const mosqueAddress = event.mosque?.address || event.venue_address || '';
  const shareText = `${event.title} at ${mosqueName} — ${getTimeDisplay(event)}`;
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://halaqas.com'}/events/${event.id}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-primary transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to events
      </Link>

      <article className="bg-white border border-sand-dark rounded-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <EventTypeTag type={event.event_type} />
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
            {event.gender.charAt(0).toUpperCase() + event.gender.slice(1)}
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

        {event.flyer_image_url && (
          <div className="pt-2 border-t border-sand-dark">
            <img
              src={event.flyer_image_url}
              alt={`Flyer for ${event.title}`}
              className="rounded-card max-w-full"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="whatsapp" href={whatsappUrl}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share on WhatsApp
          </Button>
          <ReportButton eventId={event.id} />
        </div>
      </article>
    </div>
  );
}
