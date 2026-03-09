import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getServiceClient } from '@/lib/supabase';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Get all mosques with event counts
  const { data: mosques, error: mErr } = await supabase
    .from('mosques')
    .select('id, name, suburb, state, facebook_url, website_url, last_checked_at')
    .order('state')
    .order('name');

  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }

  // Get event counts per mosque
  const { data: events, error: eErr } = await supabase
    .from('events')
    .select('mosque_id, created_at')
    .eq('status', 'active');

  if (eErr) {
    return NextResponse.json({ error: eErr.message }, { status: 500 });
  }

  // Build counts and latest event date per mosque
  const countMap: Record<string, { count: number; latest: string | null }> = {};
  for (const e of events || []) {
    if (!countMap[e.mosque_id]) {
      countMap[e.mosque_id] = { count: 0, latest: null };
    }
    countMap[e.mosque_id].count++;
    if (!countMap[e.mosque_id].latest || e.created_at > countMap[e.mosque_id].latest!) {
      countMap[e.mosque_id].latest = e.created_at;
    }
  }

  const result = (mosques || []).map(m => ({
    ...m,
    event_count: countMap[m.id]?.count || 0,
    latest_event_at: countMap[m.id]?.latest || null,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing mosque id' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from('mosques')
    .update({ last_checked_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
