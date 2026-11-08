'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

/** Real band boundaries (rows of the 1254px source): top bun | sauce+pickle+tomato | cheese+patty | lettuce+sauce | bottom bun. */
const CUTS = [0, 470, 712, 905, 1012, 1254];
const SRC = '/assets/food/cheeseburger.png';
const SIZES = '(max-width: 899px) 100vw, 66vw';
const Y = [-27, -13.5, 0, 13.5, 27];
const X = [-2.5, 2, -1.5, 2.5, -2];
const R = [-2.5, 1.8, -1.2, 2.2, -2];
const pct = (n: number) => `${((n / 1254) * 100).toFixed(3)}%`;

export function BurgerExplode({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      // pin length by viewport shape: desktop landscape 300%, short landscape 260%, tablet/phone portrait 240% (incl. a hold of the assembled burger)
      const pinLen = () => { const w = window.innerWidth, h = window.innerHeight; if (h <= 520 && w > h) return 260; if (w >= 900 && w >= h) return 300; return 240; };
      const build = () => {
        const section = el.closest('section') ?? el;
        const group = el.querySelector('.bx__group');
        const bands = gsap.utils.toArray<HTMLElement>('.bx__band', el);
        const ticks = gsap.utils.toArray<HTMLElement>('.bx__tick', el);
        const tl = gsap.timeline();
        // timeline (0..1): explode 0.03-0.2, hold apart to 0.36, slow reassemble 0.36-0.74, hold the whole burger 0.74-1
        bands.forEach((b, i) => {
          tl.to(b, { yPercent: Y[i], xPercent: X[i], rotate: R[i], duration: 0.16 + i * 0.006, ease: 'power3.out' }, 0.03);
          tl.to(b, { yPercent: 0, xPercent: 0, rotate: 0, duration: 0.3 + (4 - i) * 0.02, ease: 'power2.inOut' }, 0.36 + (4 - i) * 0.0);
        });
        tl.to(group, { scale: 0.6, xPercent: -8, duration: 0.18, ease: 'power3.out' }, 0.03);
        tl.to(group, { scale: 1.04, xPercent: 0, duration: 0.38, ease: 'power2.inOut' }, 0.36);
        tl.to(ticks, { opacity: 1, duration: 0.05, stagger: 0.012 }, 0.12);
        tl.to(ticks, { opacity: 0, duration: 0.06 }, 0.34);
        tl.to({}, { duration: 0.0001 }, 1);
        const st = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${pinLen()}%`,
          invalidateOnRefresh: true,
          pin: true,
          animation: tl,
          scrub: 0.6,
          onUpdate: (self) => el.classList.toggle('is-split', self.progress > 0.01 && self.progress < 0.75),
          onToggle: (self) => { if (!self.isActive) el.classList.remove('is-split'); },
        });
        return () => { st.kill(); el.classList.remove('is-split'); };
      };
      mm.add('(prefers-reduced-motion: no-preference)', () => build());
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div className="pm__art bx" ref={root} aria-hidden="true">
      <div className="bx__group">
        <Image className="bx__still" src={SRC} alt="" fill sizes={SIZES} />
        {CUTS.slice(0, 5).map((top, i) => (
          <div className="bx__band" key={i}>
            <div className="bx__static">
              <Image
                src={SRC}
                alt=""
                fill
                sizes={SIZES}
                style={{ clipPath: `inset(${pct(top)} 0 ${pct(1254 - CUTS[i + 1])} 0)` }}
              />
              <span className="bx__tick" style={{ top: pct((top + CUTS[i + 1]) / 2) }}>0{i + 1}</span>
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
