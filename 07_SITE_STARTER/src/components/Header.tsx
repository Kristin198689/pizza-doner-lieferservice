'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconPhone } from './Icons';
import { locales, type Locale } from '@/lib/i18n';

type Props = {
  locale: Locale;
  nav: { menu: string; delivery: string; pickup: string; call: string; languages: string };
  phonePending: string;
  tel: string | null;
};

export function Header({ locale, nav, phonePending, tel }: Props) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`header${solid ? ' header--solid' : ''}`}>
      <Link href={`/${locale}`} className="brand" aria-label="Pizza & Döner">
        PIZZA <span>&amp;</span> DÖNER
      </Link>
      <nav className="header__nav" aria-label="Main">
        <a href="#menu">{nav.menu}</a>
        <a href="#delivery">{nav.delivery}</a>
        <a href="#delivery">{nav.pickup}</a>
      </nav>
      <div className="lang" role="group" aria-label={nav.languages}>
        {locales.map((l) => (
          <Link key={l} href={`/${l}`} hrefLang={l} lang={l} aria-current={l === locale ? 'true' : undefined}>
            {l.toUpperCase()}
          </Link>
        ))}
      </div>
      {tel ? (
        <a className="btn btn--red btn--small" href={tel}>
          <IconPhone className="btn__icon" />
          <span>{nav.call}</span>
        </a>
      ) : (
        <span className="header__pending">{phonePending}</span>
      )}
    </header>
  );
}
