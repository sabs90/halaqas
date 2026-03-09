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
        <Link href="/admin/review" className="block bg-white border border-amber-300 rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all relative">
          <h2 className="text-lg font-bold text-charcoal">Review Submissions</h2>
          <p className="text-sm text-warm-gray mt-1">Approve or reject user-submitted events before they go live.</p>
          {counts && counts.submissions > 0 && <Badge count={counts.submissions} />}
        </Link>
        <Link href="/admin/amendments" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all relative">
          <h2 className="text-lg font-bold text-charcoal">Review Amendments</h2>
          <p className="text-sm text-warm-gray mt-1">Review and approve or reject reported issues.</p>
          {counts && counts.amendments > 0 && <Badge count={counts.amendments} />}
        </Link>
        <Link href="/admin/events" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <h2 className="text-lg font-bold text-charcoal">Manage Events</h2>
          <p className="text-sm text-warm-gray mt-1">Edit, archive, or delete events.</p>
        </Link>
        <Link href="/admin/mosques/manage" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <h2 className="text-lg font-bold text-charcoal">Manage Mosques</h2>
          <p className="text-sm text-warm-gray mt-1">View and edit mosque details, addresses, and status.</p>
        </Link>
        <Link href="/admin/mosques" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all relative">
          <h2 className="text-lg font-bold text-charcoal">Mosque Suggestions</h2>
          <p className="text-sm text-warm-gray mt-1">Review and approve suggested mosques from users.</p>
          {counts && counts.suggestions > 0 && <Badge count={counts.suggestions} />}
        </Link>
        <Link href="/admin/batch" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <h2 className="text-lg font-bold text-charcoal">Batch Process Flyers</h2>
          <p className="text-sm text-warm-gray mt-1">Upload multiple flyers, review extracted events, and submit in bulk.</p>
        </Link>
        <Link href="/admin/analytics" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <h2 className="text-lg font-bold text-charcoal">Analytics</h2>
          <p className="text-sm text-warm-gray mt-1">View page views, popular mosques, and tracking data.</p>
        </Link>
        <Link href="/admin/outreach" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <h2 className="text-lg font-bold text-charcoal">Facebook Outreach</h2>
          <p className="text-sm text-warm-gray mt-1">Check mosque Facebook pages for new events to add.</p>
        </Link>
        <Link href="/admin/health" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all relative">
          <h2 className="text-lg font-bold text-charcoal">Data Health</h2>
          <p className="text-sm text-warm-gray mt-1">Orphaned events, duplicates, and stale recurring events.</p>
          {counts && counts.health > 0 && <Badge count={counts.health} />}
        </Link>
        <Link href="/admin/settings" className="block bg-white border border-primary/30 rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <h2 className="text-lg font-bold text-charcoal">Site Settings</h2>
          <p className="text-sm text-warm-gray mt-1">Featured event toggle, nav configuration, and site-wide settings.</p>
        </Link>
      </div>
    </div>
  );
}
