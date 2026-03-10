import type { EventType, Language, PrayerName } from './types';

export const RAMADAN_END_DATE = '2026-03-19';

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'talk', label: 'Talk' },
  { value: 'class', label: 'Class' },
  { value: 'quran_circle', label: 'Quran Circle' },
  { value: 'iftar', label: 'Iftar' },
  { value: 'taraweeh', label: 'Taraweeh' },
  { value: 'charity', label: 'Charity' },
  { value: 'youth', label: 'Youth' },
  { value: 'tahajjud', label: 'Tahajjud' },
  { value: 'itikaf', label: "I'tikaf" },
  { value: 'halaqa', label: 'Halaqa' },
  { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'eid_event', label: 'Eid Event' },
  { value: 'eid_prayers', label: 'Eid Prayers' },
  { value: 'other', label: 'Other' },
];

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'other', label: 'Other' },
];

export const PRAYERS: { value: PrayerName; label: string }[] = [
  { value: 'fajr', label: 'Fajr' },
  { value: 'dhuhr', label: 'Dhuhr' },
  { value: 'asr', label: 'Asr' },
  { value: 'maghrib', label: 'Maghrib' },
  { value: 'isha', label: 'Isha' },
];

export const RECURRENCE_PATTERNS = [
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
  { value: 'custom', label: 'Custom days' },
];

export const DAY_OPTIONS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const GENDER_OPTIONS = [
  { value: 'mixed', label: 'Both' },
  { value: 'brothers', label: 'Brothers' },
  { value: 'sisters', label: 'Sisters' },
];
