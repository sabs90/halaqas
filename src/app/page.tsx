import { Hero } from '@/components/ui/Hero';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getUpcomingEvents() {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('events')
    .select('*, mosque:mosques(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}

export default async function HomePage() {
  const events = await getUpcomingEvents();

  return (
    <div className="space-y-8">
      <Hero />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[28px] font-bold text-charcoal">Upcoming Events</h2>
          <Button variant="outline" href="/events">
            View All
          </Button>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-sand rounded-card">
            <p className="text-warm-gray text-sm">No events yet. Be the first to submit one!</p>
            <Button variant="secondary" href="/submit" className="mt-4">
              Submit an Event
            </Button>
          </div>
        )}
      </section>

      <section className="bg-sand rounded-card p-6 sm:p-8">
        <h2 className="text-xl font-bold text-charcoal mb-2">How Halaqas Works</h2>
        <div className="grid gap-6 sm:grid-cols-3 mt-4">
          <div>
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-bold text-charcoal text-sm">Browse</h3>
            <p className="text-sm text-warm-gray mt-1">
              Search events by mosque, suburb, type, language, or day of the week.
            </p>
          </div>
          <div>
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-bold text-charcoal text-sm">Subscribe</h3>
            <p className="text-sm text-warm-gray mt-1">
              Add any mosque&apos;s calendar to your phone for automatic updates.
            </p>
          </div>
          <div>
            <div className="text-2xl mb-2">📤</div>
            <h3 className="font-bold text-charcoal text-sm">Contribute</h3>
            <p className="text-sm text-warm-gray mt-1">
              Upload a flyer or paste a message — AI extracts the details for you.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
