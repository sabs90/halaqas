import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { searchParams } = new URL(request.url);

  if (searchParams.get('list') === 'all') {
    const { data, error } = await supabase
      .from('mosques')
      .select('*')
      .order('name');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('mosque_suggestions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, action } = await request.json();
  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = getServiceClient();
  let linkedEvents = 0;

  if (action === 'approve') {
    // Fetch the suggestion
    const { data: suggestion, error: fetchError } = await supabase
      .from('mosque_suggestions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    // Insert into mosques table
    const { error: insertError } = await supabase.from('mosques').insert({
      name: suggestion.name,
      address: suggestion.address || '',
      suburb: suggestion.suburb || '',
      state: suggestion.state || 'NSW',
      latitude: suggestion.latitude || 0,
      longitude: suggestion.longitude || 0,
      nicknames: [],
      active: true,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Auto-link events with matching venue_name to the new mosque
    const { data: newMosque } = await supabase
      .from('mosques')
      .select('id')
      .ilike('name', suggestion.name)
      .single();

    if (newMosque) {
      const { data: linked } = await supabase
        .from('events')
        .update({ mosque_id: newMosque.id })
        .is('mosque_id', null)
        .ilike('venue_name', suggestion.name)
        .select('id');
      linkedEvents = linked?.length || 0;
    }

    // Mark suggestion as approved
    const { error: updateError } = await supabase
      .from('mosque_suggestions')
      .update({ status: 'approved' })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    // Reject
    const { error: updateError } = await supabase
      .from('mosque_suggestions')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, linked_events: action === 'approve' ? linkedEvents : 0 });
}

const ALLOWED_FIELDS = ['name', 'address', 'suburb', 'state', 'latitude', 'longitude', 'nicknames', 'active'];

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...rest } = body;
  if (!id) {
    return NextResponse.json({ error: 'Missing mosque id' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in rest) updates[key] = rest[key];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from('mosques').update(updates).eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
