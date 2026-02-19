'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { Amendment } from '@/lib/types';
import Link from 'next/link';

export default function AmendmentsPage() {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAmendments(); }, []);

  async function loadAmendments() {
    setLoading(true);
    const res = await fetch('/api/admin/amendments');
    if (res.ok) {
      const data = await res.json();
      setAmendments(data);
    }
    setLoading(false);
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    await fetch(`/api/admin/amendments/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    loadAmendments();
  }

  const REASON_LABELS: Record<string, string> = {
    ended: 'Event ended',
    wrong_date: 'Wrong date/time',
    wrong_details: 'Wrong details',
    duplicate: 'Duplicate',
    other: 'Other',
  };

  if (loading) {
    return <div className="text-center py-16 text-warm-gray">Loading amendments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-warm-gray hover:text-primary">← Admin</Link>
        <h1 className="text-[28px] font-bold text-charcoal">Amendments ({amendments.length})</h1>
      </div>

      {amendments.length === 0 ? (
        <div className="text-center py-12 bg-sand rounded-card">
          <p className="text-warm-gray">No pending amendments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {amendments.map(amendment => (
            <div key={amendment.id} className="bg-white border border-sand-dark rounded-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block text-xs font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-tag">
                    {REASON_LABELS[amendment.reason] || amendment.reason}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-charcoal">
                    {amendment.event?.title || 'Unknown event'}
                  </h3>
                  <p className="text-sm text-warm-gray">
                    {amendment.event?.mosque?.name || 'Unknown mosque'}
                  </p>
                </div>
                <span className="text-xs text-stone">
                  {new Date(amendment.created_at).toLocaleDateString('en-AU')}
                </span>
              </div>

              {amendment.new_details && Object.keys(amendment.new_details).length > 0 && (
                <div className="bg-sand rounded-button p-3">
                  <p className="text-xs font-semibold text-charcoal mb-1">Proposed changes:</p>
                  <pre className="text-xs text-warm-gray whitespace-pre-wrap">
                    {JSON.stringify(amendment.new_details, null, 2)}
                  </pre>
                </div>
              )}

              {amendment.reporter_contact && (
                <p className="text-xs text-stone">Contact: {amendment.reporter_contact}</p>
              )}

              <div className="flex gap-2">
                <Button variant="primary" onClick={() => handleAction(amendment.id, 'approve')}>
                  Approve
                </Button>
                <Button variant="outline" onClick={() => handleAction(amendment.id, 'reject')}>
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
