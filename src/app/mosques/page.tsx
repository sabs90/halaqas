import { Suspense } from 'react';
import { getServiceClient } from '@/lib/supabase';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MosqueSearch } from './MosqueSearch';
import type { Mosque } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Mosques',
  description: 'Browse Australian mosques and discover their upcoming events and programs.',
};

export const revalidate = 300;

const STATE_NAMES: Record<string, string> = {
  NSW: 'New South Wales',
  VIC: 'Victoria',
  QLD: 'Queensland',
  WA: 'Western Australia',
  SA: 'South Australia',
  ACT: 'Australian Capital Territory',
  NT: 'Northern Territory',
  TAS: 'Tasmania',
};

interface Props {
  searchParams: Promise<{ state?: string }>;
}

async function getMosques(state?: string) {
  const supabase = getServiceClient();
  const effectiveState = state ?? 'NSW';

  let mosqueQuery = supabase
    .from('mosques')
    .select('*')
    .eq('active', true)
    .order('name');

  if (effectiveState !== 'all') {
    mosqueQuery = mosqueQuery.eq('state', effectiveState);
  }

  const { data: mosques } = await mosqueQuery;
  return { mosques: (mosques || []) as Mosque[], effectiveState };
}

export default async function MosquesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { mosques, effectiveState } = await getMosques(params.state);

  const stateName = effectiveState !== 'all' ? STATE_NAMES[effectiveState] || effectiveState : null;

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold text-charcoal">Mosques</h1>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-warm-gray">
          {stateName
            ? `Browse mosques in ${stateName} and discover their upcoming events.`
            : 'Browse Australian mosques and discover their upcoming events.'}
        </p>
        <Link
          href="/mosques/suggest"
          className="shrink-0 text-sm font-semibold bg-primary text-white px-4 py-2 rounded-button hover:bg-primary-light transition-colors"
        >
          + Suggest a Mosque
        </Link>
      </div>

      <Suspense fallback={<div className="h-10 bg-sand rounded-card animate-pulse" />}>
        <MosqueSearch mosques={mosques} />
      </Suspense>
    </div>
  );
}
