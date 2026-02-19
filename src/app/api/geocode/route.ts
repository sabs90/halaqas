import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { geocodeAddress } from '@/lib/geocoding';
import { haversineDistance } from '@/lib/haversine';
import type { Mosque } from '@/lib/types';

const NEARBY_RADIUS_KM = 0.5;

export async function POST(request: NextRequest) {
  const { address } = await request.json();
  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  const coordinates = await geocodeAddress(address);
  if (!coordinates) {
    return NextResponse.json({ coordinates: null, nearbyMosques: [] });
  }

  const supabase = getServiceClient();
  const { data: mosques } = await supabase
    .from('mosques')
    .select('*')
    .eq('active', true);

  const nearbyMosques: Mosque[] = (mosques || []).filter((m: Mosque) =>
    haversineDistance(coordinates.latitude, coordinates.longitude, m.latitude, m.longitude) <= NEARBY_RADIUS_KM
  );

  return NextResponse.json({
    coordinates: { lat: coordinates.latitude, lng: coordinates.longitude },
    nearbyMosques,
  });
}
