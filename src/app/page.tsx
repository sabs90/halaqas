import { Suspense } from 'react';
import { Hero } from '@/components/ui/Hero';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { Button } from '@/components/ui/Button';
import { getServiceClient } from '@/lib/supabase';
import { SYDNEY_SUBURBS } from '@/data/sydney-suburbs';
import { haversineDistance } from '@/lib/haversine';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{
    type?: string;
    language?: string;
    gender?: string;
    mosque?: string;
    q?: string;
  }>;
}

async function getEvents(params: {
  type?: string;
  language?: string;
  gender?: string;
  mosque?: string;
  q?: string;
}) {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split('T')[0];
  let query = supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('status', 'active')
    .or(`is_recurring.eq.true,fixed_date.is.null,fixed_date.gte.${today}`)
    .order('created_at', { ascending: false });

  if (params.type) query = query.eq('event_type', params.type);
  if (params.language) query = query.eq('language', params.language);
  if (params.gender) query = query.eq('gender', params.gender);
  if (params.mosque) query = query.eq('mosque_id', params.mosque);

  const { data } = await query;
  let events = data || [];

  if (params.q) {
    const q = params.q.toLowerCase();
    const matchedSuburb = SYDNEY_SUBURBS.find(s => s.name.toLowerCase().includes(q));

    events = events.filter(event => {
      const mosqueName = (event.mosque?.name || event.venue_name || '').toLowerCase();
      const mosqueSuburb = (event.mosque?.suburb || '').toLowerCase();
      const title = event.title.toLowerCase();
      const speaker = (event.speaker || '').toLowerCase();
      const description = (event.description || '').toLowerCase();

      if (
        mosqueName.includes(q) ||
        mosqueSuburb.includes(q) ||
        title.includes(q) ||
        speaker.includes(q) ||
        description.includes(q) ||
        (event.mosque?.nicknames || []).some((n: string) => n.toLowerCase().includes(q))
      ) return true;

      if (matchedSuburb) {
        const lat = event.mosque?.latitude || event.venue_latitude;
        const lng = event.mosque?.longitude || event.venue_longitude;
        if (lat && lng) {
          return haversineDistance(matchedSuburb.latitude, matchedSuburb.longitude, lat, lng) <= 5;
        }
      }
      return false;
    });
  }

  return events;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const hasFilters = params.q || params.type || params.language || params.gender || params.mosque;
  const events = await getEvents(params);

  return (
    <div className="space-y-6">
      <Hero />

      <Suspense fallback={<div className="h-24 bg-sand rounded-card animate-pulse" />}>
        <EventFilters />
      </Suspense>

      {events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-sand rounded-card">
          {hasFilters ? (
            <>
              <p className="text-warm-gray">No events match your search.</p>
              <p className="text-sm text-stone mt-1">Try a different search term or clear your filters.</p>
            </>
          ) : (
            <>
              <p className="text-warm-gray text-sm">No events yet. Be the first to submit one!</p>
              <Button variant="secondary" href="/submit" className="mt-4">
                Submit an Event
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
