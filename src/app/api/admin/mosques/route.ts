import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
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
      latitude: suggestion.latitude || 0,
      longitude: suggestion.longitude || 0,
      nicknames: [],
      active: true,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
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

  return NextResponse.json({ success: true });
}
