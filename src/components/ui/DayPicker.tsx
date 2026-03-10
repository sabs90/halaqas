'use client';

import { DAY_OPTIONS } from '@/lib/event-constants';

interface DayPickerProps {
  selected: number[];
  onChange: (days: number[]) => void;
}

export function DayPicker({ selected, onChange }: DayPickerProps) {
  function toggle(day: number) {
    if (selected.includes(day)) {
      onChange(selected.filter(d => d !== day));
    } else {
      onChange([...selected, day]);
    }
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {DAY_OPTIONS.map(d => {
        const active = selected.includes(d.value);
        return (
          <button
            key={d.value}
            type="button"
            onClick={() => toggle(d.value)}
            className={`text-sm font-medium px-3 py-1.5 rounded-pill transition-colors ${
              active ? 'bg-primary text-white' : 'bg-sand text-warm-gray'
            }`}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}
