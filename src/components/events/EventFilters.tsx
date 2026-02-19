'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { FilterPill } from '@/components/ui/FilterPill';
import { SYDNEY_SUBURBS } from '@/data/sydney-suburbs';
import type { EventType, Language, Gender } from '@/lib/types';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'talk', label: 'Talk' },
  { value: 'class', label: 'Class' },
  { value: 'quran_circle', label: 'Quran Circle' },
  { value: 'iftar', label: 'Iftar' },
  { value: 'taraweeh', label: 'Taraweeh' },
  { value: 'sisters_circle', label: 'Sisters Circle' },
  { value: 'youth', label: 'Youth' },
  { value: 'charity', label: 'Charity' },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'mixed', label: 'Mixed' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'brothers', label: 'Brothers' },
  { value: 'sisters', label: 'Sisters' },
];

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type');
  const currentLanguage = searchParams.get('language');
  const currentGender = searchParams.get('gender');
  const currentSuburb = searchParams.get('suburb');

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && params.get(key) !== value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/events?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-3">
      {/* Suburb selector */}
      <div>
        <select
          value={currentSuburb || ''}
          onChange={(e) => setFilter('suburb', e.target.value || null)}
          className="w-full sm:w-auto text-sm font-medium px-3 py-2 rounded-button border border-sand-dark bg-white text-charcoal focus:border-primary"
        >
          <option value="">All suburbs</option>
          {SYDNEY_SUBURBS.map((s) => (
            <option key={s.name} value={s.name}>{s.name} (5km)</option>
          ))}
        </select>
      </div>

      {/* Event type pills */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <FilterPill label="All" active={!currentType} onClick={() => setFilter('type', null)} />
        {EVENT_TYPES.map(({ value, label }) => (
          <FilterPill
            key={value}
            label={label}
            active={currentType === value}
            onClick={() => setFilter('type', value)}
          />
        ))}
      </div>

      {/* Language & gender */}
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map(({ value, label }) => (
          <FilterPill
            key={value}
            label={label}
            active={currentLanguage === value}
            onClick={() => setFilter('language', value)}
          />
        ))}
        <span className="w-px h-6 bg-sand-dark self-center mx-1" />
        {GENDERS.map(({ value, label }) => (
          <FilterPill
            key={value}
            label={label}
            active={currentGender === value}
            onClick={() => setFilter('gender', value)}
          />
        ))}
      </div>
    </div>
  );
}
