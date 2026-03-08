'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { EventTypeTag, AudienceTag } from '@/components/events/EventTypeTag';
import EventEditForm, { eventToFormData, formDataToPayload } from '@/components/admin/EventEditForm';
import type { EventFormData } from '@/components/admin/EventEditForm';
import type { Event, Mosque } from '@/lib/types';
import Link from 'next/link';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadEvents(); loadMosques(); }, []);

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
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setError('');
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    setSaving(true);
    setError('');

    const res = await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, ...formDataToPayload(editForm) }),
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

  if (loading) {
    return <div className="text-center py-16 text-warm-gray">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-warm-gray hover:text-primary">&larr; Admin</Link>
        <h1 className="text-[28px] font-bold text-charcoal">Events ({events.length})</h1>
      </div>

      <div className="space-y-3">
        {events.map(event => (
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
              />
            ) : (
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
