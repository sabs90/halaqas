import { Suspense } from 'react';
import { Hero } from '@/components/ui/Hero';
import { EventFilters } from '@/components/events/EventFilters';
import { Button } from '@/components/ui/Button';
import { getServiceClient } from '@/lib/supabase';
import type { Event } from '@/lib/types';

export const revalidate = 60;

interface Props {
  searchParams: Promise<{
    type?: string;
    gender?: string;
    mosque?: string;
    kids?: string;
    family?: string;
  }>;
}

async function getEvents(params: {
  type?: string;
  gender?: string;
  mosque?: string;
  kids?: string;
  family?: string;
}) {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split('T')[0];
  let query = supabase
    .from('events')
    .select('id, title, event_type, status, is_recurring, recurrence_pattern, last_confirmed_at, time_mode, prayer_anchor, prayer_offset_minutes, fixed_time, fixed_date, language, gender, speaker, is_kids, is_family, venue_name, venue_latitude, venue_longitude, description, mosque_id, mosque:mosques(id, name, suburb, nicknames, latitude, longitude)')
    .eq('status', 'active')
    .or(`is_recurring.eq.true,fixed_date.is.null,fixed_date.gte.${today}`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (params.type) query = query.eq('event_type', params.type);
  if (params.gender) query = query.eq('gender', params.gender);
  if (params.mosque) query = query.eq('mosque_id', params.mosque);
  if (params.kids === 'true') query = query.eq('is_kids', true);
  if (params.family === 'true') query = query.eq('is_family', true);

  const { data } = await query;
  return (data || []) as unknown as Event[];
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const hasFilters = !!(params.type || params.gender || params.mosque || params.kids || params.family);
  const events = await getEvents(params);

  return (
    <div className="space-y-6">
      <Hero />

      <Suspense fallback={<div className="h-24 bg-sand rounded-card animate-pulse" />}>
        <EventFilters events={events} hasFilters={hasFilters} />
      </Suspense>

      {!hasFilters && events.length === 0 && (
        <div className="text-center py-12 bg-sand rounded-card">
          <p className="text-warm-gray text-sm">No events yet. Be the first to submit one!</p>
          <Button variant="secondary" href="/submit" className="mt-4">
            Submit an Event
          </Button>
        </div>
      )}
    </div>
  );
}
