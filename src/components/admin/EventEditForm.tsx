import { Button } from '@/components/ui/Button';
import { EVENT_TYPES, LANGUAGES, PRAYERS, RECURRENCE_PATTERNS, GENDER_OPTIONS } from '@/lib/event-constants';
import type { Mosque, EventType, Language, Gender, PrayerName } from '@/lib/types';

export interface EventFormData {
  title: string;
  mosque_id: string;
  venue_name: string;
  venue_address: string;
  event_type: string;
  language: string;
  gender: string;
  speaker: string;
  time_mode: 'fixed' | 'prayer_anchored';
  fixed_date: string;
  fixed_time: string;
  prayer_anchor: string;
  prayer_offset_minutes: number;
  is_recurring: boolean;
  recurrence_pattern: string;
  recurrence_end_date: string;
  is_kids: boolean;
  is_family: boolean;
  description: string;
}

interface EventEditFormProps {
  form: EventFormData;
  onChange: (updates: Partial<EventFormData>) => void;
  mosques: Mosque[];
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string;
  saveLabel?: string;
}

const inputClass = 'w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal';

export function eventToFormData(event: {
  title: string;
  mosque_id: string | null;
  venue_name: string | null;
  venue_address: string | null;
  event_type: EventType;
  language: Language;
  gender: Gender;
  speaker: string | null;
  time_mode: string;
  fixed_date: string | null;
  fixed_time: string | null;
  prayer_anchor: PrayerName | null;
  prayer_offset_minutes: number | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_end_date: string | null;
  is_kids: boolean;
  is_family: boolean;
  description: string | null;
}): EventFormData {
  return {
    title: event.title || '',
    mosque_id: event.mosque_id || '',
    venue_name: event.venue_name || '',
    venue_address: event.venue_address || '',
    event_type: event.event_type || 'other',
    language: event.language || 'english',
    gender: event.gender || 'mixed',
    speaker: event.speaker || '',
    time_mode: (event.time_mode as 'fixed' | 'prayer_anchored') || 'fixed',
    fixed_date: event.fixed_date || '',
    fixed_time: event.fixed_time ? event.fixed_time.slice(0, 5) : '',
    prayer_anchor: event.prayer_anchor || '',
    prayer_offset_minutes: event.prayer_offset_minutes ?? 15,
    is_recurring: event.is_recurring || false,
    recurrence_pattern: event.recurrence_pattern || '',
    recurrence_end_date: event.recurrence_end_date || '',
    is_kids: event.is_kids || false,
    is_family: event.is_family || false,
    description: event.description || '',
  };
}

export function formDataToPayload(form: EventFormData) {
  return {
    title: form.title,
    mosque_id: form.mosque_id || null,
    venue_name: form.venue_name || null,
    venue_address: form.venue_address || null,
    event_type: form.event_type,
    language: form.language,
    gender: form.gender,
    speaker: form.speaker || null,
    time_mode: form.time_mode,
    fixed_date: form.time_mode === 'fixed' ? (form.fixed_date || null) : null,
    fixed_time: form.time_mode === 'fixed' ? (form.fixed_time || null) : null,
    prayer_anchor: form.time_mode === 'prayer_anchored' ? (form.prayer_anchor || null) : null,
    prayer_offset_minutes: form.time_mode === 'prayer_anchored' ? form.prayer_offset_minutes : null,
    is_recurring: form.is_recurring || !!form.recurrence_pattern,
    recurrence_pattern: form.recurrence_pattern || null,
    recurrence_end_date: form.recurrence_end_date || null,
    is_kids: form.is_kids,
    is_family: form.is_family,
    description: form.description || null,
  };
}

