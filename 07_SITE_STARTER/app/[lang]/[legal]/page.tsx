import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMessages, locales } from '@/lib/i18n';

const SLUGS = ['impressum', 'datenschutz'] as const;
type Slug = (typeof SLUGS)[number];
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => SLUGS.map((legal) => ({ lang, legal })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; legal: string }> }): Promise<Metadata> {
  const { lang, legal } = await params;
  const { t } = getMessages(lang);
  const block = legal === 'impressum' ? t.legal.imprint : t.legal.privacy;
  return { title: block.title, robots: { index: false, follow: false } };
}

export default async function LegalPage({ params }: { params: Promise<{ lang: string; legal: string }> }) {
  const { lang, legal } = await params;
  if (!SLUGS.includes(legal as Slug)) notFound();
  const { locale, t } = getMessages(lang);
  const page = legal === 'impressum' ? t.legal.imprint : t.legal.privacy;
  return (
    <main className="legal">
      <Link className="legal__back" href={`/${locale}`}>← {t.legal.back}</Link>
      <h1>{page.title}</h1>
      <p className="legal__draft" role="note">{t.legal.draft}</p>
      {page.blocks.map(([h, body]) => (
        <section key={h}>
          <h2>{h}</h2>
          <p>{body}</p>
        </section>
      ))}
    </main>
  );
}
