'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

/** Restrained hero move: the plain wrap rises in with a gentle rotate + scale-up. */
export function YufkaUnroll({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const section = el.closest('section') ?? el;
        const img = el.querySelector('.yx__img');
        const tl = gsap.timeline();
        tl.fromTo(img, { rotate: -12, scale: 0.92, yPercent: 6 }, { rotate: 0, scale: 1, yPercent: -3, ease: 'power2.out', duration: 0.5 }, 0);
        tl.to(img, { yPercent: -6, ease: 'none', duration: 0.5 }, 0.5);
        const st = ScrollTrigger.create({ trigger: section, start: 'top 85%', end: 'bottom 25%', animation: tl, scrub: 0.4 });
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div className="pm__art yx" ref={root} aria-hidden="true">
      <Image className="pm__img yx__img" src="/assets/food/yufka_wrap.png" alt="" width={1254} height={1254} sizes="(max-width: 899px) 100vw, 66vw" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
