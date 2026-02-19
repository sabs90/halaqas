import { NextRequest, NextResponse } from 'next/server';
import { parseImageWithGroq } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = image.type || 'image/jpeg';

    const parsed = await parseImageWithGroq(base64, mimeType);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Image parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse image' },
      { status: 500 }
    );
  }
}
