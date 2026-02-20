import type { ParsedEventData } from './types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getSystemPrompt(): string {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });

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

/** Extract the first event from a multi-event Groq response */
function extractFirstEvent(content: string): ParsedEventData {
  const events = extractAllEvents(content);
  return events[0];
}

/** Extract all events from a multi-event Groq response */
function extractAllEvents(content: string): ParsedEventData[] {
  const parsed = JSON.parse(content);
  const events = (parsed.events && Array.isArray(parsed.events))
    ? parsed.events as ParsedEventData[]
    : [parsed as ParsedEventData];
  return backfillRecurrenceEndDate(events);
}

/** If any sibling event has a recurrence_end_date, apply it to all recurring events missing one */
function backfillRecurrenceEndDate(events: ParsedEventData[]): ParsedEventData[] {
  const endDate = events.find(e => e.recurrence_end_date)?.recurrence_end_date;
  if (!endDate) return events;
  return events.map(e =>
    e.is_recurring && !e.recurrence_end_date ? { ...e, recurrence_end_date: endDate } : e
  );
}

export async function parseImageWithGroq(imageBase64: string, mimeType: string): Promise<ParsedEventData> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
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

  return extractFirstEvent(content);
}

export async function parseImageWithGroqMulti(imageBase64: string, mimeType: string): Promise<ParsedEventData[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
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

  return extractAllEvents(content);
}

export async function parseTextWithGroq(text: string): Promise<ParsedEventData> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        {
          role: 'user',
          content: `Extract event details from this text message:\n\n${text}`,
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

  return extractFirstEvent(content);
}
