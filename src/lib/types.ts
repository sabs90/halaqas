export type EventType = 'talk' | 'class' | 'quran_circle' | 'iftar' | 'taraweeh' | 'charity' | 'youth' | 'sisters_circle' | 'other';
export type Language = 'english' | 'arabic' | 'urdu' | 'turkish' | 'bahasa' | 'mixed' | 'other';
export type Gender = 'brothers' | 'sisters' | 'mixed';
export type TimeMode = 'fixed' | 'prayer_anchored';
export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type EventStatus = 'active' | 'archived' | 'delisted';
export type AmendmentReason = 'ended' | 'wrong_date' | 'wrong_details' | 'duplicate' | 'other';
export type AmendmentStatus = 'pending' | 'approved' | 'rejected';

export interface Mosque {
  id: string;
  name: string;
  address: string;
  suburb: string;
  latitude: number;
  longitude: number;
  active: boolean;
  go_pray_id: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  mosque_id: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_latitude: number | null;
  venue_longitude: number | null;
  title: string;
  description: string | null;
  event_type: EventType;
  speaker: string | null;
  language: Language;
  gender: Gender;
  time_mode: TimeMode;
  fixed_date: string | null;
  fixed_time: string | null;
  prayer_anchor: PrayerName | null;
  prayer_offset_minutes: number | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_end_date: string | null;
  flyer_image_url: string | null;
  submitter_contact: string | null;
  status: EventStatus;
  last_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  mosque?: Mosque;
}

export interface Amendment {
  id: string;
  event_id: string;
  reason: AmendmentReason;
  old_details: Record<string, unknown>;
  new_details: Record<string, unknown>;
  reporter_contact: string | null;
  status: AmendmentStatus;
  created_at: string;
  reviewed_at: string | null;
  // Joined
  event?: Event;
}

export interface ParsedEventData {
  title: string | null;
  mosque_or_venue: string | null;
  date: string | null;
  time: string | null;
  prayer_anchor: PrayerName | null;
  prayer_offset: string | null;
  speaker: string | null;
  event_type: EventType | null;
  language: Language | null;
  gender: Gender | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  description: string | null;
  confidence: number;
}

export interface SuburbData {
  name: string;
  latitude: number;
  longitude: number;
}
