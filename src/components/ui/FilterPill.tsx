interface FilterPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function FilterPill({ label, active = false, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-3.5 py-1.5 rounded-pill transition-colors whitespace-nowrap ${
        active
          ? 'bg-primary text-white'
          : 'bg-transparent text-warm-gray border border-sand-dark hover:bg-primary/[0.04] hover:border-stone hover:text-charcoal'
      }`}
    >
      {label}
    </button>
  );
}
