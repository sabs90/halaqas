'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function SuggestMosquePage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  async function handleGeocodeAddress() {
    if (!address.trim()) return;
    setGeocodeStatus('loading');
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (data.coordinates) {
        setLatitude(data.coordinates.lat);
        setLongitude(data.coordinates.lng);
        setGeocodeStatus('found');
      } else {
        setGeocodeStatus('not_found');
      }
    } catch {
      setGeocodeStatus('not_found');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Mosque name is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/mosques/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim() || null,
          suburb: suburb.trim() || null,
          latitude,
          longitude,
          suggested_by_contact: contact.trim() || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
    } catch {
      setError('Failed to submit suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="text-[28px] font-bold text-charcoal">Mosque Submitted!</h1>
        <p className="text-warm-gray">
          Thank you for your suggestion. We&apos;ll review it and add it to the directory shortly.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Button variant="primary" href="/mosques">Browse Mosques</Button>
          <Button variant="outline" onClick={() => {
            setSubmitted(false);
            setName('');
            setAddress('');
            setSuburb('');
            setContact('');
            setLatitude(null);
            setLongitude(null);
            setGeocodeStatus('idle');
          }}>
            Suggest Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-[28px] font-bold text-charcoal">Suggest a Mosque</h1>
      <p className="text-sm text-warm-gray">
        Can&apos;t find your mosque in our directory? Let us know and we&apos;ll add it.
      </p>

      {error && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-card p-3 text-sm text-secondary-dark">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Mosque Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Masjid Al-Noor"
            className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={handleGeocodeAddress}
            placeholder="Full street address"
            className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
          />
          {geocodeStatus === 'loading' && (
            <p className="text-xs text-warm-gray mt-1 animate-pulse">Looking up address...</p>
          )}
          {geocodeStatus === 'found' && (
            <p className="text-xs text-green-600 mt-1">Location found — mosque will appear on the map</p>
          )}
          {geocodeStatus === 'not_found' && (
            <p className="text-xs text-amber-600 mt-1">Couldn&apos;t locate address — we&apos;ll look it up manually</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Suburb</label>
          <input
            type="text"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            placeholder="e.g. Lakemba"
            className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Your Contact (optional)</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or phone — in case we need to check details"
            className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
          />
        </div>

        <Button variant="secondary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Suggestion'}
        </Button>
      </form>
    </div>
  );
}
