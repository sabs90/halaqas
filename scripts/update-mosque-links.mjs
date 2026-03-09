/**
 * One-time script to populate mosque website_url and facebook_url columns.
 * Reads from mosque-links-candidates.json (manually verified).
 *
 * Prerequisites: migration 015_mosque_links.sql must be applied first.
 * Run: node scripts/update-mosque-links.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env
const envText = readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
  envText.split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('=').map(s => s.trim()))
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Load candidates
const candidates = JSON.parse(readFileSync('scripts/mosque-links-candidates.json', 'utf-8'));

async function main() {
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const mosque of candidates) {
    const updates = {};
    if (mosque.website_url) updates.website_url = mosque.website_url;
    if (mosque.facebook_url) updates.facebook_url = mosque.facebook_url;

    if (Object.keys(updates).length === 0) {
      console.log(`  SKIP ${mosque.name} — no links`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from('mosques').update(updates).eq('id', mosque.id);
    if (error) {
      console.error(`  FAILED ${mosque.name}: ${error.message}`);
      failed++;
    } else {
      const links = [
        updates.website_url ? 'website' : null,
        updates.facebook_url ? 'facebook' : null,
      ].filter(Boolean).join(' + ');
      console.log(`  Updated ${mosque.name} → ${links}`);
      updated++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${failed} failed`);

  // Verify
  console.log('\nVerifying...');
  const { data } = await supabase
    .from('mosques')
    .select('name, website_url, facebook_url')
    .or('website_url.not.is.null,facebook_url.not.is.null')
    .order('name');

  console.log(`\nMosques with links (${data?.length || 0}):`);
  data?.forEach(m => {
    const links = [
      m.website_url ? `web: ${m.website_url}` : null,
      m.facebook_url ? `fb: ${m.facebook_url}` : null,
    ].filter(Boolean).join(' | ');
    console.log(`  ${m.name}: ${links}`);
  });
}

main().catch(console.error);
