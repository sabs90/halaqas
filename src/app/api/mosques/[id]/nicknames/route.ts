import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const nickname = (body.nickname || '').trim();

  if (nickname.length < 2) {
    return NextResponse.json({ error: 'Nickname too short' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Fetch current mosque
  const { data: mosque, error: fetchError } = await supabase
    .from('mosques')
    .select('name, nicknames')
    .eq('id', id)
    .single();

  if (fetchError || !mosque) {
    return NextResponse.json({ error: 'Mosque not found' }, { status: 404 });
  }

  // Skip if nickname matches the formal name
  if (mosque.name.toLowerCase().includes(nickname.toLowerCase())) {
    return NextResponse.json({ skipped: true });
  }

  // Skip if already in the nicknames array
  const existing = mosque.nicknames || [];
  const alreadyExists = existing.some(
    (n: string) => n.toLowerCase() === nickname.toLowerCase()
  );
  if (alreadyExists) {
    return NextResponse.json({ skipped: true });
  }

  // Append the new nickname
  const { error: updateError } = await supabase
    .from('mosques')
    .update({ nicknames: [...existing, nickname] })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ added: true });
}
