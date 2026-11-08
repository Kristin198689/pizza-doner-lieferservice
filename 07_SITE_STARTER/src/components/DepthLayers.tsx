'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

/**
 * Layered depth section. Layers (back to front): giant word, ingredients, hero box,
 * side dishes that fly past the lens (all crisp, no blur). Each layer scales and
 * travels at its own rate = camera dolly. Only transform/opacity are animated.
 */
type Item = {
  src: string; layer: 1 | 2 | 3;
  x: number; y: number;      // centre, % of stage
  w: number; wm: number;     // width in vw (desktop / mobile)
  s0: number; s1: number;    // scale start / end
  y0: number; y1: number;    // translateY start / end, % of own height
  r: number;                 // rotation deg
  d: number;                 // pointer parallax depth
  skipMobile?: boolean;
  alt?: string;
};

const A = (f: string) => `/assets/${f}.png`;
const ITEMS: Item[] = [
  // L1 mid: ingredients
  { src: A('ingredients/tomato_half'), layer: 1, x: 14, y: 46, w: 11, wm: 24, s0: 0.7, s1: 1.1, y0: 30, y1: -40, r: -14, d: 0.5 },
  { src: A('ingredients/basil_sprig'), layer: 1, x: 87, y: 44, w: 11, wm: 26, s0: 0.7, s1: 1.1, y0: 40, y1: -50, r: 18, d: 0.6 },
  { src: A('ingredients/red_pepper_rings'), layer: 1, x: 30, y: 74, w: 10, wm: 22, s0: 0.7, s1: 1.1, y0: 40, y1: -30, r: 10, d: 0.5 },
  { src: A('ingredients/mozzarella_shreds'), layer: 1, x: 72, y: 76, w: 11, wm: 24, s0: 0.7, s1: 1.1, y0: 30, y1: -40, r: -8, d: 0.6 },
  { src: A('ingredients/black_olives'), layer: 1, x: 60, y: 84, w: 8, wm: 18, s0: 0.7, s1: 1.1, y0: 40, y1: -60, r: 6, d: 0.4, skipMobile: true },
  { src: A('ingredients/mushroom_slice'), layer: 1, x: 8, y: 62, w: 8, wm: 18, s0: 0.7, s1: 1.1, y0: 40, y1: -50, r: 20, d: 0.4, skipMobile: true },
  // L2 hero: box
  { src: A('packaging/pizza_box_open_steam'), layer: 2, x: 50, y: 66, w: 46, wm: 96, s0: 0.62, s1: 1.12, y0: 8, y1: -6, r: 0, d: 1 },
  // L3: side dishes fly past the lens
  { src: A('food/doner_sandwich'), layer: 3, x: 13, y: 70, w: 24, wm: 42, s0: 0.45, s1: 1.3, y0: 10, y1: -10, r: -8, d: 1.6 },
  { src: A('food/yufka_wrap'), layer: 3, x: 87, y: 66, w: 22, wm: 40, s0: 0.45, s1: 1.3, y0: 10, y1: -10, r: 9, d: 1.6 },
];

