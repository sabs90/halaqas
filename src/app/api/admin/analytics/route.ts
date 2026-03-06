import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const days = parseInt(searchParams.get('period') || '30');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const supabase = getServiceClient();

  const [pageViews, topMosquesRaw, recentActivity] = await Promise.all([
    // Page views in period
    supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .in('event_name', ['mosque_view', 'event_view'])
      .gte('created_at', since),

    // Mosque-related events for aggregation
    supabase
      .from('analytics_events')
      .select('mosque_id, event_name')
      .in('event_name', ['mosque_view', 'calendar_download_mosque', 'calendar_subscribe_mosque', 'calendar_feed_fetch'])
      .not('mosque_id', 'is', null)
      .gte('created_at', since),

    // Recent activity feed
    supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  // Aggregate top mosques in JS
  const mosqueStats: Record<string, { views: number; downloads: number }> = {};
  if (topMosquesRaw.data) {
    for (const row of topMosquesRaw.data) {
      if (!row.mosque_id) continue;
      if (!mosqueStats[row.mosque_id]) {
        mosqueStats[row.mosque_id] = { views: 0, downloads: 0 };
      }
      if (row.event_name === 'mosque_view') {
        mosqueStats[row.mosque_id].views++;
      } else {
        mosqueStats[row.mosque_id].downloads++;
      }
    }
  }

  // Fetch mosque names for the top mosques
  const mosqueIds = Object.keys(mosqueStats);
  let mosqueNames: Record<string, { name: string; suburb: string }> = {};
  if (mosqueIds.length > 0) {
    const { data: mosques } = await supabase
      .from('mosques')
      .select('id, name, suburb')
      .in('id', mosqueIds);
    if (mosques) {
      mosqueNames = Object.fromEntries(
        mosques.map(m => [m.id, { name: m.name, suburb: m.suburb }])
      );
    }
  }

  const top_mosques = Object.entries(mosqueStats)
    .map(([id, stats]) => ({
      mosque_id: id,
      mosque_name: mosqueNames[id]?.name || 'Unknown',
      suburb: mosqueNames[id]?.suburb || '',
      views: stats.views,
      downloads: stats.downloads,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  return NextResponse.json({
    overview: {
      page_views: pageViews.count || 0,
      period_days: days,
    },
    top_mosques,
    recent_activity: recentActivity.data || [],
  });
}
