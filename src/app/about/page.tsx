import { Button } from '@/components/ui/Button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Halaqas — a free community project for the Sydney Muslim community.',
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-[28px] font-bold text-charcoal">About Halaqas</h1>

      <section className="space-y-4 text-[15px] text-warm-gray leading-relaxed">
        <p>
          <strong className="text-charcoal">Halaqas</strong> (حلقات — &quot;circles&quot; or &quot;gatherings&quot;) is a free,
          community-powered website that collates Islamic events and programs across Sydney mosques
          into a single searchable directory with subscribable calendars.
        </p>
        <p>
          Think of it as the missing layer on top of <strong className="text-charcoal">Go Pray</strong>:
          Go Pray tells you <em>where</em> to pray, Halaqas tells you <em>what&apos;s on</em>.
        </p>
      </section>

      <section className="bg-sand rounded-card p-6 space-y-3">
        <h2 className="text-xl font-bold text-charcoal">The Problem</h2>
        <p className="text-sm text-warm-gray leading-relaxed">
          Event information across Sydney&apos;s mosques is fragmented. Talks, classes, Quran circles,
          and community programs are announced through mosque-specific WhatsApp groups, occasional
          Facebook posts, and physical flyers. There is no single place to discover what&apos;s happening
          across the city.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-charcoal">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white border border-sand-dark rounded-card p-4">
            <h3 className="font-bold text-charcoal text-sm mb-1">Browse & Filter</h3>
            <p className="text-sm text-warm-gray">
              Search events by mosque, suburb, event type, language, or gender. Find what&apos;s on near you.
            </p>
          </div>
          <div className="bg-white border border-sand-dark rounded-card p-4">
            <h3 className="font-bold text-charcoal text-sm mb-1">Subscribe</h3>
            <p className="text-sm text-warm-gray">
              Add any mosque&apos;s calendar to your phone. New events appear automatically.
            </p>
          </div>
          <div className="bg-white border border-sand-dark rounded-card p-4">
            <h3 className="font-bold text-charcoal text-sm mb-1">Contribute</h3>
            <p className="text-sm text-warm-gray">
              Upload a flyer or paste a WhatsApp message. AI extracts the details — you just confirm.
            </p>
          </div>
          <div className="bg-white border border-sand-dark rounded-card p-4">
            <h3 className="font-bold text-charcoal text-sm mb-1">Share</h3>
            <p className="text-sm text-warm-gray">
              Share events via WhatsApp with a single tap. Rich previews included.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-charcoal">Community Powered</h2>
        <p className="text-sm text-warm-gray leading-relaxed">
          Halaqas is a not-for-profit community project. It costs essentially nothing to run
          (all infrastructure is on free tiers), has no ads, no user accounts, and no revenue model.
          It exists purely to help Sydney&apos;s Muslim community connect with Islamic events and programs.
        </p>
        <p className="text-sm text-warm-gray leading-relaxed">
          Anyone can submit events. If you spot an error, use the report button on any event to flag it.
        </p>
      </section>

      <div className="flex gap-3">
        <Button variant="primary" href="/events">Browse Events</Button>
        <Button variant="secondary" href="/submit">Submit an Event</Button>
      </div>
    </div>
  );
}
