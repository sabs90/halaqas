import { Suspense } from 'react';
import { getServiceClient } from '@/lib/supabase';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MapWrapper } from '@/components/map/MapWrapper';
import { MosqueSearch } from './MosqueSearch';
import { SYDNEY_SUBURBS } from '@/data/sydney-suburbs';
import { haversineDistance } from '@/lib/haversine';
import type { Mosque } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Mosques',
  description: 'Browse Australian mosques and discover their upcoming events and programs.',
};

export const revalidate = 300;

const STATE_NAMES: Record<string, string> = {
  NSW: 'New South Wales',
  VIC: 'Victoria',
  QLD: 'Queensland',
  WA: 'Western Australia',
  SA: 'South Australia',
  ACT: 'Australian Capital Territory',
  NT: 'Northern Territory',
  TAS: 'Tasmania',
};

interface Props {
  searchParams: Promise<{ q?: string; state?: string }>;
}

async function getMosques(query?: string, state?: string) {
  const supabase = getServiceClient();

  // Default to NSW on initial load
  const effectiveState = state ?? 'NSW';

  let mosqueQuery = supabase
    .from('mosques')
    .select('*')
    .eq('active', true)
    .order('name');

  // Push state filter to DB level (unless "all")
  if (effectiveState !== 'all') {
    mosqueQuery = mosqueQuery.eq('state', effectiveState);
  }

  const { data: mosques } = await mosqueQuery;

  let filteredMosques: Mosque[] = mosques || [];

  // Filter by search query (text match + 5km radius for suburb matches)
  if (query) {
    const q = query.toLowerCase();
    const matchedSuburb = SYDNEY_SUBURBS.find(s => s.name.toLowerCase().includes(q));

    filteredMosques = filteredMosques.filter(mosque => {
      // Text match on name, suburb, address, nicknames
      if (
        mosque.name.toLowerCase().includes(q) ||
        mosque.suburb.toLowerCase().includes(q) ||
        mosque.address.toLowerCase().includes(q) ||
        (mosque.nicknames || []).some((n: string) => n.toLowerCase().includes(q))
      ) return true;

      // 5km radius match if query matches a known suburb
      if (matchedSuburb && mosque.latitude && mosque.longitude) {
        return haversineDistance(matchedSuburb.latitude, matchedSuburb.longitude, mosque.latitude, mosque.longitude) <= 5;
      }

      return false;
    });
  }

  return { mosques: filteredMosques, effectiveState };
}

export default async function MosquesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { mosques, effectiveState } = await getMosques(params.q, params.state);

  const stateName = effectiveState !== 'all' ? STATE_NAMES[effectiveState] || effectiveState : null;

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold text-charcoal">Mosques</h1>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-warm-gray">
          {stateName
            ? `Browse mosques in ${stateName} and discover their upcoming events.`
            : 'Browse Australian mosques and discover their upcoming events.'}
        </p>
        <Link
          href="/mosques/suggest"
          className="shrink-0 text-sm font-semibold bg-primary text-white px-4 py-2 rounded-button hover:bg-primary-light transition-colors"
        >
          + Suggest a Mosque
        </Link>
      </div>

      <Suspense fallback={<div className="h-10 bg-sand rounded-card animate-pulse" />}>
        <MosqueSearch />
      </Suspense>

      <Suspense fallback={<div className="h-[350px] bg-sand rounded-card animate-pulse" />}>
        <MapWrapper mosques={mosques} events={[]} />
      </Suspense>

      {mosques.length > 0 ? (
        <>
          <p className="text-xs text-stone">{mosques.length} mosque{mosques.length !== 1 ? 's' : ''}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {mosques.map((mosque) => (
              <Link key={mosque.id} href={`/mosques/${mosque.id}`} className="block">
                <div className="bg-white border border-sand-dark rounded-card p-5 transition-all hover:border-primary hover:shadow-card-hover">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-charcoal">{mosque.name}</h3>
                    <span className="shrink-0 text-[10px] font-semibold text-stone bg-sand px-1.5 py-0.5 rounded-pill">{mosque.state}</span>
                  </div>
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
        </>
      ) : (
        <div className="text-center py-12 bg-sand rounded-card">
          <p className="text-warm-gray">No mosques found matching your search.</p>
          <p className="text-sm text-stone mt-1">Try a different search term or state filter.</p>
        </div>
      )}
    </div>
  );
}
