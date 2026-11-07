'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

/** Yufka rolls in from the side, tears the headline apart; kinetic type reacts to scroll speed. */
export function LimeScene({ t, alt, word }: { t: Messages['lime']; alt: string; word: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      /** type leans with scroll velocity (transform only) */
      const kinetic = (self: ScrollTrigger) => {
        const v = gsap.utils.clamp(-9, 9, self.getVelocity() / -260);
        skewTo(v);
      };
      const targets = q('.lime__l1, .lime__l2, .lime__row');
      const skewTo = gsap.quickTo(targets, 'skewX', { duration: 0.5, ease: 'power3.out' });

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end: '+=170%', scrub: 0.7, pin: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: kinetic },
        });
        // it rolls: translation + several turns that settle into its resting pose
        tl.fromTo(q('.lime__wrap'), { xPercent: 125, rotation: -420 }, { xPercent: 0, rotation: 0, ease: 'power2.out', duration: 1.4 }, 0);
        tl.fromTo(q('.lime__l1'), { xPercent: 0 }, { xPercent: -5, ease: 'power2.inOut', duration: 0.9 }, 0.7);
        tl.fromTo(q('.lime__l2'), { xPercent: 0 }, { xPercent: 2, ease: 'power2.inOut', duration: 0.9 }, 0.75);
        tl.fromTo(q('.lime__row--a'), { xPercent: 0 }, { xPercent: -26, duration: 2.4 }, 0);
        tl.fromTo(q('.lime__row--b'), { xPercent: -26 }, { xPercent: 0, duration: 2.4 }, 0);
        tl.fromTo(q('.lime__body'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, ease: 'power3.out', duration: 0.6 }, 1.3);
        tl.to({}, { duration: 0.5 });
        gsap.to(q('.lime__deco'), { y: (i: number) => (i % 2 ? -50 : 50), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 70%', end: 'center 45%', scrub: 0.7, onUpdate: kinetic } });
        tl.fromTo(q('.lime__wrap'), { xPercent: 115, rotation: -300 }, { xPercent: 0, rotation: 0, ease: 'power2.out', duration: 1 }, 0);
        tl.fromTo(q('.lime__l1'), { xPercent: 0 }, { xPercent: -3, duration: 0.6 }, 0.45);
        tl.fromTo(q('.lime__l2'), { xPercent: 0 }, { xPercent: 3, duration: 0.6 }, 0.5);
        gsap.fromTo(q('.lime__row--a'), { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.fromTo(q('.lime__row--b'), { xPercent: -30 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const marquee = Array.from({ length: 8 }, () => word).join(' · ');
  return (
    <section className="lime" ref={root} id="yufka">
      <div className="lime__marq" aria-hidden="true">
        <span className="lime__row lime__row--a">{marquee}</span>
        <span className="lime__row lime__row--b">{marquee}</span>
      </div>
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
      <p className="lime__body">{t.body}</p>
    </section>
  );
}
