import type { Metadata } from 'next';
import { getServiceClient } from '@/lib/supabase';
import { MapWrapper } from '@/components/map/MapWrapper';

export const metadata: Metadata = {
  title: 'Map',
  description: 'Find mosques and events near you on the map.',
};

export const dynamic = 'force-dynamic';

async function getMosquesWithEvents() {
  const supabase = getServiceClient();
  const { data: mosques } = await supabase
    .from('mosques')
    .select('*')
    .eq('active', true);

  const { data: events } = await supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('status', 'active');

  return { mosques: mosques || [], events: events || [] };
}

export default async function MapPage() {
  const { mosques, events } = await getMosquesWithEvents();

  return (
    <div className="space-y-4">
      <h1 className="text-[28px] font-bold text-charcoal">Map</h1>
      <p className="text-sm text-warm-gray">Find mosques and events near you.</p>
      <MapWrapper mosques={mosques} events={events} />
    </div>
  );
}
