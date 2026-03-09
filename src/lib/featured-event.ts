import type { EventType } from './types';

export interface FeaturedEventConfig {
  enabled: boolean;
  type: EventType;
  label: string;
  href: string;
}

export const FEATURED_EVENT_DEFAULT: FeaturedEventConfig = {
  enabled: true,
  type: 'tahajjud',
  label: 'Tahajjud',
  href: '/tahajjud',
};

// Event types that can be featured (ones that make sense as standalone pages)
export const FEATURABLE_TYPES: { value: EventType; label: string; href: string }[] = [
  { value: 'tahajjud', label: 'Tahajjud', href: '/tahajjud' },
  { value: 'taraweeh', label: 'Taraweeh', href: '/tahajjud' },
  { value: 'itikaf', label: "I'tikaf", href: '/tahajjud' },
  { value: 'eid_prayers', label: 'Eid Prayers', href: '/tahajjud' },
  { value: 'eid_event', label: 'Eid Event', href: '/tahajjud' },
  { value: 'iftar', label: 'Iftar', href: '/tahajjud' },
];
