import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();

  const [submissions, amendments, suggestions] = await Promise.all([
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('amendments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('mosque_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return NextResponse.json({
    submissions: submissions.count ?? 0,
    amendments: amendments.count ?? 0,
    suggestions: suggestions.count ?? 0,
  });
}
