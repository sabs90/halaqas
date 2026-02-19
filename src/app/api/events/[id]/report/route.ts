import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = getServiceClient();

  // Get current event details for old_details snapshot
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('amendments')
    .insert({
      event_id: id,
      reason: body.reason,
      old_details: event,
      new_details: body.new_details || {},
      reporter_contact: body.reporter_contact || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If reason is "ended", auto-archive the event
  if (body.reason === 'ended') {
    await supabase
      .from('events')
      .update({ status: 'archived' })
      .eq('id', id);
  }

  return NextResponse.json(data, { status: 201 });
}
