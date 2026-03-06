/**
 * One-time script to tag existing events with is_kids / is_family
 * based on manual review of flyer images.
 *
 * Run after migration 011 has been applied:
 *   node scripts/update-kids-family-tags.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env
const envText = readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
  envText.split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('=').map(s => s.trim()))
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Events to tag as is_kids = true (identified from flyer review)
const KIDS_EVENT_IDS = [
  // AIH Ramadan Quest — all for kids ages 5-18
  '49925627-933a-48f7-af16-dd80be00830e', // Ramadan Quest Quran Competition
  '35514527-dc79-46b6-9833-088243db3394', // Ramadan Quest Adhaan Competition
  '8cb900be-3899-4da8-8a34-5d983a8ca3ba', // Ramadan Quest Friday Kahoot Nights
  '6e6e81b4-1405-4462-9923-0fb15660bbe4', // Ramadan Quest Daily Quiz
  '328c2c8a-f2db-40c6-952b-6ed7e9b03448', // Ramadan Quest Daily Quiz (duplicate)
  '151c9716-addb-4e23-985a-fd7dcfabd401', // Ramadan Quest Prayer Cards
  'bb0cd0f2-b83a-4f2f-89cf-671c3835604a', // Ramadan Quest Prize Distribution Ceremony
  // Hobart Mosque — Quran competition with age groups from 4-5
  '7f296ecc-22d4-408c-9673-1d7570f7a4cf', // Ramadan Qur'an Memorisation Competition 2026
  // Girls Eid Ball — Age 8+
  '5dcd771d-2ccb-41f3-bfdc-fcc8e8ba06cd', // Girls Eid Ball
  // Thomastown/Sunshine Mosque — explicitly "Kids Iftar"
  '061e3ffa-c81e-4266-bbc1-70310b87f684', // Kids Iftar
];

// Events to tag as is_family = true (identified from flyer review)
const FAMILY_EVENT_IDS = [
  // Revesby — explicitly says "FAMILY FRIENDLY"
  'bc9e3dfd-7274-404c-8898-f099935788fe', // Ramadan Night Market
  // Islamic Society of Darwin — "You and your family are cordially invited"
  '2f6a372a-6ccf-4d03-9bce-b7273b55d107', // Iftar and Dinner
  // MIA Liverpool Community Iftar — "OPEN FOR ALL", "Children are welcome"
  '23822299-823d-4c22-a339-2ac122ff7dd4', // Community Iftar
  // Lakemba Open Air Taraweeh — "Open to All", large community event
  '9b1a9493-ef63-49b4-b8a5-e5f2af5457e8', // Haldon Street Open Air Taraweeh and Iftar
  // Kids Iftar at Thomastown — also family (parents bring kids)
  '061e3ffa-c81e-4266-bbc1-70310b87f684', // Kids Iftar
  // HDMS Community Eid Dinner — community dinner
  '9a1038f5-7f08-4f2e-b7e9-c0c6ede665ac', // Community Eid Dinner
  // Marion Mosque Experience Ramadan — Mosque Tour & Iftar open event
  '955d5efd-e974-4dae-a895-1b93054cbd51', // Experience Ramadan
];

async function main() {
  console.log('Updating kids tags...');
  for (const id of KIDS_EVENT_IDS) {
    const { error } = await supabase.from('events').update({ is_kids: true }).eq('id', id);
    if (error) {
      console.error(`  FAILED ${id}: ${error.message}`);
    } else {
      console.log(`  Updated ${id} → is_kids=true`);
    }
  }

  console.log('\nUpdating family tags...');
  for (const id of FAMILY_EVENT_IDS) {
    const { error } = await supabase.from('events').update({ is_family: true }).eq('id', id);
    if (error) {
      console.error(`  FAILED ${id}: ${error.message}`);
    } else {
      console.log(`  Updated ${id} → is_family=true`);
    }
  }

  // Verify
  console.log('\nVerifying...');
  const { data: kids } = await supabase.from('events').select('id, title').eq('is_kids', true);
  const { data: family } = await supabase.from('events').select('id, title').eq('is_family', true);
  console.log(`\nKids events (${kids?.length || 0}):`);
  kids?.forEach(e => console.log(`  - ${e.title}`));
  console.log(`\nFamily events (${family?.length || 0}):`);
  family?.forEach(e => console.log(`  - ${e.title}`));
}

main().catch(console.error);
