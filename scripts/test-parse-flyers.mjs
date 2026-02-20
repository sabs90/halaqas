import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { basename, join, extname } from 'path';

// ── Config ────────────────────────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const FLYERS_DIR = 'example-flyers';
const RESULTS_DIR = 'scripts/flyer-results';
const EXPECTED_FILE = 'scripts/flyer-expected.json';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// ── Read env ──────────────────────────────────────────────────────────
const envContent = readFileSync('.env.local', 'utf8');
const getEnv = (key) => envContent.split('\n').find(l => l.startsWith(key + '='))?.split('=').slice(1).join('=')?.trim();
const GROQ_API_KEY = getEnv('GROQ_API_KEY');
if (!GROQ_API_KEY) { console.error('Missing GROQ_API_KEY in .env.local'); process.exit(1); }

// ── System prompt (working copy — iterate here) ──────────────────────
function getSystemPrompt() {
  const today = '2026-02-20';

  return `You are an event information extractor for Islamic community events in Sydney, Australia.
Today's date in Sydney is ${today}.

Given an image of a flyer or a text message about an event, extract COMMUNITY EVENTS as JSON.

WHAT TO EXTRACT:
- Classes, lectures, talks, halaqas, workshops
- Taraweeh programs, Tahajjud/Qiyam sessions
- Iftar events, charity drives, competitions
- Youth programs, sisters circles
- Any scheduled community gathering

WHAT TO SKIP — DO NOT extract these:
- Regular daily prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha jamaat times). These are NOT events.
- Prayer schedule timetables — only extract the actual community programs listed alongside them (e.g. Taraweeh, Tahajjud, classes).
- Anything that is NOT a scheduled gathering. If people don't come together at a specific time/place, it is NOT an event. Skip: prayer cards, prayer tracking charts, reading challenges done at home, colouring competitions, sticker charts, take-home activities, and any other passive/individual activity.
- I'tikaf / Itikaf programs — extract these but use event_type='itikaf' so they can be filtered.

MULTI-EVENT: If the flyer contains MULTIPLE distinct events, return { "events": [ {...}, {...} ] }. If there is only ONE event, still return { "events": [ { ... } ] }.

MOSQUE/VENUE NAME: Look carefully at the flyer for the mosque or venue name. Check the header/logo area, footer, website URL, and any branding. Common Sydney mosques include: Australian Islamic House (AIH), Dar Ibn Abbas (DIA), Liverpool Islamic Centre (MIA), Punchbowl Mosque, Lakemba Mosque, Masjid Al Noor, etc. If a website is shown (e.g. ibnabbas.com.au), use it as a clue for the venue name. ALWAYS fill in mosque_or_venue — it should never be null if any mosque branding is visible.

Each event object must have these fields:
{
  "title": "string — event title or topic. Use a descriptive name, not just the day/time.",
  "mosque_or_venue": "string — name of mosque or venue as shown on the flyer. Never null if visible.",
  "date": "string — ISO date (YYYY-MM-DD) or null if unclear. Resolve relative dates using today's date. For Ramadan 2026: starts approximately 2026-02-18, ends approximately 2026-03-19. Eid al-Fitr is approximately 2026-03-20.",
  "time": "string — HH:MM in 24hr format, or null. If a specific clock time is given (e.g. '7:30 PM', '3:15 AM'), ALWAYS convert and use this field. Convert 12hr to 24hr format.",
  "prayer_anchor": "string or null — MUST be one of: fajr, dhuhr, asr, maghrib, isha (ALWAYS lowercase), or null. CRITICAL RULE: If a specific clock time is given ANYWHERE for this event (even alongside a prayer reference like 'After Maghrib (7:38PM)' or '7:15 PM'), you MUST set prayer_anchor to null and put the clock time in the 'time' field instead. Only set prayer_anchor when there is NO clock time at all and the time is ONLY described relative to a prayer (e.g. 'after Isha', 'before Maghrib'). 'After Taraweeh' → prayer_anchor='isha'. 'After Adhan/Athan' → use the prayer name it refers to. For iftar events with no specific time, set prayer_anchor='maghrib' and prayer_offset='after' (since iftar is at maghrib).",
  "prayer_offset": "string or null — use 'after' or 'before', optionally with minutes: e.g. 'after', '15 min after', '30 min before', '20 min after', '5 min after'. MUST use 'after' or 'before' (not 'pre' or 'post'). Set this whenever prayer_anchor is set. Must be null if prayer_anchor is null.",
  "speaker": "string — speaker name(s) or null. Include titles like Sheikh, Mufti, Ustadh, Dr, Br, etc.",
  "event_type": "string — MUST be one of: talk, class, quran_circle, iftar, taraweeh, tahajjud, charity, youth, sisters_circle, competition, workshop, other. Use 'taraweeh' for taraweeh prayers. Use 'tahajjud' for tahajjud/qiyam-ul-layl sessions. Use 'itikaf' for i'tikaf/itikaf programs. Use 'competition' for Quran competitions, adhaan competitions, quizzes, kahoot, etc.",
  "language": "string — one of: english, arabic, urdu, turkish, bahasa, mixed, other. Default to 'english' for Sydney events unless another language is indicated.",
  "gender": "string — one of: brothers, sisters, mixed. Look for clues: 'sisters only', 'ladies', 'women', 'mothers', 'sisterhood' → sisters. 'brothers only', 'men only', 'boys only' → brothers. Default to 'mixed' if not specified.",
  "is_recurring": "boolean — MUST be true or false, never null. true if the event repeats (daily, weekly, every night of Ramadan, etc.). Jumuah/Friday khutbahs are ALWAYS recurring with every_friday. One-off events with a specific single date are false.",
  "recurrence_pattern": "string — MUST be one of: every_monday, every_tuesday, every_wednesday, every_thursday, every_friday, every_saturday, every_sunday, daily, daily_ramadan, weekly, fortnightly, monthly, or null. Use 'daily_ramadan' for events that occur every night/day during Ramadan. Use 'every_friday' for Jumuah khutbahs and Friday night programs. Match the pattern to the actual day mentioned (e.g. 'Friday Kahoot Nights' → every_friday, NOT daily_ramadan).",
  "recurrence_end_date": "string — ISO date (YYYY-MM-DD) or null. For ALL Ramadan 2026 recurring events (daily_ramadan, weekly during Ramadan, tahajjud in last 10 nights, etc.), use '2026-03-19'. If the flyer is explicitly about Ramadan (e.g. titled 'Ramadan Lessons', 'Ramadan Program', etc.), ALL recurring events on it end at Ramadan — use '2026-03-19'. Only null for non-Ramadan ongoing events with no stated end.",
  "description": "string — include ALL of these if present on the flyer: number of rak'at, juz coverage (e.g. '1½ Juz every night'), registration links/URLs, contact phone numbers, website URLs, special instructions, topics covered, cost/pricing, capacity limits, age restrictions, and any other useful details. Or null if truly nothing extra.",
  "venue_address": "string — full street address if shown on the flyer, or null",
  "confidence": "number 0-1 — your overall confidence in the extraction"
}

If a field cannot be determined, set it to null. Prefer extracting partial information over returning nothing. Return ONLY valid JSON, no other text.`;
}

