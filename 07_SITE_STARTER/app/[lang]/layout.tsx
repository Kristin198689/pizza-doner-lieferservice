import type { Metadata, Viewport } from 'next';
import { biz, getMessages, locales } from '@/lib/i18n';
// Self-hosted fonts (no requests to Google at runtime). Latin + Cyrillic subsets are split via unicode-range.
import '@fontsource-variable/oswald';
import '@fontsource-variable/manrope';
import '@fontsource/roboto-condensed/900-italic.css';
import '../globals.css';


export const viewport: Viewport = { themeColor: '#09090b', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

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
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
