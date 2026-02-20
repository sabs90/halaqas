'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          contact: contact || null,
          message,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="text-[28px] font-bold text-charcoal">Message Sent!</h1>
        <p className="text-warm-gray">
          Thank you for reaching out. We&apos;ll review your message shortly.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Button variant="primary" href="/events">Browse Events</Button>
          <Button variant="outline" onClick={() => {
            setSubmitted(false);
            setName('');
            setContact('');
            setMessage('');
          }}>
            Send Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-[28px] font-bold text-charcoal">Contact Us</h1>
      <p className="text-sm text-warm-gray">
        Have feedback, a question, or a suggestion? Send us a message and we&apos;ll get back to you.
      </p>

      {error && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-card p-3 text-sm text-secondary-dark">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Contact info (optional)</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or phone — so we can reply"
            className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full text-sm rounded-card border border-sand-dark p-3 bg-white text-charcoal placeholder:text-stone resize-none"
            rows={5}
          />
        </div>

        <Button variant="secondary" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}
