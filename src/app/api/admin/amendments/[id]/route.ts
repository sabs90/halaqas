import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await request.json(); // 'approve' or 'reject'
  const supabase = getServiceClient();

  if (action === 'approve') {
    // Get the amendment
    const { data: amendment } = await supabase
      .from('amendments')
      .select('*')
      .eq('id', id)
      .single();

    if (!amendment) return NextResponse.json({ error: 'Amendment not found' }, { status: 404 });

    // Apply changes to the event if there are new details
    if (amendment.new_details && Object.keys(amendment.new_details).length > 0) {
      const updates: Record<string, unknown> = {};
      const details = amendment.new_details as Record<string, unknown>;
      // Only apply known fields
      const allowedFields = ['title', 'description', 'speaker', 'event_type', 'language', 'gender',
        'fixed_date', 'fixed_time', 'prayer_anchor', 'prayer_offset_minutes', 'is_recurring', 'recurrence_pattern'];
      for (const field of allowedFields) {
        if (field in details) updates[field] = details[field];
      }
      if (Object.keys(updates).length > 0) {
        await supabase.from('events').update(updates).eq('id', amendment.event_id);
      }
    }

    // If reason is "ended", archive the event
    if (amendment.reason === 'ended') {
      await supabase.from('events').update({ status: 'archived' }).eq('id', amendment.event_id);
    }
  }

  // Update amendment status
  const { error } = await supabase
    .from('amendments')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
