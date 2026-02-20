import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ── Read env ──────────────────────────────────────────────────────────
const envContent = readFileSync('.env.local', 'utf8');
const getEnv = (key) => envContent.split('\n').find(l => l.startsWith(key + '='))?.split('=').slice(1).join('=')?.trim();

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY')
);

// ── Helpers ───────────────────────────────────────────────────────────
function parseOffset(offsetStr) {
  if (!offsetStr) return 0;
  const match = offsetStr.match(/(\d+)\s*min\s*(before|after)/i);
  if (match) {
    const minutes = parseInt(match[1]);
    return match[2].toLowerCase() === 'before' ? -minutes : minutes;
  }
  if (offsetStr.toLowerCase().includes('before')) return -15;
  return 0; // "after" = immediately after
}

function mapEvent(e, mosqueId, overrides = {}) {
  const hasClockTime = !!e.time;
  const hasPrayerAnchor = !!e.prayer_anchor;

  let time_mode, fixed_time, prayer_anchor, prayer_offset_minutes;

  if (hasClockTime) {
    time_mode = 'fixed';
    fixed_time = e.time.length === 5 ? e.time + ':00' : e.time;
    prayer_anchor = null;
    prayer_offset_minutes = 0;
  } else if (hasPrayerAnchor) {
    time_mode = 'prayer_anchored';
    fixed_time = null;
    prayer_anchor = e.prayer_anchor;
    prayer_offset_minutes = parseOffset(e.prayer_offset);
  } else {
    time_mode = 'fixed';
    fixed_time = null;
    prayer_anchor = null;
    prayer_offset_minutes = 0;
  }

  return {
    mosque_id: mosqueId,
    title: e.title,
    event_type: e.event_type,
    speaker: e.speaker || null,
    language: e.language || 'english',
    gender: e.gender || 'mixed',
    time_mode,
    fixed_date: e.date || null,
    fixed_time,
    prayer_anchor,
    prayer_offset_minutes,
    is_recurring: e.is_recurring || false,
    recurrence_pattern: e.recurrence_pattern || null,
    recurrence_end_date: e.recurrence_end_date || null,
    description: e.description || null,
    venue_address: e.venue_address || null,
    status: 'active',
    ...overrides,
  };
}

// ── Step 1: Delete all existing events ────────────────────────────────
console.log('Deleting all existing events...');
const { error: delError } = await supabase.from('events').delete().gte('created_at', '1970-01-01');
if (delError) { console.error('Delete error:', delError); process.exit(1); }
console.log('  ✓ All events deleted\n');

// ── Step 2: Ensure mosques exist ──────────────────────────────────────
const newMosques = [
  {
    name: 'Australian Islamic House',
    address: '2094 Camden Valley Way, Edmondson Park NSW 2174',
    suburb: 'Edmondson Park',
    latitude: -33.8674,
    longitude: 150.8521,
  },
  {
    name: 'Dar Ibn Abbas',
    address: '14 Rossmore Ave, Punchbowl NSW 2196',
    suburb: 'Punchbowl',
    latitude: -33.9290,
    longitude: 151.0550,
  },
];

for (const m of newMosques) {
  const { data: existing } = await supabase
    .from('mosques')
    .select('id')
    .ilike('name', `%${m.name}%`)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from('mosques').insert(m);
    if (error) { console.error(`Error adding ${m.name}:`, error); process.exit(1); }
    console.log(`  + Added mosque: ${m.name}`);
  } else {
    console.log(`  ○ Mosque exists: ${m.name}`);
  }
}

// ── Step 3: Load mosque lookup ────────────────────────────────────────
const { data: mosques } = await supabase.from('mosques').select('id, name');
const find = (partial) => {
  const entry = mosques.find(m => m.name.toLowerCase().includes(partial.toLowerCase()));
  if (!entry) console.warn(`  ⚠ Mosque not found: "${partial}"`);
  return entry?.id || null;
};

const aih = find('australian islamic');
const dia = find('dar ibn abbas');
const alNoor = find('al-noor') || find('al noor');
const liverpool = find('liverpool');
const lakemba = find('lakemba');
const punchbowl = find('punchbowl');

// ── Step 4: Build event list from flyer data ──────────────────────────
const expected = JSON.parse(readFileSync('scripts/flyer-expected.json', 'utf8'));

const events = [];

// --- AIH Ramadan Comps (skip "Prayer Cards") ---
for (const e of expected['AIH - ramadan comps.jpeg'].events) {
  if (e.title.includes('Prayer Cards')) continue;
  events.push(mapEvent(e, aih));
}

// --- DIA Ramadan Program ---
for (const e of expected['DIA - ramadan program.jpg'].events) {
  events.push(mapEvent(e, dia));
}

// --- AIH Sisters Iftar ---
for (const e of expected['aih - sisters iftar.jpg'].events) {
  events.push(mapEvent(e, aih));
}

// --- Masjid Al Noor ---
for (const e of expected['masjid al noor ramadan.jpg'].events) {
  events.push(mapEvent(e, alNoor));
}

// --- MIA Liverpool ---
for (const e of expected['mia liverpool.jpg'].events) {
  events.push(mapEvent(e, liverpool));
}

// --- Open Iftar Lakemba (LMA = Lakemba Mosque, but venue is Haldon St) ---
for (const e of expected['open iftar lakemba.jpg'].events) {
  events.push(mapEvent(e, lakemba, {
    venue_name: 'Haldon Street, Lakemba',
    venue_address: 'Haldon Street, Lakemba NSW (Between Oneata St & Gillies St)',
  }));
}

// --- Punchbowl Taraweeh ---
for (const e of expected['punchbowl - taraweeh.jpeg'].events) {
  events.push(mapEvent(e, punchbowl));
}

// --- Punchbowl Mosque Ramadan Lessons ---
for (const e of expected['punchbowl mosque.jpg'].events) {
  events.push(mapEvent(e, punchbowl));
}

// ── Step 5: Insert all events ─────────────────────────────────────────
console.log(`\nInserting ${events.length} events...`);

const { data, error } = await supabase.from('events').insert(events).select('id, title, event_type');

if (error) {
  console.error('Insert error:', error);
  process.exit(1);
}

console.log(`\n✓ Seeded ${data.length} events:`);
for (const e of data) {
  console.log(`  ${e.event_type.padEnd(12)} ${e.title}`);
}
