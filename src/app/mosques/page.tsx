import { getServiceClient } from '@/lib/supabase';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mosques',
  description: 'Browse Sydney mosques and discover their upcoming events and programs.',
};

export const dynamic = 'force-dynamic';

async function getMosques() {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('mosques')
    .select('*, events:events(count)')
    .eq('active', true)
    .order('name');
  return data || [];
}

export default async function MosquesPage() {
  const mosques = await getMosques();

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold text-charcoal">Mosques</h1>
      <p className="text-sm text-warm-gray">Browse Sydney mosques and discover their upcoming events.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {mosques.map((mosque) => (
          <Link key={mosque.id} href={`/mosques/${mosque.id}`} className="block">
            <div className="bg-white border border-sand-dark rounded-card p-5 transition-all hover:border-primary hover:shadow-card-hover">
              <h3 className="text-base font-bold text-charcoal">{mosque.name}</h3>
              <p className="mt-1 text-sm text-warm-gray flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {mosque.address}
              </p>
              <p className="mt-2 text-xs text-stone">{mosque.suburb}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
