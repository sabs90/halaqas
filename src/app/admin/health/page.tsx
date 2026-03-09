'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import EventEditForm, { eventToFormData, formDataToPayload } from '@/components/admin/EventEditForm';
import type { EventFormData } from '@/components/admin/EventEditForm';
import type { Mosque as FullMosque } from '@/lib/types';
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

interface DupeEvent {
  id: string;
  title: string;
  mosque_id: string | null;
  venue_name: string | null;
  venue_address: string | null;
  event_type: string;
  language: string;
  gender: string;
  fixed_date: string | null;
  fixed_time: string | null;
  time_mode: string;
  prayer_anchor: string | null;
  prayer_offset_minutes: number | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_end_date: string | null;
  speaker: string | null;
  description: string | null;
  is_kids: boolean;
  is_family: boolean;
  flyer_image_url: string | null;
  status: string;
  created_at: string;
}

interface DupeEventPair {
  event_a: DupeEvent;
  event_b: DupeEvent;
  mosque_name: string;
}

interface StaleRecurring {
  id: string;
  title: string;
  mosque_name: string;
  recurrence_end_date: string | null;
  status: string;
}

interface MosqueBasic {
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
  const [mosques, setMosques] = useState<FullMosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [linkSelections, setLinkSelections] = useState<Record<string, string>>({});
  const [endDateInputs, setEndDateInputs] = useState<Record<string, string>>({});
  // Dupe event editing: tracks which event is being edited and which will be deleted
  const [dupeEdit, setDupeEdit] = useState<{ pairIndex: number; editKey: 'event_a' | 'event_b'; deleteKey: 'event_a' | 'event_b' } | null>(null);
  const [dupeEditForm, setDupeEditForm] = useState<EventFormData | null>(null);
  const [dupeEditSaving, setDupeEditSaving] = useState(false);
  const [dupeEditError, setDupeEditError] = useState('');

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

  function startDupeEdit(pairIndex: number, editKey: 'event_a' | 'event_b') {
    const deleteKey = editKey === 'event_a' ? 'event_b' : 'event_a';
    const evt = data!.possible_dupe_events[pairIndex][editKey];
    setDupeEdit({ pairIndex, editKey, deleteKey });
    setDupeEditForm(eventToFormData(evt as Parameters<typeof eventToFormData>[0]));
    setDupeEditError('');
  }

  function cancelDupeEdit() {
    setDupeEdit(null);
    setDupeEditForm(null);
    setDupeEditError('');
  }

  async function saveDupeEdit() {
    if (!dupeEdit || !dupeEditForm || !data) return;
    setDupeEditSaving(true);
    setDupeEditError('');

    const pair = data.possible_dupe_events[dupeEdit.pairIndex];
    const keepId = pair[dupeEdit.editKey].id;
    const deleteId = pair[dupeEdit.deleteKey].id;

    // 1. Save edits on the kept event
    const patchRes = await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: keepId, ...formDataToPayload(dupeEditForm) }),
    });

    if (!patchRes.ok) {
      const err = await patchRes.json();
      setDupeEditError(err.error || 'Failed to save edits');
      setDupeEditSaving(false);
      return;
    }

    // 2. Delete the other event
    const delRes = await fetch('/api/admin/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_event', event_id: deleteId }),
    });

    if (!delRes.ok) {
      const err = await delRes.json();
      setDupeEditError(err.error || 'Saved edits but failed to delete the other event');
      setDupeEditSaving(false);
      return;
    }

    setDupeEditSaving(false);
    cancelDupeEdit();
    await fetchData();
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
                  {Object.entries(
                    mosques.reduce<Record<string, FullMosque[]>>((acc, m) => {
                      (acc[m.state] ??= []).push(m);
                      return acc;
                    }, {})
                  )
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([state, list]) => (
                      <optgroup key={state} label={state}>
                        {list.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </optgroup>
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
                <Link
                  href={`/admin/mosques/manage?create=${encodeURIComponent(event.venue_name || '')}&link_event=${event.id}`}
                  className="text-xs text-primary hover:text-primary-dark font-medium whitespace-nowrap"
                >
                  + New Mosque
                </Link>
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
          data.possible_dupe_events.map((pair, i) => {
            const isEditing = dupeEdit?.pairIndex === i;

            if (isEditing && dupeEditForm) {
              const otherEvt = pair[dupeEdit.deleteKey];
              const otherLabel = dupeEdit.deleteKey === 'event_a' ? 'A' : 'B';
              return (
                <div key={i} className="p-3 bg-sand-light rounded-button space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-warm-gray font-medium">{pair.mosque_name}</p>
                    <p className="text-xs text-secondary font-medium">
                      Will delete {otherLabel}: &quot;{otherEvt.title}&quot;
                    </p>
                  </div>
                  <EventEditForm
                    form={dupeEditForm}
                    onChange={(updates) => setDupeEditForm({ ...dupeEditForm, ...updates })}
                    mosques={mosques}
                    onSave={saveDupeEdit}
                    onCancel={cancelDupeEdit}
                    saving={dupeEditSaving}
                    error={dupeEditError}
                    saveLabel="Save & Delete Other"
                    flyerImageUrl={pair[dupeEdit.editKey].flyer_image_url}
                  />
                </div>
              );
            }

            return (
              <div key={i} className="p-3 bg-sand-light rounded-button space-y-2">
                <p className="text-xs text-warm-gray font-medium">{pair.mosque_name}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {(['event_a', 'event_b'] as const).map((key, idx) => {
                    const evt = pair[key];
                    const label = idx === 0 ? 'A' : 'B';
                    const actionKey = `del-evt-${i}-${label.toLowerCase()}`;
                    return (
                      <div key={key} className="flex-1 border border-sand-dark rounded-button p-3 bg-white space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{label}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-tag bg-sand text-stone">{evt.event_type?.replace(/_/g, ' ')}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-tag bg-sand text-stone">{evt.status}</span>
                        </div>
                        <p className="font-semibold text-charcoal text-sm">{evt.title}</p>
                        <div className="text-xs text-warm-gray space-y-0.5">
                          <p>
                            {evt.fixed_date ?? 'No date'}
                            {evt.time_mode === 'fixed' && evt.fixed_time ? ` at ${evt.fixed_time.slice(0, 5)}` : ''}
                            {evt.time_mode === 'prayer_anchored' && evt.prayer_anchor ? ` · ${evt.prayer_offset_minutes ?? 0} min after ${evt.prayer_anchor}` : ''}
                          </p>
                          {evt.is_recurring && evt.recurrence_pattern && (
                            <p>{evt.recurrence_pattern.replace(/_/g, ' ')}{evt.recurrence_end_date ? ` until ${evt.recurrence_end_date}` : ''}</p>
                          )}
                          {evt.speaker && <p>Speaker: {evt.speaker}</p>}
                          <p className="text-stone">Added {new Date(evt.created_at).toLocaleDateString('en-AU')}</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="primary"
                            onClick={() => startDupeEdit(i, key)}
                            className="!text-xs !px-3 !py-1.5"
                          >
                            Keep & Edit
                          </Button>
                          <Button
                            variant="outline"
                            disabled={actionLoading === actionKey}
                            onClick={() => {
                              if (confirm(`Delete "${evt.title}" (${evt.fixed_date ?? 'no date'})?`)) {
                                doAction(actionKey, { action: 'delete_event', event_id: evt.id });
                              }
                            }}
                            className="!text-xs !px-3 !py-1.5 !text-secondary !border-secondary/30 hover:!border-secondary"
                          >
                            {actionLoading === actionKey ? '...' : `Delete ${label}`}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
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
