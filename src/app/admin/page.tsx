'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute top-3 right-3 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold text-white bg-secondary rounded-full">
      {count}
    </span>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [counts, setCounts] = useState<{ submissions: number; amendments: number; suggestions: number; health: number } | null>(null);

  useEffect(() => {
    // Check if already authenticated by trying to fetch admin data
    fetch('/api/admin/auth')
      .then(r => {
        if (r.ok) {
          setAuthenticated(true);
          fetch('/api/admin/counts').then(r => r.ok ? r.json() : null).then(setCounts);
        }
      })
      .finally(() => setChecking(false));
  }, []);

  async function handleLogin() {
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      fetch('/api/admin/counts').then(r => r.ok ? r.json() : null).then(setCounts);
    } else {
      setError('Invalid password');
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthenticated(false);
    setPassword('');
  }

  if (checking) {
    return <div className="text-center py-16 text-warm-gray">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto py-16 space-y-4">
        <h1 className="text-[28px] font-bold text-charcoal text-center">Admin</h1>
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password"
            className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
          />
        </div>
        {error && <p className="text-sm text-secondary">{error}</p>}
        <Button variant="primary" onClick={handleLogin} className="w-full">
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-charcoal">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Log Out</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/review" className="flex items-center gap-4 bg-white border border-amber-300 rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all relative">
          <svg className="w-10 h-10 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <h2 className="text-lg font-bold text-charcoal">Review Submissions</h2>
            <p className="text-sm text-warm-gray mt-0.5">Approve or reject user-submitted events before they go live.</p>
          </div>
          {counts && counts.submissions > 0 && <Badge count={counts.submissions} />}
        </Link>
        <Link href="/admin/amendments" className="flex items-center gap-4 bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all relative">
          <svg className="w-10 h-10 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <h2 className="text-lg font-bold text-charcoal">Review Amendments</h2>
            <p className="text-sm text-warm-gray mt-0.5">Review and approve or reject reported issues.</p>
          </div>
          {counts && counts.amendments > 0 && <Badge count={counts.amendments} />}
        </Link>
        <Link href="/admin/events" className="flex items-center gap-4 bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <svg className="w-10 h-10 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <div>
            <h2 className="text-lg font-bold text-charcoal">Manage Events</h2>
            <p className="text-sm text-warm-gray mt-0.5">Edit, archive, or delete events.</p>
          </div>
        </Link>
        <Link href="/admin/mosques/manage" className="flex items-center gap-4 bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <svg className="w-10 h-10 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          <div>
            <h2 className="text-lg font-bold text-charcoal">Manage Mosques</h2>
            <p className="text-sm text-warm-gray mt-0.5">View and edit mosque details, addresses, and status.</p>
          </div>
        </Link>
        <Link href="/admin/mosques" className="flex items-center gap-4 bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all relative">
          <svg className="w-10 h-10 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <div>
            <h2 className="text-lg font-bold text-charcoal">Mosque Suggestions</h2>
            <p className="text-sm text-warm-gray mt-0.5">Review and approve suggested mosques from users.</p>
          </div>
          {counts && counts.suggestions > 0 && <Badge count={counts.suggestions} />}
        </Link>
        <Link href="/admin/batch" className="flex items-center gap-4 bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <svg className="w-10 h-10 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <div>
            <h2 className="text-lg font-bold text-charcoal">Batch Process Flyers</h2>
            <p className="text-sm text-warm-gray mt-0.5">Upload multiple flyers, review extracted events, and submit in bulk.</p>
          </div>
        </Link>
        <Link href="/admin/analytics" className="flex items-center gap-4 bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <svg className="w-10 h-10 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <div>
            <h2 className="text-lg font-bold text-charcoal">Analytics</h2>
            <p className="text-sm text-warm-gray mt-0.5">View page views, popular mosques, and tracking data.</p>
          </div>
        </Link>
        <Link href="/admin/outreach" className="flex items-center gap-4 bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <svg className="w-10 h-10 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <div>
            <h2 className="text-lg font-bold text-charcoal">Facebook Outreach</h2>
            <p className="text-sm text-warm-gray mt-0.5">Check mosque Facebook pages for new events to add.</p>
          </div>
        </Link>
        <Link href="/admin/health" className="flex items-center gap-4 bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all relative">
          <svg className="w-10 h-10 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <div>
            <h2 className="text-lg font-bold text-charcoal">Data Health</h2>
            <p className="text-sm text-warm-gray mt-0.5">Orphaned events, duplicates, and stale recurring events.</p>
          </div>
          {counts && counts.health > 0 && <Badge count={counts.health} />}
        </Link>
        <Link href="/admin/settings" className="flex items-center gap-4 bg-white border border-primary/30 rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <svg className="w-10 h-10 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <div>
            <h2 className="text-lg font-bold text-charcoal">Site Settings</h2>
            <p className="text-sm text-warm-gray mt-0.5">Featured event toggle, nav configuration, and site-wide settings.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
