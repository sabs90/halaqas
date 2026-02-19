export async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  const query = encodeURIComponent(`${address}, Sydney, Australia`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=au`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Halaqas/1.0' },
  });

  if (!response.ok) return null;

  const results = await response.json();
  if (!results.length) return null;

  return {
    latitude: parseFloat(results[0].lat),
    longitude: parseFloat(results[0].lon),
  };
}
