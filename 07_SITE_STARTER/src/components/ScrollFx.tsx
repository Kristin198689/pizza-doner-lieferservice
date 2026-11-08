'use client';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { initRevealFx, initMagnetic } from './fx/RevealFx';

/** Global, lightweight scroll effects: IntersectionObserver reveals + transform-only parallax. */
export function ScrollFx() {
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

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    return () => {
      window.removeEventListener('load', refresh);
      mm.revert();
    };
  }, []);
  return null;
}
