import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, address, suburb, latitude, longitude, suggested_by_contact } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from('mosque_suggestions').insert({
    name: name.trim(),
    address: address?.trim() || null,
    suburb: suburb?.trim() || null,
    latitude: latitude || null,
    longitude: longitude || null,
    suggested_by_contact: suggested_by_contact?.trim() || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
