'use client';

import { useState, useRef, useEffect } from 'react';
import { trackEvent } from '@/lib/tracking';

interface Props {
  mosqueName: string;
  mosqueId: string;
  icsHttpUrl: string;
}

export function SubscribeCalendarButton({ mosqueName, mosqueId, icsHttpUrl }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleDownload() {
    trackEvent('calendar_download_mosque', { mosque_id: mosqueId });
    const a = document.createElement('a');
    a.href = icsHttpUrl;
    a.download = `${mosqueName.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setOpen(false);
  }

  const webcalUrl = icsHttpUrl.replace(/^https?:\/\//, 'webcal://');

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 text-sm font-semibold px-[22px] py-[10px] rounded-button transition-colors bg-primary text-white hover:bg-primary-light active:bg-primary-dark"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="14" x2="12" y2="18" /><line x1="10" y1="16" x2="14" y2="16" />
        </svg>
        Add All to Calendar
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-sand-dark rounded-card shadow-lg py-1 min-w-[220px]">
          <button
            onClick={handleDownload}
            className="w-full px-4 py-2.5 text-left text-sm text-charcoal hover:bg-sand flex items-center gap-3 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0 text-warm-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <div>
              <div>Download .ics file</div>
              <div className="text-xs text-stone mt-0.5">One-time import</div>
            </div>
          </button>
          <a
            href={webcalUrl}
            onClick={() => {
              trackEvent('calendar_subscribe_mosque', { mosque_id: mosqueId });
              setOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-charcoal hover:bg-sand flex items-center gap-3 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0 text-warm-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <div>
              <div>Subscribe to calendar</div>
              <div className="text-xs text-stone mt-0.5">Live-updating feed</div>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
