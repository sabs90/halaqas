import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { parseImageWithGroqMulti } from '@/lib/groq';
import { uploadFlyer } from '@/lib/storage';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = image.type || 'image/jpeg';

    const [events, flyer_image_url] = await Promise.all([
      parseImageWithGroqMulti(base64, mimeType),
      uploadFlyer(bytes, image.name || 'flyer.jpg', mimeType),
    ]);

    return NextResponse.json({ events, flyer_image_url });
  } catch (error) {
    console.error('Batch flyer parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse flyer' },
      { status: 500 }
    );
  }
}
