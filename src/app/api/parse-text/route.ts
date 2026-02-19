import { NextRequest, NextResponse } from 'next/server';
import { parseTextWithGroq } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const parsed = await parseTextWithGroq(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Text parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse text' },
      { status: 500 }
    );
  }
}
