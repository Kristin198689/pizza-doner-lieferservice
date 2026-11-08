'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

/* three phase-shifted wave paths, 4 periods of 400 units: translating the 200%-wide svg by -50% loops seamlessly */
const WAVE = (amp: number) => {
  let d = `M0 50 Q100 ${50 - amp} 200 50`;
  for (let x = 400; x <= 1600; x += 200) d += ` T${x} 50`;
  return `${d} V100 H0 Z`;
};

const BUBBLES = [
  { l: 8, b: 6, s: 10, t: 7, d: 0 },
  { l: 19, b: 22, s: 18, t: 9, d: 2.4 },
  { l: 31, b: 4, s: 8, t: 6, d: 4.1 },
  { l: 47, b: 14, s: 14, t: 8, d: 1.2 },
  { l: 58, b: 3, s: 20, t: 10, d: 3.3 },
  { l: 71, b: 18, s: 9, t: 6.5, d: 5.2 },
  { l: 83, b: 8, s: 16, t: 8.5, d: 0.8 },
  { l: 93, b: 24, s: 11, t: 7.5, d: 2.9 },
];

/** Neon-green drinks screen: flat cream liquid with wavy edge rising behind the list as you scroll. */
export function DrinksWave({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const liquid = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const liq = liquid.current;
      const section = el?.parentElement;
      if (!el || !liq || !section) return;

      // run the CSS loops only while the screen is on screen
      const io = new IntersectionObserver(([e]) => el.classList.toggle('is-live', e.isIntersecting), { rootMargin: '80px' });
      io.observe(section);

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          liq,
          { yPercent: 96 },
          { yPercent: 38, ease: 'none', scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 5%', scrub: 0.6, invalidateOnRefresh: true } },
        );
      });
      return () => {
        io.disconnect();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <div className="dw" ref={root} aria-hidden="true">
      <div className="dw__liquid" ref={liquid}>
        <div className="dw__waves">
          {[
            { amp: 30, cls: 'dw__wave--a' },
            { amp: 26, cls: 'dw__wave--b' },
            { amp: 34, cls: 'dw__wave--c' },
          ].map((w) => (
            <svg key={w.cls} className={`dw__wave ${w.cls}`} viewBox="0 0 1600 100" preserveAspectRatio="none" focusable="false">
              <path d={WAVE(w.amp)} />
            </svg>
          ))}
        </div>
        <div className="dw__body">
          {BUBBLES.map((b, i) => (
            <span key={i} className="dw__bub" style={{ left: `${b.l}%`, bottom: `${b.b}%`, width: b.s, height: b.s, animationDuration: `${b.t}s`, animationDelay: `-${b.d}s` }} />
          ))}
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
