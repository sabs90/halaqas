'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { EventTypeTag, AudienceTag } from '@/components/events/EventTypeTag';
import EventEditForm, { eventToFormData, formDataToPayload } from '@/components/admin/EventEditForm';
import type { EventFormData } from '@/components/admin/EventEditForm';
import type { Event, Mosque } from '@/lib/types';
import Link from 'next/link';

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function titlesOverlap(a: string, b: string): boolean {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return true;
  // Check if one contains the other
  if (na.includes(nb) || nb.includes(na)) return true;
  // Check significant word overlap
  const wordsA = new Set(na.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(nb.split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return false;
  const overlap = [...wordsA].filter(w => wordsB.has(w)).length;
  const minSize = Math.min(wordsA.size, wordsB.size);
  return minSize > 0 && overlap / minSize >= 0.5;
}

function sameVenue(a: Event, b: Event): boolean {
  // Same mosque
  if (a.mosque_id && b.mosque_id && a.mosque_id === b.mosque_id) return true;
  // Same venue name (fuzzy)
  const va = (a.venue_name || a.mosque?.name || '').toLowerCase().trim();
  const vb = (b.venue_name || b.mosque?.name || '').toLowerCase().trim();
  if (va && vb && (va === vb || va.includes(vb) || vb.includes(va))) return true;
  return false;
}

function datesOverlap(a: Event, b: Event): boolean {
  // Both recurring with no fixed date — likely overlap
  if (a.is_recurring && b.is_recurring) {
    // Same recurrence day pattern is a strong signal
    if (a.recurrence_pattern && b.recurrence_pattern && a.recurrence_pattern === b.recurrence_pattern) return true;
  }
  // Both have fixed dates
  if (a.fixed_date && b.fixed_date && a.fixed_date === b.fixed_date) return true;
  // One-off falls within a recurring event's range
  if (a.is_recurring && b.fixed_date) {
    const bDate = b.fixed_date;
    const aEnd = a.recurrence_end_date || '9999-12-31';
    const aStart = a.fixed_date || a.created_at.slice(0, 10);
    if (bDate >= aStart && bDate <= aEnd) return true;
  }
  if (b.is_recurring && a.fixed_date) {
    const aDate = a.fixed_date;
    const bEnd = b.recurrence_end_date || '9999-12-31';
    const bStart = b.fixed_date || b.created_at.slice(0, 10);
    if (aDate >= bStart && aDate <= bEnd) return true;
  }
  return false;
}

function findDuplicates(event: Event, allEvents: Event[]): Event[] {
  return allEvents.filter(other => {
    if (other.id === event.id) return false;
    if (!sameVenue(event, other)) return false;
    // Same venue — check for signals
    const sameType = event.event_type === other.event_type;
    const similarTitle = titlesOverlap(event.title, other.title);
    const dateOverlap = datesOverlap(event, other);
    // Need at least two signals, or a title match (strongest signal)
    if (similarTitle) return true;
    if (sameType && dateOverlap) return true;
    return false;
  });
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventFormData | null>(null);
  const [editFlyerUrl, setEditFlyerUrl] = useState<string | null>(null);
  const [flyerChanged, setFlyerChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadEvents();
    loadMosques();
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setSearch(q);
  }, []);

  async function loadEvents() {
    setLoading(true);
    const res = await fetch('/api/admin/events');
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }

  async function loadMosques() {
    const res = await fetch('/api/mosques');
    if (res.ok) setMosques(await res.json());
  }

  function startEdit(event: Event) {
    setEditingId(event.id);
    setEditForm(eventToFormData(event));
    setEditFlyerUrl(event.flyer_image_url ?? null);
    setFlyerChanged(false);
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditFlyerUrl(null);
    setFlyerChanged(false);
    setError('');
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    setSaving(true);
    setError('');

    const payload: Record<string, unknown> = { id: editingId, ...formDataToPayload(editForm) };
    if (flyerChanged) {
      payload.flyer_image_url = editFlyerUrl;
    }

    const res = await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      cancelEdit();
      await loadEvents();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to save');
    }
    setSaving(false);
  }

  async function handleArchive(id: string) {
    await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'archived' }),
    });
    loadEvents();
  }

  async function handleActivate(id: string) {
    await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'active', last_confirmed_at: new Date().toISOString() }),
    });
    loadEvents();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to permanently delete this event?')) return;
    await fetch('/api/admin/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadEvents();
  }

  const dupeMap = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const event of events) {
      map.set(event.id, findDuplicates(event, events));
    }
    return map;
  }, [events]);

  const filtered = events.filter(event => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      event.title.toLowerCase().includes(q) ||
      (event.mosque?.name || '').toLowerCase().includes(q) ||
      (event.venue_name || '').toLowerCase().includes(q) ||
      (event.speaker || '').toLowerCase().includes(q) ||
      (event.event_type || '').toLowerCase().includes(q) ||
      (event.status || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="text-center py-16 text-warm-gray">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-warm-gray hover:text-primary">&larr; Admin</Link>
        <h1 className="text-[28px] font-bold text-charcoal">Events ({filtered.length})</h1>
      </div>

      {events.length > 0 && (
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, venue, speaker, type, status..."
          className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
        />
      )}

      <div className="space-y-3">
        {filtered.map(event => (
          <div key={event.id} className="bg-white border border-sand-dark rounded-card p-4">
            {editingId === event.id && editForm ? (
              <EventEditForm
                form={editForm}
                onChange={(updates) => setEditForm({ ...editForm, ...updates })}
                mosques={mosques}
                onSave={saveEdit}
                onCancel={cancelEdit}
                saving={saving}
                error={error}
                flyerImageUrl={editFlyerUrl}
                onFlyerChange={(url) => { setEditFlyerUrl(url); setFlyerChanged(true); }}
              />
            ) : (
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <EventTypeTag type={event.event_type} />
                      {event.is_kids && <AudienceTag kind="kids" />}
                      {event.is_family && <AudienceTag kind="family" />}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-tag ${
                        event.status === 'active' ? 'bg-sage/20 text-sage-deep' :
                        event.status === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                        event.status === 'archived' ? 'bg-stone/20 text-stone' :
                        'bg-secondary/20 text-secondary-dark'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-charcoal truncate">{event.title}</h3>
                    <p className="text-xs text-warm-gray truncate">
                      {event.mosque?.name || event.venue_name || 'Unknown venue'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" onClick={() => startEdit(event)} className="!text-xs !px-3 !py-1.5">
                      Edit
                    </Button>
                    {event.status === 'active' ? (
                      <Button variant="outline" onClick={() => handleArchive(event.id)} className="!text-xs !px-3 !py-1.5">
                        Archive
                      </Button>
                    ) : (
                      <Button variant="ghost" onClick={() => handleActivate(event.id)} className="!text-xs !px-3 !py-1.5">
                        Activate
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => handleDelete(event.id)} className="!text-xs !px-3 !py-1.5 !text-secondary !border-secondary/30 hover:!border-secondary">
                      Delete
                    </Button>
                  </div>
                </div>
                {(() => {
                  const dupes = dupeMap.get(event.id) || [];
                  if (dupes.length === 0) {
                    return <p className="mt-2 text-xs text-sage-deep">No duplicates found</p>;
                  }
                  return (
                    <div className="mt-2 border-t border-sand-dark pt-2 space-y-1.5">
                      <p className="text-xs font-semibold text-amber-700">
                        Potential duplicate{dupes.length > 1 ? 's' : ''} ({dupes.length})
                      </p>
                      {dupes.map(d => (
                        <div key={d.id} className="bg-amber-50 border border-amber-200 rounded-button px-3 py-2 text-xs space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-charcoal">{d.title}</span>
                            <EventTypeTag type={d.event_type} />
                            <span className={`font-medium px-1.5 py-0.5 rounded-tag ${
                              d.status === 'active' ? 'bg-sage/20 text-sage-deep' :
                              d.status === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                              'bg-stone/20 text-stone'
                            }`}>{d.status}</span>
                          </div>
                          <p className="text-warm-gray">
                            {d.mosque?.name || d.venue_name || 'Unknown venue'}
                            {d.speaker && <> &middot; {d.speaker}</>}
                            {d.fixed_date && <> &middot; {d.fixed_date}</>}
                            {d.fixed_time && <> {d.fixed_time.slice(0, 5)}</>}
                            {d.is_recurring && d.recurrence_pattern && <> &middot; {d.recurrence_pattern}</>}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
