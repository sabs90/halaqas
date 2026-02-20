'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { MosqueSuggestion } from '@/lib/types';
import Link from 'next/link';

export default function AdminMosquesPage() {
  const [suggestions, setSuggestions] = useState<MosqueSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSuggestions(); }, []);

  async function loadSuggestions() {
    setLoading(true);
    const res = await fetch('/api/admin/mosques');
    if (res.ok) setSuggestions(await res.json());
    setLoading(false);
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    await fetch('/api/admin/mosques', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    loadSuggestions();
  }

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
          {suggestions.map(s => (
            <div key={s.id} className="bg-white border border-sand-dark rounded-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-charcoal">{s.name}</h3>
                  {s.address && <p className="text-sm text-warm-gray">{s.address}</p>}
                  {s.suburb && <p className="text-sm text-warm-gray">Suburb: {s.suburb}</p>}
                  {s.latitude && s.longitude && (
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

              <div className="flex gap-2">
                <Button variant="primary" onClick={() => handleAction(s.id, 'approve')}>
                  Approve
                </Button>
                <Button variant="outline" onClick={() => handleAction(s.id, 'reject')}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
