import type { ParsedEventData } from './types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are an event information extractor for Islamic community events in Sydney, Australia.

Given an image of a flyer or a text message about an event, extract the following fields as JSON:

{
  "title": "string — event title or topic",
  "mosque_or_venue": "string — name of mosque or venue",
  "date": "string — ISO date (YYYY-MM-DD) or null if unclear",
  "time": "string — HH:MM in 24hr format, or null",
  "prayer_anchor": "string — fajr/dhuhr/asr/maghrib/isha if time is relative to a prayer, or null",
  "prayer_offset": "string — e.g. 'after', '15 min after', '30 min before', or null",
  "speaker": "string — speaker name(s) or null",
  "event_type": "string — talk/class/quran_circle/iftar/taraweeh/charity/youth/sisters_circle/other",
  "language": "string — english/arabic/urdu/turkish/bahasa/mixed/other",
  "gender": "string — brothers/sisters/mixed",
  "is_recurring": "boolean",
  "recurrence_pattern": "string — e.g. 'every thursday', 'daily during ramadan', or null",
  "description": "string — any additional details, or null",
  "confidence": "number 0-1 — your overall confidence in the extraction"
}

If a field cannot be determined, set it to null. Prefer extracting partial information over returning nothing. Dates should be interpreted relative to the current date in Sydney, Australia. Return ONLY valid JSON, no other text.`;

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
        { role: 'system', content: SYSTEM_PROMPT },
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
      max_tokens: 1024,
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

  return JSON.parse(content) as ParsedEventData;
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
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Extract event details from this text message:\n\n${text}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
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

  return JSON.parse(content) as ParsedEventData;
}
