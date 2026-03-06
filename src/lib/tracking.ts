declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, unknown>) => void;
    };
  }
}

interface TrackingData {
  mosque_id?: string;
  event_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget client-side tracking.
 * Sends to both Supabase (domain metrics) and Umami (general analytics).
 * Never throws, never blocks UI.
 */
export function trackEvent(name: string, data?: TrackingData): void {
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: name,
        mosque_id: data?.mosque_id || null,
        event_id: data?.event_id || null,
        metadata: data?.metadata || {},
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silently ignore
  }

  try {
    window.umami?.track(name, {
      mosque_id: data?.mosque_id,
      event_id: data?.event_id,
      ...data?.metadata,
    });
  } catch {
    // Silently ignore
  }
}
