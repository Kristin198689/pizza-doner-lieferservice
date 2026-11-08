'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

/**
 * Layered depth section. Layers (back to front): giant word, ingredients, hero box,
 * side dishes that fly past the lens, blurred foreground bits. Each layer scales and
 * travels at its own rate = camera dolly. Only transform/opacity are animated.
 */
type Item = {
  src: string; layer: 1 | 2 | 3 | 4;
  x: number; y: number;      // centre, % of stage
  w: number; wm: number;     // width in vw (desktop / mobile)
  s0: number; s1: number;    // scale start / end
  y0: number; y1: number;    // translateY start / end, % of own height
  r: number;                 // rotation deg
  d: number;                 // pointer parallax depth
  skipMobile?: boolean;
  alt?: string;
  blur?: number;
};

const A = (f: string) => `/assets/${f}.png`;
const ITEMS: Item[] = [
  // L1 mid: ingredients
  { src: A('ingredients/tomato_half'), layer: 1, x: 18, y: 30, w: 11, wm: 24, s0: 0.7, s1: 1.1, y0: 30, y1: -40, r: -14, d: 0.5 },
  { src: A('ingredients/basil_sprig'), layer: 1, x: 84, y: 26, w: 11, wm: 26, s0: 0.7, s1: 1.1, y0: 40, y1: -50, r: 18, d: 0.6 },
  { src: A('ingredients/red_pepper_rings'), layer: 1, x: 30, y: 74, w: 10, wm: 22, s0: 0.7, s1: 1.1, y0: 40, y1: -30, r: 10, d: 0.5 },
  { src: A('ingredients/mozzarella_shreds'), layer: 1, x: 72, y: 76, w: 11, wm: 24, s0: 0.7, s1: 1.1, y0: 30, y1: -40, r: -8, d: 0.6 },
  { src: A('ingredients/black_olives'), layer: 1, x: 50, y: 22, w: 8, wm: 18, s0: 0.7, s1: 1.1, y0: 40, y1: -60, r: 6, d: 0.4, skipMobile: true },
  { src: A('ingredients/mushroom_slice'), layer: 1, x: 8, y: 62, w: 8, wm: 18, s0: 0.7, s1: 1.1, y0: 40, y1: -50, r: 20, d: 0.4, skipMobile: true },
  // L2 hero: box
  { src: A('packaging/pizza_box_open_steam'), layer: 2, x: 50, y: 58, w: 46, wm: 96, s0: 0.62, s1: 1.12, y0: 8, y1: -6, r: 0, d: 1 },
  // L3: side dishes fly past the lens
  { src: A('food/doner_sandwich'), layer: 3, x: 13, y: 70, w: 24, wm: 42, s0: 0.45, s1: 1.3, y0: 10, y1: -10, r: -8, d: 1.6 },
  { src: A('food/yufka_wrap'), layer: 3, x: 87, y: 66, w: 22, wm: 40, s0: 0.45, s1: 1.3, y0: 10, y1: -10, r: 9, d: 1.6 },
  // L4 front: blurred bits
  { src: A('ingredients/basil_leaf_single'), layer: 4, x: 6, y: 20, w: 15, wm: 34, s0: 1, s1: 2.6, y0: 0, y1: -30, r: -25, d: 2.4, blur: 7 },
  { src: A('ingredients/cherry_tomatoes'), layer: 4, x: 95, y: 82, w: 16, wm: 34, s0: 1, s1: 2.6, y0: 0, y1: -20, r: 15, d: 2.4, blur: 8 },
  { src: A('ingredients/red_onion_ring'), layer: 4, x: 92, y: 14, w: 12, wm: 28, s0: 1, s1: 2.4, y0: 0, y1: -20, r: 30, d: 2.2, blur: 6, skipMobile: true },
];

export function DepthLayers({ t }: { t: Messages['depth'] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      const q = <T extends HTMLElement>(s: string) => Array.from(el.querySelectorAll<T>(s));

      const build = (end: string, pointer: boolean) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end, scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
        });
        tl.fromTo('.dl__word', { scale: 0.72, yPercent: 8 }, { scale: 1.35, yPercent: -6 }, 0);
        q('.dl__s').forEach((s) => {
          const i = ITEMS[Number(s.dataset.i)];
          tl.fromTo(s, { scale: i.s0, yPercent: i.y0, rotate: i.r }, { scale: i.s1, yPercent: i.y1, rotate: i.r * -0.5 }, 0);
          if (i.layer >= 3) tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.18 }, 0).to(s, { opacity: 0, duration: 0.15 }, 0.85);
        });
        tl.fromTo('.dl__head', { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.28 }, 0.02);
        tl.fromTo('.dl__text', { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.3);

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

      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => build('+=260%', window.matchMedia('(hover: hover)').matches));
      mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767px)', () => build('+=160%', false));
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
            style={{ '--x': `${it.x}%`, '--y': `${it.y}%`, '--w': `${it.w}vw`, '--wm': `${it.wm}vw`, '--b': `${it.blur ?? 0}px` } as React.CSSProperties}
          >
            <div className="dl__s" data-i={i} style={{ transform: `scale(${it.s1 > 1.2 ? 1 : (it.s0 + it.s1) / 2}) rotate(${it.r}deg)` }}>
              <Image src={it.src} alt={it.layer === 2 ? t.boxAlt : ''} width={it.layer >= 2 && it.layer < 4 ? 1254 : 380} height={it.layer === 2 ? 941 : it.layer === 3 ? 1254 : 330} sizes="(max-width: 767px) 60vw, 30vw" draggable={false} />
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
