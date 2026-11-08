'use client';
import { useEffect } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { initRevealFx, initMagnetic } from './fx/RevealFx';

/** Global, lightweight scroll effects: IntersectionObserver reveals + transform-only parallax. */
/** layout tier of the viewport; every pinned scene picks its geometry/timeline from this once, at build time */
const tier = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const o = w > h ? 'l' : 'p';
  const wb = w < 600 ? 'xs' : w < 900 ? 'sm' : w < 1024 ? 'md' : 'lg';
  return `${o}-${wb}-${h <= 500 ? 's' : 't'}`;
};

export function ScrollFx() {
  // Rotating a phone or switching the device emulator re-flows every pinned scene (each one chose its timeline for the
  // old tier). Rebuilding them all in place is fragile, so crossing a tier simply reloads the page (scroll is restored by
  // the browser). Ordinary window resizing inside one tier is handled by ScrollTrigger as before.
  useEffect(() => {
    let current = tier();
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { if (tier() !== current) {
          current = tier();
          // never loop: at most one automatic reload per 4 s
          try { const last = Number(sessionStorage.getItem('tier-reload') || 0); if (Date.now() - last < 4000) return; sessionStorage.setItem('tier-reload', String(Date.now())); } catch { /* storage blocked: still reload once */ }
          window.location.reload();
        } }, 450);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => { window.clearTimeout(timer); window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize); };
  }, []);
  useGSAP(() => {
    const root = document.documentElement;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      root.dataset.motion = 'on';
      const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).classList.add('in');
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
      );
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.classList.add('in', 'in--instant');
        else io.observe(el);
      });

      const small = window.matchMedia('(max-width: 767px)').matches;
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        const v = parseFloat(el.dataset.parallax || '0') * (small ? 0.5 : 1);
        gsap.fromTo(el, { y: -v }, { y: v, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      const cleanFx = initRevealFx(small);

      return () => {
        cleanFx();
        io.disconnect();
        delete root.dataset.motion;
      };
    });

    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => initMagnetic());

    // Pin starts/ends are absolute scroll offsets: any layout shift above a pin (late fonts/images, row reveals, resize) makes them stale
    // and the pinned screen snaps over its neighbour. Keep them in sync: refresh (debounced) whenever the page height changes.
    let t = 0;
    let lastH = document.documentElement.scrollHeight;
    const refresh = () => { window.clearTimeout(t); t = window.setTimeout(() => { lastH = document.documentElement.scrollHeight; ScrollTrigger.sort(); ScrollTrigger.refresh(); }, 180); };
    const ro = new ResizeObserver(() => { const h = document.documentElement.scrollHeight; if (Math.abs(h - lastH) >= 1) refresh(); });
    ro.observe(document.body);
    window.addEventListener('load', refresh, { once: true });
    document.fonts?.ready.then(refresh);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      window.removeEventListener('load', refresh);
      mm.revert();
    };
  }, []);
  return null;
}
