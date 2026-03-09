import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';
import { FEATURED_EVENT_DEFAULT } from '@/lib/featured-event';
import type { FeaturedEventConfig } from '@/lib/featured-event';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'featured_event')
    .single();

  const config: FeaturedEventConfig = data?.value || FEATURED_EVENT_DEFAULT;
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const config: FeaturedEventConfig = {
    enabled: !!body.enabled,
    type: body.type || 'tahajjud',
    label: body.label || 'Tahajjud',
    href: body.href || '/tahajjud',
  };

  const supabase = getServiceClient();
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'featured_event', value: config, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(config);
}
