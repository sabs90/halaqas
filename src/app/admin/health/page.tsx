'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface OrphanedEvent {
  id: string;
  title: string;
  venue_name: string;
  fixed_date: string | null;
  status: string;
}

interface DupeMosquePair {
  mosque_a: { id: string; name: string };
  mosque_b: { id: string; name: string };
  mosque_a_event_count: number;
  mosque_b_event_count: number;
}

interface DupeEventPair {
  event_a: { id: string; title: string; fixed_date: string | null };
  event_b: { id: string; title: string; fixed_date: string | null };
  mosque_name: string;
}

interface StaleRecurring {
  id: string;
  title: string;
  mosque_name: string;
  recurrence_end_date: string | null;
  status: string;
}

interface Mosque {
  id: string;
  name: string;
}

interface HealthData {
  orphaned_events: OrphanedEvent[];
  possible_dupe_mosques: DupeMosquePair[];
  possible_dupe_events: DupeEventPair[];
  stale_recurring: StaleRecurring[];
}

function Section({ title, count, defaultOpen, children }: { title: string; count: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? count > 0);

  return (
    <div className="bg-white border border-sand-dark rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-sand-light/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{open ? '▾' : '▸'}</span>
          <h2 className="text-lg font-bold text-charcoal">{title}</h2>
        </div>
        <span className={`inline-flex items-center justify-center min-w-[24px] h-[24px] px-2 text-xs font-bold rounded-full ${count > 0 ? 'bg-secondary text-white' : 'bg-sand-dark text-warm-gray'}`}>
          {count}
        </span>
      </button>
      {open && <div className="border-t border-sand-dark p-4 space-y-3">{children}</div>}
    </div>
  );
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [linkSelections, setLinkSelections] = useState<Record<string, string>>({});
  const [endDateInputs, setEndDateInputs] = useState<Record<string, string>>({});

  async function fetchData() {
    try {
      const [healthRes, mosquesRes] = await Promise.all([
        fetch('/api/admin/health'),
        fetch('/api/admin/mosques?list=all'),
      ]);

      if (!healthRes.ok) {
        if (healthRes.status === 401) {
          setError('Not authenticated. Please log in from the admin dashboard first.');
          return;
        }
        throw new Error('Failed to fetch health data');
      }

      const healthData = await healthRes.json();
      const mosquesData = mosquesRes.ok ? await mosquesRes.json() : [];

      setData(healthData);
      setMosques(mosquesData);
    } catch {
      setError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function doAction(actionKey: string, body: Record<string, unknown>) {
    setActionLoading(actionKey);
    try {
      const res = await fetch('/api/admin/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Action failed');
        return;
      }
      await fetchData();
    } catch {
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div className="text-center py-16 text-warm-gray">Loading health data...</div>;
  if (error) return <div className="text-center py-16 text-secondary">{error}</div>;
  if (!data) return null;

  const totalIssues = data.orphaned_events.length + data.possible_dupe_mosques.length + data.possible_dupe_events.length + data.stale_recurring.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-primary hover:underline">&larr; Back to Dashboard</Link>
          <h1 className="text-[28px] font-bold text-charcoal mt-1">Data Health</h1>
          <p className="text-sm text-warm-gray">
            {totalIssues === 0 ? 'No issues found' : `${totalIssues} issue${totalIssues === 1 ? '' : 's'} found`}
          </p>
        </div>
        <Button variant="outline" onClick={() => { setLoading(true); fetchData(); }}>Refresh</Button>
      </div>

      {/* Orphaned Events */}
      <Section title="Orphaned Events" count={data.orphaned_events.length} defaultOpen>
        {data.orphaned_events.length === 0 ? (
          <p className="text-sm text-warm-gray">No orphaned events found.</p>
        ) : (
          data.orphaned_events.map(event => (
            <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-sand-light rounded-button">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal truncate">{event.title}</p>
                <p className="text-sm text-warm-gray">Venue: {event.venue_name} {event.fixed_date ? `· ${event.fixed_date}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={linkSelections[event.id] ?? ''}
                  onChange={e => setLinkSelections(prev => ({ ...prev, [event.id]: e.target.value }))}
                  className="text-sm rounded-button border border-sand-dark p-1.5 bg-white text-charcoal max-w-[200px]"
                >
                  <option value="">Select mosque...</option>
                  {mosques.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  disabled={!linkSelections[event.id] || actionLoading === `link-${event.id}`}
                  onClick={() => doAction(`link-${event.id}`, { action: 'link_event', event_id: event.id, mosque_id: linkSelections[event.id] })}
                  className="text-xs px-3 py-1.5"
                >
                  {actionLoading === `link-${event.id}` ? '...' : 'Link'}
                </Button>
              </div>
            </div>
          ))
        )}
      </Section>

      {/* Possible Duplicate Mosques */}
      <Section title="Possible Duplicate Mosques" count={data.possible_dupe_mosques.length}>
        {data.possible_dupe_mosques.length === 0 ? (
          <p className="text-sm text-warm-gray">No duplicate mosques detected.</p>
        ) : (
          data.possible_dupe_mosques.map((pair, i) => (
            <div key={i} className="p-3 bg-sand-light rounded-button space-y-2">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{pair.mosque_a.name}</p>
                  <p className="text-xs text-warm-gray">{pair.mosque_a_event_count} event{pair.mosque_a_event_count !== 1 ? 's' : ''}</p>
                </div>
                <div className="hidden sm:flex items-center text-warm-gray text-lg">vs</div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{pair.mosque_b.name}</p>
                  <p className="text-xs text-warm-gray">{pair.mosque_b_event_count} event{pair.mosque_b_event_count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  disabled={actionLoading === `merge-${i}-a`}
                  onClick={() => {
                    if (confirm(`Merge: Move all events from "${pair.mosque_b.name}" → "${pair.mosque_a.name}", then delete "${pair.mosque_b.name}"?`)) {
                      doAction(`merge-${i}-a`, { action: 'merge_mosques', source_id: pair.mosque_b.id, target_id: pair.mosque_a.id });
                    }
                  }}
                  className="text-xs px-3 py-1.5"
                >
                  {actionLoading === `merge-${i}-a` ? '...' : `Keep "${pair.mosque_a.name}"`}
                </Button>
                <Button
                  variant="primary"
                  disabled={actionLoading === `merge-${i}-b`}
                  onClick={() => {
                    if (confirm(`Merge: Move all events from "${pair.mosque_a.name}" → "${pair.mosque_b.name}", then delete "${pair.mosque_a.name}"?`)) {
                      doAction(`merge-${i}-b`, { action: 'merge_mosques', source_id: pair.mosque_a.id, target_id: pair.mosque_b.id });
                    }
                  }}
                  className="text-xs px-3 py-1.5"
                >
                  {actionLoading === `merge-${i}-b` ? '...' : `Keep "${pair.mosque_b.name}"`}
                </Button>
              </div>
            </div>
          ))
        )}
      </Section>

      {/* Possible Duplicate Events */}
      <Section title="Possible Duplicate Events" count={data.possible_dupe_events.length}>
        {data.possible_dupe_events.length === 0 ? (
          <p className="text-sm text-warm-gray">No duplicate events detected.</p>
        ) : (
          data.possible_dupe_events.map((pair, i) => (
            <div key={i} className="p-3 bg-sand-light rounded-button space-y-2">
              <p className="text-xs text-warm-gray font-medium">{pair.mosque_name}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{pair.event_a.title}</p>
                  <p className="text-xs text-warm-gray">{pair.event_a.fixed_date ?? 'No date'}</p>
                </div>
                <div className="hidden sm:flex items-center text-warm-gray text-lg">vs</div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{pair.event_b.title}</p>
                  <p className="text-xs text-warm-gray">{pair.event_b.fixed_date ?? 'No date'}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  disabled={actionLoading === `del-evt-${i}-b`}
                  onClick={() => {
                    if (confirm(`Delete "${pair.event_b.title}" (${pair.event_b.fixed_date ?? 'no date'})?`)) {
                      doAction(`del-evt-${i}-b`, { action: 'delete_event', event_id: pair.event_b.id });
                    }
                  }}
                  className="text-xs px-3 py-1.5"
                >
                  {actionLoading === `del-evt-${i}-b` ? '...' : 'Delete B'}
                </Button>
                <Button
                  variant="outline"
                  disabled={actionLoading === `del-evt-${i}-a`}
                  onClick={() => {
                    if (confirm(`Delete "${pair.event_a.title}" (${pair.event_a.fixed_date ?? 'no date'})?`)) {
                      doAction(`del-evt-${i}-a`, { action: 'delete_event', event_id: pair.event_a.id });
                    }
                  }}
                  className="text-xs px-3 py-1.5"
                >
                  {actionLoading === `del-evt-${i}-a` ? '...' : 'Delete A'}
                </Button>
              </div>
            </div>
          ))
        )}
      </Section>

      {/* Stale Recurring Events */}
      <Section title="Stale Recurring Events" count={data.stale_recurring.length}>
        {data.stale_recurring.length === 0 ? (
          <p className="text-sm text-warm-gray">No stale recurring events found.</p>
        ) : (
          data.stale_recurring.map(event => (
            <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-sand-light rounded-button">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal truncate">{event.title}</p>
                <p className="text-sm text-warm-gray">
                  {event.mosque_name}
                  {event.recurrence_end_date ? ` · Ended ${event.recurrence_end_date}` : ' · No end date set'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <input
                  type="date"
                  value={endDateInputs[event.id] ?? ''}
                  onChange={e => setEndDateInputs(prev => ({ ...prev, [event.id]: e.target.value }))}
                  className="text-sm rounded-button border border-sand-dark p-1.5 bg-white text-charcoal"
                />
                <Button
                  variant="primary"
                  disabled={!endDateInputs[event.id] || actionLoading === `enddate-${event.id}`}
                  onClick={() => doAction(`enddate-${event.id}`, { action: 'set_end_date', event_id: event.id, recurrence_end_date: endDateInputs[event.id] })}
                  className="text-xs px-3 py-1.5"
                >
                  {actionLoading === `enddate-${event.id}` ? '...' : 'Set End'}
                </Button>
                <Button
                  variant="outline"
                  disabled={actionLoading === `archive-${event.id}`}
                  onClick={() => {
                    if (confirm(`Archive "${event.title}"?`)) {
                      doAction(`archive-${event.id}`, { action: 'archive_event', event_id: event.id });
                    }
                  }}
                  className="text-xs px-3 py-1.5"
                >
                  {actionLoading === `archive-${event.id}` ? '...' : 'Archive'}
                </Button>
              </div>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}
