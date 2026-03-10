'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { Mosque } from '@/lib/types';

const STATE_ORDER = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'];

interface Props {
  mosques: Mosque[];
  value: string; // mosque_id or ''
  onChange: (mosqueId: string) => void;
  onSuggestNew: () => void;
}

export function MosqueSearchSelect({ mosques, value, onChange, onSuggestNew }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedMosque = mosques.find(m => m.id === value);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = q
      ? mosques.filter(m => {
          const searchable = [m.name, m.suburb, ...(m.nicknames || [])].join(' ').toLowerCase();
          // Match all words in query
          return q.split(/\s+/).every(word => searchable.includes(word));
        })
      : mosques;

    // Group by state
    const grouped: Record<string, Mosque[]> = {};
    for (const m of list) {
      const state = m.state || 'Other';
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push(m);
    }

    // Sort mosques within each state
    for (const state of Object.keys(grouped)) {
      grouped[state].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Order states
    const ordered: { state: string; mosques: Mosque[] }[] = [];
    for (const state of STATE_ORDER) {
      if (grouped[state]) {
        ordered.push({ state, mosques: grouped[state] });
        delete grouped[state];
      }
    }
    // Any remaining states
    for (const [state, list] of Object.entries(grouped)) {
      ordered.push({ state, mosques: list });
    }

    return ordered;
  }, [mosques, query]);

  const totalResults = filtered.reduce((sum, g) => sum + g.mosques.length, 0);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setQuery(''); }}
        className="w-full text-left text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal flex items-center justify-between"
      >
        <span className={selectedMosque ? 'text-charcoal' : 'text-stone'}>
          {selectedMosque ? selectedMosque.name : 'Select a mosque or venue...'}
        </span>
        <svg className={`w-4 h-4 text-stone transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-sand-dark rounded-card shadow-lg max-h-80 flex flex-col">
          {/* Search input */}
          <div className="p-2 border-b border-sand">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, suburb, or nickname..."
              className="w-full text-sm rounded-button border border-sand-dark p-2 bg-white text-charcoal placeholder:text-stone focus:outline-none focus:border-primary"
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto flex-1">
            {/* Other venue option */}
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-sand/50 transition-colors ${
                !value ? 'bg-primary/5 text-primary font-medium' : 'text-warm-gray'
              }`}
            >
              Other venue (enter below)
            </button>

            <div className="border-t border-sand" />

            {totalResults === 0 && (
              <div className="px-3 py-4 text-sm text-stone text-center">
                No mosques found matching &ldquo;{query}&rdquo;
              </div>
            )}

            {filtered.map(group => (
              <div key={group.state}>
                {/* State header */}
                <div className="px-3 py-1.5 text-xs font-semibold text-warm-gray bg-sand/40 sticky top-0">
                  {group.state}
                </div>
                {group.mosques.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { onChange(m.id); setOpen(false); setQuery(''); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-sand/50 transition-colors ${
                      value === m.id ? 'bg-primary/5 text-primary font-medium' : 'text-charcoal'
                    }`}
                  >
                    <span>{m.name}</span>
                    {m.suburb && (
                      <span className="text-stone ml-1.5">— {m.suburb}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}

            <div className="border-t border-sand" />

            {/* Suggest new mosque */}
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); setQuery(''); onSuggestNew(); }}
              className="w-full text-left px-3 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors font-medium"
            >
              + Mosque not listed? Suggest a new one
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
