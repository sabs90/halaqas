'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already authenticated by trying to fetch admin data
    fetch('/api/admin/events')
      .then(r => { if (r.ok) setAuthenticated(true); })
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
        <Link href="/admin/amendments" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <h2 className="text-lg font-bold text-charcoal">Review Amendments</h2>
          <p className="text-sm text-warm-gray mt-1">Review and approve or reject reported issues.</p>
        </Link>
        <Link href="/admin/events" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <h2 className="text-lg font-bold text-charcoal">Manage Events</h2>
          <p className="text-sm text-warm-gray mt-1">Edit, archive, or delete events.</p>
        </Link>
        <Link href="/admin/mosques" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <h2 className="text-lg font-bold text-charcoal">Mosque Suggestions</h2>
          <p className="text-sm text-warm-gray mt-1">Review and approve suggested mosques from users.</p>
        </Link>
        <Link href="/admin/feedback" className="block bg-white border border-sand-dark rounded-card p-6 hover:border-primary hover:shadow-card-hover transition-all">
          <h2 className="text-lg font-bold text-charcoal">Feedback</h2>
          <p className="text-sm text-warm-gray mt-1">Review messages and feedback from users.</p>
        </Link>
      </div>
    </div>
  );
}
