'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';

interface MosqueOutreach {
  id: string;
  name: string;
  suburb: string;
  state: string;
  facebook_url: string | null;
  website_url: string | null;
  last_checked_at: string | null;
  event_count: number;
  latest_event_at: string | null;
}

const STATE_ORDER = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysAgo(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export default function OutreachPage() {
  const [mosques, setMosques] = useState<MosqueOutreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [showUncheckedOnly, setShowUncheckedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkChecking, setBulkChecking] = useState(false);
  const lastSelectedIndex = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/mosques/outreach')
      .then(r => r.ok ? r.json() : [])
      .then(setMosques)
      .finally(() => setLoading(false));
  }, []);

  function handleCheckboxClick(e: React.MouseEvent, mosqueId: string) {
    const currentIndex = flatRows.findIndex(m => m.id === mosqueId);

    if (e.shiftKey && lastSelectedIndex.current !== null) {
      const start = Math.min(lastSelectedIndex.current, currentIndex);
      const end = Math.max(lastSelectedIndex.current, currentIndex);
      const rangeIds = flatRows.slice(start, end + 1).map(m => m.id);
      const adding = !selectedIds.has(mosqueId);
      setSelectedIds(prev => {
        const next = new Set(prev);
        rangeIds.forEach(id => adding ? next.add(id) : next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(mosqueId)) next.delete(mosqueId);
        else next.add(mosqueId);
        return next;
      });
    }

    lastSelectedIndex.current = currentIndex;
  }

  async function markCheckedBulk() {
    setBulkChecking(true);
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map(id =>
      fetch('/api/admin/mosques/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    ));
    const now = new Date().toISOString();
    setMosques(prev => prev.map(m =>
      selectedIds.has(m.id) ? { ...m, last_checked_at: now } : m
    ));
    setSelectedIds(new Set());
    lastSelectedIndex.current = null;
    setBulkChecking(false);
  }

  async function markChecked(id: string) {
    setChecking(id);
    const res = await fetch('/api/admin/mosques/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMosques(prev => prev.map(m =>
        m.id === id ? { ...m, last_checked_at: new Date().toISOString() } : m
      ));
    }
    setChecking(null);
  }

  const grouped = useMemo(() => {
    let filtered = mosques;
    if (stateFilter !== 'all') {
      filtered = filtered.filter(m => m.state === stateFilter);
    }
    if (showUncheckedOnly) {
      filtered = filtered.filter(m => !m.last_checked_at);
    }

    const groups: Record<string, MosqueOutreach[]> = {};
    for (const m of filtered) {
      if (!groups[m.state]) groups[m.state] = [];
      groups[m.state].push(m);
    }

    // Sort mosques within each state by event count desc, then by last_checked_at asc (unchecked first)
    for (const state of Object.keys(groups)) {
      groups[state].sort((a, b) => {
        if (b.event_count !== a.event_count) return b.event_count - a.event_count;
        // Unchecked first
        if (!a.last_checked_at && b.last_checked_at) return -1;
        if (a.last_checked_at && !b.last_checked_at) return 1;
        // Oldest checked first
        if (a.last_checked_at && b.last_checked_at) {
          return new Date(a.last_checked_at).getTime() - new Date(b.last_checked_at).getTime();
        }
        return 0;
      });
    }

    // Sort states by STATE_ORDER
    return STATE_ORDER
      .filter(s => groups[s])
      .map(s => ({ state: s, mosques: groups[s] }));
  }, [mosques, stateFilter, showUncheckedOnly]);

  const flatRows = useMemo(() => grouped.flatMap(g => g.mosques), [grouped]);

  const totalWithFb = mosques.filter(m => m.facebook_url).length;
  const totalUnchecked = mosques.filter(m => !m.last_checked_at).length;
  const states = [...new Set(mosques.map(m => m.state))].sort(
    (a, b) => STATE_ORDER.indexOf(a) - STATE_ORDER.indexOf(b)
  );

  if (loading) {
    return <div className="text-center py-16 text-warm-gray">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-warm-gray hover:text-primary">&larr; Admin</Link>
        <h1 className="text-[28px] font-bold text-charcoal">Facebook Outreach</h1>
      </div>

      <p className="text-sm text-warm-gray">
        {mosques.length} mosques &middot; {totalWithFb} with Facebook &middot; {totalUnchecked} never checked
      </p>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-card px-4 py-3">
          <span className="text-sm text-primary font-medium">{selectedIds.size} selected</span>
          <button
            onClick={markCheckedBulk}
            disabled={bulkChecking}
            className="text-sm bg-primary text-white rounded-button px-4 py-1.5 font-medium hover:bg-primary-dark disabled:opacity-50"
          >
            {bulkChecking ? 'Marking...' : `Mark ${selectedIds.size} checked`}
          </button>
          <button
            onClick={() => { setSelectedIds(new Set()); lastSelectedIndex.current = null; }}
            className="text-sm text-warm-gray hover:text-charcoal"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          className="text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
        >
          <option value="all">All states</option>
          {states.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={showUncheckedOnly}
            onChange={e => setShowUncheckedOnly(e.target.checked)}
            className="rounded border-sand-dark"
          />
          Unchecked only
        </label>
      </div>

      {/* Grouped tables */}
      {grouped.map(({ state, mosques: stateMosques }) => (
        <div key={state}>
          <h2 className="text-lg font-bold text-charcoal mb-2">
            {state} <span className="text-sm font-normal text-warm-gray">({stateMosques.length})</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-sand-dark rounded-card overflow-hidden">
              <thead>
                <tr className="bg-sand text-left">
                  <th className="p-3 w-8"></th>
                  <th className="p-3 font-semibold text-charcoal">Mosque</th>
                  <th className="p-3 font-semibold text-charcoal">Suburb</th>
                  <th className="p-3 font-semibold text-charcoal text-center">Events</th>
                  <th className="p-3 font-semibold text-charcoal">Latest Event</th>
                  <th className="p-3 font-semibold text-charcoal">Facebook</th>
                  <th className="p-3 font-semibold text-charcoal">Last Checked</th>
                  <th className="p-3 font-semibold text-charcoal"></th>
                </tr>
              </thead>
              <tbody>
                {stateMosques.map(m => {
                  const checkedDays = daysAgo(m.last_checked_at);
                  const isStale = checkedDays === null || checkedDays > 30;

                  return (
                    <tr
                      key={m.id}
                      className={`border-t border-sand-dark ${selectedIds.has(m.id) ? 'bg-primary/5' : isStale ? 'bg-amber-50/50' : 'bg-white'}`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(m.id)}
                          onClick={e => handleCheckboxClick(e, m.id)}
                          onChange={() => {}}
                          className="rounded border-sand-dark cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-medium text-charcoal">
                        <Link href={`/mosques/${m.id}`} className="hover:text-primary transition-colors">
                          {m.name}
                        </Link>
                      </td>
                      <td className="p-3 text-warm-gray">{m.suburb}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-bold ${
                          m.event_count > 0 ? 'bg-primary/10 text-primary' : 'bg-sand text-stone'
                        }`}>
                          {m.event_count}
                        </span>
                      </td>
                      <td className="p-3 text-warm-gray text-xs">{formatDate(m.latest_event_at)}</td>
                      <td className="p-3">
                        {m.facebook_url ? (
                          <a
                            href={m.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:text-primary-dark transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Open
                          </a>
                        ) : (
                          <span className="text-stone text-xs">No link</span>
                        )}
                      </td>
                      <td className="p-3 text-xs">
                        {m.last_checked_at ? (
                          <span className={checkedDays !== null && checkedDays > 30 ? 'text-amber-600' : 'text-warm-gray'}>
                            {formatDate(m.last_checked_at)}
                            {checkedDays !== null && <span className="text-stone ml-1">({checkedDays}d ago)</span>}
                          </span>
                        ) : (
                          <span className="text-stone">Never</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => markChecked(m.id)}
                          disabled={checking === m.id}
                          className="text-xs text-primary hover:text-primary-dark font-medium disabled:opacity-50 whitespace-nowrap"
                        >
                          {checking === m.id ? '...' : 'Mark checked'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
