'use client';

import dynamic from 'next/dynamic';
import type { Mosque, Event } from '@/lib/types';

const EventMap = dynamic(() => import('./EventMap').then(m => m.EventMap), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-sand rounded-card animate-pulse flex items-center justify-center">
      <p className="text-warm-gray text-sm">Loading map...</p>
    </div>
  ),
});

export function MapWrapper({ mosques, events }: { mosques: Mosque[]; events: Event[] }) {
  return <EventMap mosques={mosques} events={events} />;
}
