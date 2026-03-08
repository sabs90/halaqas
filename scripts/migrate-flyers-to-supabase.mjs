import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ── Read env ──────────────────────────────────────────────────────────
const envContent = readFileSync('.env.local', 'utf8');
const getEnv = (key) => envContent.split('\n').find(l => l.startsWith(key + '='))?.split('=').slice(1).join('=')?.trim();

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY')
);

const BUCKET = 'flyers';

// ── Fetch events with base64 flyer images ─────────────────────────────
const { data: events, error } = await supabase
  .from('events')
  .select('id, title, flyer_image_url')
  .like('flyer_image_url', 'data:%');

if (error) {
  console.error('Failed to fetch events:', error.message);
  process.exit(1);
}

console.log(`Found ${events.length} events with base64 flyer images.\n`);

let migrated = 0;
let failed = 0;

for (const event of events) {
  const { id, title, flyer_image_url } = event;

  // Parse data URL: data:image/jpeg;base64,/9j/4AAQ...
  const match = flyer_image_url.match(/^data:(image\/\w+);base64,(.+)$/s);
  if (!match) {
    console.log(`✗ "${title}" — could not parse data URL`);
    failed++;
    continue;
  }

  const contentType = match[1];
  const ext = contentType.split('/')[1]; // jpeg, png, webp
  const buffer = Buffer.from(match[2], 'base64');
  const key = `${Date.now()}-event-${id}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType, upsert: false });

  if (uploadError) {
    console.log(`✗ "${title}" — upload failed: ${uploadError.message}`);
    failed++;
    continue;
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
  const publicUrl = urlData.publicUrl;

  // Update the event row
  const { error: updateError } = await supabase
    .from('events')
    .update({ flyer_image_url: publicUrl })
    .eq('id', id);

  if (updateError) {
    console.log(`✗ "${title}" — DB update failed: ${updateError.message}`);
    failed++;
    continue;
  }

  console.log(`✓ "${title}" → ${publicUrl}`);
  migrated++;
}

console.log(`\n────────────────────────────────────`);
console.log(`Done! Migrated: ${migrated}, Failed: ${failed}, Total: ${events.length}`);
