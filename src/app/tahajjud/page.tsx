import Link from 'next/link';
import { getServiceClient } from '@/lib/supabase';
import { getEventTime } from '@/lib/prayer-times';
import { parseDetailSummary } from '@/lib/parse-details';
import { IslamicPattern } from '@/components/ui/IslamicPattern';
import type { Event } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Tahajjud Prayers — Halaqas',
  description: 'Find tahajjud (night prayer) times across Sydney mosques during Ramadan.',
};

const STATE_LABELS: Record<string, string> = {
  NSW: 'New South Wales',
  VIC: 'Victoria',
  QLD: 'Queensland',
  WA: 'Western Australia',
  SA: 'South Australia',
  ACT: 'Australian Capital Territory',
  TAS: 'Tasmania',
  NT: 'Northern Territory',
};

const STATE_ORDER = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS', 'NT'];

function getTimeDisplay(event: Event): string {
  if (event.time_mode === 'prayer_anchored' && event.prayer_anchor) {
    const { label } = getEventTime(event.prayer_anchor, event.prayer_offset_minutes || 0);
    return label;
  }
  if (event.fixed_time) {
    const [h, m] = event.fixed_time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return 'Time TBA';
}

function getTimeSort(event: Event): number {
  if (event.fixed_time) {
    const [h, m] = event.fixed_time.split(':').map(Number);
    return h * 60 + m;
  }
  if (event.time_mode === 'prayer_anchored' && event.prayer_anchor) {
    const { calculatedTime } = getEventTime(event.prayer_anchor, event.prayer_offset_minutes || 0);
    return calculatedTime.getHours() * 60 + calculatedTime.getMinutes();
  }
  return 9999;
}

async function getTahajjudEvents(): Promise<Event[]> {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('events')
    .select('id, title, event_type, status, is_recurring, recurrence_pattern, last_confirmed_at, time_mode, prayer_anchor, prayer_offset_minutes, fixed_time, fixed_date, language, gender, speaker, is_kids, is_family, venue_name, venue_latitude, venue_longitude, description, detail_summary, mosque_id, mosque:mosques(id, name, suburb, nicknames, latitude, longitude, state)')
    .eq('status', 'active')
    .eq('event_type', 'tahajjud')
    .or(`is_recurring.eq.true,fixed_date.is.null,fixed_date.gte.${today}`)
    .limit(50);

  if (error) console.error('Tahajjud query error:', error);
  const events = (data || []) as unknown as Event[];
  events.sort((a, b) => getTimeSort(a) - getTimeSort(b));
  return events;
}

function getDetailSummary(event: Event): string | null {
  return event.detail_summary || parseDetailSummary(event.description);
}

function groupByState(events: Event[]): { state: string; events: Event[] }[] {
  const map = new Map<string, Event[]>();
  for (const event of events) {
    const state = event.mosque?.state || 'Other';
    if (!map.has(state)) map.set(state, []);
    map.get(state)!.push(event);
  }
  const groups: { state: string; events: Event[] }[] = [];
  for (const state of STATE_ORDER) {
    if (map.has(state)) {
      groups.push({ state, events: map.get(state)! });
      map.delete(state);
    }
  }
  for (const [state, evts] of map) {
    groups.push({ state, events: evts });
  }
  return groups;
}

export default async function TahajjudPage() {
  const events = await getTahajjudEvents();
  const groups = groupByState(events);
  const tableGroups = groupByState([...events].sort((a, b) =>
    (a.mosque?.name || a.venue_name || '').localeCompare(b.mosque?.name || b.venue_name || '')
  ));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative bg-primary rounded-2xl overflow-hidden px-6 py-10 sm:px-12 sm:py-14">
        <IslamicPattern />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Ramadan 2026</p>
          <h1 className="text-[32px] sm:text-[36px] font-extrabold text-white leading-tight">
            Tahajjud Prayers
          </h1>
          <p className="mt-3 text-[15px] text-white/85 sm:text-lg">
            Find qiyam prayers at mosques across Australia
          </p>
          <p className="mt-2 text-sm text-white/50">
            {events.length} {events.length === 1 ? 'prayer' : 'prayers'} listed
          </p>
        </div>
      </section>

      {/* Compact shareable table */}
      {events.length > 0 && (
        <section className="bg-white border border-sand-dark rounded-2xl overflow-hidden">
          <div className="bg-primary px-3 sm:px-5 py-3 flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Tahajjud Times — Ramadan 2026</h2>
            <span className="text-[10px] sm:text-xs font-medium text-white/60">halaqas.au</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-0">
              <tbody>
                {tableGroups.map(({ state, events: stateEvents }) => {
                  let rowIndex = 0;
                  return [
                    <tr key={`state-${state}`}>
                      <td colSpan={3} className="bg-primary/[0.05] px-3 sm:px-5 py-1.5 border-b border-sand-dark">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{state}</span>
                      </td>
                    </tr>,
                    ...stateEvents.map((event) => {
                      const mosqueName = event.mosque?.name || event.venue_name || 'Unknown';
                      const suburb = event.mosque?.suburb;
                      const details = getDetailSummary(event);
                      const stripe = rowIndex++ % 2 === 0 ? 'bg-white' : 'bg-sand/30';
                      const href = `/events/${event.id}`;
                      return (
                        <tr key={event.id} className={`${stripe} hover:bg-primary/[0.04] transition-colors`}>
                          <td className="pl-3 sm:pl-5 pr-2 sm:pr-3 py-1.5 sm:py-2">
                            <Link href={href}>
                              <span className="text-[11px] sm:text-[13px] font-semibold text-charcoal">{mosqueName}</span>
                              {details && (
                                <span className="block text-[9px] sm:text-[11px] text-secondary leading-tight mt-0.5">{details}</span>
                              )}
                            </Link>
                          </td>
                          <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-[13px] text-warm-gray whitespace-nowrap">
                            <Link href={href}>{suburb}</Link>
                          </td>
                          <td className="pl-2 sm:pl-3 pr-3 sm:pr-5 py-1.5 sm:py-2 text-[11px] sm:text-[13px] font-bold text-primary text-right whitespace-nowrap">
                            <Link href={href}>{getTimeDisplay(event)}</Link>
                          </td>
                        </tr>
                      );
                    }),
                  ];
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-sand/40 px-3 sm:px-5 py-2 border-t border-sand-dark text-center">
            <p className="text-[11px] text-stone">Visit <span className="font-semibold text-primary">halaqas.au/tahajjud</span> for details &amp; more</p>
          </div>
        </section>
      )}

      {events.length === 0 ? (
        <div className="text-center py-12 bg-sand rounded-card">
          <p className="text-warm-gray text-sm">No tahajjud events found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ state, events: stateEvents }) => (
            <section key={state}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-charcoal">{STATE_LABELS[state] || state}</h2>
                <span className="text-xs font-semibold text-white bg-primary/80 px-2 py-0.5 rounded-pill">
                  {stateEvents.length}
                </span>
                <div className="flex-1 h-px bg-sand-dark" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {stateEvents.map((event) => {
                  const mosqueName = event.mosque?.name || event.venue_name || 'Unknown venue';
                  const suburb = event.mosque?.suburb;

                  return (
                    <Link key={event.id} href={`/events/${event.id}`} className="block group">
                      <article className="bg-white border border-sand-dark rounded-card p-5 transition-all group-hover:border-primary group-hover:shadow-card-hover h-full">
                        {/* Time badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/[0.07] px-2.5 py-1 rounded-pill">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {getTimeDisplay(event)}
                          </span>
                          {suburb && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-warm-gray">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                              </svg>
                              {suburb}
                            </span>
                          )}
                        </div>

                        {/* Mosque name */}
                        <h3 className="text-[17px] font-bold text-charcoal leading-snug group-hover:text-primary transition-colors">
                          {mosqueName}
                        </h3>

                        {/* Description */}
                        {event.description && (
                          <p className="mt-2 text-[13px] text-stone leading-relaxed line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        {/* Speaker */}
                        {event.speaker && (
                          <p className="mt-2 text-xs text-warm-gray">
                            <span className="text-stone">Led by </span>
                            <span className="font-medium text-charcoal">{event.speaker}</span>
                          </p>
                        )}
                      </article>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
