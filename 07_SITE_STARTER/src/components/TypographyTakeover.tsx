'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

const letters = (s: string) =>
  Array.from(s).map((c, i) => (
    <span className="tk__ch" key={i}>
      <span className="tk__chi">{c}</span>
    </span>
  ));

/** Art-direction pause: lots of air, two words in contrasting type, a big slice that crosses slowly and lingers. */
export function TypographyTakeover({ t, sliceAlt }: { t: Messages['takeover']; sliceAlt: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      const vw = () => window.innerWidth;
      const vh = () => window.innerHeight;

      const build = (tl: gsap.core.Timeline, fadeOut: boolean) => {
        tl.fromTo(q('.tk__w1 .tk__chi'), { yPercent: 118 }, { yPercent: 0, duration: 1.5, ease: 'power4.out', stagger: 0.12 }, 0);
        tl.fromTo(q('.tk__w2 .tk__chi'), { yPercent: 118 }, { yPercent: 0, duration: 1.7, ease: 'power4.out' }, 1.1);
        // the slice: slow arc in, lingers in the middle, drifts out
        const slice = q('.tk__slice');
        tl.fromTo(slice, { x: () => vw() * 0.7, y: () => vh() * 0.42, rotation: 38, scale: 0.8, opacity: 0 }, { x: () => vw() * 0.06, y: () => -vh() * 0.02, rotation: -8, scale: 1.04, opacity: 1, duration: 3, ease: 'power2.out' }, 1.8);
        tl.to(slice, { x: () => -vw() * 0.04, y: () => -vh() * 0.05, rotation: -14, scale: 1.1, duration: 1.8, ease: 'sine.inOut' }, 4.8);
        tl.to(slice, { x: () => -vw() * 0.8, y: () => -vh() * 0.4, rotation: -80, scale: 0.9, duration: 2.6, ease: 'power2.in' }, 6.6);
        tl.to(q('.tk__w1'), { xPercent: -3, duration: 1.6, ease: 'sine.inOut' }, 2.6);
        tl.to(q('.tk__w2'), { xPercent: 4, duration: 1.6, ease: 'sine.inOut' }, 2.8);
        if (fadeOut) {
          tl.to(q('.tk__chi'), { yPercent: -120, duration: 1, ease: 'power3.in', stagger: 0.04 }, 8.4);
          tl.fromTo(q('.tk__line'), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power3.inOut' }, 8.8);
        }
      };

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: '+=360%', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
        build(tl, true);
        tl.to({}, { duration: 0.8 }, 10);
      });

      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 60%', once: true } });
        build(tl, false);
        tl.timeScale(1.1);
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(q('.tk__slice'), { x: 0, y: 0, rotation: -10, opacity: 1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="tk" ref={root} aria-label={t.label}>
      <h2 className="sr-only">{t.label}</h2>
      <div className="tk__stage" aria-hidden="true">
        <p className="tk__w tk__w1">{letters(t.a)}</p>
        <p className="tk__w tk__w2">{letters(t.b)}</p>
        <span className="tk__line" />
        <Image className="tk__slice" src="/assets/food/pizza_slice_cheese_pull.png" alt="" width={1254} height={1254} sizes="(max-width: 767px) 80vw, 58vw" />
      </div>
      <span className="sr-only">{sliceAlt}</span>
    </section>
  );
}
