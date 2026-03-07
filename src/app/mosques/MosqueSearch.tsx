'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

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

export function MosqueSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('q') || '';
  const currentState = searchParams.get('state') || 'NSW';
  const [value, setValue] = useState(currentSearch);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  function buildUrl(q: string, state: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (state) params.set('state', state);
    const qs = params.toString();
    return qs ? `/mosques?${qs}` : '/mosques';
  }

  function handleChange(v: string) {
    setValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl(v, currentState));
    }, 300);
  }

  function handleClear() {
    setValue('');
    router.push(buildUrl('', currentState));
  }

  function handleStateChange(state: string) {
    router.push(buildUrl(value, state));
  }

  return (
    <div className="space-y-3">
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

      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search by name, suburb, or address..."
          className="w-full text-sm font-medium pl-10 pr-8 py-2.5 rounded-card border border-sand-dark bg-white text-charcoal placeholder:text-stone focus:border-primary focus:outline-none transition-colors"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-charcoal"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
