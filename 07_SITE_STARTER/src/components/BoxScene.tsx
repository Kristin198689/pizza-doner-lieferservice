'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

/**
 * Black scene: a kraft pizza box opens (lid hinges at the back), the pizza lifts out as the hero object,
 * and the scene stays dark so the next dark section continues it without a cut.
 */
export function BoxScene({ t }: { t: Messages['box'] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const w = window.innerWidth, h = window.innerHeight;
        // hand-off from the cream 'Acht mal Glück': the scene enters cream (closed box + solid headline already in view),
        // then an ink circle grows from the box while the section scrolls into its pin. No empty black frame.
        const txt = q('.box__title, .box__body, .box .eyebrow');
        const ownColors = Array.from(txt as HTMLElement[]).map((n) => getComputedStyle(n).color);
        gsap.set(el, { backgroundColor: '#f6f2e9' });
        gsap.set(txt, { color: '#09090b' });
        const desktop = w >= 900 && w >= h && h > 520;
        const shortLand = w > h && h <= 520;
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: desktop
            ? { trigger: el, start: 'top top', end: '+=330%', scrub: 0.8, pin: true, invalidateOnRefresh: true }
            : { trigger: el, start: 'top top', end: shortLand ? '+=450%' : '+=320%', scrub: 0.6, pin: true, invalidateOnRefresh: true },
        });
        // mobile: same beats, stretched so the lid opening takes ~40% of a long pinned scroll, plus a hold at the end
        const k = desktop
          ? { lid: 0.2, lidD: 1.5, glow: 0.8, pz: 0.9, pzD: 1.4, st: 1.2, stD: 1.8, hl: 0.5, hlD: 1.4, nx: 2.4, col: 3.0, hold: 3.2 }
          : { lid: 0.1, lidD: 2.8, glow: 1.2, pz: 1.9, pzD: 1.8, st: 2.5, stD: 2.2, hl: 0.5, hlD: 2.2, nx: 4.2, col: 4.8, hold: 5.9 };
        // 1) the cream scene is HELD first so 'Direkt aus der Box' can be read; 2) only then the ink circle grows from the box (text colour swaps with it); 3) then the lid opens
        const S = (desktop ? 1.6 : 2.2) + 1.2;
        (Object.keys(k) as Array<keyof typeof k>).forEach((key) => { if (key !== 'lidD' && key !== 'pzD' && key !== 'stD' && key !== 'hlD') k[key] += S; });
        const g0 = desktop ? 1.6 : 2.2;
        tl.fromTo(q('.box__ink'), { clipPath: 'circle(0% at 50% 66%)' }, { clipPath: 'circle(150% at 50% 66%)', ease: 'power1.inOut', duration: 1.6 }, g0);
        (txt as HTMLElement[]).forEach((n, i) => tl.fromTo(n, { color: '#09090b' }, { color: ownColors[i], ease: 'none', duration: 0.7 }, g0 + 0.5));
        tl.fromTo(q('.cbox__lid'), { rotationX: 0 }, { rotationX: 118, ease: 'power2.inOut', duration: k.lidD }, k.lid);
        tl.fromTo(q('.cbox__lidlight'), { opacity: 0 }, { opacity: 0.6, duration: k.lidD - 0.1 }, k.lid);
        tl.fromTo(q('.cbox__glow'), { opacity: 0 }, { opacity: 1, duration: 1.2 }, k.glow);
        tl.fromTo(q('.cbox__pizza'), { yPercent: 26, scale: 0.84, opacity: 0 }, { yPercent: -4, scale: 1, opacity: 1, ease: 'power3.out', duration: k.pzD }, k.pz);
        tl.fromTo(q('.cbox__steam'), { yPercent: 10, opacity: 0 }, { yPercent: -30, opacity: 0.8, duration: k.stD }, k.st);
        tl.fromTo(q('.box__halo'), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: k.hlD, ease: 'power2.out' }, k.hl);
        tl.to({}, { duration: 0.6 }, k.hold);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="box" ref={root}>
      <div className="box__ink" aria-hidden="true" />
      <div className="box__halo" aria-hidden="true" />
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
            <Image className="cbox__pizza" src="/assets/food/pizza_hero_assembled.webp" alt="" width={1100} height={1100} sizes="(max-width: 767px) 90vw, 620px" />
            <Image className="cbox__steam" src="/assets/effects/smoke_overlay.webp" alt="" width={1000} height={769} sizes="60vw" />
          </div>
        </div>
        <p className="box__body">{t.body}</p>
      </div>
    </section>
  );
}
