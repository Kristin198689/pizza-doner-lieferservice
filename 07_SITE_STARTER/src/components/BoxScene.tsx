'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

/**
 * Black scene: a kraft pizza box opens (lid hinges at the back), the pizza lifts out as the hero object,
 * then a cream frame grows from inside the box and becomes the next section (the menu).
 */
export function BoxScene({ t }: { t: Messages['box'] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const desktop = window.matchMedia('(min-width: 768px)').matches;
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: desktop
            ? { trigger: el, start: 'top top', end: '+=230%', scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
            : { trigger: el, start: 'top 70%', end: 'bottom 80%', scrub: 0.8 },
        });
        tl.fromTo(q('.cbox__lid'), { rotationX: 0 }, { rotationX: 118, ease: 'power2.inOut', duration: 1.5 }, 0.2);
        tl.fromTo(q('.cbox__lidlight'), { opacity: 0 }, { opacity: 0.6, duration: 1.4 }, 0.2);
        tl.fromTo(q('.cbox__glow'), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.8);
        tl.fromTo(q('.cbox__pizza'), { yPercent: 26, scale: 0.84, opacity: 0 }, { yPercent: -4, scale: 1, opacity: 1, ease: 'power3.out', duration: 1.4 }, 0.9);
        tl.fromTo(q('.cbox__steam'), { yPercent: 10, opacity: 0 }, { yPercent: -30, opacity: 0.8, duration: 1.8 }, 1.2);
        tl.fromTo(q('.box__halo'), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0.5);
        // the next frame opens from inside the box
        tl.fromTo(q('.box__next'), { clipPath: 'circle(0% at 50% 62%)' }, { clipPath: 'circle(140% at 50% 62%)', ease: 'power3.inOut', duration: 1.7 }, 2.4);
        tl.to(q('.box__title, .box__body, .box .eyebrow'), { color: '#09090b', duration: 0.6 }, 3.0);
        tl.to({}, { duration: 0.6 }, 4.1);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="box" ref={root}>
      <div className="box__halo" aria-hidden="true" />
      <div className="box__next" aria-hidden="true" />
      <div className="box__inner">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="display box__title">{t.title}</h2>
        <div className="cbox" role="img" aria-label={t.alt}>
          <div className="cbox__shadow" aria-hidden="true" />
          <div className="cbox__scene" aria-hidden="true">
            <div className="cbox__base"><span className="cbox__glow" /></div>
            <div className="cbox__lid">
              <div className="cbox__lidface cbox__lidface--out" />
              <div className="cbox__lidface cbox__lidface--in"><span className="cbox__lidlight" /></div>
            </div>
          </div>
          <div className="cbox__rise" aria-hidden="true">
            <Image className="cbox__pizza" src="/assets/food/pizza_hero_assembled.png" alt="" width={1254} height={1254} sizes="(max-width: 767px) 90vw, 620px" />
            <Image className="cbox__steam" src="/assets/effects/smoke_overlay.png" alt="" width={1300} height={1000} sizes="60vw" />
          </div>
        </div>
        <p className="box__body">{t.body}</p>
      </div>
    </section>
  );
}
