import type { Metadata, Viewport } from 'next';
import { biz, getMessages, locales } from '@/lib/i18n';
import localFont from 'next/font/local';
import '../globals.css';
import '../hero.css';
import '../header.css';
import '../takeover.css';
import '../sections.css';
import '../fx1.css';
import '../fx2.css';
import '../fx3.css';
import '../fx4.css';
import '../fx5.css';
import '../fx6.css';
import '../fx7.css';
import '../fx8.css';
import '../fx9.css';
import '../fx10.css';
import '../fx11.css';

// Roboto Flex (variable: weight 100–1000 + width axis), self-hosted by next/font: no requests to Google at runtime.
const rfLatin = localFont({ src: '../../src/fonts/roboto-flex-latin-wdth-normal.woff2', weight: '100 1000', display: 'swap', variable: '--font-rf-latin', adjustFontFallback: false });
const rfCyr = localFont({ src: '../../src/fonts/roboto-flex-cyrillic-full-normal.woff2', weight: '100 1000', display: 'swap', variable: '--font-rf-cyr', preload: false, adjustFontFallback: false });


export const viewport: Viewport = { themeColor: '#09090b', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export const dynamicParams = false; // unknown /xyz paths are a real 404, not a copy of the homepage

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const { t } = getMessages(lang);
  return {
    title: t.meta.title,
    description: t.meta.description,
    // Stay out of search indexes until the owner has confirmed real data.
    robots: biz.publishReady ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { title: t.meta.title, description: t.meta.description, type: 'website', locale: lang },
  };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { locale } = getMessages(lang);
  return (
    <html lang={locale} className={`${rfLatin.variable} ${rfCyr.variable}`}>
      <body>{children}</body>
    </html>
  );
}
