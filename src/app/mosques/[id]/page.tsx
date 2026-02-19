import { getServiceClient } from '@/lib/supabase';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

async function getMosque(id: string) {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('mosques')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

async function getMosqueEvents(mosqueId: string) {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('mosque_id', mosqueId)
    .eq('status', 'active')
    .or(`is_recurring.eq.true,fixed_date.is.null,fixed_date.gte.${today}`)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const mosque = await getMosque(id);
  if (!mosque) return { title: 'Mosque Not Found' };
  return {
    title: mosque.name,
    description: `Upcoming events at ${mosque.name}, ${mosque.suburb}`,
  };
}

export default async function MosqueDetailPage({ params }: Props) {
  const { id } = await params;
  const mosque = await getMosque(id);
  if (!mosque) notFound();

  const events = await getMosqueEvents(id);
  const calendarUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://halaqas.com'}/api/mosques/${id}/calendar.ics`;

  return (
    <div className="space-y-6">
      <Link href="/mosques" className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-primary transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to mosques
      </Link>

      <div className="bg-white border border-sand-dark rounded-card p-6">
        <h1 className="text-[28px] font-bold text-charcoal">{mosque.name}</h1>
        <p className="mt-2 text-sm text-warm-gray flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {mosque.address}
        </p>
        <p className="mt-1 text-xs text-stone">{mosque.suburb}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="primary" href={calendarUrl}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Subscribe to Calendar
          </Button>
          <Button variant="outline" href={`/events?mosque=${mosque.id}`}>
            View in Directory
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-charcoal mb-4">
          Upcoming Events ({events.length})
        </h2>

        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-sand rounded-card">
            <p className="text-warm-gray text-sm">No events listed yet for this mosque.</p>
            <Button variant="secondary" href="/submit" className="mt-4">
              Submit an Event
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
