import type { EventType } from '@/lib/types';

const TAG_STYLES: Record<EventType, { bg: string; text: string }> = {
  talk: { bg: 'rgba(30, 82, 72, 0.08)', text: '#1E5248' },
  class: { bg: 'rgba(90, 122, 110, 0.09)', text: '#5A7A6E' },
  quran_circle: { bg: 'rgba(196, 154, 60, 0.10)', text: '#C49A3C' },
  iftar: { bg: 'rgba(196, 112, 75, 0.09)', text: '#C4704B' },
  sisters_circle: { bg: 'rgba(122, 168, 154, 0.12)', text: '#5A8A7A' },
  youth: { bg: 'rgba(107, 140, 206, 0.12)', text: '#4A6BA8' },
  taraweeh: { bg: 'rgba(30, 82, 72, 0.08)', text: '#1E5248' },
  tahajjud: { bg: 'rgba(30, 82, 72, 0.08)', text: '#1E5248' },
  itikaf: { bg: 'rgba(156, 149, 144, 0.10)', text: '#6B6560' },
  charity: { bg: 'rgba(196, 154, 60, 0.10)', text: '#C49A3C' },
  competition: { bg: 'rgba(196, 112, 75, 0.09)', text: '#B85C3A' },
  workshop: { bg: 'rgba(90, 122, 110, 0.09)', text: '#5A7A6E' },
  other: { bg: 'rgba(156, 149, 144, 0.10)', text: '#6B6560' },
};

const LABELS: Record<EventType, string> = {
  talk: 'Talk',
  class: 'Class',
  quran_circle: 'Quran Circle',
  iftar: 'Iftar',
  sisters_circle: 'Sisters Circle',
  youth: 'Youth',
  taraweeh: 'Taraweeh',
  tahajjud: 'Tahajjud',
  itikaf: "I'tikaf",
  charity: 'Charity',
  competition: 'Competition',
  workshop: 'Workshop',
  other: 'Other',
};

export function EventTypeTag({ type }: { type: EventType }) {
  const style = TAG_STYLES[type] || TAG_STYLES.other;
  return (
    <span
      className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-[3px] rounded-tag"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {LABELS[type] || type}
    </span>
  );
}
