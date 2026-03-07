'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useMemo } from 'react';
import { FilterPill } from '@/components/ui/FilterPill';
import { EventCard } from '@/components/events/EventCard';
import { useGeocode } from '@/hooks/useGeocode';
import { haversineDistance } from '@/lib/haversine';
import { SUBURB_COORDS } from '@/lib/suburb-coords';
import type { Event, EventType, Gender } from '@/lib/types';

const LEARNING_TYPES: { value: EventType; label: string }[] = [
  { value: 'talk', label: 'Talk' },
  { value: 'class', label: 'Class' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'quran_circle', label: 'Quran Circle' },
];

const PRAYER_TYPES: { value: EventType; label: string }[] = [
  { value: 'taraweeh', label: 'Taraweeh' },
  { value: 'tahajjud', label: 'Tahajjud' },
  { value: 'itikaf', label: "I'tikaf" },
];

const COMMUNITY_TYPES: { value: EventType; label: string }[] = [
  { value: 'iftar', label: 'Iftar' },
  { value: 'youth', label: 'Youth' },
  { value: 'sisters_circle', label: 'Sisters Circle' },
  { value: 'charity', label: 'Charity' },
  { value: 'competition', label: 'Competition' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'mixed', label: 'Both' },
  { value: 'brothers', label: 'Brothers' },
  { value: 'sisters', label: 'Sisters' },
];

interface Props {
  events: Event[];
  hasFilters: boolean;
}

export function EventFilters({ events, hasFilters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type');
  const currentGender = searchParams.get('gender');
  const currentKids = searchParams.get('kids');
  const currentFamily = searchParams.get('family');

  const [searchValue, setSearchValue] = useState('');

  const basePath = pathname === '/' ? '/' : pathname;

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q'); // q is now client-side only
      if (value && params.get(key) !== value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    },
    [router, searchParams, basePath]
  );

  // Build suburb → coords map: static lookup first, then overlay mosque-derived (more precise)
  const suburbCoords = useMemo(() => {
    const map = new Map<string, { latitude: number; longitude: number }>(
      Object.entries(SUBURB_COORDS)
    );
    for (const event of events) {
      const suburb = event.mosque?.suburb?.toLowerCase();
      const lat = event.mosque?.latitude;
      const lng = event.mosque?.longitude;
      if (suburb && lat && lng) {
        map.set(suburb, { latitude: lat, longitude: lng });
      }
    }
    return map;
  }, [events]);

  // Text-match events client-side
  const textMatched = useMemo(() => {
    if (!searchValue) return events;
    const q = searchValue.toLowerCase();
    return events.filter(event => {
      const mosqueName = (event.mosque?.name || event.venue_name || '').toLowerCase();
      const mosqueSuburb = (event.mosque?.suburb || '').toLowerCase();
      const title = event.title.toLowerCase();
      const speaker = (event.speaker || '').toLowerCase();
      const description = (event.description || '').toLowerCase();
      return (
        mosqueName.includes(q) ||
        mosqueSuburb.includes(q) ||
        title.includes(q) ||
        speaker.includes(q) ||
        description.includes(q) ||
        (event.mosque?.nicknames || []).some((n: string) => n.toLowerCase().includes(q))
      );
    });
  }, [events, searchValue]);

  // Suburb-radius matching — if search matches a known suburb, find events within 5km
  const suburbRadiusMatched = useMemo(() => {
    if (!searchValue) return [];
    const q = searchValue.toLowerCase().trim();
    const center = suburbCoords.get(q);
    if (!center) return [];
    return events.filter(event => {
      const lat = event.mosque?.latitude || event.venue_latitude;
      const lng = event.mosque?.longitude || event.venue_longitude;
      if (!lat || !lng) return false;
      return haversineDistance(center.latitude, center.longitude, lat, lng) <= 5;
    });
  }, [events, searchValue, suburbCoords]);

  // Merge text + suburb-radius matches, deduplicated
  const localMatched = useMemo(() => {
    if (!searchValue) return events;
    const ids = new Set(textMatched.map(e => e.id));
    const merged = [...textMatched];
    for (const e of suburbRadiusMatched) {
      if (!ids.has(e.id)) {
        merged.push(e);
        ids.add(e.id);
      }
    }
    return merged;
  }, [events, searchValue, textMatched, suburbRadiusMatched]);

  // Geocode fallback — only fires when both text and suburb-coord matching found nothing
  const { coords, isGeocoding } = useGeocode(searchValue, localMatched.length);

  // Combine: use local matches if any, otherwise use geo-proximity matches
  const filtered = useMemo(() => {
    if (!searchValue) return events;
    if (localMatched.length > 0) return localMatched;
    if (!coords) return [];
    return events.filter(event => {
      const lat = event.mosque?.latitude || event.venue_latitude;
      const lng = event.mosque?.longitude || event.venue_longitude;
      if (!lat || !lng) return false;
      return haversineDistance(coords.latitude, coords.longitude, lat, lng) <= 5;
    });
  }, [events, searchValue, localMatched, coords]);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search suburb, mosque, speaker, or topic..."
          className="w-full text-sm font-medium pl-10 pr-8 py-2.5 rounded-card border border-sand-dark bg-white text-charcoal placeholder:text-stone focus:border-primary focus:outline-none transition-colors"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-charcoal"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Event type pills — grouped */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <FilterPill label="All" active={!currentType} onClick={() => setFilter('type', null)} />
        <span className="w-px h-5 bg-sand-dark self-center mx-0.5" />
        {LEARNING_TYPES.map(({ value, label }) => (
          <FilterPill key={value} label={label} active={currentType === value} onClick={() => setFilter('type', value)} />
        ))}
        <span className="w-px h-5 bg-sand-dark self-center mx-0.5" />
        {PRAYER_TYPES.map(({ value, label }) => (
          <FilterPill key={value} label={label} active={currentType === value} onClick={() => setFilter('type', value)} />
        ))}
        <span className="w-px h-5 bg-sand-dark self-center mx-0.5" />
        {COMMUNITY_TYPES.map(({ value, label }) => (
          <FilterPill key={value} label={label} active={currentType === value} onClick={() => setFilter('type', value)} />
        ))}
      </div>

      {/* Gender, Language & Audience */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone mr-0.5">Gender</span>
        {GENDERS.map(({ value, label }) => (
          <FilterPill key={value} label={label} active={currentGender === value} onClick={() => setFilter('gender', value)} />
        ))}
        <span className="w-px h-5 bg-sand-dark self-center mx-1" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone mr-0.5">Audience</span>
        <FilterPill label="Kids" active={currentKids === 'true'} onClick={() => setFilter('kids', currentKids === 'true' ? null : 'true')} />
        <FilterPill label="Family" active={currentFamily === 'true'} onClick={() => setFilter('family', currentFamily === 'true' ? null : 'true')} />
      </div>

      {/* Event list */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-sand rounded-card">
          {isGeocoding ? (
            <p className="text-warm-gray">Searching nearby...</p>
          ) : hasFilters || searchValue ? (
            <>
              <p className="text-warm-gray">No events match your search.</p>
              <p className="text-sm text-stone mt-1">Try a different search term or clear your filters.</p>
            </>
          ) : (
            <p className="text-warm-gray text-sm">No events yet. Be the first to submit one!</p>
          )}
        </div>
      )}
    </div>
  );
}
