'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { MosqueSuggestion } from '@/lib/types';
import Link from 'next/link';

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

interface EditableSuggestion {
  name: string;
  address: string;
  suburb: string;
  state: string;
  latitude: string;
  longitude: string;
  nicknames: string;
  facebook_url: string;
  website_url: string;
}

export default function AdminMosquesPage() {
  const [suggestions, setSuggestions] = useState<MosqueSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditableSuggestion>({
    name: '', address: '', suburb: '', state: 'NSW', latitude: '', longitude: '', nicknames: '', facebook_url: '', website_url: '',
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<'success' | 'not_found' | 'error' | null>(null);

  useEffect(() => { loadSuggestions(); }, []);

  async function loadSuggestions() {
    setLoading(true);
    const res = await fetch('/api/admin/mosques');
    if (res.ok) setSuggestions(await res.json());
    setLoading(false);
  }

  function startEditing(s: MosqueSuggestion) {
    setEditingId(s.id);
    setGeocodeStatus(null);
    setEditForm({
      name: s.name,
      address: s.address || '',
      suburb: s.suburb || '',
      state: 'NSW',
      latitude: s.latitude != null ? String(s.latitude) : '',
      longitude: s.longitude != null ? String(s.longitude) : '',
      nicknames: '',
      facebook_url: '',
      website_url: '',
    });
  }

  async function geocodeAddress() {
    const address = [editForm.address, editForm.suburb, editForm.state].filter(Boolean).join(', ');
    if (!address) return;
    setGeocoding(true);
    setGeocodeStatus(null);
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.coordinates) {
          setEditForm(f => ({
            ...f,
            latitude: String(data.coordinates.lat),
            longitude: String(data.coordinates.lng),
          }));
          setGeocodeStatus('success');
        } else {
          setGeocodeStatus('not_found');
        }
      } else {
        setGeocodeStatus('error');
      }
    } catch {
      setGeocodeStatus('error');
    } finally {
      setGeocoding(false);
    }
  }

  function openEditing(s: MosqueSuggestion) {
    if (editingId === s.id) {
      setEditingId(null);
    } else {
      startEditing(s);
    }
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActionLoading(id);
    const body: Record<string, unknown> = { id, action };

    if (action === 'approve') {
      body.overrides = {
        name: editForm.name.trim(),
        address: editForm.address.trim(),
        suburb: editForm.suburb.trim(),
        state: editForm.state,
        latitude: editForm.latitude ? parseFloat(editForm.latitude) : 0,
        longitude: editForm.longitude ? parseFloat(editForm.longitude) : 0,
        nicknames: editForm.nicknames.trim()
          ? editForm.nicknames.split(',').map(n => n.trim()).filter(Boolean)
          : [],
        facebook_url: editForm.facebook_url.trim() || null,
        website_url: editForm.website_url.trim() || null,
      };
    }

    const res = await fetch('/api/admin/mosques', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok && action === 'approve') {
      const data = await res.json();
      if (data.linked_events > 0) {
        alert(`Mosque approved! ${data.linked_events} event(s) auto-linked.`);
      }
    }
    setEditingId(null);
    setActionLoading(null);
    loadSuggestions();
  }

  const inputClass = 'text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone w-full';

  if (loading) {
    return <div className="text-center py-16 text-warm-gray">Loading suggestions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-warm-gray hover:text-primary">&larr; Admin</Link>
        <h1 className="text-[28px] font-bold text-charcoal">Mosque Suggestions ({suggestions.length})</h1>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-12 bg-sand rounded-card">
          <p className="text-warm-gray">No pending mosque suggestions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map(s => {
            const isEditing = editingId === s.id;
            const isLoading = actionLoading === s.id;

            return (
              <div key={s.id} className="bg-white border border-sand-dark rounded-card p-5 space-y-3">
                {/* Header: submitted info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-charcoal">{s.name}</h3>
                    {s.address && <p className="text-sm text-warm-gray">{s.address}</p>}
                    {s.suburb && <p className="text-sm text-warm-gray">Suburb: {s.suburb}</p>}
                    {s.latitude != null && s.longitude != null && (
                      <p className="text-xs text-stone">Coords: {s.latitude}, {s.longitude}</p>
                    )}
                  </div>
                  <span className="text-xs text-stone">
                    {new Date(s.created_at).toLocaleDateString('en-AU')}
                  </span>
                </div>

                {s.suggested_by_contact && (
                  <p className="text-xs text-stone">Contact: {s.suggested_by_contact}</p>
                )}

                {/* Expand/collapse edit form */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openEditing(s)}
                  >
                    {isEditing ? 'Collapse' : 'Review & Edit'}
                  </Button>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        startEditing(s);
                        handleAction(s.id, 'reject');
                      }}
                      disabled={isLoading}
                    >
                      Reject
                    </Button>
                  )}
                </div>

                {/* Editable fields */}
                {isEditing && (
                  <div className="border-t border-sand-dark pt-4 space-y-3">
                    <p className="text-xs font-semibold text-warm-gray uppercase tracking-wide">Edit before approving</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-charcoal mb-1">Name *</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={editForm.name}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-charcoal mb-1">Address</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className={inputClass}
                            value={editForm.address}
                            onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="text-xs text-primary hover:text-primary-dark font-medium whitespace-nowrap px-2 disabled:opacity-50"
                            onClick={geocodeAddress}
                            disabled={geocoding || !editForm.address.trim()}
                            title="Fetch coordinates from address"
                          >
                            {geocoding ? 'Looking up...' : 'Geocode'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-charcoal mb-1">Suburb</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={editForm.suburb}
                          onChange={e => setEditForm(f => ({ ...f, suburb: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-charcoal mb-1">State</label>
                        <select
                          className={inputClass}
                          value={editForm.state}
                          onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))}
                        >
                          {STATES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-charcoal mb-1">Latitude</label>
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="-33.8688"
                          value={editForm.latitude}
                          onChange={e => setEditForm(f => ({ ...f, latitude: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-charcoal mb-1">Longitude</label>
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="151.2093"
                          value={editForm.longitude}
                          onChange={e => setEditForm(f => ({ ...f, longitude: e.target.value }))}
                        />
                      </div>
                    </div>

                    {geocodeStatus && (
                      <p className={`text-xs ${geocodeStatus === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                        {geocodeStatus === 'success' && 'Coordinates updated from address.'}
                        {geocodeStatus === 'not_found' && 'No coordinates found for this address. Try a more specific address.'}
                        {geocodeStatus === 'error' && 'Geocode request failed. Try again.'}
                      </p>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-charcoal mb-1">Nicknames (comma-separated)</label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="e.g. Lakemba Mosque, Big Mosque"
                        value={editForm.nicknames}
                        onChange={e => setEditForm(f => ({ ...f, nicknames: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-charcoal mb-1">Facebook URL</label>
                        <input
                          type="url"
                          className={inputClass}
                          placeholder="https://facebook.com/mosquepage"
                          value={editForm.facebook_url}
                          onChange={e => setEditForm(f => ({ ...f, facebook_url: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-charcoal mb-1">Website URL</label>
                        <input
                          type="url"
                          className={inputClass}
                          placeholder="https://mosque.org.au"
                          value={editForm.website_url}
                          onChange={e => setEditForm(f => ({ ...f, website_url: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="primary"
                        onClick={() => handleAction(s.id, 'approve')}
                        disabled={isLoading || !editForm.name.trim()}
                      >
                        {isLoading ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAction(s.id, 'reject')}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
