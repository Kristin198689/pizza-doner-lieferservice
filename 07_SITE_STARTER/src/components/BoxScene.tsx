'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

/**
 * Dark → kraft threshold, then a CSS-3D pizza box: the lid hinges open at its back edge,
 * steam rises and the pizza lifts out. Built from the kraft texture — no fake photo cross-fade.
 */
export function BoxScene({ t }: { t: Messages['box'] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      const open = (tl: gsap.core.Timeline) => {
        tl.fromTo(q('.cbox__lid'), { rotationX: 0 }, { rotationX: 118, ease: 'power2.inOut', duration: 1.2 }, 0);
        tl.fromTo(q('.cbox__lidlight'), { opacity: 0 }, { opacity: 0.55, duration: 1.2 }, 0);
        tl.fromTo(q('.cbox__pizza'), { yPercent: 24, scale: 0.86, opacity: 0 }, { yPercent: -6, scale: 1, opacity: 1, ease: 'power3.out', duration: 1 }, 0.55);
        tl.fromTo(q('.cbox__steam'), { yPercent: 10, opacity: 0 }, { yPercent: -28, opacity: 0.85, ease: 'none', duration: 1.2 }, 0.8);
        tl.fromTo(q('.cbox__glow'), { opacity: 0 }, { opacity: 1, duration: 1 }, 0.6);
      };

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const panel = q('.box__panel')[0];
        const desktop = window.matchMedia('(min-width: 768px)').matches;
        gsap.set(panel, { '--p': 0 });
        // 1) dark → kraft sweep
        gsap.to(panel, { '--p': 1, ease: 'power2.inOut', scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 5%', scrub: 0.6 } });
        // 2) lid opens
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: desktop
            ? { trigger: el, start: 'top top', end: '+=150%', scrub: 0.7, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
            : { trigger: q('.cbox')[0], start: 'top 85%', end: 'center 45%', scrub: 0.7 },
        });
        open(tl);
        if (desktop) tl.to({}, { duration: 0.5 });
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
          <div className="cbox" role="img" aria-label={t.alt}>
            <div className="cbox__shadow" aria-hidden="true" />
            <div className="cbox__scene" aria-hidden="true">
              <div className="cbox__base">
                <span className="cbox__glow" />
              </div>
              <div className="cbox__front" />
              <div className="cbox__lid">
                <div className="cbox__lidface cbox__lidface--out" />
                <div className="cbox__lidface cbox__lidface--in"><span className="cbox__lidlight" /></div>
              </div>
            </div>
            <div className="cbox__rise" aria-hidden="true">
              <Image className="cbox__pizza" src="/assets/food/pizza_hero_assembled.png" alt="" width={1254} height={1254} sizes="(max-width: 767px) 80vw, 560px" />
              <Image className="cbox__steam" src="/assets/effects/smoke_overlay.png" alt="" width={1300} height={1000} sizes="60vw" />
            </div>
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
