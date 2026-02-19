import { Suspense } from 'react';
import { getServiceClient } from '@/lib/supabase';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MapWrapper } from '@/components/map/MapWrapper';
import { MosqueSearch } from './MosqueSearch';
import { SYDNEY_SUBURBS } from '@/data/sydney-suburbs';
import { haversineDistance } from '@/lib/haversine';

export const metadata: Metadata = {
  title: 'Mosques',
  description: 'Browse Sydney mosques and discover their upcoming events and programs.',
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

async function getMosquesAndEvents(suburb?: string) {
  const supabase = getServiceClient();
  const { data: mosques } = await supabase
    .from('mosques')
    .select('*')
    .eq('active', true)
    .order('name');

  const { data: events } = await supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('status', 'active');

  let filteredMosques = mosques || [];

  if (suburb) {
    const q = suburb.toLowerCase();
    const matchedSuburb = SYDNEY_SUBURBS.find(s => s.name.toLowerCase().includes(q));

    if (matchedSuburb) {
      filteredMosques = filteredMosques.filter(mosque =>
        haversineDistance(matchedSuburb.latitude, matchedSuburb.longitude, mosque.latitude, mosque.longitude) <= 5
      );
    } else {
      filteredMosques = filteredMosques.filter(mosque =>
        mosque.name.toLowerCase().includes(q) ||
        mosque.suburb.toLowerCase().includes(q) ||
        mosque.address.toLowerCase().includes(q)
      );
    }
  }

  return { mosques: filteredMosques, allMosques: mosques || [], events: events || [] };
}

export default async function MosquesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { mosques, allMosques, events } = await getMosquesAndEvents(params.q);

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold text-charcoal">Mosques</h1>
      <p className="text-sm text-warm-gray">Browse Sydney mosques and discover their upcoming events.</p>

      <Suspense fallback={<div className="h-10 bg-sand rounded-card animate-pulse" />}>
        <MosqueSearch />
      </Suspense>

      <Suspense fallback={<div className="h-[500px] bg-sand rounded-card animate-pulse" />}>
        <MapWrapper mosques={params.q ? mosques : allMosques} events={events} />
      </Suspense>

      {mosques.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {mosques.map((mosque) => (
            <Link key={mosque.id} href={`/mosques/${mosque.id}`} className="block">
              <div className="bg-white border border-sand-dark rounded-card p-5 transition-all hover:border-primary hover:shadow-card-hover">
                <h3 className="text-base font-bold text-charcoal">{mosque.name}</h3>
                <p className="mt-1 text-sm text-warm-gray flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {mosque.address}
                </p>
                <p className="mt-2 text-xs text-stone">{mosque.suburb}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-sand rounded-card">
          <p className="text-warm-gray">No mosques found near that suburb.</p>
          <p className="text-sm text-stone mt-1">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
