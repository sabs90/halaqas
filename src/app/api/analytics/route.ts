import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

const VALID_EVENTS = new Set([
  'mosque_view',
  'event_view',
  'calendar_download_event',
  'calendar_google_event',
  'calendar_outlook_event',
  'calendar_download_mosque',
  'calendar_subscribe_mosque',
  'calendar_feed_fetch',
  'whatsapp_share',
  'event_submission',
  'mosque_suggestion',
  'feedback_submission',
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_name, mosque_id, event_id, metadata } = body;

    if (!event_name || !VALID_EVENTS.has(event_name)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const supabase = getServiceClient();
    await supabase.from('analytics_events').insert({
      event_name,
      mosque_id: mosque_id || null,
      event_id: event_id || null,
      metadata: metadata || {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
