'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconPhone } from './Icons';
import { locales, type Locale } from '@/lib/i18n';

type Props = {
  locale: Locale;
  nav: {
    menu: string; delivery: string; pickup: string; call: string; languages: string;
    open: string; close: string; viewMenu: string; tagline: string;
  };
  phonePending?: string;
  tel: string | null;
};

const LINKS = [
  { key: 'menu', href: '#menu' },
  { key: 'delivery', href: '#delivery' },
  { key: 'pickup', href: '#delivery' },
] as const;

export function Header({ locale, nav, tel }: Props) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

  const close = useCallback(() => {
    // release the scroll lock synchronously so the hash jump is not blocked
    document.documentElement.removeAttribute('data-menu-open');
    setOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // scroll lock + focus management
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.setAttribute('data-menu-open', '');
      firstLinkRef.current?.focus({ preventScroll: true });
      wasOpen.current = true;
    } else {
      root.removeAttribute('data-menu-open');
      if (wasOpen.current) {
        burgerRef.current?.focus({ preventScroll: true });
        wasOpen.current = false;
      }
    }
    return () => root.removeAttribute('data-menu-open');
  }, [open]);

  // Escape, focus trap, close past 900px
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab' || !headerRef.current) return;
      const f = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      const active = document.activeElement;
      if (!headerRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const mq = window.matchMedia('(min-width: 900px)');
    const onMq = () => mq.matches && close();
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open, close]);

  return (
    <header ref={headerRef} className={`header${solid ? ' header--solid' : ''}${open ? ' header--open' : ''}`}>
      <Link href={`/${locale}`} className="brand" aria-label="Pizza & Döner" onClick={close}>
        PIZZA <span>&amp;</span> DÖNER
      </Link>
      <nav className="header__nav" aria-label="Main">
        <a href="#menu">{nav.menu}</a>
        <a href="#delivery">{nav.delivery}</a>
        <a href="#delivery">{nav.pickup}</a>
      </nav>
      <div className="lang header__lang" role="group" aria-label={nav.languages}>
        {locales.map((l) => (
          <Link key={l} href={`/${l}`} hrefLang={l} lang={l} aria-current={l === locale ? 'true' : undefined}>
            {l.toUpperCase()}
          </Link>
        ))}
      </div>
      {tel ? (
        <a className="btn btn--red btn--small header__call" href={tel}>
          <IconPhone className="btn__icon" />
          <span>{nav.call}</span>
        </a>
      ) : null}

      <button
        ref={burgerRef}
        type="button"
        className="burger"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? nav.close : nav.open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="burger__bar" />
        <span className="burger__bar" />
        <span className="burger__bar" />
      </button>

      <div id="mobile-menu" className="mmenu" role="dialog" aria-modal="true" aria-label={nav.menu} data-open={open}>
        <div className="mmenu__inner">
          <nav className="mmenu__nav" aria-label="Main">
            {LINKS.map((l, i) => (
              <a
                key={l.key}
                ref={i === 0 ? firstLinkRef : undefined}
                href={l.href}
                className="mmenu__link"
                style={{ ['--i' as string]: i }}
                onClick={close}
              >
                {nav[l.key]}
              </a>
            ))}
          </nav>
          <div className="mmenu__foot" style={{ ['--i' as string]: 3 }}>
            <div className="mmenu__lang" role="group" aria-label={nav.languages}>
              {locales.map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  hrefLang={l}
                  lang={l}
                  aria-current={l === locale ? 'true' : undefined}
                  onClick={close}
                >
                  {l.toUpperCase()}
                </Link>
              ))}
            </div>
            {tel ? (
              <a className="btn btn--red mmenu__cta" href={tel} onClick={close}>
                <IconPhone className="btn__icon" />
                <span>{nav.call}</span>
              </a>
            ) : (
              <a className="btn btn--red mmenu__cta" href="#menu" onClick={close}>
                <span>{nav.viewMenu}</span>
              </a>
            )}
            <p className="mmenu__tag">{nav.tagline}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
