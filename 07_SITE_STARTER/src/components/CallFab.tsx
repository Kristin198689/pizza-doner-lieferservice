'use client';
import { useEffect, useRef, useState } from 'react';
import { IconPhone } from './Icons';

/**
 * Floating call button. Shown after the first ~0.6 viewport of scroll; hidden while the contact block,
 * the footer or the burger menu is in view. With a configured number it is a real tel: link; otherwise
 * it scrolls to the contact block (#delivery). No number is ever invented.
 */
export function CallFab({ label, tel }: { label: string; tel: string | null }) {
  const [past, setPast] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [covers, setCovers] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  // 1) only after the whole hero (its pinned spacer has left the screen)
  useEffect(() => {
    const hero = document.querySelector('.hero');
    const spacer = (hero?.parentElement?.classList.contains('pin-spacer') ? hero.parentElement : hero) as Element | null;
    if (!spacer) { setPast(true); return; }
    const calc = () => {
      const r = spacer.getBoundingClientRect();
      setPast(r.bottom <= window.innerHeight * 0.35);
    };
    calc();
    window.addEventListener('scroll', calc, { passive: true });
    window.addEventListener('resize', calc);
    return () => { window.removeEventListener('scroll', calc); window.removeEventListener('resize', calc); };
  }, []);

  // 2) step aside whenever it would sit on top of something important (text, headings, buttons, links)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const IMPORTANT = 'a, button, h1, h2, h3, h4, p, li, small, label, input, .btn, [role="button"], .display';
    let raf = 0;
    let last = 0;
    const check = () => {
      raf = 0;
      const now = performance.now();
      if (now - last < 90) { raf = requestAnimationFrame(check); return; }
      last = now;
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const pad = 10;
      const xs = [r.left - pad, r.left + r.width / 2, r.right + pad];
      const ys = [r.top - pad, r.top + r.height / 2, r.bottom + pad];
      let hit = false;
      for (const x of xs) {
        for (const y of ys) {
          if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
          for (const n of document.elementsFromPoint(x, y)) {
            if (n === el || el.contains(n) || n.classList.contains('page-top')) continue;
            if (n.matches?.(IMPORTANT) || n.closest?.(IMPORTANT)) {
              const t = (n as HTMLElement).textContent?.trim();
              if (t || n.matches?.('input, .btn, [role="button"]')) { hit = true; }
            }
            break; // only the topmost element at this point counts
          }
          if (hit) break;
        }
        if (hit) break;
      }
      setCovers(hit);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    const id = window.setInterval(kick, 400); // pinned scenes animate without scrolling too
    kick();
    return () => { window.removeEventListener('scroll', kick); window.removeEventListener('resize', kick); window.clearInterval(id); if (raf) cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const seen = new Set<Element>();
    const update = () => setBlocked(seen.size > 0 || root.hasAttribute('data-menu-open'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      update();
    });
    document.querySelectorAll('#delivery, footer.ft').forEach((el) => io.observe(el));
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ['data-menu-open'] });
    update();
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  const show = past && !blocked && !covers;
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (tel) return;
    const target = document.getElementById('delivery');
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <a
      ref={ref}
      className="callfab"
      data-show={show}
      href={tel ?? '#delivery'}
      onClick={onClick}
      aria-label={label}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
    >
      <IconPhone className="callfab__icon" />
    </a>
  );
}
