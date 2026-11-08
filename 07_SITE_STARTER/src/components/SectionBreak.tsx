'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

type Tone = 'ink' | 'red' | 'lime' | 'cream' | 'green';

type Props = {
  /** words: two kinetic lines sliding in opposite directions. roll: one ingredient rolls across. wipe: next colour rises over the previous. */
  variant: 'words' | 'roll' | 'wipe';
  /** background of the previous section (wipe/roll) or the band colour (words) */
  from: Tone;
  /** colour that wipes in (wipe only) */
  to?: Tone;
  /** words[0] is the main word; words[1] (words variant) the second line */
  words: string[];
  /** ingredient file under /assets/ingredients (roll only) */
  sprite?: string;
  spriteSize?: [number, number];
};

const TXT: Record<Tone, string> = { ink: 'cream', red: 'ink', lime: 'ink', cream: 'ink', green: 'ink' };

export function SectionBreak({ variant, from, to = 'red', words, sprite, spriteSize = [320, 290] }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const trigger = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } as const;
        if (variant === 'words') {
          gsap.fromTo('.sb__l1', { xPercent: -2 }, { xPercent: -32, ease: 'none', scrollTrigger: trigger });
          gsap.fromTo('.sb__l2', { xPercent: -34 }, { xPercent: -4, ease: 'none', scrollTrigger: trigger });
        } else if (variant === 'roll') {
          gsap.fromTo('.sb__sprite', { x: '-30vw', rotate: -40 }, { x: '112vw', rotate: 560, ease: 'none', scrollTrigger: trigger });
          gsap.fromTo('.sb__bgword', { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: trigger });
        } else {
          gsap.fromTo('.sb__panel', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'center 45%', scrub: 0.4 } });
          gsap.fromTo('.sb__word', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 60%', end: 'center 58%', scrub: 0.4 } });
        }
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [variant] },
  );

  const rep = (w: string) => Array.from({ length: 5 }, (_, i) => <span key={i}>{w}</span>);
  const [w1, w2 = words[0]] = words;
  const fg = TXT[variant === 'wipe' ? to : from];

  return (
    <div ref={ref} className={`sb sb--${variant} sb--bg-${from} sb--to-${to} sb--fg-${fg}`} aria-hidden="true" style={{ '--n': w1.length } as React.CSSProperties}>
      {variant === 'words' && (
        <div className="sb__lines">
          <div className="sb__l1">{rep(w1)}</div>
          <div className="sb__l2">{rep(w2)}</div>
        </div>
      )}
      {variant === 'roll' && (
        <>
          <div className="sb__bgword">{w1}</div>
          {sprite && (
            <div className="sb__sprite">
              <Image src={`/assets/ingredients/${sprite}`} alt="" width={spriteSize[0]} height={spriteSize[1]} sizes="(max-width: 767px) 28vw, 18vw" />
            </div>
          )}
        </>
      )}
      {variant === 'wipe' && (
        <>
          <div className="sb__panel" />
          <div className="sb__word">{w1}</div>
        </>
      )}
    </div>
  );
}
