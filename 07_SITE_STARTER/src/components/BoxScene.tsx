'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

/** Dark → kraft threshold: a lid-like paper edge sweeps down and reveals the box. */
export function BoxScene({ t }: { t: Messages['box'] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const panel = q('.box__panel')[0];
        gsap.set(panel, { '--p': 0 });
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 5%', scrub: 0.6 } });
        tl.to(panel, { '--p': 1, ease: 'power2.inOut', duration: 1 }, 0);
        gsap.from(q('.box__img'), { yPercent: 14, scale: 0.9, opacity: 0, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 20%', end: 'top -10%', scrub: 0.6 } });
        gsap.to(q('.box__steam'), { yPercent: -18, opacity: 0.9, ease: 'none', scrollTrigger: { trigger: el, start: 'top 20%', end: 'bottom top', scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="box" ref={root}>
      <div className="box__panel">
        <span className="box__edge" aria-hidden="true" />
        <div className="box__inner">
          <p className="eyebrow" data-reveal>{t.eyebrow}</p>
          <h2 className="display box__title" data-reveal>{t.title}</h2>
          <div className="box__stage">
            <Image className="box__img" src="/assets/packaging/pizza_box_open_steam.png" alt={t.alt} width={1448} height={1086} sizes="(max-width: 767px) 94vw, 62vw" />
            <Image className="box__steam" src="/assets/effects/smoke_overlay.png" alt="" aria-hidden width={1300} height={1000} sizes="60vw" />
            <Image className="box__deco box__deco--a" src="/assets/ingredients/basil_sprig.png" alt="" aria-hidden width={360} height={316} sizes="160px" data-parallax="-40" />
            <Image className="box__deco box__deco--b" src="/assets/ingredients/red_pepper_rings.png" alt="" aria-hidden width={378} height={301} sizes="170px" data-parallax="50" />
            <Image className="box__deco box__deco--c" src="/assets/ingredients/black_olives.png" alt="" aria-hidden width={360} height={292} sizes="140px" data-parallax="30" />
          </div>
          <p className="box__body" data-reveal>{t.body}</p>
        </div>
      </div>
    </section>
  );
}
