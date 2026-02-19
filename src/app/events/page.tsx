import { Suspense } from 'react';
import { getServiceClient } from '@/lib/supabase';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { SYDNEY_SUBURBS } from '@/data/sydney-suburbs';
import { haversineDistance } from '@/lib/haversine';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Browse upcoming Islamic events, talks, classes, and programs across Sydney mosques.',
};

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
  let query = supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (params.type) query = query.eq('event_type', params.type);
  if (params.language) query = query.eq('language', params.language);
  if (params.gender) query = query.eq('gender', params.gender);
  if (params.mosque) query = query.eq('mosque_id', params.mosque);

  const { data } = await query;
  let events = data || [];

  // Text search across suburb, mosque name, speaker, and title
  if (params.q) {
    const q = params.q.toLowerCase();

    // Check if search term matches a suburb — if so, also do radius filtering
    const matchedSuburb = SYDNEY_SUBURBS.find(s => s.name.toLowerCase().includes(q));

    events = events.filter(event => {
      const mosqueName = (event.mosque?.name || event.venue_name || '').toLowerCase();
      const mosqueSuburb = (event.mosque?.suburb || '').toLowerCase();
      const title = event.title.toLowerCase();
      const speaker = (event.speaker || '').toLowerCase();
      const description = (event.description || '').toLowerCase();

      // Direct text match
      if (
        mosqueName.includes(q) ||
        mosqueSuburb.includes(q) ||
        title.includes(q) ||
        speaker.includes(q) ||
        description.includes(q)
      ) {
        return true;
      }

      // Suburb radius match (5km)
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

export default async function EventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const events = await getEvents(params);

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold text-charcoal">Events</h1>

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
        <div className="text-center py-16 bg-sand rounded-card">
          <p className="text-warm-gray">No events match your search.</p>
          <p className="text-sm text-stone mt-1">Try a different search term or clear your filters.</p>
        </div>
      )}
    </div>
  );
}
