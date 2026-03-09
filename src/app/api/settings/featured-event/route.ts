import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { FEATURED_EVENT_DEFAULT } from '@/lib/featured-event';
import type { FeaturedEventConfig } from '@/lib/featured-event';

export async function GET() {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'featured_event')
    .single();

  const config: FeaturedEventConfig = data?.value || FEATURED_EVENT_DEFAULT;
  return NextResponse.json(config);
}
