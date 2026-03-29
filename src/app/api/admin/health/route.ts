import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';

function normalizeMosqueName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(masjid|mosque|islamic\s+cent(re|er)|musallah|prayer\s+room|al-|al\s+)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();

  const [eventsRes, mosquesRes] = await Promise.all([
    supabase.from('events').select('*, mosque:mosques(id, name)'),
    supabase.from('mosques').select('*').eq('active', true).order('name'),
  ]);

  if (eventsRes.error) return NextResponse.json({ error: eventsRes.error.message }, { status: 500 });
  if (mosquesRes.error) return NextResponse.json({ error: mosquesRes.error.message }, { status: 500 });

  const events = eventsRes.data ?? [];
  const mosques = mosquesRes.data ?? [];

  // 1. Orphaned events: have venue_name but no mosque_id
  const orphaned_events = events
    .filter(e => !e.mosque_id && e.venue_name)
    .map(e => ({ id: e.id, title: e.title, venue_name: e.venue_name, fixed_date: e.fixed_date, status: e.status }));

  // 2. Possible duplicate mosques: similar normalized names
  const possible_dupe_mosques: { mosque_a: { id: string; name: string }; mosque_b: { id: string; name: string } }[] = [];
  const normalized = mosques.map(m => ({ ...m, normalized: normalizeMosqueName(m.name) }));
  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const a = normalized[i];
      const b = normalized[j];
      if (
        a.normalized === b.normalized ||
        (a.normalized.length >= 3 && b.normalized.length >= 3 &&
          (a.normalized.includes(b.normalized) || b.normalized.includes(a.normalized)))
      ) {
        possible_dupe_mosques.push({
          mosque_a: { id: a.id, name: a.name },
          mosque_b: { id: b.id, name: b.name },
        });
      }
    }
  }

  // Count events per mosque for dupe display
  const eventCountByMosque: Record<string, number> = {};
  for (const e of events) {
    if (e.mosque_id) {
      eventCountByMosque[e.mosque_id] = (eventCountByMosque[e.mosque_id] ?? 0) + 1;
    }
  }
  const dupe_mosques_with_counts = possible_dupe_mosques.map(pair => ({
    ...pair,
    mosque_a_event_count: eventCountByMosque[pair.mosque_a.id] ?? 0,
    mosque_b_event_count: eventCountByMosque[pair.mosque_b.id] ?? 0,
  }));

  // 3. Possible duplicate events: same mosque, case-insensitive title match
  const eventsByMosque: Record<string, typeof events> = {};
  for (const e of events) {
    if (e.mosque_id) {
      if (!eventsByMosque[e.mosque_id]) eventsByMosque[e.mosque_id] = [];
      eventsByMosque[e.mosque_id].push(e);
    }
  }
  const pickEventFields = (e: typeof events[number]) => ({
    id: e.id,
    title: e.title,
    mosque_id: e.mosque_id,
    venue_name: e.venue_name,
    venue_address: e.venue_address,
    event_type: e.event_type,
    language: e.language,
    gender: e.gender,
    fixed_date: e.fixed_date,
    fixed_time: e.fixed_time,
    time_mode: e.time_mode,
    prayer_anchor: e.prayer_anchor,
    prayer_offset_minutes: e.prayer_offset_minutes,
    is_recurring: e.is_recurring,
    recurrence_pattern: e.recurrence_pattern,
    recurrence_end_date: e.recurrence_end_date,
    speaker: e.speaker,
    description: e.description,
    is_kids: e.is_kids,
    is_family: e.is_family,
    flyer_image_url: e.flyer_image_url,
    status: e.status,
    created_at: e.created_at,
  });
  const possible_dupe_events: { event_a: ReturnType<typeof pickEventFields>; event_b: ReturnType<typeof pickEventFields>; mosque_name: string }[] = [];
  for (const [mosqueId, mosqueEvents] of Object.entries(eventsByMosque)) {
    for (let i = 0; i < mosqueEvents.length; i++) {
      for (let j = i + 1; j < mosqueEvents.length; j++) {
        if (mosqueEvents[i].title?.toLowerCase() === mosqueEvents[j].title?.toLowerCase()) {
          const mosque = mosques.find(m => m.id === mosqueId);
          possible_dupe_events.push({
            event_a: pickEventFields(mosqueEvents[i]),
            event_b: pickEventFields(mosqueEvents[j]),
            mosque_name: mosque?.name ?? 'Unknown',
          });
        }
      }
    }
  }

  // 4. Stale recurring events: active, and no end date or end date has passed
  const today = new Date().toISOString().split('T')[0];
  const stale_recurring = events
    .filter(e => e.status === 'active' && e.is_recurring && (!e.recurrence_end_date || e.recurrence_end_date < today))
    .map(e => ({
      id: e.id,
      title: e.title,
      mosque_name: e.mosque?.name ?? e.venue_name ?? 'Unknown',
      recurrence_end_date: e.recurrence_end_date,
      is_recurring: e.is_recurring,
      status: e.status,
    }));

  return NextResponse.json({
    orphaned_events,
    possible_dupe_mosques: dupe_mosques_with_counts,
    possible_dupe_events,
    stale_recurring,
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, ...params } = await request.json();
  const supabase = getServiceClient();

  // Link orphaned event to a mosque
  if (action === 'link_event') {
    const { event_id, mosque_id } = params;
    const { error } = await supabase.from('events').update({ mosque_id }).eq('id', event_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Merge duplicate mosques (move events and analytics from source → target, delete source)
  if (action === 'merge_mosques') {
    const { source_id, target_id } = params;

    // Reassign events
    const { error: eventsError } = await supabase
      .from('events')
      .update({ mosque_id: target_id })
      .eq('mosque_id', source_id);
    if (eventsError) return NextResponse.json({ error: eventsError.message }, { status: 500 });

    // Reassign analytics
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .update({ mosque_id: target_id })
      .eq('mosque_id', source_id);
    if (analyticsError) return NextResponse.json({ error: analyticsError.message }, { status: 500 });

    // Delete source mosque
    const { error: deleteError } = await supabase.from('mosques').delete().eq('id', source_id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }

  // Set end date on stale recurring event
  if (action === 'set_end_date') {
    const { event_id, recurrence_end_date } = params;
    const { error } = await supabase.from('events').update({ recurrence_end_date }).eq('id', event_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Archive event
  if (action === 'archive_event') {
    const { event_id } = params;
    const { error } = await supabase.from('events').update({ status: 'archived' }).eq('id', event_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Delete event
  if (action === 'delete_event') {
    const { event_id } = params;
    const { error } = await supabase.from('events').delete().eq('id', event_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