// ── Helpers ───────────────────────────────────────────────────────────
function getMimeType(filename) {
  const ext = extname(filename).toLowerCase();
  return ext === '.png' ? 'image/png' : ext === '.jpeg' || ext === '.jpg' ? 'image/jpeg' : 'image/jpeg';
}

async function parseFlyer(filepath) {
  const imageBase64 = readFileSync(filepath).toString('base64');
  const mimeType = getMimeType(filepath);

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: getSystemPrompt() },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
            { type: 'text', text: 'Extract event details from this flyer image.' },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('No content in Groq response');

  const usage = data.usage || {};
  const parsed = JSON.parse(content);

  // Normalize to { events: [...] } format
  let events;
  if (parsed.events && Array.isArray(parsed.events)) {
    events = parsed.events;
  } else {
    events = [parsed];
  }

  return { events, usage };
}

function compareField(key, actual, expected) {
  if (expected === undefined) return null; // no expected value
  if (actual === expected) return { match: true };
  if (actual == null && expected == null) return { match: true };
  // Loose string comparison (case-insensitive, trimmed)
  if (typeof actual === 'string' && typeof expected === 'string') {
    if (actual.trim().toLowerCase() === expected.trim().toLowerCase()) return { match: true };
  }
  return { match: false, actual, expected };
}

function compareEvent(actual, expected) {
  const results = {};
  const allKeys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  let matches = 0, mismatches = 0, unchecked = 0;

  for (const key of allKeys) {
    if (key === 'confidence') continue; // skip confidence in comparison
    const result = compareField(key, actual[key], expected[key]);
    if (result === null) {
      unchecked++;
    } else if (result.match) {
      matches++;
      results[key] = '✓';
    } else {
      mismatches++;
      results[key] = `✗ got "${result.actual}" expected "${result.expected}"`;
    }
  }

  return { results, matches, mismatches, unchecked };
}

