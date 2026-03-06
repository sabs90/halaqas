import { getServiceClient } from '@/lib/supabase';

/**
 * Server-side fire-and-forget analytics insert.
 * Used in server components and API route handlers.
 * Never throws — analytics failures must not break page renders.
 */
export function trackServerEvent(
  name: string,
  data?: {
    mosque_id?: string;
    event_id?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  try {
    const supabase = getServiceClient();
    supabase
      .from('analytics_events')
      .insert({
        event_name: name,
        mosque_id: data?.mosque_id || null,
        event_id: data?.event_id || null,
        metadata: data?.metadata || {},
      })
      .then(() => {});
  } catch {
    // Silently ignore
  }
}
