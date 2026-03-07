'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapWrapper } from '@/components/map/MapWrapper';
import { useGeocode } from '@/hooks/useGeocode';
import { haversineDistance } from '@/lib/haversine';
import type { Mosque } from '@/lib/types';

const STATES = [
  { code: 'all', label: 'All' },
  { code: 'NSW', label: 'NSW' },
  { code: 'VIC', label: 'VIC' },
  { code: 'QLD', label: 'QLD' },
  { code: 'WA', label: 'WA' },
  { code: 'SA', label: 'SA' },
  { code: 'ACT', label: 'ACT' },
  { code: 'NT', label: 'NT' },
  { code: 'TAS', label: 'TAS' },
];

interface Props {
  mosques: Mosque[];
}

export function MosqueSearch({ mosques }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentState = searchParams.get('state') || 'NSW';
  const [search, setSearch] = useState('');

  // Text-match mosques client-side
  const textMatched = useMemo(() => {
    if (!search) return mosques;
    const q = search.toLowerCase();
    return mosques.filter(mosque =>
      mosque.name.toLowerCase().includes(q) ||
      mosque.suburb.toLowerCase().includes(q) ||
      mosque.address.toLowerCase().includes(q) ||
      (mosque.nicknames || []).some((n: string) => n.toLowerCase().includes(q))
    );
  }, [mosques, search]);

  // Geocode fallback — only fires when text matching found nothing
  const { coords, isGeocoding } = useGeocode(search, textMatched.length);

  // Combine: use text matches if any, otherwise use geo-proximity matches
  const filtered = useMemo(() => {
    if (!search) return mosques;
    if (textMatched.length > 0) return textMatched;
    if (!coords) return [];
    return mosques.filter(mosque =>
      mosque.latitude && mosque.longitude &&
      haversineDistance(coords.latitude, coords.longitude, mosque.latitude, mosque.longitude) <= 5
    );
  }, [mosques, search, textMatched, coords]);

  function handleStateChange(state: string) {
    const params = new URLSearchParams();
    if (state) params.set('state', state);
    const qs = params.toString();
    router.push(qs ? `/mosques?${qs}` : '/mosques');
  }

  return (
    <div className="space-y-6">
      {/* State pills */}
      <div className="flex flex-wrap gap-1.5">
        {STATES.map((s) => (
          <button
            key={s.code}
            onClick={() => handleStateChange(s.code)}
            className={`px-3 py-1.5 text-xs font-medium rounded-pill border transition-colors ${
              currentState === s.code
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-charcoal border-sand-dark hover:border-primary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search input — purely local state, no URL navigation */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, suburb, or address..."
          className="w-full text-sm font-medium pl-10 pr-8 py-2.5 rounded-card border border-sand-dark bg-white text-charcoal placeholder:text-stone focus:border-primary focus:outline-none transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-charcoal"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Map */}
      <MapWrapper mosques={filtered} events={[]} />

      {/* Mosque list */}
      {filtered.length > 0 ? (
        <>
          <p className="text-xs text-stone">{filtered.length} mosque{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((mosque) => (
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
          {isGeocoding ? (
            <p className="text-warm-gray">Searching nearby...</p>
          ) : (
            <>
              <p className="text-warm-gray">No mosques found matching your search.</p>
              <p className="text-sm text-stone mt-1">Try a different search term or state filter.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
