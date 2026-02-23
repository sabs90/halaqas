#!/usr/bin/env node

/**
 * Geocoding helper — generates SQL migration for Australian mosque expansion.
 *
 * Usage:  node scripts/generate-mosque-migration.mjs
 *
 * Hits Nominatim (OpenStreetMap) at 1 req/sec to resolve coordinates,
 * then writes the full migration SQL to stdout.
 *
 * Pipe to file:  node scripts/generate-mosque-migration.mjs > supabase/migrations/006_australian_mosque_expansion.sql
 */

const MOSQUES = [
  // ─── Sydney (NSW) gap-fill ───────────────────────────────────
  { name: 'Masjid Al-Azhar', address: '2 Lakemba St, Belmore NSW 2192', suburb: 'Belmore', state: 'NSW' },
  { name: 'Campsie Mosque (Turkish)', address: '4 Anglo Rd, Campsie NSW 2194', suburb: 'Campsie', state: 'NSW' },
  { name: 'Roselands Mosque (Masjid Darul Imaan)', address: '6A Roseland Ave, Roselands NSW 2196', suburb: 'Roselands', state: 'NSW' },
  { name: 'Lidcombe Mosque', address: '5 Birnie Ave, Lidcombe NSW 2141', suburb: 'Lidcombe', state: 'NSW' },
  { name: 'Blacktown Islamic Centre', address: '43 Fifth Ave, Blacktown NSW 2148', suburb: 'Blacktown', state: 'NSW' },
  { name: 'Guildford Mosque', address: '18 Railway Terrace, Guildford NSW 2161', suburb: 'Guildford', state: 'NSW' },
  { name: 'Toongabbie Mosque', address: '12 Binalong Rd, Toongabbie NSW 2146', suburb: 'Toongabbie', state: 'NSW' },
  { name: 'Bass Hill Mosque', address: '684 Hume Hwy, Bass Hill NSW 2197', suburb: 'Bass Hill', state: 'NSW' },
  { name: 'Smithfield Mosque', address: '30 Bourke St, Smithfield NSW 2164', suburb: 'Smithfield', state: 'NSW' },
  { name: 'Masjid Al-Hijrah', address: '72 Princes Hwy, Tempe NSW 2044', suburb: 'Tempe', state: 'NSW' },
  { name: 'Hoxton Park Mosque (ICSA)', address: '214 Wilson Rd, Hinchinbrook NSW 2168', suburb: 'Hinchinbrook', state: 'NSW' },
  { name: 'Revesby Mosque', address: '1 Bransgrove Rd, Revesby NSW 2212', suburb: 'Revesby', state: 'NSW' },
  { name: 'Kellyville Mosque (Islamic Centre of the Hills)', address: '3 Hezlett Rd, Kellyville NSW 2155', suburb: 'Kellyville', state: 'NSW' },
  { name: 'Masjid Wardah', address: '7 Waterloo Rd, Greenacre NSW 2190', suburb: 'Greenacre', state: 'NSW' },
  { name: 'Al-Faisal College Mosque', address: '35 Railway Parade, Auburn NSW 2144', suburb: 'Auburn', state: 'NSW' },
  { name: 'Bukhari House', address: '519 Canterbury Rd, Campsie NSW 2194', suburb: 'Campsie', state: 'NSW' },
  { name: 'Islamic Society of Manly Warringah', address: '6 South Creek Rd, Dee Why NSW 2099', suburb: 'Dee Why', state: 'NSW' },

  // ─── Melbourne (VIC) ────────────────────────────────────────
  { name: 'Preston Mosque', address: '90-96 Cramer St, Preston VIC 3072', suburb: 'Preston', state: 'VIC' },
  { name: 'Newport Mosque', address: '1 Walker St, Newport VIC 3015', suburb: 'Newport', state: 'VIC' },
  { name: 'Broadmeadows Mosque (Turkish)', address: '46-48 Camp Rd, Broadmeadows VIC 3047', suburb: 'Broadmeadows', state: 'VIC' },
  { name: 'Sunshine Mosque', address: '619 Ballarat Rd, Albion VIC 3020', suburb: 'Albion', state: 'VIC' },
  { name: 'Thomastown Mosque', address: '124 Station St, Thomastown VIC 3074', suburb: 'Thomastown', state: 'VIC' },
  { name: 'Werribee Islamic Centre', address: '5 Minindee Rd, Werribee VIC 3030', suburb: 'Werribee', state: 'VIC' },
  { name: 'Dandenong Mosque', address: '87 Foster St, Dandenong VIC 3175', suburb: 'Dandenong', state: 'VIC' },
  { name: 'Hallam Mosque (Hira Masjid)', address: '38 Belgrave-Hallam Rd, Hallam VIC 3803', suburb: 'Hallam', state: 'VIC' },
  { name: 'Epping Mosque (Epping Islamic Centre)', address: '7 Lyndarum Dr, Epping VIC 3076', suburb: 'Epping', state: 'VIC' },
  { name: 'Fawkner Mosque', address: '46-48 Baroda Ave, Fawkner VIC 3060', suburb: 'Fawkner', state: 'VIC' },
  { name: 'Coburg Mosque (Cypriot Turkish Islamic Centre)', address: '31 Nicholson St, Coburg VIC 3058', suburb: 'Coburg', state: 'VIC' },
  { name: 'Omar bin Al-Khattab Mosque (Carlton)', address: '765 Drummond St, Carlton VIC 3053', suburb: 'Carlton', state: 'VIC' },
  { name: 'Heidelberg Mosque', address: '25 Yarra St, Heidelberg VIC 3084', suburb: 'Heidelberg', state: 'VIC' },
  { name: 'Virgin Mary Mosque', address: '168-170 Hogans Rd, Hoppers Crossing VIC 3029', suburb: 'Hoppers Crossing', state: 'VIC' },
  { name: 'IISCA Doveton Mosque', address: '15 Photinia St, Doveton VIC 3177', suburb: 'Doveton', state: 'VIC' },

  // ─── Brisbane (QLD) ─────────────────────────────────────────
  { name: 'Kuraby Mosque (Islamic Society of Holland Park)', address: '19 Doig St, Holland Park QLD 4121', suburb: 'Holland Park', state: 'QLD' },
  { name: 'Darra Mosque', address: '63-65 Station Rd, Darra QLD 4076', suburb: 'Darra', state: 'QLD' },
  { name: 'Masjid Al-Farooq (Sunnybank)', address: '13 Doig St, Sunnybank QLD 4109', suburb: 'Sunnybank', state: 'QLD' },
  { name: 'Islamic College of Brisbane', address: '45 Acacia Rd, Karawatha QLD 4117', suburb: 'Karawatha', state: 'QLD' },
  { name: 'Slacks Creek Mosque', address: '17 Milne St, Slacks Creek QLD 4127', suburb: 'Slacks Creek', state: 'QLD' },
  { name: 'Logan Mosque (Masjid Taqwa)', address: '24 Magnesium Dr, Crestmead QLD 4132', suburb: 'Crestmead', state: 'QLD' },
  { name: 'Gold Coast Mosque', address: '23 Allied Dr, Arundel QLD 4214', suburb: 'Arundel', state: 'QLD' },
  { name: 'Toowoomba Mosque', address: '196 West St, Toowoomba QLD 4350', suburb: 'Toowoomba', state: 'QLD' },

  // ─── Perth (WA) ─────────────────────────────────────────────
  { name: 'Perth Mosque', address: '427 William St, Perth WA 6000', suburb: 'Perth', state: 'WA' },
  { name: 'Masjid Ibrahim (Southern River)', address: '2 Balfour St, Southern River WA 6110', suburb: 'Southern River', state: 'WA' },
  { name: 'Mirrabooka Mosque', address: '8 Sudbury Rd, Mirrabooka WA 6061', suburb: 'Mirrabooka', state: 'WA' },
  { name: 'Thornlie Mosque', address: '2 Garling St, Thornlie WA 6108', suburb: 'Thornlie', state: 'WA' },
  { name: 'Rivervale Mosque', address: '3 Malvern Rd, Rivervale WA 6103', suburb: 'Rivervale', state: 'WA' },
  { name: 'Canning Vale Mosque', address: '2 Waranup Ct, Canning Vale WA 6155', suburb: 'Canning Vale', state: 'WA' },
  { name: 'Kenwick Mosque', address: '33 Bickley Rd, Kenwick WA 6107', suburb: 'Kenwick', state: 'WA' },
  { name: 'Madina Mosque (Wanneroo)', address: '20 Civic Dr, Wanneroo WA 6065', suburb: 'Wanneroo', state: 'WA' },

  // ─── Adelaide (SA) ──────────────────────────────────────────
  { name: 'Adelaide Mosque', address: '20 Little Gilbert St, Adelaide SA 5000', suburb: 'Adelaide', state: 'SA' },
  { name: 'Park Holme Mosque (Islamic Society of SA)', address: '658 Marion Rd, Park Holme SA 5043', suburb: 'Park Holme', state: 'SA' },
  { name: 'Al-Khalil Mosque (Pooraka)', address: '29 Wandana Ave, Pooraka SA 5095', suburb: 'Pooraka', state: 'SA' },
  { name: 'Elizabeth Mosque', address: '89 Hamblynn Rd, Elizabeth Downs SA 5113', suburb: 'Elizabeth Downs', state: 'SA' },
  { name: 'Murray Bridge Mosque', address: '26 Grubb St, Murray Bridge SA 5253', suburb: 'Murray Bridge', state: 'SA' },

  // ─── Canberra (ACT) ────────────────────────────────────────
  { name: 'Canberra Islamic Centre', address: '130 Empire Circuit, Yarralumla ACT 2600', suburb: 'Yarralumla', state: 'ACT' },
  { name: 'Gungahlin Mosque', address: '130 Hibberson St, Gungahlin ACT 2912', suburb: 'Gungahlin', state: 'ACT' },
  { name: 'Woden Mosque', address: '21 Irving St, Phillip ACT 2606', suburb: 'Phillip', state: 'ACT' },

  // ─── Darwin (NT) ───────────────────────────────────────────
  { name: 'Darwin Mosque', address: '53 Vanderlin Dr, Casuarina NT 0810', suburb: 'Casuarina', state: 'NT' },

  // ─── Hobart (TAS) ──────────────────────────────────────────
  { name: 'Hobart Mosque', address: '166 Warwick St, West Hobart TAS 7000', suburb: 'West Hobart', state: 'TAS' },
];

