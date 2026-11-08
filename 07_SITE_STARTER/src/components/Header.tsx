'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconPhone } from './Icons';
import { biz, locales, phoneLabel, type Locale } from '@/lib/i18n';

type Props = {
  locale: Locale;
  nav: {
    menu: string; delivery: string; pickup: string; call: string; languages: string;
    open: string; close: string; viewMenu: string; tagline: string;
    title: string; products: string; doner: string; today: string; fulfillment: string;
    hours: string; address: string; contact: string; hoursLink: string; fabCall: string;
  };
  phonePending?: string;
  tel: string | null;
};

// page order; labels from i18n nav keys
const LINKS = [
  { key: 'products', href: '#products' },
  { key: 'doner', href: '#doner' },
  { key: 'today', href: '#orbit' },
  { key: 'menu', href: '#menu' },
  { key: 'fulfillment', href: '#delivery' },
  { key: 'contact', href: '#delivery' },
  { key: 'hoursLink', href: '#delivery' },
] as const;

// Only real, configured values are rendered. Nothing is invented.
function hoursLines(): string[] {
  const raw = (biz as { businessHours?: unknown }).businessHours;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((h) => {
      if (typeof h === 'string') return h.trim();
      if (h && typeof h === 'object') {
        const o = h as Record<string, unknown>;
        const day = String(o.days ?? o.day ?? '').trim();
        const from = String(o.opens ?? o.open ?? '').trim();
        const to = String(o.closes ?? o.close ?? '').trim();
        const time = from && to ? `${from}–${to}` : '';
        return [day, time].filter(Boolean).join(' ');
      }
      return '';
    })
    .filter(Boolean);
}
function addressLine(): string {
  const street = (biz.streetAddress || '').trim();
  const city = [biz.postalCode, biz.city].map((s) => (s || '').trim()).filter(Boolean).join(' ');
  return [street, city].filter(Boolean).join(', ');
}

export function Header({ locale, nav, tel }: Props) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const hours = hoursLines();
  const address = addressLine();

  const close = useCallback(() => {
    // release the scroll lock synchronously so the hash jump is not blocked
    const root = document.documentElement;
    root.removeAttribute('data-menu-open');
    root.style.removeProperty('--sbw');
    setOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // scroll lock (compensating the scrollbar width) + focus management
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      const sbw = window.innerWidth - root.clientWidth;
      root.style.setProperty('--sbw', `${Math.max(0, sbw)}px`);
      root.setAttribute('data-menu-open', '');
      closeBtnRef.current?.focus({ preventScroll: true });
      wasOpen.current = true;
    } else {
      root.removeAttribute('data-menu-open');
      root.style.removeProperty('--sbw');
      if (wasOpen.current) {
        burgerRef.current?.focus({ preventScroll: true });
        wasOpen.current = false;
      }
    }
    return () => {
      root.removeAttribute('data-menu-open');
      root.style.removeProperty('--sbw');
    };
  }, [open]);

  // Escape, focus trap, close when the inline nav takes over
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      const panel = panelRef.current;
      if (e.key !== 'Tab' || !panel) return;
      const f = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
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

  let n = 0;
  const step = () => ({ ['--i' as string]: n++ });

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

      <div className="mmenu" data-open={open}>
        <div className="mmenu__backdrop" aria-hidden="true" onClick={close} />
        <div
          ref={panelRef}
          id="mobile-menu"
          className="mmenu__panel"
          role="dialog"
          aria-modal="true"
          aria-label={nav.title}
        >
          <div className="mmenu__top">
            <span className="mmenu__title">{nav.title}</span>
            <button ref={closeBtnRef} type="button" className="mmenu__close" aria-label={nav.close} onClick={close}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          </div>

          <nav className="mmenu__nav" aria-label="Main">
            {LINKS.map((l) => (
              <a key={l.key} href={l.href} className="mmenu__link" style={step()} onClick={close}>
                {nav[l.key]}
              </a>
            ))}
          </nav>

          <div className="mmenu__lang" role="group" aria-label={nav.languages} style={step()}>
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

          {hours.length || address ? (
            <div className="mmenu__info" style={step()}>
              {hours.length ? (
                <div>
                  <h2>{nav.hours}</h2>
                  {hours.map((h) => (
                    <p key={h}>{h}</p>
                  ))}
                </div>
              ) : null}
              {address ? (
                <div>
                  <h2>{nav.address}</h2>
                  <p>{address}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {tel ? (
            <a className="btn btn--red mmenu__cta" href={tel} style={step()} onClick={close}>
              <IconPhone className="btn__icon" />
              <span>{phoneLabel || nav.call}</span>
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
