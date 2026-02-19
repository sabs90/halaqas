import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = getServiceClient();
  const { searchParams } = request.nextUrl;

  let query = supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const type = searchParams.get('type');
  const language = searchParams.get('language');
  const gender = searchParams.get('gender');
  const mosqueId = searchParams.get('mosque');
  const limit = searchParams.get('limit');

  if (type) query = query.eq('event_type', type);
  if (language) query = query.eq('language', language);
  if (gender) query = query.eq('gender', gender);
  if (mosqueId) query = query.eq('mosque_id', mosqueId);
  if (limit) query = query.limit(parseInt(limit));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('events')
    .insert({
      mosque_id: body.mosque_id || null,
      venue_name: body.venue_name || null,
      venue_address: body.venue_address || null,
      title: body.title,
      description: body.description || null,
      event_type: body.event_type || 'other',
      speaker: body.speaker || null,
      language: body.language || 'english',
      gender: body.gender || 'mixed',
      time_mode: body.time_mode || 'fixed',
      fixed_date: body.fixed_date || null,
      fixed_time: body.fixed_time || null,
      prayer_anchor: body.prayer_anchor || null,
      prayer_offset_minutes: body.prayer_offset_minutes || 0,
      is_recurring: body.is_recurring || false,
      recurrence_pattern: body.recurrence_pattern || null,
      flyer_image_url: body.flyer_image_url || null,
      submitter_contact: body.submitter_contact || null,
      status: 'active',
      last_confirmed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