async function geocode(address) {
  const query = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=au`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Halaqas/1.0 (mosque-expansion-script)' },
  });
  if (!res.ok) return null;
  const results = await res.json();
  if (!results.length) return null;
  return {
    latitude: parseFloat(parseFloat(results[0].lat).toFixed(4)),
    longitude: parseFloat(parseFloat(results[0].lon).toFixed(4)),
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

async function main() {
  const failed = [];
  const resolved = [];

  console.error(`Geocoding ${MOSQUES.length} mosques (1 req/sec)...\n`);

  for (const m of MOSQUES) {
    console.error(`  → ${m.name} (${m.suburb}, ${m.state})...`);
    const coords = await geocode(m.address);
    if (coords) {
      resolved.push({ ...m, ...coords });
      console.error(`    ✓ ${coords.latitude}, ${coords.longitude}`);
    } else {
      failed.push(m);
      console.error(`    ✗ FAILED — needs manual coordinates`);
    }
    await sleep(1100); // respect Nominatim rate limit
  }

  if (failed.length) {
    console.error(`\n⚠  ${failed.length} mosque(s) failed geocoding:\n`);
    for (const f of failed) {
      console.error(`   - ${f.name}: ${f.address}`);
    }
    console.error('\nAdd manual coordinates for these before running the migration.\n');
  }

  // ── Build SQL ──────────────────────────────────────────────
  const lines = [];

  lines.push('-- Migration 006: Australian Mosque Expansion');
  lines.push(`-- Generated ${new Date().toISOString().split('T')[0]}`);
  lines.push(`-- Adds ${resolved.length} mosques across ${[...new Set(resolved.map(m => m.state))].length} states`);
  lines.push('');
  lines.push('-- ============================================');
  lines.push('-- ADD STATE COLUMN');
  lines.push('-- ============================================');
  lines.push('');
  lines.push('ALTER TABLE mosques ADD COLUMN state TEXT;');
  lines.push('');
  lines.push('-- Backfill existing mosques (all in NSW)');
  lines.push("UPDATE mosques SET state = 'NSW';");
  lines.push('');
  lines.push('-- Now enforce NOT NULL');
  lines.push('ALTER TABLE mosques ALTER COLUMN state SET NOT NULL;');
  lines.push('');
  lines.push('-- ============================================');
  lines.push('-- UNIQUE CONSTRAINT ON NAME');
  lines.push('-- ============================================');
  lines.push('');
  lines.push('ALTER TABLE mosques ADD CONSTRAINT mosques_name_unique UNIQUE (name);');
  lines.push('');
  lines.push('-- ============================================');
  lines.push('-- INDEX ON STATE');
  lines.push('-- ============================================');
  lines.push('');
  lines.push('CREATE INDEX idx_mosques_state ON mosques(state);');
  lines.push('');

  // Group by state
  const byState = {};
  for (const m of resolved) {
    if (!byState[m.state]) byState[m.state] = [];
    byState[m.state].push(m);
  }

  const stateOrder = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'NT', 'TAS'];
  const stateNames = { NSW: 'New South Wales', VIC: 'Victoria', QLD: 'Queensland', WA: 'Western Australia', SA: 'South Australia', ACT: 'Australian Capital Territory', NT: 'Northern Territory', TAS: 'Tasmania' };

  for (const state of stateOrder) {
    const mosques = byState[state];
    if (!mosques?.length) continue;

    lines.push('-- ============================================');
    lines.push(`-- ${stateNames[state]} (${state}) — ${mosques.length} mosques`);
    lines.push('-- ============================================');
    lines.push('');

    for (const m of mosques) {
      lines.push(`INSERT INTO mosques (name, address, suburb, state, latitude, longitude)`);
      lines.push(`VALUES ('${escapeSQL(m.name)}', '${escapeSQL(m.address)}', '${escapeSQL(m.suburb)}', '${m.state}', ${m.latitude}, ${m.longitude})`);
      lines.push(`ON CONFLICT (name) DO NOTHING;`);
      lines.push('');
    }
  }

  // Failed mosques as comments
  if (failed.length) {
    lines.push('-- ============================================');
    lines.push('-- FAILED GEOCODING — needs manual coordinates');
    lines.push('-- ============================================');
    lines.push('');
    for (const f of failed) {
      lines.push(`-- ${f.name}: ${f.address} (${f.state})`);
      lines.push(`-- INSERT INTO mosques (name, address, suburb, state, latitude, longitude)`);
      lines.push(`-- VALUES ('${escapeSQL(f.name)}', '${escapeSQL(f.address)}', '${escapeSQL(f.suburb)}', '${f.state}', ???, ???)`);
      lines.push(`-- ON CONFLICT (name) DO NOTHING;`);
      lines.push('');
    }
  }

  console.log(lines.join('\n'));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
