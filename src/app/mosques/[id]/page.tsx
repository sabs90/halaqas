import { cache } from 'react';
import { getServiceClient } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/tracking-server';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { SubscribeCalendarButton } from './SubscribeCalendarButton';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string }>;
}

const getMosque = cache(async (id: string) => {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('mosques')
    .select('*')
    .eq('id', id)
    .single();
  return data;
});

async function getMosqueEvents(mosqueId: string) {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('mosque_id', mosqueId)
    .eq('status', 'active')
    .or(`is_recurring.eq.true,fixed_date.is.null,fixed_date.gte.${today}`)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const mosque = await getMosque(id);
  if (!mosque) return { title: 'Mosque Not Found' };
  return {
    title: mosque.name,
    description: `Upcoming events at ${mosque.name}, ${mosque.suburb}`,
  };
}

export default async function MosqueDetailPage({ params }: Props) {
  const { id } = await params;
  const [mosque, events] = await Promise.all([getMosque(id), getMosqueEvents(id)]);
  if (!mosque) notFound();

  void trackServerEvent('mosque_view', { mosque_id: id });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://halaqas.com';
  const icsHttpUrl = `${siteUrl}/api/mosques/${id}/calendar.ics`;

  return (
    <div className="space-y-6">
      <Link href="/mosques" className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-primary transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to mosques
      </Link>

      <div className="bg-white border border-sand-dark rounded-card p-6">
        <h1 className="text-[28px] font-bold text-charcoal">{mosque.name}</h1>
        <p className="mt-2 text-sm text-warm-gray flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {mosque.address}
        </p>
        <p className="mt-1 text-xs text-stone">{mosque.suburb}, {mosque.state}</p>

        {(mosque.website_url || mosque.facebook_url) && (
          <div className="mt-3 flex flex-wrap gap-4">
            {mosque.website_url && (
              <a href={mosque.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Website
              </a>
            )}
            {mosque.facebook_url && (
              <a href={mosque.facebook_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <SubscribeCalendarButton mosqueName={mosque.name} mosqueId={mosque.id} icsHttpUrl={icsHttpUrl} />
          <Button variant="outline" href={`/submit?mosque=${mosque.id}`}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add an Event
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-charcoal mb-4">
          Upcoming Events ({events.length})
        </h2>

        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-sand rounded-card">
            <p className="text-warm-gray text-sm">No events listed yet for this mosque.</p>
            <Button variant="secondary" href="/submit" className="mt-4">
              Submit an Event
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