export default function EventEditForm({
  form,
  onChange,
  mosques,
  onSave,
  onCancel,
  saving,
  error,
  saveLabel = 'Save',
}: EventEditFormProps) {
  return (
    <div className="space-y-3">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-charcoal mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Event title"
          className={inputClass}
        />
      </div>

      {/* 2-column grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Mosque */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Mosque</label>
          <select
            value={form.mosque_id}
            onChange={(e) => onChange({
              mosque_id: e.target.value,
              venue_name: e.target.value ? '' : form.venue_name,
            })}
            className={inputClass}
          >
            <option value="">Other venue</option>
            {mosques.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        {/* Event type */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Event Type</label>
          <select
            value={form.event_type}
            onChange={(e) => onChange({ event_type: e.target.value as EventType })}
            className={inputClass}
          >
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Language</label>
          <select
            value={form.language}
            onChange={(e) => onChange({ language: e.target.value as Language })}
            className={inputClass}
          >
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => onChange({ gender: e.target.value as Gender })}
            className={inputClass}
          >
            {GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>

        {/* Speaker */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Speaker</label>
          <input
            type="text"
            value={form.speaker}
            onChange={(e) => onChange({ speaker: e.target.value })}
            placeholder="Speaker name"
            className={inputClass}
          />
        </div>

        {/* Time mode toggle */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Time Mode</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onChange({
                time_mode: 'fixed',
                prayer_anchor: '',
                prayer_offset_minutes: 15,
              })}
              className={`flex-1 text-sm px-3 py-2 rounded-button border ${
                form.time_mode === 'fixed'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-warm-gray border-sand-dark'
              }`}
            >
              Fixed Time
            </button>
            <button
              type="button"
              onClick={() => onChange({
                time_mode: 'prayer_anchored',
                fixed_date: '',
                fixed_time: '',
              })}
              className={`flex-1 text-sm px-3 py-2 rounded-button border ${
                form.time_mode === 'prayer_anchored'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-warm-gray border-sand-dark'
              }`}
            >
              After Prayer
            </button>
          </div>
        </div>

        {/* Time fields */}
        {form.time_mode === 'fixed' ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Date</label>
              <input
                type="date"
                value={form.fixed_date}
                onChange={(e) => onChange({ fixed_date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Time</label>
              <input
                type="time"
                value={form.fixed_time}
                onChange={(e) => onChange({ fixed_time: e.target.value })}
                className={inputClass}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Prayer</label>
              <select
                value={form.prayer_anchor}
                onChange={(e) => onChange({ prayer_anchor: e.target.value as PrayerName })}
                className={inputClass}
              >
                <option value="">Select prayer</option>
                {PRAYERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Minutes After</label>
              <input
                type="number"
                value={form.prayer_offset_minutes}
                onChange={(e) => onChange({ prayer_offset_minutes: parseInt(e.target.value) || 0 })}
                className={inputClass}
                min={0}
                max={120}
              />
            </div>
          </>
        )}

        {/* Recurrence */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Recurrence</label>
          <select
            value={form.recurrence_pattern}
            onChange={(e) => onChange({
              recurrence_pattern: e.target.value,
              is_recurring: !!e.target.value,
            })}
            className={inputClass}
          >
            {RECURRENCE_PATTERNS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {/* Recurrence end date */}
        {form.recurrence_pattern && (
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Recurrence End Date</label>
            <input
              type="date"
              value={form.recurrence_end_date}
              onChange={(e) => onChange({ recurrence_end_date: e.target.value })}
              className={inputClass}
            />
          </div>
        )}
      </div>

      {/* Venue fields (when no mosque selected) */}
      {!form.mosque_id && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Venue Name</label>
            <input
              type="text"
              value={form.venue_name}
              onChange={(e) => onChange({ venue_name: e.target.value })}
              placeholder="Venue name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Venue Address</label>
            <input
              type="text"
              value={form.venue_address}
              onChange={(e) => onChange({ venue_address: e.target.value })}
              placeholder="Venue address"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-charcoal mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Description (optional)"
          className={`${inputClass} resize-none`}
          rows={2}
        />
      </div>

      {/* Checkboxes */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_kids}
            onChange={(e) => onChange({ is_kids: e.target.checked })}
            className="rounded"
          />
          Kids
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_family}
            onChange={(e) => onChange({ is_family: e.target.checked })}
            className="rounded"
          />
          Family
        </label>
      </div>

      {error && <p className="text-sm text-secondary">{error}</p>}

      <div className="flex gap-2">
        <Button variant="primary" onClick={onSave} disabled={saving} className="!text-xs !px-3 !py-1.5">
          {saving ? 'Saving...' : saveLabel}
        </Button>
        <Button variant="outline" onClick={onCancel} className="!text-xs !px-3 !py-1.5">
          Cancel
        </Button>
      </div>
    </div>
  );
}
