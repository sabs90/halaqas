'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MosqueStat {
  mosque_id: string;
  mosque_name: string;
  suburb: string;
  views: number;
  downloads: number;
}

interface ActivityItem {
  id: string;
  event_name: string;
  mosque_id: string | null;
  event_id: string | null;
  created_at: string;
}

interface DailyActivity {
  date: string;
  views: number;
  shares: number;
  calendar: number;
}

interface ActionBreakdown {
  event_name: string;
  count: number;
}

interface AnalyticsData {
  overview: {
    page_views: number;
    shares: number;
    calendar_actions: number;
    submissions: number;
    period_days: number;
  };
  daily_activity: DailyActivity[];
  action_breakdown: ActionBreakdown[];
  top_mosques: MosqueStat[];
  recent_activity: ActivityItem[];
}

const EVENT_LABELS: Record<string, string> = {
  mosque_view: 'Mosque page view',
  event_view: 'Event page view',
  calendar_download_event: 'Calendar download (event)',
  calendar_google_event: 'Google Calendar (event)',
  calendar_outlook_event: 'Outlook Calendar (event)',
  calendar_download_mosque: 'Calendar download (mosque)',
  calendar_subscribe_mosque: 'Calendar subscribe (mosque)',
  calendar_feed_fetch: 'Calendar feed fetch',
  whatsapp_share: 'WhatsApp share',
  event_submission: 'Event submitted',
  mosque_suggestion: 'Mosque suggested',
  feedback_submission: 'Feedback submitted',
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return <div className="text-center py-16 text-warm-gray">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-center py-16 text-warm-gray">Failed to load analytics.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm text-warm-gray hover:text-primary">&larr; Admin</Link>
          <h1 className="text-[28px] font-bold text-charcoal">Analytics</h1>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Page Views', value: data.overview.page_views, color: 'text-primary' },
          { label: 'WhatsApp Shares', value: data.overview.shares, color: 'text-terracotta' },
          { label: 'Calendar Actions', value: data.overview.calendar_actions, color: 'text-sage-dark' },
          { label: 'Submissions', value: data.overview.submissions, color: 'text-charcoal' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-sand-dark rounded-card p-4 text-center">
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-warm-gray mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Daily activity bar chart */}
      {data.daily_activity.length > 0 && (
        <div className="bg-white border border-sand-dark rounded-card p-6">
          <h2 className="text-lg font-bold text-charcoal mb-4">Daily Activity</h2>
          <div className="flex items-end gap-[2px] h-40">
            {(() => {
              const maxTotal = Math.max(...data.daily_activity.map(d => d.views + d.shares + d.calendar), 1);
              return data.daily_activity.map(day => {
                const total = day.views + day.shares + day.calendar;
                const pct = (total / maxTotal) * 100;
                const viewsPct = total > 0 ? (day.views / total) * pct : 0;
                const sharesPct = total > 0 ? (day.shares / total) * pct : 0;
                const calPct = total > 0 ? (day.calendar / total) * pct : 0;
                const dateLabel = new Date(day.date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center min-w-0" title={`${dateLabel}: ${total} events`}>
                    <div className="w-full flex flex-col justify-end" style={{ height: '128px' }}>
                      <div className="w-full rounded-t-sm bg-[#7C9A8E]" style={{ height: `${calPct}%` }} />
                      <div className="w-full bg-[#C4704B]" style={{ height: `${sharesPct}%` }} />
                      <div className="w-full rounded-b-sm bg-[#1E5248]" style={{ height: `${viewsPct}%` }} />
                    </div>
                    <span className="text-[9px] text-stone mt-1 truncate w-full text-center leading-tight">
                      {data.daily_activity.length <= 14 ? dateLabel : (
                        // Show every nth label for longer periods
                        data.daily_activity.indexOf(day) % Math.ceil(data.daily_activity.length / 10) === 0 ? dateLabel : ''
                      )}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-warm-gray">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-[#1E5248]" /> Views</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-[#C4704B]" /> Shares</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-[#7C9A8E]" /> Calendar</span>
          </div>
        </div>
      )}

      {/* Action breakdown */}
      {data.action_breakdown.length > 0 && (
        <div className="bg-white border border-sand-dark rounded-card p-6">
          <h2 className="text-lg font-bold text-charcoal mb-4">Action Breakdown</h2>
          <div className="space-y-2">
            {(() => {
              const maxCount = data.action_breakdown[0]?.count || 1;
              return data.action_breakdown.map(item => (
                <div key={item.event_name} className="flex items-center gap-3 text-sm">
                  <span className="w-40 shrink-0 text-charcoal truncate">
                    {EVENT_LABELS[item.event_name] || item.event_name}
                  </span>
                  <div className="flex-1 h-5 bg-sand rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-warm-gray w-8 text-right">{item.count}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Most popular mosques */}
      <div className="bg-white border border-sand-dark rounded-card p-6">
        <h2 className="text-lg font-bold text-charcoal mb-4">Most Popular Mosques</h2>
        {data.top_mosques.length === 0 ? (
          <p className="text-sm text-warm-gray">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-dark text-left">
                  <th className="pb-2 text-stone font-medium">#</th>
                  <th className="pb-2 text-stone font-medium">Mosque</th>
                  <th className="pb-2 text-stone font-medium">Suburb</th>
                  <th className="pb-2 text-stone font-medium text-right">Views</th>
                  <th className="pb-2 text-stone font-medium text-right">Cal Downloads</th>
                </tr>
              </thead>
              <tbody>
                {data.top_mosques.map((m, i) => (
                  <tr key={m.mosque_id} className="border-b border-sand-dark/50">
                    <td className="py-2 text-warm-gray">{i + 1}</td>
                    <td className="py-2 text-charcoal font-medium">
                      <Link href={`/mosques/${m.mosque_id}`} className="hover:text-primary">
                        {m.mosque_name}
                      </Link>
                    </td>
                    <td className="py-2 text-warm-gray">{m.suburb}</td>
                    <td className="py-2 text-charcoal text-right">{m.views}</td>
                    <td className="py-2 text-charcoal text-right">{m.downloads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent activity feed */}
      <div className="bg-white border border-sand-dark rounded-card p-6">
        <h2 className="text-lg font-bold text-charcoal mb-4">Recent Activity</h2>
        {data.recent_activity.length === 0 ? (
          <p className="text-sm text-warm-gray">No activity tracked yet.</p>
        ) : (
          <div className="space-y-2">
            {data.recent_activity.map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm py-1 border-b border-sand-dark/50 last:border-0">
                <span className="text-charcoal">
                  {EVENT_LABELS[a.event_name] || a.event_name}
                </span>
                <span className="text-xs text-stone shrink-0 ml-4">
                  {new Date(a.created_at).toLocaleString('en-AU', {
                    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
