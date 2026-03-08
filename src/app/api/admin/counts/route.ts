import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();

  const today = new Date().toISOString().split('T')[0];

  const [submissions, amendments, suggestions, orphaned, staleNoEnd, stalePastEnd] = await Promise.all([
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('amendments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('mosque_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('events').select('id', { count: 'exact', head: true }).is('mosque_id', null).not('venue_name', 'is', null),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_recurring', true).is('recurrence_end_date', null),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_recurring', true).lt('recurrence_end_date', today),
  ]);

  return NextResponse.json({
    submissions: submissions.count ?? 0,
    amendments: amendments.count ?? 0,
    suggestions: suggestions.count ?? 0,
    health: (orphaned.count ?? 0) + (staleNoEnd.count ?? 0) + (stalePastEnd.count ?? 0),
  });
}
