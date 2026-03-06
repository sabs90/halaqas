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

// ── R2 upload (same logic as src/lib/r2.ts with error fallback) ──────
async function uploadToR2(fileBuffer, fileName, contentType) {
  const accountId = getEnv('R2_ACCOUNT_ID');
  const bucketName = getEnv('R2_BUCKET_NAME') || 'halaqas-images';

  if (!accountId) {
    console.log('    R2 not configured, using data URL fallback');
    const base64 = Buffer.from(fileBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  }

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const key = `flyers/${Date.now()}-${fileName}`;
  const url = `${endpoint}/${bucketName}/${key}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      throw new Error(`R2 upload failed: ${response.status}`);
    }

    const publicUrl = `https://images.halaqas.com/${key}`;
    console.log(`    Uploaded to R2: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.log(`    R2 upload failed (${err.message}), using data URL fallback`);
    const base64 = Buffer.from(fileBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  }
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

  const flyerUrl = await uploadToR2(imageBuffer.buffer, fileName, contentType);
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
