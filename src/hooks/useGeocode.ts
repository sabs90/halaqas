'use client';

import { useState, useEffect, useRef } from 'react';

interface GeoCoords {
  latitude: number;
  longitude: number;
}

const cache = new Map<string, GeoCoords | null>();

/**
 * Debounced geocoding hook. Only fires when textMatchCount is 0
 * (i.e. text-based search found nothing) and query is >= 3 chars.
 */
export function useGeocode(
  query: string,
  textMatchCount: number,
  debounceMs = 150
): { coords: GeoCoords | null; isGeocoding: boolean } {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Don't geocode if text matching already found results, or query is too short
    if (textMatchCount > 0 || query.length < 3) {
      setCoords(null);
      setIsGeocoding(false);
      return;
    }

    const key = query.toLowerCase().trim();

    // Check cache
    if (cache.has(key)) {
      setCoords(cache.get(key)!);
      setIsGeocoding(false);
      return;
    }

    setIsGeocoding(true);

    const timer = setTimeout(async () => {
      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: query }),
          signal: controller.signal,
        });

        if (!res.ok) {
          cache.set(key, null);
          setCoords(null);
          setIsGeocoding(false);
          return;
        }

        const data = await res.json();
        const result = data.coordinates
          ? { latitude: data.coordinates.lat, longitude: data.coordinates.lng }
          : null;

        cache.set(key, result);
        setCoords(result);
      } catch {
        // Aborted or network error — don't cache
        if (!controller.signal.aborted) {
          cache.set(key, null);
          setCoords(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsGeocoding(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
      setIsGeocoding(false);
    };
  }, [query, textMatchCount, debounceMs]);

  return { coords, isGeocoding };
}
