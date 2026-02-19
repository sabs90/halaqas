'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { Mosque, EventType, Language, Gender, PrayerName, ParsedEventData } from '@/lib/types';

type Tab = 'image' | 'text' | 'manual';
type Step = 'input' | 'confirm' | 'duplicate_warning' | 'success';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'talk', label: 'Talk' },
  { value: 'class', label: 'Class' },
  { value: 'quran_circle', label: 'Quran Circle' },
  { value: 'iftar', label: 'Iftar' },
  { value: 'taraweeh', label: 'Taraweeh' },
  { value: 'charity', label: 'Charity' },
  { value: 'youth', label: 'Youth' },
  { value: 'sisters_circle', label: 'Sisters Circle' },
  { value: 'other', label: 'Other' },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'other', label: 'Other' },
];

const PRAYERS: { value: PrayerName; label: string }[] = [
  { value: 'fajr', label: 'Fajr' },
  { value: 'dhuhr', label: 'Dhuhr' },
  { value: 'asr', label: 'Asr' },
  { value: 'maghrib', label: 'Maghrib' },
  { value: 'isha', label: 'Isha' },
];

const RECURRENCE_PATTERNS = [
  { value: '', label: 'Not recurring' },
  { value: 'every_monday', label: 'Every Monday' },
  { value: 'every_tuesday', label: 'Every Tuesday' },
  { value: 'every_wednesday', label: 'Every Wednesday' },
  { value: 'every_thursday', label: 'Every Thursday' },
  { value: 'every_friday', label: 'Every Friday' },
  { value: 'every_saturday', label: 'Every Saturday' },
  { value: 'every_sunday', label: 'Every Sunday' },
  { value: 'daily', label: 'Daily' },
  { value: 'daily_ramadan', label: 'Daily (Ramadan)' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
];

interface FormData {
  title: string;
  mosque_id: string;
  venue_name: string;
  venue_address: string;
  venue_latitude: number | null;
  venue_longitude: number | null;
  event_type: EventType;
  speaker: string;
  language: Language;
  gender: Gender;
  time_mode: 'fixed' | 'prayer_anchored';
  fixed_date: string;
  fixed_time: string;
  prayer_anchor: PrayerName | '';
  prayer_offset_minutes: number;
  is_recurring: boolean;
  recurrence_pattern: string;
  description: string;
  submitter_contact: string;
  flyer_image_url: string;
}

const INITIAL_FORM: FormData = {
  title: '',
  mosque_id: '',
  venue_name: '',
  venue_address: '',
  venue_latitude: null,
  venue_longitude: null,
  event_type: 'talk',
  speaker: '',
  language: 'english',
  gender: 'mixed',
  time_mode: 'fixed',
  fixed_date: '',
  fixed_time: '',
  prayer_anchor: '',
  prayer_offset_minutes: 15,
  is_recurring: false,
  recurrence_pattern: '',
  description: '',
  submitter_contact: '',
  flyer_image_url: '',
};

interface DuplicateEvent {
  id: string;
  title: string;
  mosque_id: string | null;
  venue_name: string | null;
  fixed_date: string | null;
  event_type: string;
  speaker: string | null;
}

export default function SubmitPage() {
  const [tab, setTab] = useState<Tab>('image');
  const [step, setStep] = useState<Step>('input');
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState<DuplicateEvent[]>([]);
  const [successType, setSuccessType] = useState<'submitted' | 'amended'>('submitted');
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');
  const [nearbyMosques, setNearbyMosques] = useState<Mosque[]>([]);

  useEffect(() => {
    fetch('/api/mosques')
      .then(r => r.json())
      .then(data => setMosques(data))
      .catch(() => {});
  }, []);

  function updateForm(updates: Partial<FormData>) {
    setForm(prev => ({ ...prev, ...updates }));
  }

  function applyParsedData(parsed: ParsedEventData) {
    const updates: Partial<FormData> = {};
    if (parsed.title) updates.title = parsed.title;
    if (parsed.speaker) updates.speaker = parsed.speaker;
    if (parsed.event_type) updates.event_type = parsed.event_type;
    if (parsed.language) updates.language = parsed.language;
    if (parsed.gender) updates.gender = parsed.gender;
    if (parsed.date) updates.fixed_date = parsed.date;
    if (parsed.time) updates.fixed_time = parsed.time;
    if (parsed.description) updates.description = parsed.description;
    if (parsed.is_recurring) updates.is_recurring = true;
    if (parsed.recurrence_pattern) {
      updates.recurrence_pattern = parsed.recurrence_pattern.replace(/\s+/g, '_').toLowerCase();
    }
    if (parsed.prayer_anchor) {
      updates.time_mode = 'prayer_anchored';
      updates.prayer_anchor = parsed.prayer_anchor;
      if (parsed.prayer_offset) {
        const match = parsed.prayer_offset.match(/(\d+)/);
        if (match) updates.prayer_offset_minutes = parseInt(match[1]);
        else updates.prayer_offset_minutes = 15;
      }
    }
    // Try to match mosque
    if (parsed.mosque_or_venue) {
      const match = mosques.find(m =>
        m.name.toLowerCase().includes(parsed.mosque_or_venue!.toLowerCase()) ||
        parsed.mosque_or_venue!.toLowerCase().includes(m.name.toLowerCase().split('(')[0].trim())
      );
      if (match) updates.mosque_id = match.id;
      else updates.venue_name = parsed.mosque_or_venue;
    }
    if (parsed.venue_address) updates.venue_address = parsed.venue_address;
    updateForm(updates);
    setStep('confirm');
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setError('');
    try {
      const formData = new globalThis.FormData();
      formData.append('image', file);

      const res = await fetch('/api/parse-image', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to parse image');
      const parsed = await res.json();
      applyParsedData(parsed);
    } catch {
      setError('Failed to parse image. Please try again or enter details manually.');
    } finally {
      setParsing(false);
    }
  }

  async function handleTextParse() {
    if (!pasteText.trim()) return;
    setParsing(true);
    setError('');
    try {
      const res = await fetch('/api/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      });
      if (!res.ok) throw new Error('Failed to parse text');
      const parsed = await res.json();
      applyParsedData(parsed);
    } catch {
      setError('Failed to parse text. Please try again or enter details manually.');
    } finally {
      setParsing(false);
    }
  }

  async function handleGeocodeVenue() {
    if (!form.venue_address.trim()) return;
    setGeocodeStatus('loading');
    setNearbyMosques([]);
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: form.venue_address }),
      });
      const data = await res.json();
      if (data.coordinates) {
        updateForm({
          venue_latitude: data.coordinates.lat,
          venue_longitude: data.coordinates.lng,
        });
        setGeocodeStatus('found');
        if (data.nearbyMosques?.length > 0) {
          setNearbyMosques(data.nearbyMosques);
        }
      } else {
        setGeocodeStatus('not_found');
      }
    } catch {
      setGeocodeStatus('not_found');
    }
  }

  async function handleSubmit(force = false) {
    if (!form.title) { setError('Title is required'); return; }
    if (!form.mosque_id && !form.venue_name) { setError('Please select a mosque or enter a venue name'); return; }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          mosque_id: form.mosque_id || null,
          prayer_anchor: form.prayer_anchor || null,
          is_recurring: form.is_recurring || !!form.recurrence_pattern,
          recurrence_pattern: form.recurrence_pattern || null,
          force,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setDuplicates(data.duplicates);
        setStep('duplicate_warning');
        return;
      }

      if (!res.ok) throw new Error('Failed to submit event');
      setSuccessType('submitted');
      setStep('success');
    } catch {
      setError('Failed to submit event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateExisting(eventId: string) {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/events/${eventId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'wrong_details',
          new_details: {
            title: form.title,
            speaker: form.speaker,
            event_type: form.event_type,
            language: form.language,
            gender: form.gender,
            fixed_date: form.fixed_date,
            fixed_time: form.fixed_time,
            description: form.description,
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to submit update');
      setSuccessType('amended');
      setStep('success');
    } catch {
      setError('Failed to submit update. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="text-[28px] font-bold text-charcoal">
          {successType === 'amended' ? 'Update Submitted!' : 'Event Submitted!'}
        </h1>
        <p className="text-warm-gray">
          {successType === 'amended'
            ? 'Your suggested changes will be reviewed shortly. Thank you for helping keep things accurate!'
            : 'Your event is now live on Halaqas. Thank you for contributing!'}
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Button variant="primary" href="/events">View Events</Button>
          <Button variant="outline" onClick={() => { setStep('input'); setForm(INITIAL_FORM); setDuplicates([]); setSuccessType('submitted'); }}>
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'duplicate_warning') {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-[28px] font-bold text-charcoal">Similar Event Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-card p-4 text-sm text-amber-800">
          We found an existing event that looks similar to what you&apos;re submitting.
        </div>

        {duplicates.map(dup => {
          const mosque = mosques.find(m => m.id === dup.mosque_id);
          return (
            <div key={dup.id} className="bg-white border border-sand-dark rounded-card p-4 space-y-2">
              <h3 className="font-semibold text-charcoal">{dup.title}</h3>
              <div className="text-sm text-warm-gray space-y-1">
                {mosque && <p>At: {mosque.name}</p>}
                {dup.venue_name && <p>Venue: {dup.venue_name}</p>}
                {dup.fixed_date && <p>Date: {dup.fixed_date}</p>}
                {dup.speaker && <p>Speaker: {dup.speaker}</p>}
              </div>
              <Button
                variant="outline"
                onClick={() => handleUpdateExisting(dup.id)}
                disabled={submitting}
              >
                Update this event&apos;s details
              </Button>
            </div>
          );
        })}

        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'This is different — submit anyway'}
          </Button>
          <Button variant="outline" onClick={() => { setStep('confirm'); setDuplicates([]); }}>
            Cancel — go back to editing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-[28px] font-bold text-charcoal">Submit an Event</h1>
      <p className="text-sm text-warm-gray">
        Share an event with the community. Upload a flyer, paste a message, or fill in the details manually.
      </p>

      {error && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-card p-3 text-sm text-secondary-dark">
          {error}
        </div>
      )}

      {step === 'input' && (
        <>
          {/* Tab selector */}
          <div className="flex gap-1 bg-sand rounded-card p-1">
            {[
              { id: 'image' as Tab, label: 'Upload Flyer', icon: '📷' },
              { id: 'text' as Tab, label: 'Paste Text', icon: '📋' },
              { id: 'manual' as Tab, label: 'Manual Entry', icon: '✏️' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 text-sm font-medium py-2.5 rounded-button transition-colors ${
                  tab === t.id ? 'bg-white text-charcoal shadow-sm' : 'text-warm-gray hover:text-charcoal'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab === 'image' && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-sand-dark rounded-card p-10 cursor-pointer hover:border-primary transition-colors">
                <svg className="w-10 h-10 text-stone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-sm text-warm-gray">
                  {parsing ? 'Parsing flyer with AI...' : 'Click to upload a flyer image'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={parsing} />
              </label>
              {parsing && (
                <div className="text-center text-sm text-primary animate-pulse">
                  AI is extracting event details from your flyer...
                </div>
              )}
            </div>
          )}

          {tab === 'text' && (
            <div className="space-y-4">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste a WhatsApp message or text about the event here..."
                className="w-full text-sm rounded-card border border-sand-dark p-4 bg-white text-charcoal placeholder:text-stone resize-none min-h-[160px]"
              />
              <Button variant="primary" onClick={handleTextParse} disabled={parsing || !pasteText.trim()}>
                {parsing ? 'Parsing...' : 'Extract Details'}
              </Button>
            </div>
          )}

          {tab === 'manual' && (
            <Button variant="primary" onClick={() => setStep('confirm')}>
              Continue to Form
            </Button>
          )}
        </>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-sand/50 rounded-card p-3 text-sm text-warm-gray">
            Review and edit the details below before submitting.
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Event Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="e.g. Tafseer of Surah Al-Kahf"
              className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
            />
          </div>

          {/* Mosque / Venue */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Mosque / Venue *</label>
            <select
              value={form.mosque_id}
              onChange={(e) => {
                updateForm({ mosque_id: e.target.value, venue_name: '', venue_address: '', venue_latitude: null, venue_longitude: null });
                setNearbyMosques([]);
                setGeocodeStatus('idle');
              }}
              className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
            >
              <option value="">Other venue (enter below)</option>
              {mosques.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {!form.mosque_id && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={form.venue_name}
                  onChange={(e) => updateForm({ venue_name: e.target.value })}
                  placeholder="Venue name"
                  className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
                />
                <input
                  type="text"
                  value={form.venue_address}
                  onChange={(e) => updateForm({ venue_address: e.target.value })}
                  onBlur={handleGeocodeVenue}
                  placeholder="Venue address"
                  className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
                />
                {geocodeStatus === 'loading' && (
                  <p className="text-xs text-warm-gray animate-pulse">Looking up address...</p>
                )}
                {geocodeStatus === 'found' && (
                  <p className="text-xs text-green-600">Location found — event will appear on the map</p>
                )}
                {geocodeStatus === 'not_found' && (
                  <p className="text-xs text-amber-600">Couldn&apos;t locate address — event won&apos;t appear on the map</p>
                )}
                {nearbyMosques.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-card p-3 space-y-2">
                    <p className="text-xs font-medium text-blue-800">Did you mean one of these mosques?</p>
                    {nearbyMosques.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          updateForm({ mosque_id: m.id, venue_name: '', venue_address: '', venue_latitude: null, venue_longitude: null });
                          setNearbyMosques([]);
                          setGeocodeStatus('idle');
                        }}
                        className="block w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        {m.name} — {m.address}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Event Type + Language + Gender */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">Type</label>
              <select value={form.event_type} onChange={(e) => updateForm({ event_type: e.target.value as EventType })}
                className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal">
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">Language</label>
              <select value={form.language} onChange={(e) => updateForm({ language: e.target.value as Language })}
                className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal">
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">Gender</label>
              <select value={form.gender} onChange={(e) => updateForm({ gender: e.target.value as Gender })}
                className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal">
                <option value="mixed">Mixed</option>
                <option value="brothers">Brothers</option>
                <option value="sisters">Sisters</option>
              </select>
            </div>
          </div>

          {/* Speaker */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Speaker</label>
            <input
              type="text"
              value={form.speaker}
              onChange={(e) => updateForm({ speaker: e.target.value })}
              placeholder="Speaker name (optional)"
              className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
            />
          </div>

          {/* Time Mode */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Time</label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => updateForm({ time_mode: 'fixed' })}
                className={`text-sm font-medium px-3 py-1.5 rounded-pill transition-colors ${
                  form.time_mode === 'fixed' ? 'bg-primary text-white' : 'bg-sand text-warm-gray'
                }`}
              >
                Fixed time
              </button>
              <button
                onClick={() => updateForm({ time_mode: 'prayer_anchored' })}
                className={`text-sm font-medium px-3 py-1.5 rounded-pill transition-colors ${
                  form.time_mode === 'prayer_anchored' ? 'bg-primary text-white' : 'bg-sand text-warm-gray'
                }`}
              >
                After prayer
              </button>
            </div>

            {form.time_mode === 'fixed' ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="date"
                  value={form.fixed_date}
                  onChange={(e) => updateForm({ fixed_date: e.target.value })}
                  className="text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                />
                <input
                  type="time"
                  value={form.fixed_time}
                  onChange={(e) => updateForm({ fixed_time: e.target.value })}
                  className="text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                />
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  value={form.prayer_anchor}
                  onChange={(e) => updateForm({ prayer_anchor: e.target.value as PrayerName })}
                  className="text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                >
                  <option value="">Select prayer</option>
                  {PRAYERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.prayer_offset_minutes}
                    onChange={(e) => updateForm({ prayer_offset_minutes: parseInt(e.target.value) || 0 })}
                    className="w-20 text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
                    min={0}
                    max={120}
                  />
                  <span className="text-sm text-warm-gray">minutes after</span>
                </div>
              </div>
            )}
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Recurrence</label>
            <select
              value={form.recurrence_pattern}
              onChange={(e) => updateForm({ recurrence_pattern: e.target.value, is_recurring: !!e.target.value })}
              className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
            >
              {RECURRENCE_PATTERNS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm({ description: e.target.value })}
              placeholder="Any additional details (optional)"
              className="w-full text-sm rounded-card border border-sand-dark p-3 bg-white text-charcoal placeholder:text-stone resize-none"
              rows={3}
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Your Contact (optional)</label>
            <input
              type="text"
              value={form.submitter_contact}
              onChange={(e) => updateForm({ submitter_contact: e.target.value })}
              placeholder="Email or phone — not displayed publicly"
              className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => handleSubmit()} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Event'}
            </Button>
            <Button variant="outline" onClick={() => setStep('input')}>
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
