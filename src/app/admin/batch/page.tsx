'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import type { Mosque, EventType, Language, Gender, PrayerName, ParsedEventData } from '@/lib/types';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'talk', label: 'Talk' },
  { value: 'class', label: 'Class' },
  { value: 'quran_circle', label: 'Quran Circle' },
  { value: 'iftar', label: 'Iftar' },
  { value: 'taraweeh', label: 'Taraweeh' },
  { value: 'charity', label: 'Charity' },
  { value: 'youth', label: 'Youth' },
  { value: 'tahajjud', label: 'Tahajjud' },
  { value: 'itikaf', label: "I'tikaf" },
  { value: 'sisters_circle', label: 'Sisters Circle' },
  { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },
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

type Step = 'upload' | 'review' | 'submit';

interface FlyerStatus {
  file: File;
  thumbnail: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

interface BatchEvent {
  id: string; // client-side ID for tracking
  flyerIndex: number;
  included: boolean;
  // Editable fields
  title: string;
  mosque_id: string;
  venue_name: string;
  venue_address: string;
  event_type: EventType;
  language: Language;
  gender: Gender;
  speaker: string;
  time_mode: 'fixed' | 'prayer_anchored';
  fixed_date: string;
  fixed_time: string;
  prayer_anchor: PrayerName | '';
  prayer_offset_minutes: number;
  is_recurring: boolean;
  recurrence_pattern: string;
  recurrence_end_date: string;
  is_kids: boolean;
  is_family: boolean;
  description: string;
  flyer_image_url: string;
  confidence: number;
}

interface SubmitResult {
  eventId: string;
  title: string;
  success: boolean;
  duplicate?: boolean;
  error?: string;
}

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX_WIDTH = 800;
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round(height * (MAX_WIDTH / width));
        width = MAX_WIDTH;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.6
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

function matchMosque(venueName: string, mosques: Mosque[]): string {
  const match = mosques.find(m => {
    const names = [m.name, ...(m.nicknames || [])];
    return names.some(n =>
      n.toLowerCase().includes(venueName.toLowerCase()) ||
      venueName.toLowerCase().includes(n.toLowerCase().split('(')[0].trim())
    );
  });
  return match?.id || '';
}

function parsePrayerOffset(offsetStr: string | null): number {
  if (!offsetStr) return 15;
  const match = offsetStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 15;
}

function parsedToEvent(parsed: ParsedEventData, flyerIndex: number, flyerUrl: string, mosques: Mosque[]): BatchEvent {
  const mosqueId = parsed.mosque_or_venue ? matchMosque(parsed.mosque_or_venue, mosques) : '';
  return {
    id: `${flyerIndex}-${Math.random().toString(36).slice(2, 8)}`,
    flyerIndex,
    included: true,
    title: parsed.title || '',
    mosque_id: mosqueId,
    venue_name: mosqueId ? '' : (parsed.mosque_or_venue || ''),
    venue_address: parsed.venue_address || '',
    event_type: parsed.event_type || 'other',
    language: parsed.language || 'english',
    gender: parsed.gender || 'mixed',
    speaker: parsed.speaker || '',
    time_mode: parsed.prayer_anchor ? 'prayer_anchored' : 'fixed',
    fixed_date: parsed.date || '',
    fixed_time: parsed.time || '',
    prayer_anchor: parsed.prayer_anchor || '',
    prayer_offset_minutes: parsePrayerOffset(parsed.prayer_offset),
    is_recurring: parsed.is_recurring || false,
    recurrence_pattern: parsed.recurrence_pattern || '',
    recurrence_end_date: parsed.recurrence_end_date || '',
    is_kids: parsed.is_kids || false,
    is_family: parsed.is_family || false,
    description: parsed.description || '',
    flyer_image_url: flyerUrl,
    confidence: parsed.confidence ?? 0.5,
  };
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 0.8 ? 'bg-green-100 text-green-700' :
    confidence >= 0.5 ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-pill ${color}`}>
      {Math.round(confidence * 100)}%
    </span>
  );
}

function EventCard({
  event,
  mosques,
  onUpdate,
  onToggle,
}: {
  event: BatchEvent;
  mosques: Mosque[];
  onUpdate: (id: string, updates: Partial<BatchEvent>) => void;
  onToggle: (id: string) => void;
}) {
  const inputClass = 'w-full text-sm rounded-button border border-sand-dark p-2 bg-white text-charcoal';

  return (
    <div className={`border rounded-card p-4 space-y-3 transition-opacity ${
      event.included ? 'border-sand-dark bg-white' : 'border-sand bg-sand/30 opacity-60'
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={event.included}
          onChange={() => onToggle(event.id)}
          className="mt-1 h-4 w-4 rounded border-sand-dark text-primary accent-primary"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <ConfidenceBadge confidence={event.confidence} />
          </div>

          {/* Title */}
          <input
            type="text"
            value={event.title}
            onChange={(e) => onUpdate(event.id, { title: e.target.value })}
            placeholder="Event title"
            className={`${inputClass} font-semibold mb-2`}
          />

          {/* 2-column layout */}
          <div className="grid gap-2 sm:grid-cols-2">
            {/* Mosque */}
            <select
              value={event.mosque_id}
              onChange={(e) => onUpdate(event.id, {
                mosque_id: e.target.value,
                venue_name: e.target.value ? '' : event.venue_name,
              })}
              className={inputClass}
            >
              <option value="">Other venue</option>
              {mosques.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            {/* Event type */}
            <select
              value={event.event_type}
              onChange={(e) => onUpdate(event.id, { event_type: e.target.value as EventType })}
              className={inputClass}
            >
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            {/* Language */}
            <select
              value={event.language}
              onChange={(e) => onUpdate(event.id, { language: e.target.value as Language })}
              className={inputClass}
            >
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>

            {/* Gender */}
            <select
              value={event.gender}
              onChange={(e) => onUpdate(event.id, { gender: e.target.value as Gender })}
              className={inputClass}
            >
              <option value="mixed">Mixed</option>
              <option value="brothers">Brothers</option>
              <option value="sisters">Sisters</option>
            </select>

            {/* Speaker */}
            <input
              type="text"
              value={event.speaker}
              onChange={(e) => onUpdate(event.id, { speaker: e.target.value })}
              placeholder="Speaker"
              className={inputClass}
            />

            {/* Time mode toggle + fields */}
            <div className="flex gap-1">
              <button
                onClick={() => onUpdate(event.id, { time_mode: 'fixed' })}
                className={`text-xs px-2 py-1 rounded-pill ${
                  event.time_mode === 'fixed' ? 'bg-primary text-white' : 'bg-sand text-warm-gray'
                }`}
              >
                Fixed
              </button>
              <button
                onClick={() => onUpdate(event.id, { time_mode: 'prayer_anchored' })}
                className={`text-xs px-2 py-1 rounded-pill ${
                  event.time_mode === 'prayer_anchored' ? 'bg-primary text-white' : 'bg-sand text-warm-gray'
                }`}
              >
                Prayer
              </button>
            </div>

            {/* Time fields */}
            {event.time_mode === 'fixed' ? (
              <>
                <input
                  type="date"
                  value={event.fixed_date}
                  onChange={(e) => onUpdate(event.id, { fixed_date: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="time"
                  value={event.fixed_time}
                  onChange={(e) => onUpdate(event.id, { fixed_time: e.target.value })}
                  className={inputClass}
                />
              </>
            ) : (
              <>
                <select
                  value={event.prayer_anchor}
                  onChange={(e) => onUpdate(event.id, { prayer_anchor: e.target.value as PrayerName })}
                  className={inputClass}
                >
                  <option value="">Select prayer</option>
                  {PRAYERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={event.prayer_offset_minutes}
                    onChange={(e) => onUpdate(event.id, { prayer_offset_minutes: parseInt(e.target.value) || 0 })}
                    className="w-16 text-sm rounded-button border border-sand-dark p-2 bg-white text-charcoal"
                    min={0}
                    max={120}
                  />
                  <span className="text-xs text-warm-gray">min after</span>
                </div>
              </>
            )}

            {/* Recurrence */}
            <select
              value={event.recurrence_pattern}
              onChange={(e) => onUpdate(event.id, {
                recurrence_pattern: e.target.value,
                is_recurring: !!e.target.value,
              })}
              className={inputClass}
            >
              {RECURRENCE_PATTERNS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            {/* Recurrence end date (only if recurring) */}
            {event.recurrence_pattern && (
              <input
                type="date"
                value={event.recurrence_end_date}
                onChange={(e) => onUpdate(event.id, { recurrence_end_date: e.target.value })}
                placeholder="End date"
                className={inputClass}
              />
            )}
          </div>

          {/* Venue name (if no mosque selected) */}
          {!event.mosque_id && (
            <input
              type="text"
              value={event.venue_name}
              onChange={(e) => onUpdate(event.id, { venue_name: e.target.value })}
              placeholder="Venue name"
              className={`${inputClass} mt-2`}
            />
          )}

          {/* Description */}
          <textarea
            value={event.description}
            onChange={(e) => onUpdate(event.id, { description: e.target.value })}
            placeholder="Description (optional)"
            className={`${inputClass} mt-2 resize-none`}
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}

export default function BatchPage() {
  const [step, setStep] = useState<Step>('upload');
  const [flyers, setFlyers] = useState<FlyerStatus[]>([]);
  const [events, setEvents] = useState<BatchEvent[]>([]);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState<SubmitResult[]>([]);
  const [submitProgress, setSubmitProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    fetch('/api/mosques')
      .then(r => r.json())
      .then(setMosques)
      .catch(() => {});
  }, []);

  const processFlyers = useCallback(async (flyerList: FlyerStatus[]) => {
    setProcessing(true);
    abortRef.current = false;

    for (let i = 0; i < flyerList.length; i++) {
      if (abortRef.current) break;

      setFlyers(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'processing' } : f
      ));

      try {
        const compressed = await compressImage(flyerList[i].file);
        const formData = new FormData();
        formData.append('image', compressed);

        const res = await fetch('/api/admin/parse-flyers', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const parsed: ParsedEventData[] = data.events;
        const flyerUrl: string = data.flyer_image_url;

        const newEvents = parsed.map(p => parsedToEvent(p, i, flyerUrl, mosques));
        setEvents(prev => [...prev, ...newEvents]);

        setFlyers(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'done' } : f
        ));
      } catch (err) {
        setFlyers(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'error', error: err instanceof Error ? err.message : 'Unknown error' } : f
        ));
      }
    }

    setProcessing(false);
  }, [mosques]);

  function handleFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const newFlyers: FlyerStatus[] = imageFiles.map(file => ({
      file,
      thumbnail: URL.createObjectURL(file),
      status: 'pending' as const,
    }));

    const updated = [...flyers, ...newFlyers];
    setFlyers(updated);
    processFlyers(newFlyers.map((_, idx) => updated[flyers.length + idx]));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  }

  function updateEvent(id: string, updates: Partial<BatchEvent>) {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }

  function toggleEvent(id: string) {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, included: !e.included } : e));
  }

  async function handleSubmit() {
    const selected = events.filter(e => e.included);
    if (selected.length === 0) return;

    setSubmitting(true);
    setSubmitProgress(0);
    setSubmitResults([]);

    const results: SubmitResult[] = [];

    for (let i = 0; i < selected.length; i++) {
      const ev = selected[i];
      setSubmitProgress(i + 1);

      try {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: ev.title,
            mosque_id: ev.mosque_id || null,
            venue_name: ev.venue_name || null,
            venue_address: ev.venue_address || null,
            event_type: ev.event_type,
            speaker: ev.speaker || null,
            language: ev.language,
            gender: ev.gender,
            time_mode: ev.time_mode,
            fixed_date: ev.fixed_date || null,
            fixed_time: ev.fixed_time || null,
            prayer_anchor: ev.prayer_anchor || null,
            prayer_offset_minutes: ev.prayer_offset_minutes,
            is_recurring: ev.is_recurring || !!ev.recurrence_pattern,
            recurrence_pattern: ev.recurrence_pattern || null,
            recurrence_end_date: ev.recurrence_end_date || null,
            is_kids: ev.is_kids || false,
            is_family: ev.is_family || false,
            description: ev.description || null,
            flyer_image_url: ev.flyer_image_url || null,
          }),
        });

        if (res.status === 409) {
          results.push({ eventId: ev.id, title: ev.title, success: true, duplicate: true });
        } else if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        } else {
          results.push({ eventId: ev.id, title: ev.title, success: true });
        }
      } catch (err) {
        results.push({
          eventId: ev.id,
          title: ev.title,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    setSubmitResults(results);
    setSubmitting(false);
    setStep('submit');
  }

  async function handleRetryFailed() {
    const failedIds = new Set(submitResults.filter(r => !r.success).map(r => r.eventId));
    const toRetry = events.filter(e => failedIds.has(e.id));
    if (toRetry.length === 0) return;

    setSubmitting(true);
    setSubmitProgress(0);

    const newResults = [...submitResults.filter(r => r.success)];

    for (let i = 0; i < toRetry.length; i++) {
      const ev = toRetry[i];
      setSubmitProgress(i + 1);

      try {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: ev.title,
            mosque_id: ev.mosque_id || null,
            venue_name: ev.venue_name || null,
            venue_address: ev.venue_address || null,
            event_type: ev.event_type,
            speaker: ev.speaker || null,
            language: ev.language,
            gender: ev.gender,
            time_mode: ev.time_mode,
            fixed_date: ev.fixed_date || null,
            fixed_time: ev.fixed_time || null,
            prayer_anchor: ev.prayer_anchor || null,
            prayer_offset_minutes: ev.prayer_offset_minutes,
            is_recurring: ev.is_recurring || !!ev.recurrence_pattern,
            recurrence_pattern: ev.recurrence_pattern || null,
            recurrence_end_date: ev.recurrence_end_date || null,
            is_kids: ev.is_kids || false,
            is_family: ev.is_family || false,
            description: ev.description || null,
            flyer_image_url: ev.flyer_image_url || null,
          }),
        });

        if (res.status === 409) {
          newResults.push({ eventId: ev.id, title: ev.title, success: true, duplicate: true });
        } else if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        } else {
          newResults.push({ eventId: ev.id, title: ev.title, success: true });
        }
      } catch (err) {
        newResults.push({
          eventId: ev.id,
          title: ev.title,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    setSubmitResults(newResults);
    setSubmitting(false);
  }

  function resetAll() {
    // Revoke thumbnail URLs
    flyers.forEach(f => URL.revokeObjectURL(f.thumbnail));
    setStep('upload');
    setFlyers([]);
    setEvents([]);
    setSubmitResults([]);
    setSubmitProgress(0);
  }

  const completedFlyers = flyers.filter(f => f.status === 'done').length;
  const selectedCount = events.filter(e => e.included).length;
  const createdCount = submitResults.filter(r => r.success && !r.duplicate).length;
  const dupCount = submitResults.filter(r => r.duplicate).length;
  const failCount = submitResults.filter(r => !r.success).length;

  // Group events by flyer
  const flyerGroups = flyers.map((flyer, idx) => ({
    flyer,
    flyerIndex: idx,
    events: events.filter(e => e.flyerIndex === idx),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-charcoal">Batch Process Flyers</h1>
        <Button variant="outline" href="/admin">Back to Dashboard</Button>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 text-sm">
        {(['upload', 'review', 'submit'] as Step[]).map((s, i) => (
          <div key={s} className={`flex items-center gap-1.5 ${step === s ? 'text-primary font-semibold' : 'text-warm-gray'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? 'bg-primary text-white' : 'bg-sand text-warm-gray'
            }`}>{i + 1}</span>
            <span className="capitalize">{s}</span>
            {i < 2 && <span className="text-sand-dark mx-1">/</span>}
          </div>
        ))}
      </div>

      {/* STEP 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-card p-10 cursor-pointer transition-colors ${
              dragging ? 'border-primary bg-primary/[0.04]' : 'border-sand-dark hover:border-primary'
            }`}
          >
            <svg className="w-10 h-10 text-stone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-sm text-warm-gray text-center">
              Drop flyer images here, or click to select files
            </span>
            <span className="text-xs text-stone">Supports multiple files</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {/* Flyer list */}
          {flyers.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-charcoal">
                Flyers ({completedFlyers}/{flyers.length} processed)
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {flyers.map((flyer, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white border border-sand-dark rounded-card p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={flyer.thumbnail}
                      alt={flyer.file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal truncate">{flyer.file.name}</p>
                      <p className="text-xs text-warm-gray">
                        {flyer.status === 'pending' && 'Queued'}
                        {flyer.status === 'processing' && (
                          <span className="text-primary animate-pulse">Parsing with AI...</span>
                        )}
                        {flyer.status === 'done' && (
                          <span className="text-green-600">
                            {events.filter(e => e.flyerIndex === idx).length} event(s) found
                          </span>
                        )}
                        {flyer.status === 'error' && (
                          <span className="text-red-600">{flyer.error || 'Failed'}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {flyers.length > 0 && (
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => setStep('review')}
                disabled={processing || events.length === 0}
              >
                {processing
                  ? `Processing (${completedFlyers}/${flyers.length})...`
                  : `Continue to Review (${events.length} events)`}
              </Button>
              <Button variant="outline" onClick={resetAll} disabled={processing}>
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Review — wider layout for side-by-side flyer + events */}
      {step === 'review' && (
        <div className="space-y-6 w-screen max-w-5xl relative left-1/2 -translate-x-1/2 px-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between bg-sand/50 rounded-card p-3">
            <span className="text-sm text-charcoal font-medium">
              {selectedCount} of {events.length} events selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEvents(prev => prev.map(e => ({ ...e, included: true })))}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                onClick={() => setEvents(prev => prev.map(e => ({ ...e, included: false })))}
              >
                Deselect All
              </Button>
            </div>
          </div>

          {/* Events grouped by flyer */}
          {flyerGroups.filter(g => g.events.length > 0).map((group) => (
            <div key={group.flyerIndex} className="space-y-3">
              <div className="flex items-center gap-3 py-2 border-b border-sand-dark">
                <p className="text-sm font-semibold text-charcoal">{group.flyer.file.name}</p>
                <p className="text-xs text-warm-gray">{group.events.length} event(s)</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                {/* Flyer image */}
                <div className="lg:sticky lg:top-4 lg:self-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={group.flyer.thumbnail}
                    alt={group.flyer.file.name}
                    className="w-full rounded-card border border-sand-dark"
                  />
                </div>
                {/* Extracted events */}
                <div className="space-y-3">
                  {group.events.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      mosques={mosques}
                      onUpdate={updateEvent}
                      onToggle={toggleEvent}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleSubmit}
              disabled={selectedCount === 0}
            >
              Submit {selectedCount} Event{selectedCount !== 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={() => setStep('upload')}>
              Back to Upload
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Submit Results */}
      {step === 'submit' && (
        <div className="space-y-6">
          {submitting ? (
            <div className="text-center py-10 space-y-3">
              <div className="text-sm text-primary animate-pulse">
                Submitting events... {submitProgress} of {events.filter(e => e.included).length}
              </div>
              <div className="w-full max-w-xs mx-auto bg-sand rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(submitProgress / events.filter(e => e.included).length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="text-center py-6 space-y-2">
                <p className="text-2xl font-bold text-charcoal">
                  {createdCount} created{dupCount > 0 ? `, ${dupCount} skipped` : ''}{failCount > 0 ? `, ${failCount} failed` : ''}
                </p>
                {failCount === 0 && dupCount === 0 && (
                  <p className="text-sm text-green-600">All events submitted successfully!</p>
                )}
                {failCount === 0 && dupCount > 0 && (
                  <p className="text-sm text-warm-gray">Duplicates were skipped automatically.</p>
                )}
              </div>

              {/* Failed events */}
              {failCount > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-red-600">Failed Events</h3>
                  {submitResults.filter(r => !r.success).map(r => (
                    <div key={r.eventId} className="bg-red-50 border border-red-200 rounded-card p-3">
                      <p className="text-sm font-medium text-charcoal">{r.title}</p>
                      <p className="text-xs text-red-600 mt-1">{r.error}</p>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={handleRetryFailed} disabled={submitting}>
                    Retry Failed ({failCount})
                  </Button>
                </div>
              )}

              {/* Duplicate events */}
              {dupCount > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-amber-600">Skipped — Already Exist ({dupCount})</h3>
                  {submitResults.filter(r => r.duplicate).map(r => (
                    <div key={r.eventId} className="bg-amber-50 border border-amber-200 rounded-card p-2 text-sm text-charcoal">
                      {r.title}
                    </div>
                  ))}
                </div>
              )}

              {/* Created events */}
              {createdCount > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-green-600">Created Events ({createdCount})</h3>
                  {submitResults.filter(r => r.success && !r.duplicate).map(r => (
                    <div key={r.eventId} className="bg-green-50 border border-green-200 rounded-card p-2 text-sm text-charcoal">
                      {r.title}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="primary" onClick={resetAll}>
                  Start New Batch
                </Button>
                <Button variant="outline" href="/admin/events">
                  View All Events
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
