import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { uploadFlyer } from '@/lib/storage';

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('image') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const url = await uploadFlyer(buffer, file.name, file.type);
  return NextResponse.json({ url });
}
