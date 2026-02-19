'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect, useRef } from 'react';
import { FilterPill } from '@/components/ui/FilterPill';
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
  const currentSearch = searchParams.get('q') || '';

  const [searchValue, setSearchValue] = useState(currentSearch);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync search input when URL changes externally
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

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

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilter('q', value || null);
    }, 300);
  }

  function handleSearchClear() {
    setSearchValue('');
    setFilter('q', null);
  }

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
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search suburb, mosque, speaker, or topic..."
          className="w-full text-sm font-medium pl-10 pr-8 py-2.5 rounded-card border border-sand-dark bg-white text-charcoal placeholder:text-stone focus:border-primary focus:outline-none transition-colors"
        />
        {searchValue && (
          <button
            onClick={handleSearchClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-charcoal"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
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
