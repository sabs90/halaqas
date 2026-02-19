import { IslamicPattern } from './IslamicPattern';
import { Button } from './Button';

export function Hero() {
  return (
    <section className="relative bg-primary rounded-2xl overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
      <IslamicPattern />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h1 className="text-[36px] font-extrabold text-white leading-tight">
          Halaqas{' '}
          <span className="text-sage font-light text-2xl">حلقات</span>
        </h1>
        <p className="mt-3 text-[15px] text-white/85 sm:text-lg">
          Discover talks, classes, and events at mosques across Sydney
        </p>
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" href="/submit">
            Submit an Event
          </Button>
        </div>
      </div>
    </section>
  );
}
