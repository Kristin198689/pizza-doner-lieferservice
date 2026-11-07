import Link from 'next/link';
import type { Locale, Messages } from '@/lib/i18n';

export function Footer({ t, locale }: { t: Messages['footer']; locale: Locale }) {
  return (
    <footer className="footer">
      <div className="footer__brand">PIZZA <span>&amp;</span> DÖNER</div>
      <p className="footer__tag">{t.tagline}</p>
      <nav className="footer__nav" aria-label="Legal">
        <Link href={`/${locale}/impressum`}>{t.imprint}</Link>
        <Link href={`/${locale}/datenschutz`}>{t.privacy}</Link>
        <a href="#top">{t.back} ↑</a>
      </nav>
      <small>{t.placeholder}</small>
    </footer>
  );
}
