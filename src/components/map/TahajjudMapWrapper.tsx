'use client';

import dynamic from 'next/dynamic';
import type { TahajjudPin } from './TahajjudMap';

const TahajjudMap = dynamic(() => import('./TahajjudMap').then(m => m.TahajjudMap), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-sand rounded-card animate-pulse flex items-center justify-center">
      <p className="text-warm-gray text-sm">Loading map...</p>
    </div>
  ),
});

export function TahajjudMapWrapper({ pins }: { pins: TahajjudPin[] }) {
  return <TahajjudMap pins={pins} />;
}