function printEvent(event, index, expectedEvent) {
  console.log(`\n  Event ${index + 1}:`);
  const fields = ['title', 'mosque_or_venue', 'date', 'time', 'prayer_anchor', 'prayer_offset',
    'speaker', 'event_type', 'language', 'gender', 'is_recurring', 'recurrence_pattern',
    'recurrence_end_date', 'description', 'venue_address', 'confidence'];

  for (const key of fields) {
    const val = event[key];
    const display = val === null || val === undefined ? '(null)' : String(val);
    let indicator = '  ';

    if (expectedEvent && key !== 'confidence') {
      const cmp = compareField(key, val, expectedEvent[key]);
      if (cmp === null) indicator = '  ';
      else if (cmp.match) indicator = '✓ ';
      else indicator = '✗ ';
    }

    const truncated = display.length > 80 ? display.slice(0, 77) + '...' : display;
    console.log(`    ${indicator}${key.padEnd(22)} ${truncated}`);
  }

  if (expectedEvent) {
    const { matches, mismatches } = compareEvent(event, expectedEvent);
    console.log(`\n    Score: ${matches} match, ${mismatches} mismatch`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const saveFlag = args.includes('--save');
const fileArg = args.find(a => !a.startsWith('--'));

// Ensure results dir
if (!existsSync(RESULTS_DIR)) mkdirSync(RESULTS_DIR, { recursive: true });

// Load expected
let expected = {};
if (existsSync(EXPECTED_FILE)) {
  expected = JSON.parse(readFileSync(EXPECTED_FILE, 'utf8'));
}

// Determine which flyers to run
let flyerFiles;
if (fileArg) {
  // Match against files in the flyers directory
  const all = readdirSync(FLYERS_DIR);
  const match = all.find(f => f === fileArg || f.toLowerCase().includes(fileArg.toLowerCase()));
  if (!match) {
    console.error(`No flyer matching "${fileArg}" found in ${FLYERS_DIR}/`);
    console.error('Available:', all.join(', '));
    process.exit(1);
  }
  flyerFiles = [match];
} else {
  flyerFiles = readdirSync(FLYERS_DIR).filter(f => /\.(jpg|jpeg|png)$/i.test(f)).sort();
}

console.log(`\n${'═'.repeat(70)}`);
console.log(`  Flyer Parse Test — ${flyerFiles.length} flyer(s)`);
console.log(`${'═'.repeat(70)}`);

let totalMatches = 0, totalMismatches = 0, totalTokens = 0;

for (const file of flyerFiles) {
  const filepath = join(FLYERS_DIR, file);
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`📄 ${file}`);
  console.log(`${'─'.repeat(70)}`);

  try {
    const { events, usage } = await parseFlyer(filepath);
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const total = usage.total_tokens || 0;
    totalTokens += total;

    console.log(`  Tokens: ${promptTokens} prompt + ${completionTokens} completion = ${total} total`);
    console.log(`  Events found: ${events.length}`);

    const expectedEvents = expected[file]?.events || [];

    for (let i = 0; i < events.length; i++) {
      const expectedEvent = expectedEvents[i] || null;
      printEvent(events[i], i, expectedEvent);

      if (expectedEvent) {
        const { matches, mismatches } = compareEvent(events[i], expectedEvent);
        totalMatches += matches;
        totalMismatches += mismatches;
      }
    }

    // Save result
    const resultPath = join(RESULTS_DIR, file.replace(/\.[^.]+$/, '.json'));
    writeFileSync(resultPath, JSON.stringify({ events, usage }, null, 2));

    // --save: update expected
    if (saveFlag) {
      expected[file] = { events };
      console.log(`\n  💾 Saved as expected baseline`);
    }

  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
  }
}

// Save expected if --save
if (saveFlag) {
  writeFileSync(EXPECTED_FILE, JSON.stringify(expected, null, 2));
  console.log(`\n💾 Updated ${EXPECTED_FILE}`);
}

// Summary
console.log(`\n${'═'.repeat(70)}`);
console.log(`  Summary`);
console.log(`${'═'.repeat(70)}`);
console.log(`  Flyers tested:  ${flyerFiles.length}`);
console.log(`  Total tokens:   ${totalTokens}`);
if (totalMatches + totalMismatches > 0) {
  console.log(`  Fields matched: ${totalMatches}/${totalMatches + totalMismatches} (${Math.round(totalMatches / (totalMatches + totalMismatches) * 100)}%)`);
}
console.log();
