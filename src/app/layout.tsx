import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Halaqas — Mosque Events in Sydney',
    template: '%s | Halaqas',
  },
  description: 'Discover talks, classes, and events at mosques across Sydney. A free community directory with subscribable calendars.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://halaqas.com'),
  openGraph: {
    title: 'Halaqas — Mosque Events in Sydney',
    description: 'Discover talks, classes, and events at mosques across Sydney',
    type: 'website',
    siteName: 'Halaqas',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <Header />
        <main className="max-w-[900px] mx-auto px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
