import { IslamicPattern } from './IslamicPattern';
import { Button } from './Button';

interface HeroProps {
  specialEvent?: {
    label: string;
    href: string;
    count: number;
  };
}

export function Hero({ specialEvent }: HeroProps) {
  return (
    <section className="relative bg-primary rounded-2xl overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
      <IslamicPattern />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h1 className="text-[36px] font-extrabold text-white leading-tight">
          Halaqas{' '}
          <span className="text-sage font-light text-2xl">حلقات</span>
        </h1>
        <p className="mt-3 text-[15px] text-white/85 sm:text-lg">
          Discover talks, classes, and events at mosques across Australia
        </p>
        <p className="mt-2 text-sm text-white/60">
          Know what&apos;s happening at your local mosque? Help the community by adding it.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="secondary" href="/submit">
            Submit an Event
          </Button>
          {specialEvent && specialEvent.count > 0 && (
            <Button variant="outline" href={specialEvent.href} className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
              🌙 {specialEvent.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
