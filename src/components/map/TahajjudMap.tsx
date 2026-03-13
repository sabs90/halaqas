'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

function createLabelIcon(time: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
    ">
      <div style="
        background: #1E5248;
        color: white;
        font-size: 13px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 8px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        line-height: 1.2;
      ">${time}</div>
      <div style="
        width: 0;
        height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 7px solid #1E5248;
      "></div>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -35],
  });
}

export interface TahajjudPin {
  eventId: string;
  mosqueName: string;
  suburb?: string;
  time: string;
  latitude: number;
  longitude: number;
}

export function TahajjudMap({ pins }: { pins: TahajjudPin[] }) {
  const center: [number, number] = [-33.8688, 151.0693];

  return (
    <div className="relative rounded-card overflow-hidden border border-sand-dark">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((pin) => (
          <Marker key={pin.eventId} position={[pin.latitude, pin.longitude]} icon={createLabelIcon(pin.time)}>
            <Popup>
              <div className="min-w-[180px]">
                <h3 className="font-bold text-sm text-charcoal">{pin.mosqueName}</h3>
                {pin.suburb && (
                  <p className="text-xs text-warm-gray mt-0.5">{pin.suburb}</p>
                )}
                <p className="text-sm font-bold text-primary mt-1">{pin.time}</p>
                <Link href={`/events/${pin.eventId}`} className="block text-xs text-secondary font-medium mt-2 hover:underline">
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