export function DepthLayers({ t }: { t: Messages['depth'] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      const q = <T extends HTMLElement>(s: string) => Array.from(el.querySelectorAll<T>(s));

      // pin length by shape: desktop landscape 260%, tablet portrait 200%, phone portrait 160%, short landscape 260% (px are small there anyway)
      const pinLen = () => { const w = window.innerWidth, h = window.innerHeight; if (w <= h) return w >= 600 ? 340 : 320; return 400; };
      const build = (pointer: boolean) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${pinLen()}%`, scrub: 1, pin: true, invalidateOnRefresh: true },
        });
        const T = 8.4; // timeline length: depth travel runs over all of it, the reveal is choreographed in order
        // continuous camera dolly (scale/travel) across the whole pin; visibility is staged separately below
        tl.fromTo('.dl__word', { scale: 0.72, yPercent: 8 }, { scale: 1.35, yPercent: -6, duration: T }, 0);
        q('.dl__s').forEach((s) => {
          const i = ITEMS[Number(s.dataset.i)];
          tl.fromTo(s, { scale: i.s0, yPercent: i.y0, rotate: i.r }, { scale: i.s1, yPercent: i.y1, rotate: i.r * -0.5, duration: T }, 0);
        });
        // everything but the text starts invisible
        // headline + sentence are on screen from the very first frame (continuous with the dark box scene before it)
        gsap.set(['.dl__word', '.dl__p'], { opacity: 0 });

        // 1 · text alone: headline lines mask in one after another, then the sentence; HOLD so it can be read
        tl.to('.dl__word', { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0.2); // giant word fades up behind the text
        // (hold 3.2–3.8)
        // 2 · the box rises into the frame
        const box = q('.dl__p--l2');
        tl.fromTo(box, { opacity: 0, scale: 0.82, yPercent: 14 }, { opacity: 1, scale: 1, yPercent: 0, duration: 1.6, ease: 'power3.out' }, 1.6);
        // 3 · ingredients pop in one by one around it
        const ing = q('.dl__p--l1');
        ing.forEach((p, k) => tl.fromTo(p, { opacity: 0, scale: 0.55 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, 3.4 + k * 0.28));
        // 4 · side dishes fly in from the sides
        const side = q('.dl__p--l3');
        side.forEach((p, k) => tl.fromTo(p, { opacity: 0, xPercent: k % 2 ? 60 : -60 }, { opacity: 1, xPercent: 0, duration: 1.3, ease: 'power3.out' }, 5.4 + k * 0.35));
        tl.to({}, { duration: 0.6 }, T - 0.6); // final hold

        if (!pointer) return;
        const movers = q('.dl__p').map((p) => {
          const d = Number(p.dataset.d);
          return { d, x: gsap.quickTo(p, 'x', { duration: 0.9, ease: 'power3.out' }), y: gsap.quickTo(p, 'y', { duration: 0.9, ease: 'power3.out' }) };
        });
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
          movers.forEach((m) => { m.x(-nx * 22 * m.d); m.y(-ny * 16 * m.d); });
        };
        el.addEventListener('pointermove', onMove);
        return () => el.removeEventListener('pointermove', onMove);
      };

      mm.add('(prefers-reduced-motion: no-preference)', () => build(window.matchMedia('(hover: hover) and (pointer: fine)').matches));
    },
    { scope: root },
  );

  return (
    <section className="dl" id="depth" ref={root} aria-labelledby="dl-title">
      <div className="dl__stage">
        <div className="dl__word" aria-hidden="true">{t.word}</div>
        {ITEMS.map((it, i) => (
          <div
            key={i}
            className={`dl__p dl__p--l${it.layer}${it.skipMobile ? ' dl__p--d' : ''}`}
            data-d={it.d}
            style={{ '--x': `${it.x}%`, '--y': `${it.y}%`, '--w': `${it.w}vw`, '--wm': `${it.wm}vw` } as React.CSSProperties}
          >
            <div className="dl__s" data-i={i} style={{ transform: `scale(${it.s1 > 1.2 ? 1 : (it.s0 + it.s1) / 2}) rotate(${it.r}deg)` }}>
              <Image src={it.src} alt={it.layer === 2 ? t.boxAlt : ''} width={it.layer >= 2 ? 1254 : 380} height={it.layer === 2 ? 941 : it.layer === 3 ? 1254 : 330} sizes="(max-width: 767px) 60vw, 30vw" draggable={false} />
            </div>
          </div>
        ))}
        <h2 className="dl__head" id="dl-title">
          <span className="dl__a">{t.a}</span>
          <span className="dl__b">{t.b}</span>
        </h2>
        <p className="dl__text">{t.text}</p>
      </div>
    </section>
  );
}
