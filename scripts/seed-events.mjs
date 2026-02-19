import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read env vars
const envContent = readFileSync('.env.local', 'utf8');
const getEnv = (key) => envContent.split('\n').find(l => l.startsWith(key + '='))?.split('=').slice(1).join('=')?.trim();

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY')
);

// Get mosque IDs
const { data: mosques } = await supabase.from('mosques').select('id, name');
const mosqueMap = {};
for (const m of mosques) mosqueMap[m.name] = m.id;

const find = (partial) => {
  const entry = mosques.find(m => m.name.toLowerCase().includes(partial.toLowerCase()));
  return entry?.id || null;
};

const events = [
  {
    mosque_id: find('lakemba'),
    title: 'Tafseer of Surah Al-Kahf',
    event_type: 'class',
    speaker: 'Sheikh Ahmad Abdo',
    language: 'english',
    gender: 'mixed',
    time_mode: 'prayer_anchored',
    prayer_anchor: 'isha',
    prayer_offset_minutes: 15,
    is_recurring: true,
    recurrence_pattern: 'every_friday',
    description: 'Weekly tafseer class covering Surah Al-Kahf, suitable for all levels.',
  },
  {
    mosque_id: find('auburn'),
    title: 'Ramadan Taraweeh Program',
    event_type: 'taraweeh',
    speaker: null,
    language: 'arabic',
    gender: 'mixed',
    time_mode: 'prayer_anchored',
    prayer_anchor: 'isha',
    prayer_offset_minutes: 0,
    is_recurring: true,
    recurrence_pattern: 'daily_ramadan',
    description: 'Full Quran recitation over the month of Ramadan. Led by Hafiz Muhammad.',
  },
  {
    mosque_id: find('sunnah'),
    title: 'Sisters Halaqa — Purification of the Heart',
    event_type: 'sisters_circle',
    speaker: 'Ustadha Yasmin Mogahed',
    language: 'english',
    gender: 'sisters',
    time_mode: 'prayer_anchored',
    prayer_anchor: 'dhuhr',
    prayer_offset_minutes: 30,
    is_recurring: true,
    recurrence_pattern: 'every_saturday',
    description: 'Weekly sisters circle focusing on spiritual development.',
  },
  {
    mosque_id: find('isra'),
    title: 'Youth Night — Identity & Faith',
    event_type: 'youth',
    speaker: 'Brother Bilal Dannoun',
    language: 'english',
    gender: 'mixed',
    time_mode: 'prayer_anchored',
    prayer_anchor: 'maghrib',
    prayer_offset_minutes: 15,
    is_recurring: true,
    recurrence_pattern: 'every_wednesday',
    description: 'Interactive sessions for youth aged 15-25 exploring faith, identity, and modern challenges.',
  },
  {
    mosque_id: find('parramatta'),
    title: 'Community Iftar',
    event_type: 'iftar',
    speaker: null,
    language: 'mixed',
    gender: 'mixed',
    time_mode: 'prayer_anchored',
    prayer_anchor: 'maghrib',
    prayer_offset_minutes: 0,
    is_recurring: true,
    recurrence_pattern: 'daily_ramadan',
    description: 'Free community iftar every night of Ramadan. All welcome.',
  },
  {
    mosque_id: find('al-noor'),
    title: 'Quran Memorisation Circle',
    event_type: 'quran_circle',
    speaker: null,
    language: 'arabic',
    gender: 'brothers',
    time_mode: 'prayer_anchored',
    prayer_anchor: 'fajr',
    prayer_offset_minutes: 15,
    is_recurring: true,
    recurrence_pattern: 'daily',
    description: 'Daily Quran memorisation and revision circle after Fajr prayer.',
  },
  {
    mosque_id: find('liverpool'),
    title: 'Friday Night Lecture — Seerah Series',
    event_type: 'talk',
    speaker: 'Sheikh Wesam Charkawi',
    language: 'english',
    gender: 'mixed',
    time_mode: 'prayer_anchored',
    prayer_anchor: 'isha',
    prayer_offset_minutes: 20,
    is_recurring: true,
    recurrence_pattern: 'every_friday',
    description: 'Ongoing series covering the life of Prophet Muhammad (peace be upon him).',
  },
  {
    mosque_id: find('punchbowl'),
    title: 'Arabic Language Basics',
    event_type: 'class',
    speaker: 'Ustadh Omar Ibrahim',
    language: 'english',
    gender: 'mixed',
    time_mode: 'fixed',
    fixed_date: '2026-03-01',
    fixed_time: '10:00',
    prayer_anchor: null,
    prayer_offset_minutes: 0,
    is_recurring: true,
    recurrence_pattern: 'every_sunday',
    description: 'Beginner-friendly Arabic class covering reading and basic conversation.',
  },
  {
    mosque_id: find('surry'),
    title: 'Mindful Muslim — Mental Health Workshop',
    event_type: 'talk',
    speaker: 'Dr Sarah Hassan',
    language: 'english',
    gender: 'mixed',
    time_mode: 'fixed',
    fixed_date: '2026-03-07',
    fixed_time: '14:00',
    prayer_anchor: null,
    prayer_offset_minutes: 0,
    is_recurring: false,
    recurrence_pattern: null,
    description: 'A one-off workshop on mental health, wellbeing, and faith. Free entry.',
  },
  {
    mosque_id: find('imam hasan'),
    title: 'Ramadan Charity Drive',
    event_type: 'charity',
    speaker: null,
    language: 'mixed',
    gender: 'mixed',
    time_mode: 'fixed',
    fixed_date: '2026-02-28',
    fixed_time: '09:00',
    prayer_anchor: null,
    prayer_offset_minutes: 0,
    is_recurring: false,
    recurrence_pattern: null,
    description: 'Collecting food hampers and clothing for families in need this Ramadan.',
  },
  {
    mosque_id: find('unsw'),
    title: 'Jummah Khutbah & Prayer',
    event_type: 'talk',
    speaker: null,
    language: 'english',
    gender: 'mixed',
    time_mode: 'prayer_anchored',
    prayer_anchor: 'dhuhr',
    prayer_offset_minutes: 0,
    is_recurring: true,
    recurrence_pattern: 'every_friday',
    description: 'Weekly Jummah prayer at UNSW Musallah. All students and staff welcome.',
  },
  {
    mosque_id: find('lakemba'),
    title: 'Ramadan Taraweeh — Full Quran Recitation',
    event_type: 'taraweeh',
    speaker: null,
    language: 'arabic',
    gender: 'mixed',
    time_mode: 'prayer_anchored',
    prayer_anchor: 'isha',
    prayer_offset_minutes: 5,
    is_recurring: true,
    recurrence_pattern: 'daily_ramadan',
    description: 'Lakemba Mosque Taraweeh program with renowned reciters.',
  },
];

const { data, error } = await supabase.from('events').insert(events).select('id, title');

if (error) {
  console.error('Error seeding events:', error);
} else {
  console.log(`Seeded ${data.length} events:`);
  data.forEach(e => console.log(`  ✓ ${e.title}`));
}
