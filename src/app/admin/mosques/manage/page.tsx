'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { Mosque } from '@/lib/types';
import Link from 'next/link';

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

export default function ManageMosquesPage() {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Mosque>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadMosques(); }, []);

  async function loadMosques() {
    setLoading(true);
    const res = await fetch('/api/admin/mosques?list=all');
    if (res.ok) setMosques(await res.json());
    setLoading(false);
  }

  function startEdit(mosque: Mosque) {
    setEditingId(mosque.id);
    setEditForm({
      name: mosque.name,
      address: mosque.address,
      suburb: mosque.suburb,
      state: mosque.state,
      latitude: mosque.latitude,
      longitude: mosque.longitude,
      nicknames: mosque.nicknames,
      active: mosque.active,
    });
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
    setError('');
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    setError('');

    const res = await fetch('/api/admin/mosques', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, ...editForm }),
    });

    if (res.ok) {
      setEditingId(null);
      setEditForm({});
      await loadMosques();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to save');
    }
    setSaving(false);
  }

  const filtered = mosques.filter(m => {
    if (stateFilter && m.state !== stateFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.suburb.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q) ||
        m.nicknames?.some(n => n.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (loading) {
    return <div className="text-center py-16 text-warm-gray">Loading mosques...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-warm-gray hover:text-primary">← Admin</Link>
        <h1 className="text-[28px] font-bold text-charcoal">Mosques ({filtered.length})</h1>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, suburb, address..."
          className="flex-1 text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
        />
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          className="text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
        >
          <option value="">All states</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(mosque => (
          <div key={mosque.id} className="bg-white border border-sand-dark rounded-card p-4">
            {editingId === mosque.id ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Suburb</label>
                    <input
                      type="text"
                      value={editForm.suburb || ''}
                      onChange={e => setEditForm({ ...editForm, suburb: e.target.value })}
                      className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.address || ''}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">State</label>
                    <select
                      value={editForm.state || ''}
                      onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                      className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                    >
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.latitude ?? ''}
                      onChange={e => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.longitude ?? ''}
                      onChange={e => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.active ?? true}
                        onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
                        className="rounded"
                      />
                      Active
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Nicknames (comma-separated)</label>
                  <input
                    type="text"
                    value={(editForm.nicknames || []).join(', ')}
                    onChange={e => setEditForm({
                      ...editForm,
                      nicknames: e.target.value ? e.target.value.split(',').map(n => n.trim()).filter(Boolean) : [],
                    })}
                    className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                    placeholder="e.g. Lakemba Mosque, Big Mosque"
                  />
                </div>
                {error && <p className="text-sm text-secondary">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="primary" onClick={saveEdit} disabled={saving} className="!text-xs !px-3 !py-1.5">
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit} className="!text-xs !px-3 !py-1.5">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-tag bg-primary/10 text-primary">
                      {mosque.state}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-tag ${
                      mosque.active ? 'bg-sage/20 text-sage-deep' : 'bg-stone/20 text-stone'
                    }`}>
                      {mosque.active ? 'active' : 'inactive'}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-charcoal truncate">{mosque.name}</h3>
                  <p className="text-xs text-warm-gray truncate">{mosque.address}</p>
                  {mosque.nicknames?.length > 0 && (
                    <p className="text-xs text-stone truncate">aka: {mosque.nicknames.join(', ')}</p>
                  )}
                </div>
                <Button variant="outline" onClick={() => startEdit(mosque)} className="!text-xs !px-3 !py-1.5 shrink-0">
                  Edit
                </Button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-warm-gray py-8">No mosques match your search.</p>
        )}
      </div>
    </div>
  );
}
