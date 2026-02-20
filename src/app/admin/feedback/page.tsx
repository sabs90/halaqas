'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { Feedback } from '@/lib/types';
import Link from 'next/link';

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFeedback(); }, []);

  async function loadFeedback() {
    setLoading(true);
    const res = await fetch('/api/admin/feedback');
    if (res.ok) setFeedback(await res.json());
    setLoading(false);
  }

  async function handleMarkRead(id: string) {
    await fetch('/api/admin/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadFeedback();
  }

  if (loading) {
    return <div className="text-center py-16 text-warm-gray">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-warm-gray hover:text-primary">&larr; Admin</Link>
        <h1 className="text-[28px] font-bold text-charcoal">Feedback ({feedback.length})</h1>
      </div>

      {feedback.length === 0 ? (
        <div className="text-center py-12 bg-sand rounded-card">
          <p className="text-warm-gray">No new feedback.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map(f => (
            <div key={f.id} className="bg-white border border-sand-dark rounded-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  {f.name && <h3 className="text-base font-bold text-charcoal">{f.name}</h3>}
                  {f.contact && <p className="text-sm text-warm-gray">{f.contact}</p>}
                </div>
                <span className="text-xs text-stone">
                  {new Date(f.created_at).toLocaleDateString('en-AU')}
                </span>
              </div>

              <p className="text-sm text-charcoal whitespace-pre-wrap">{f.message}</p>

              <Button variant="outline" onClick={() => handleMarkRead(f.id)}>
                Mark as Read
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
