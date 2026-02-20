import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white/70 mt-12">
      <div className="max-w-[900px] mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg font-bold text-white">Halaqas</span>
          <span className="text-base font-light text-sage">حلقات</span>
        </div>
        <p className="text-sm mb-4">
          A free community project for the Sydney Muslim community.
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/submit" className="hover:text-white transition-colors">Submit Event</Link>
          <Link href="/mosques" className="hover:text-white transition-colors">Mosques</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="mt-6 text-xs text-white/40">
          &copy; {new Date().getFullYear()} Halaqas. Not affiliated with any mosque or organisation.
        </p>
      </div>
    </footer>
  );
}
