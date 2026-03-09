'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FEATURABLE_TYPES } from '@/lib/featured-event';
import type { FeaturedEventConfig } from '@/lib/featured-event';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<FeaturedEventConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings/featured-event')
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null; }
        return r.json();
      })
      .then(data => { if (data) setConfig(data); });
  }, [router]);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/settings/featured-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleTypeChange(type: string) {
    const preset = FEATURABLE_TYPES.find(t => t.value === type);
    setConfig(prev => prev ? {
      ...prev,
      type: type as FeaturedEventConfig['type'],
      label: preset?.label || type,
      href: '/tahajjud',
    } : prev);
  }

  if (!config) {
    return <div className="text-center py-16 text-warm-gray">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin')} className="text-sm text-warm-gray hover:text-charcoal">
          &larr; Dashboard
        </button>
      </div>

      <h1 className="text-[28px] font-bold text-charcoal">Site Settings</h1>

      {/* Featured Event Section */}
      <div className="bg-white border border-sand-dark rounded-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-charcoal">Featured Event</h2>
            <p className="text-sm text-warm-gray mt-0.5">Controls the special nav link and featured page</p>
          </div>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              config.enabled ? 'bg-primary' : 'bg-sand-dark'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <hr className="border-sand-dark" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Event Type</label>
            <select
              value={config.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal"
            >
              {FEATURABLE_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Nav Label</label>
            <input
              type="text"
              value={config.label}
              onChange={(e) => setConfig({ ...config, label: e.target.value })}
              className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-charcoal mb-1">Page URL</label>
            <input
              type="text"
              value={config.href}
              onChange={(e) => setConfig({ ...config, href: e.target.value })}
              className="w-full text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone"
            />
            <p className="text-xs text-stone mt-1">The path users visit (e.g. /tahajjud). The page at this URL must exist.</p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-sand/50 rounded-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone mb-2">Preview</p>
          {config.enabled ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary bg-primary/[0.06] px-3 py-2 rounded-button">
                {config.label}
              </span>
              <span className="text-xs text-warm-gray">appears in nav bar, linking to <code className="text-charcoal">{config.href}</code></span>
            </div>
          ) : (
            <p className="text-sm text-warm-gray">Featured event is disabled. No special nav link will appear.</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          {saved && <span className="text-sm font-medium text-primary">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
