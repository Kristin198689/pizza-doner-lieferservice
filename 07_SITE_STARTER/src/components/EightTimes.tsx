'use client';
import Image from 'next/image';
import { useRef, type CSSProperties } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

/* same 3/4-view ellipse + 8-sector clip-path technique as the hero (percent of the square image) */
const G = { cx: 50.08, cy: 55.18, rx: 49.6, ry: 33.6 };
const N = 8;
const rad = (d: number) => (d * Math.PI) / 180;
const pt = (deg: number) => `${(G.cx + G.rx * Math.cos(rad(deg))).toFixed(2)}% ${(G.cy + G.ry * Math.sin(rad(deg))).toFixed(2)}%`;
const SECTORS = Array.from({ length: N }, (_, k) => {
  const a0 = 45 * k - 22.5 - 0.3;
  const a1 = 45 * k + 22.5 + 0.3;
  const pts = [`${G.cx}% ${G.cy}%`];
  for (let a = a0; a < a1; a += 4.5) pts.push(pt(a));
  pts.push(pt(a1));
  return `polygon(${pts.join(',')})`;
});
/** arrival order of the sectors (0 = right, 90 = down, 270 = top): never two neighbours in a row */
const ORDER = [6, 3, 0, 5, 2, 7, 4, 1];
const SPIN = [-70, 55, -48, 80, -62, 44, -84, 66];

/** Airy cream scene: a giant counter ticks 1→8 while the pizza is put together slice by slice, then the counter becomes the headline. */
export function EightTimes({ t }: { t: Messages['eight'] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        el.dataset.mode = 'pinned';
        const slices = q('.et__slice');
        const portrait = window.matchMedia('(orientation: portrait)').matches;
        const dist = () => (q('.et__pizza')[0] as HTMLElement).offsetWidth;

        gsap.set(slices, { opacity: 0 });
        gsap.set(q('.et__fin > *'), { yPercent: 0, opacity: 0 });
        gsap.set(q('.et__shadow'), { opacity: 0, scale: 0.8 });
        gsap.set(q('.et__count'), { opacity: 1 });
        gsap.set(q('.et__tl, .et__line'), { yPercent: 110 });
        gsap.set(q('.et__col'), { yPercent: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end: portrait ? '+=200%' : '+=250%', pin: true, anticipatePin: 1, scrub: 0.6, invalidateOnRefresh: true },
        });

        ORDER.forEach((k, i) => {
          const a = rad(45 * k);
          const at = i * 1;
          const far = 1.05 + (i % 3) * 0.12;
          tl.fromTo(
            slices[k],
            { x: () => Math.cos(a) * dist() * far, y: () => Math.sin(a) * dist() * far * (portrait ? 1.35 : 1), rotation: SPIN[i], scale: 0.72 },
            { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.85, ease: 'power3.out' },
            at,
          );
          tl.fromTo(slices[k], { opacity: 0 }, { opacity: 1, duration: 0.18 }, at);
          if (i > 0) tl.to(q('.et__col'), { yPercent: -(100 / N) * i, duration: 0.3, ease: 'power3.out' }, at + 0.1);
        });
        tl.to(q('.et__shadow'), { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 7.6);

        // finale: the counter leaves upwards, the headline rises in its place
        tl.to(q('.et__count'), { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in' }, 8.1);
        tl.to(q('.et__fin > *'), { opacity: 1, duration: 0.01 }, 8.5);
        tl.to(q('.et__tl'), { yPercent: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 8.5);
        tl.to(q('.et__line'), { yPercent: 0, duration: 0.7, ease: 'power3.out' }, 9.2);
        tl.to({}, { duration: 0.8 }, 9.6);
        return () => { delete el.dataset.mode; };
      });
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="et" ref={root} data-mode="static" aria-label={t.label}>
      <div className="et__stage">
        <p className="et__eyebrow eyebrow">{t.eyebrow}</p>
        <div className="et__pizza" role="img" aria-label={t.alt}>
          <div className="et__shadow" aria-hidden="true" />
          {SECTORS.map((poly, k) => (
            <div
              className="et__slice"
              key={k}
              aria-hidden="true"
              style={{ transformOrigin: `${(G.cx + 0.55 * G.rx * Math.cos(rad(45 * k))).toFixed(1)}% ${(G.cy + 0.55 * G.ry * Math.sin(rad(45 * k))).toFixed(1)}%` } as CSSProperties}
            >
              <Image src="/assets/hero/pizza_whole.webp" alt="" fill unoptimized sizes="(max-width: 899px) 100vw, 60vw" style={{ clipPath: poly }} />
            </div>
          ))}
        </div>

        <div className="et__count" aria-hidden="true">
          <span className="et__win">
            <span className="et__col">
              {Array.from({ length: N }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </span>
          </span>
          <span className="et__of">/8</span>
        </div>

        <div className="et__fin">
          <h2 className="et__title">
            {t.title.map((w) => (
              <span className="et__mask" key={w}><span className="et__tl">{w}</span></span>
            ))}
          </h2>
          <p className="et__mask et__lnwrap"><span className="et__line">{t.line}</span></p>
        </div>
      </div>
    </section>
  );
}
