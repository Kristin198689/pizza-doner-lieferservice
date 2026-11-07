'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

/** Yufka rolls in from the right and tears through the oversized headline. */
export function LimeScene({ t, alt }: { t: Messages['lime']; alt: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const small = window.matchMedia('(max-width: 767px)').matches;
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: small ? 'top 70%' : 'top 65%', end: small ? 'center 45%' : 'center 35%', scrub: 0.7 } });
        tl.fromTo(q('.lime__wrap'), { xPercent: 115, rotation: -16 }, { xPercent: 0, rotation: 0, ease: 'power2.out', duration: 1 }, 0);
        tl.fromTo(q('.lime__l1'), { xPercent: 0 }, { xPercent: small ? -3 : -6, ease: 'power2.inOut', duration: 0.6 }, 0.45);
        tl.fromTo(q('.lime__l2'), { xPercent: 0 }, { xPercent: small ? 3 : 7, ease: 'power2.inOut', duration: 0.6 }, 0.5);
        gsap.to(q('.lime__deco'), { y: (i: number) => (i % 2 ? -50 : 50), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="lime" ref={root} id="yufka">
      <p className="eyebrow lime__eyebrow" data-reveal>{t.eyebrow}</p>
      <h2 className="display lime__title">
        <span className="lime__l1">{t.title}</span>
        <em className="lime__l2">{t.accent}</em>
      </h2>
      <div className="lime__wrap">
        <Image className="lime__img" src="/assets/food/yufka_wrap.png" alt={alt} width={1254} height={1254} sizes="(max-width: 767px) 100vw, 56vw" />
      </div>
      <Image className="lime__deco lime__deco--a" src="/assets/ingredients/red_pepper_rings.png" alt="" aria-hidden width={378} height={301} sizes="180px" />
      <Image className="lime__deco lime__deco--b" src="/assets/ingredients/tomato_half.png" alt="" aria-hidden width={304} height={277} sizes="160px" />
      <Image className="lime__deco lime__deco--c" src="/assets/ingredients/basil_leaf_single.png" alt="" aria-hidden width={325} height={297} sizes="160px" />
      <p className="lime__body" data-reveal>{t.body}</p>
    </section>
  );
}
