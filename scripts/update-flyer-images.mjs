import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

// ── Read env ──────────────────────────────────────────────────────────
const envContent = readFileSync('.env.local', 'utf8');
const getEnv = (key) => envContent.split('\n').find(l => l.startsWith(key + '='))?.split('=').slice(1).join('=')?.trim();

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY')
);

// ── Supabase Storage upload ──────────────────────────────────────────
const BUCKET = 'flyers';

async function uploadFlyer(fileBuffer, fileName, contentType) {
  const key = `${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, fileBuffer, { contentType, upsert: false });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  console.log(`    Uploaded: ${data.publicUrl}`);
  return data.publicUrl;
}

// ── Load expected events mapping ─────────────────────────────────────
const expected = JSON.parse(readFileSync('scripts/flyer-expected.json', 'utf8'));

// ── Load all mosques ─────────────────────────────────────────────────
const { data: mosques } = await supabase.from('mosques').select('id, name');
const findMosque = (partial) => {
  const entry = mosques.find(m => m.name.toLowerCase().includes(partial.toLowerCase()));
  return entry || null;
};

// ── Mapping: flyer filename → mosque search term ─────────────────────
const flyerToMosque = {
  'AIH - ramadan comps.jpeg': 'australian islamic',
  'DIA - ramadan program.jpg': 'daar ibn abbas',
  'aih - sisters iftar.jpg': 'australian islamic',
  'masjid al noor ramadan.jpg': 'al-noor',
  'mia liverpool.jpg': 'markaz imam ahmad',
  'open iftar lakemba.jpg': 'lakemba',
  'punchbowl - taraweeh.jpeg': 'punchbowl',
  'punchbowl mosque.jpg': 'punchbowl',
};

// ── Process each flyer ───────────────────────────────────────────────
const flyerDir = resolve('example-flyers/Round 1');
const files = readdirSync(flyerDir).filter(f => /\.(jpe?g|png)$/i.test(f));

let totalUpdated = 0;
let totalSkipped = 0;

for (const fileName of files) {
  console.log(`\n📄 ${fileName}`);

  const expectedData = expected[fileName];
  if (!expectedData) {
    console.log('  ⚠ No expected data found in flyer-expected.json, skipping');
    totalSkipped++;
    continue;
  }

  const mosqueSearch = flyerToMosque[fileName];
  if (!mosqueSearch) {
    console.log('  ⚠ No mosque mapping defined, skipping');
    totalSkipped++;
    continue;
  }

  const mosque = findMosque(mosqueSearch);
  if (!mosque) {
    console.log(`  ⚠ Mosque not found for "${mosqueSearch}", skipping`);
    totalSkipped++;
    continue;
  }

  // Read image and upload
  const filePath = resolve(flyerDir, fileName);
  const imageBuffer = readFileSync(filePath);
  const ext = fileName.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
  const contentType = `image/${ext}`;

  console.log(`  Mosque: ${mosque.name} (id: ${mosque.id})`);
  console.log(`  Uploading image (${(imageBuffer.length / 1024).toFixed(0)} KB)...`);

  const flyerUrl = await uploadFlyer(imageBuffer.buffer, fileName, contentType);
  const isDataUrl = flyerUrl.startsWith('data:');

  // Get event titles from this flyer (skip Prayer Cards)
  const eventTitles = expectedData.events
    .filter(e => !e.title.includes('Prayer Cards'))
    .map(e => e.title);

  console.log(`  Looking for ${eventTitles.length} events to update...`);

  // Find and update matching events
  for (const title of eventTitles) {
    const { data: events, error: findError } = await supabase
      .from('events')
      .select('id, title, flyer_image_url')
      .eq('mosque_id', mosque.id)
      .ilike('title', title)
      .eq('status', 'active');

    if (findError) {
      console.log(`    ✗ Error finding "${title}": ${findError.message}`);
      continue;
    }

    if (!events || events.length === 0) {
      console.log(`    ○ No match for "${title}"`);
      continue;
    }

    for (const event of events) {
      if (event.flyer_image_url) {
        console.log(`    ○ "${title}" already has flyer, skipping`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('events')
        .update({ flyer_image_url: flyerUrl })
        .eq('id', event.id);

      if (updateError) {
        console.log(`    ✗ Error updating "${title}": ${updateError.message}`);
      } else {
        console.log(`    ✓ Updated "${title}"${isDataUrl ? ' (data URL)' : ''}`);
        totalUpdated++;
      }
    }
  }
}

console.log(`\n────────────────────────────────────`);
console.log(`Done! Updated ${totalUpdated} events, skipped ${totalSkipped} flyers.`);
