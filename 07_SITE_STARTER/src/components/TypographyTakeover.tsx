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

/** Almost-black pause: two giant words, a slice of pizza flies through them. */
export function TypographyTakeover({ t, sliceAlt }: { t: Messages['takeover']; sliceAlt: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      const build = (tl: gsap.core.Timeline, vw: () => number, fadeOut: boolean) => {
        tl.fromTo(q('.tk__w1 .tk__chi'), { yPercent: 115 }, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.09 }, 0);
        tl.fromTo(q('.tk__w2 .tk__chi'), { xPercent: 90, opacity: 0, skewX: -20 }, { xPercent: 0, opacity: 1, skewX: 0, duration: 1, ease: 'power3.out', stagger: { each: 0.08, from: 'end' } }, 0.8);
        // the slice crosses the frame on an arc, spinning
        tl.fromTo(q('.tk__slice'), { x: () => vw() * 0.75, y: () => window.innerHeight * 0.22, rotation: 25, scale: 0.7, opacity: 1 }, { x: () => -vw() * 1.1, y: () => -window.innerHeight * 0.18, rotation: -235, scale: 1.1, duration: 2.2, ease: 'power1.inOut' }, 1.9);
        // words part for a moment as it passes
        tl.to(q('.tk__w1'), { xPercent: -3, duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1 }, 2.6);
        tl.to(q('.tk__w2'), { xPercent: 4, duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1 }, 2.65);
        if (fadeOut) {
          tl.to(q('.tk__chi'), { opacity: 0, yPercent: -30, duration: 0.7, ease: 'power2.in', stagger: 0.03 }, 4.6);
          tl.fromTo(q('.tk__line'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, 4.9);
        }
      };

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: '+=220%', scrub: 0.7, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
        build(tl, () => window.innerWidth, true);
        tl.to({}, { duration: 0.6 }, 5.7);
      });

      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 65%', once: true } });
        build(tl, () => window.innerWidth, false);
        tl.timeScale(1.6);
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(q('.tk__slice'), { x: 0, y: 0, rotation: -12, opacity: 1 });
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
        <Image className="tk__slice" src="/assets/food/pizza_slice_cheese_pull.png" alt="" width={1254} height={1254} sizes="(max-width: 767px) 60vw, 38vw" />
      </div>
      <span className="sr-only">{sliceAlt}</span>
    </section>
  );
}
