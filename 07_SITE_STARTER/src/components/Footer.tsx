'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { Locale, Messages } from '@/lib/i18n';

const WORD = 'PIZZA & DÖNER'.split('');

export function Footer({ t, locale }: { t: Messages['footer']; locale: Locale }) {
  const mark = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mark.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { el.dataset.in = '1'; return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.dataset.in = '1'; io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const year = new Date().getFullYear();
  return (
    <footer className="ft">
      <div className="ft__mark" ref={mark} role="img" aria-label="PIZZA & DÖNER">
        <span className="ft__word pizza-text" aria-hidden="true">
          {WORD.map((c, i) => (
            <span className={c === ' ' ? 'ft__sp' : c === '&' ? 'ft__ch ft__amp' : 'ft__ch'} key={i} style={{ ['--i' as string]: i }}>{c === ' ' ? ' ' : c}</span>
          ))}
        </span>
      </div>
      <hr className="ft__rule" />
      <nav className="ft__nav" aria-label="Legal">
        <Link href={`/${locale}/impressum`}>{t.imprint}</Link>
        <Link href={`/${locale}/datenschutz`}>{t.privacy}</Link>
        <a href="#top">{t.back}</a>
      </nav>
      <hr className="ft__rule ft__rule--legal" />
      <div className="ft__legal">
        <small>© {year} PIZZA &amp; DÖNER · {t.rights}</small>
        <small>
          {t.dev}{' '}
          <a className="ft__credit" href="https://volodina-webstudio.de" target="_blank" rel="noopener">{t.devName}</a>
        </small>
      </div>
    </footer>
  );
}
