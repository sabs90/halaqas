import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { image_url } = await request.json();
  if (!image_url) {
    return NextResponse.json({ error: 'No image_url provided' }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
  }

  // Fetch image and convert to base64 (Groq needs data URL)
  const imgRes = await fetch(image_url);
  if (!imgRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
  }
  const buffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: `You extract concise descriptions from Islamic event flyers. Return ONLY a JSON object: { "description": "..." }

Write 1-2 sentences with the most useful details a potential attendee would want to know. Include any of these if visible:
- Number of rak'at, juz/ajza coverage
- Time range (e.g. "11pm - 3am")
- Special notes (khatm, tafseer, live translation, etc.)
- Registration or cost info
- Any other practical details

Keep it factual and brief. Do NOT include the event title, mosque name, date, speaker, or recurrence — those are stored separately. If there are no extra details worth noting, return { "description": null }.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${contentType};base64,${base64}` },
            },
            { type: 'text', text: 'Extract a concise description from this flyer.' },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error: `Groq API error: ${response.status}` }, { status: 500 });
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
  }

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json({ description: parsed.description || null });
  } catch {
    return NextResponse.json({ description: content.trim() });
  }
}
