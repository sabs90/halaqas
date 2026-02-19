'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { AmendmentReason } from '@/lib/types';

const REASONS: { value: AmendmentReason; label: string }[] = [
  { value: 'ended', label: 'This event has ended' },
  { value: 'wrong_date', label: 'Wrong date or time' },
  { value: 'wrong_details', label: 'Wrong details' },
  { value: 'duplicate', label: 'Duplicate listing' },
  { value: 'other', label: 'Other' },
];

export function ReportButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<AmendmentReason | ''>('');
  const [details, setDetails] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          new_details: details ? { notes: details } : {},
          reporter_contact: contact || null,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="text-sm text-sage-deep font-medium flex items-center gap-1">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Report submitted. Thank you!
      </p>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Report Issue
      </Button>
    );
  }

  return (
    <div className="w-full bg-sand rounded-card p-4 space-y-3">
      <h3 className="text-sm font-bold text-charcoal">Report an Issue</h3>

      <div className="space-y-2">
        {REASONS.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-2 text-sm text-warm-gray cursor-pointer">
            <input
              type="radio"
              name="reason"
              value={value}
              checked={reason === value}
              onChange={() => setReason(value)}
              className="accent-primary"
            />
            {label}
          </label>
        ))}
      </div>

      {(reason === 'wrong_details' || reason === 'other') && (
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Please describe the issue..."
          className="w-full text-sm rounded-button border border-sand-dark p-3 bg-white text-charcoal placeholder:text-stone resize-none"
          rows={3}
        />
      )}

      <input
        type="text"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Your email or phone (optional)"
        className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
      />

      <div className="flex gap-2">
        <Button variant="primary" onClick={handleSubmit} disabled={!reason || submitting}>
          {submitting ? 'Submitting...' : 'Submit Report'}
        </Button>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
