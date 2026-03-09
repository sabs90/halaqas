import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, ids, action } = await request.json();

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Bulk approve
  if (ids && Array.isArray(ids) && ids.length > 0 && action === 'approve') {
    const { error } = await supabase
      .from('events')
      .update({ status: 'active', last_confirmed_at: new Date().toISOString() })
      .in('id', ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: ids.length });
  }

  if (!id) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (action === 'approve') {
    const { error } = await supabase
      .from('events')
      .update({ status: 'active', last_confirmed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
