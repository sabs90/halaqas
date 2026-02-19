import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('amendments')
    .select('*, event:events(*, mosque:mosques(*))')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
