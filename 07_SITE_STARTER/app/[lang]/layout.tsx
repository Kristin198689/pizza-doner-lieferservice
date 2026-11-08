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

/** Absolute base for canonical/OG URLs: explicit env, then the configured domain, then the Vercel deployment host. */
const siteUrl = (): string => {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.startsWith('http') ? env : `https://${env}`;
  if (biz.domain) return biz.domain.startsWith('http') ? biz.domain : `https://${biz.domain}`;
  const v = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (v) return `https://${v}`;
  return 'http://localhost:3000';
};
const OG_LOCALE: Record<string, string> = { de: 'de_DE', en: 'en_US', uk: 'uk_UA' };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const { t, locale } = getMessages(lang);
  // JPEG under ~250 KB on purpose: WhatsApp silently drops og:image files larger than ~300 KB (Telegram does not)
  const ogImage = { url: `/og/og-${locale}.jpg`, width: 1200, height: 630, type: 'image/jpeg', alt: t.meta.title };
  return {
    metadataBase: new URL(siteUrl()),
    title: t.meta.title,
    description: t.meta.description,
    applicationName: 'Pizza & Döner',
    // Stay out of search indexes until the owner has confirmed real data.
    robots: biz.publishReady ? { index: true, follow: true } : { index: false, follow: false },
    alternates: {
      canonical: `/${locale}`,
      languages: { de: '/de', en: '/en', uk: '/uk', 'x-default': '/de' },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
        { url: '/icons/android-chrome-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/android-chrome-512.png', sizes: '512x512', type: 'image/png' },
      ],
      shortcut: ['/favicon.ico'],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/site.webmanifest',
    appleWebApp: { capable: true, title: 'Pizza & Döner', statusBarStyle: 'black-translucent' },
    formatDetection: { telephone: false },
    other: { 'msapplication-TileColor': '#09090B', 'msapplication-config': '/browserconfig.xml' },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: 'website',
      siteName: 'Pizza & Döner',
      url: `/${locale}`,
      locale: OG_LOCALE[locale] ?? 'de_DE',
      alternateLocale: Object.values(OG_LOCALE).filter((l) => l !== OG_LOCALE[locale]),
      images: [ogImage],
    },
    twitter: { card: 'summary_large_image', title: t.meta.title, description: t.meta.description, images: [ogImage.url] },
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
