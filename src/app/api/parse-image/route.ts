import { NextRequest, NextResponse } from 'next/server';
import { parseImageWithGroq } from '@/lib/groq';
import { uploadToR2 } from '@/lib/r2';

export const maxDuration = 60;

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

    const [parsed, flyer_image_url] = await Promise.all([
      parseImageWithGroq(base64, mimeType),
      uploadToR2(bytes, image.name || 'flyer.jpg', mimeType),
    ]);

    return NextResponse.json({ ...parsed, flyer_image_url });
  } catch (error) {
    console.error('Image parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse image' },
      { status: 500 }
    );
  }
}
