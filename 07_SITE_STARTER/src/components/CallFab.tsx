'use client';
import { useEffect, useState } from 'react';
import { IconPhone } from './Icons';

/**
 * Floating call button. Shown after the first ~0.6 viewport of scroll; hidden while the contact block,
 * the footer or the burger menu is in view. With a configured number it is a real tel: link; otherwise
 * it scrolls to the contact block (#delivery). No number is ever invented.
 */
export function CallFab({ label, tel }: { label: string; tel: string | null }) {
  const [past, setPast] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
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

  const show = past && !blocked;
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
      className="callfab"
      data-show={show}
      href={tel ?? '#delivery'}
      onClick={onClick}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
    >
      <IconPhone className="callfab__icon" />
      <span>{label}</span>
    </a>
  );
}
