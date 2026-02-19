import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { generateICS } from '@/lib/ics-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getServiceClient();

  const { data: mosque } = await supabase
    .from('mosques')
    .select('*')
    .eq('id', id)
    .single();

  if (!mosque) return new NextResponse('Mosque not found', { status: 404 });

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('mosque_id', id)
    .eq('status', 'active');

  const icsContent = generateICS(events || [], mosque);

  return new NextResponse(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${mosque.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
