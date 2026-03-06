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

  const { id, action } = await request.json();

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = getServiceClient();

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
