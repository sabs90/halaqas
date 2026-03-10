'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { EventTypeTag } from '@/components/events/EventTypeTag';
import EventEditForm, { eventToFormData, formDataToPayload } from '@/components/admin/EventEditForm';
import type { EventFormData } from '@/components/admin/EventEditForm';
import type { Event, Mosque } from '@/lib/types';
import { formatRecurrenceLabel } from '@/lib/recurrence';
import Link from 'next/link';

const GENDER_LABELS: Record<string, string> = {
  mixed: 'Both',
  brothers: 'Brothers',
  sisters: 'Sisters',
};

const LANGUAGE_LABELS: Record<string, string> = {
  english: 'English',
  arabic: 'Arabic',
  urdu: 'Urdu',
  turkish: 'Turkish',
  bahasa: 'Bahasa',
  mixed: 'Mixed',
  other: 'Other',
};

export default function ReviewPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventFormData | null>(null);
  const [editFlyerUrl, setEditFlyerUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [search, setSearch] = useState('');
  const [approvingAll, setApprovingAll] = useState(false);

  useEffect(() => { loadEvents(); loadMosques(); }, []);

  async function loadEvents() {
    setLoading(true);
    const res = await fetch('/api/admin/review');
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
    setEditFlyerUrl(event.flyer_image_url);
    setEditError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditFlyerUrl(null);
    setEditError('');
  }

  async function saveAndApprove() {
    if (!editingId || !editForm) return;
    setSaving(true);
    setEditError('');

    // 1. PATCH edits (include flyer URL change)
    const patchRes = await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, ...formDataToPayload(editForm), flyer_image_url: editFlyerUrl }),
    });

    if (!patchRes.ok) {
      const data = await patchRes.json();
      setEditError(data.error || 'Failed to save edits');
      setSaving(false);
      return;
    }

    // 2. Approve
    await fetch('/api/admin/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, action: 'approve' }),
    });

    setSaving(false);
    cancelEdit();
    loadEvents();
  }

  async function handleApproveAll() {
    const target = filtered.length < events.length ? 'filtered' : 'all';
    const count = filtered.length;
    if (!confirm(`Approve ${target} ${count} submission${count === 1 ? '' : 's'}?`)) return;
    setApprovingAll(true);
    const ids = filtered.map(e => e.id);
    await fetch('/api/admin/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action: 'approve' }),
    });
    setApprovingAll(false);
    loadEvents();
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    if (action === 'reject' && !confirm('Reject and permanently delete this submission?')) return;
    setActing(id);
    await fetch('/api/admin/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    setActing(null);
    loadEvents();
  }

  function formatTime(event: Event) {
    if (event.time_mode === 'prayer_anchored' && event.prayer_anchor) {
      const offset = event.prayer_offset_minutes || 0;
      return `${offset} min after ${event.prayer_anchor}`;
    }
    const parts: string[] = [];
    if (event.fixed_date) parts.push(event.fixed_date);
    if (event.fixed_time) parts.push(event.fixed_time.slice(0, 5));
    return parts.join(' at ') || 'No time set';
  }

  function formatRecurrence(event: Event) {
    if (!event.is_recurring || !event.recurrence_pattern) return null;
    const label = formatRecurrenceLabel(event.recurrence_pattern, event.recurrence_days);
    const end = event.recurrence_end_date ? ` (until ${event.recurrence_end_date})` : '';
    return (label || '') + end;
  }

  const filtered = events.filter(event => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      event.title.toLowerCase().includes(q) ||
      (event.mosque?.name || '').toLowerCase().includes(q) ||
      (event.venue_name || '').toLowerCase().includes(q) ||
      (event.speaker || '').toLowerCase().includes(q) ||
      (event.description || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="text-center py-16 text-warm-gray">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin" className="text-sm text-warm-gray hover:text-primary">&larr; Admin</Link>
        <h1 className="text-[28px] font-bold text-charcoal">Review Submissions ({filtered.length})</h1>
        {filtered.length > 1 && (
          <Button
            variant="primary"
            onClick={handleApproveAll}
            disabled={approvingAll}
          >
            {approvingAll ? 'Approving...' : `Approve All (${filtered.length})`}
          </Button>
        )}
      </div>

      {events.length > 0 && (
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, venue, speaker..."
          className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
        />
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-sand rounded-card">
          <p className="text-warm-gray">{search ? 'No submissions match your search.' : 'No submissions to review.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(event => (
            <div key={event.id} className="bg-white border border-sand-dark rounded-card p-5 space-y-3">
              {editingId === event.id && editForm ? (
                <EventEditForm
                  form={editForm}
                  onChange={(updates) => setEditForm({ ...editForm, ...updates })}
                  mosques={mosques}
                  onSave={saveAndApprove}
                  onCancel={cancelEdit}
                  saving={saving}
                  error={editError}
                  saveLabel="Save & Approve"
                  flyerImageUrl={editFlyerUrl}
                  onFlyerChange={setEditFlyerUrl}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <EventTypeTag type={event.event_type} />
                        <span className="text-xs font-medium px-2 py-0.5 rounded-tag bg-amber-100 text-amber-800">
                          pending review
                        </span>
                        <span className="text-xs text-stone px-2 py-0.5 rounded-tag bg-sand">
                          {LANGUAGE_LABELS[event.language] || event.language}
                        </span>
                        <span className="text-xs text-stone px-2 py-0.5 rounded-tag bg-sand">
                          {GENDER_LABELS[event.gender] || event.gender}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-charcoal">{event.title}</h3>
                      <p className="text-sm text-warm-gray">
                        {event.mosque?.name || event.venue_name || 'Unknown venue'}
                        {event.venue_address && !event.mosque && (
                          <span className="text-stone"> — {event.venue_address}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-stone shrink-0">
                      {new Date(event.created_at).toLocaleDateString('en-AU')}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="font-medium text-charcoal">Time: </span>
                      <span className="text-warm-gray">{formatTime(event)}</span>
                    </div>
                    {event.speaker && (
                      <div>
                        <span className="font-medium text-charcoal">Speaker: </span>
                        <span className="text-warm-gray">{event.speaker}</span>
                      </div>
                    )}
                    {formatRecurrence(event) && (
                      <div>
                        <span className="font-medium text-charcoal">Recurrence: </span>
                        <span className="text-warm-gray">{formatRecurrence(event)}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm text-warm-gray bg-sand/50 rounded-button p-3">{event.description}</p>
                  )}

                  {event.flyer_image_url && (
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.flyer_image_url}
                        alt="Flyer"
                        className="max-w-xs rounded-card border border-sand-dark"
                      />
                    </div>
                  )}

                  {event.submitter_contact && (
                    <p className="text-xs text-stone">Submitter: {event.submitter_contact}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="primary"
                      onClick={() => handleAction(event.id, 'approve')}
                      disabled={acting === event.id}
                    >
                      {acting === event.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => startEdit(event)}
                      disabled={acting === event.id}
                    >
                      Edit & Review
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction(event.id, 'reject')}
                      disabled={acting === event.id}
                      className="!text-secondary !border-secondary/30 hover:!border-secondary"
                    >
                      Reject
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
