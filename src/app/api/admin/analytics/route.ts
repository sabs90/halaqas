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

  const [allEventsRaw, topMosquesRaw, recentActivity] = await Promise.all([
    // All events in period (for daily_activity, action_breakdown, and page views count)
    supabase
      .from('analytics_events')
      .select('event_name, created_at')
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

  // Build daily_activity and action_breakdown from all events
  const viewEvents = new Set(['mosque_view', 'event_view']);
  const shareEvents = new Set(['whatsapp_share']);
  const calendarEvents = new Set([
    'calendar_download_event', 'calendar_google_event', 'calendar_outlook_event',
    'calendar_download_mosque', 'calendar_subscribe_mosque', 'calendar_feed_fetch',
  ]);
  const submissionEvents = new Set(['event_submission', 'mosque_suggestion', 'feedback_submission']);

  const dailyMap: Record<string, { views: number; shares: number; calendar: number }> = {};
  const actionMap: Record<string, number> = {};
  let pageViewCount = 0;
  let shareCount = 0;
  let calendarCount = 0;
  let submissionCount = 0;

  if (allEventsRaw.data) {
    for (const row of allEventsRaw.data) {
      // Action breakdown
      actionMap[row.event_name] = (actionMap[row.event_name] || 0) + 1;

      // Summary counts
      if (viewEvents.has(row.event_name)) pageViewCount++;
      if (shareEvents.has(row.event_name)) shareCount++;
      if (calendarEvents.has(row.event_name)) calendarCount++;
      if (submissionEvents.has(row.event_name)) submissionCount++;

      // Daily activity
      const day = row.created_at.slice(0, 10); // YYYY-MM-DD
      if (!dailyMap[day]) dailyMap[day] = { views: 0, shares: 0, calendar: 0 };
      if (viewEvents.has(row.event_name)) dailyMap[day].views++;
      else if (shareEvents.has(row.event_name)) dailyMap[day].shares++;
      else if (calendarEvents.has(row.event_name)) dailyMap[day].calendar++;
    }
  }

  const daily_activity = Object.entries(dailyMap)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const action_breakdown = Object.entries(actionMap)
    .map(([event_name, count]) => ({ event_name, count }))
    .sort((a, b) => b.count - a.count);

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
      page_views: pageViewCount,
      shares: shareCount,
      calendar_actions: calendarCount,
      submissions: submissionCount,
      period_days: days,
    },
    daily_activity,
    action_breakdown,
    top_mosques,
    recent_activity: recentActivity.data || [],
  });
}
