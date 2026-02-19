'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Mosque, Event } from '@/lib/types';
import Link from 'next/link';

// Fix default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const VenueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  function handleLocate() {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 14 });
    map.once('locationfound', () => setLocating(false));
    map.once('locationerror', () => setLocating(false));
  }

  return (
    <button
      onClick={handleLocate}
      className="absolute top-3 right-3 z-[1000] bg-white border border-sand-dark rounded-button px-3 py-2 text-sm font-medium text-charcoal shadow-dropdown hover:border-primary transition-colors"
    >
      {locating ? 'Locating...' : '📍 Near me'}
    </button>
  );
}

interface EventMapProps {
  mosques: Mosque[];
  events: Event[];
}

export function EventMap({ mosques, events }: EventMapProps) {
  const eventsByMosque = events.reduce((acc, event) => {
    const key = event.mosque_id || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Venue events: no mosque_id but have coordinates
  const venueEvents = events.filter(
    e => !e.mosque_id && e.venue_latitude && e.venue_longitude
  );

  // Sydney centre
  const center: [number, number] = [-33.8688, 151.0693];

  return (
    <div className="relative rounded-card overflow-hidden border border-sand-dark">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocateButton />

        {mosques.map((mosque) => {
          const mosqueEvents = eventsByMosque[mosque.id] || [];
          return (
            <Marker key={mosque.id} position={[mosque.latitude, mosque.longitude]}>
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-sm text-charcoal">{mosque.name}</h3>
                  <p className="text-xs text-warm-gray mt-1">{mosque.address}</p>
                  {mosqueEvents.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-semibold text-primary">{mosqueEvents.length} event{mosqueEvents.length > 1 ? 's' : ''}</p>
                      {mosqueEvents.slice(0, 3).map(e => (
                        <Link key={e.id} href={`/events/${e.id}`} className="block text-xs text-secondary hover:underline">
                          {e.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone mt-2">No events listed</p>
                  )}
                  <Link href={`/mosques/${mosque.id}`} className="block text-xs text-primary font-medium mt-2 hover:underline">
                    View mosque page →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {venueEvents.map((event) => (
          <Marker
            key={`venue-${event.id}`}
            position={[event.venue_latitude!, event.venue_longitude!]}
            icon={VenueIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-sm text-charcoal">{event.venue_name}</h3>
                {event.venue_address && (
                  <p className="text-xs text-warm-gray mt-1">{event.venue_address}</p>
                )}
                <Link href={`/events/${event.id}`} className="block text-xs text-secondary hover:underline mt-2">
                  {event.title}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
