'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

const I = (f: string) => `/assets/ingredients/${f}.png`;
const DIM: Record<string, [number, number]> = {
  tomato_half: [304, 277], red_pepper_rings: [378, 301], mushroom_slice: [359, 297], red_onion_ring: [348, 283],
  basil_leaf_single: [325, 297], basil_sprig: [360, 316], mushrooms_group: [364, 304],
};
/** x / y = centre in % of the pizza box (the ellipse top edge is at y≈21.6 %), w = width in % of the box, r = base rotation,
 *  tx / ty = float travel (px), dur = period (s). m = hidden on phones/tablets. Rows narrow upward: a pyramid. */
type Top = { f: keyof typeof DIM; x: number; y: number; w: number; r: number; tx: number; ty: number; dur: number; d: number; m?: boolean };
const TOPS: Top[] = [
  // base row: on the upper rim, widest
  { f: 'tomato_half', x: 27, y: 25.5, w: 14, r: -18, tx: 4, ty: 5, dur: 5.2, d: -1.2 },
  { f: 'red_pepper_rings', x: 41, y: 22.5, w: 16, r: 8, tx: 5, ty: 4, dur: 4.4, d: -2.6 },
  { f: 'mushroom_slice', x: 56, y: 22.5, w: 12.5, r: -10, tx: 4, ty: 6, dur: 5.8, d: -0.6, m: true },
  { f: 'red_onion_ring', x: 69, y: 25, w: 14.5, r: 22, tx: 6, ty: 4, dur: 3.8, d: -3.1 },
  // second row
  { f: 'basil_leaf_single', x: 36, y: 15, w: 12, r: -28, tx: 4, ty: 5, dur: 4.6, d: -1.9 },
  { f: 'tomato_half', x: 50, y: 14.5, w: 14, r: 10, tx: 5, ty: 5, dur: 5.4, d: -4.2 },
  { f: 'basil_sprig', x: 63, y: 15.5, w: 11.5, r: 20, tx: 5, ty: 4, dur: 4.1, d: -0.9, m: true },
  // third row
  { f: 'red_onion_ring', x: 44, y: 8.5, w: 9.5, r: -14, tx: 4, ty: 4, dur: 5, d: -2.2, m: true },
  { f: 'basil_leaf_single', x: 56, y: 8, w: 10, r: 26, tx: 4, ty: 5, dur: 4.7, d: -3.5 },
  // apex
  { f: 'basil_leaf_single', x: 50, y: 2.5, w: 8, r: -6, tx: 3, ty: 4, dur: 5.6, d: -1.4 },
];

/** Fresh toppings heaped at the top of the pizza as a cone (children of .pz-wrap, so they ride its push-in). */
export function HeroToppings() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-live', e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="pz-tops" ref={root} aria-hidden="true">
      {TOPS.map((t, i) => {
        const [w, h] = DIM[t.f];
        return (
          <span key={i} className={`pz-top${t.m ? ' pz-top--lg' : ''}${t.y < 12 ? ' pz-top--hi' : t.y < 20 ? ' pz-top--mid' : ''}`} style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${(t.w * 1.18).toFixed(1)}%`, zIndex: 100 - Math.round(t.y) }}>
            <span className="pz-top__f" style={{ ['--r' as string]: `${t.r}deg`, ['--tx' as string]: `${t.tx}px`, ['--ty' as string]: `${t.ty}px`, ['--dur' as string]: `${t.dur}s`, ['--d' as string]: `${t.d}s` }}>
              <Image src={I(t.f)} alt="" width={w} height={h} sizes="160px" unoptimized />
            </span>
          </span>
        );
      })}
    </div>
  );
}

const WISPS = [
  { x: 33, w: 7, h: 24, dur: 6.4, d: -0.5, o: 0.4, p: 'M20 118 C6 96 34 80 20 58 S6 24 20 2' },
  { x: 42, w: 6, h: 28, dur: 7.6, d: -3.2, o: 0.36, p: 'M18 118 C34 94 6 78 22 56 S34 22 18 2' },
  { x: 49, w: 7.5, h: 30, dur: 5.8, d: -1.6, o: 0.45, p: 'M22 118 C8 98 32 76 18 56 S8 22 22 2' },
  { x: 57, w: 6, h: 26, dur: 7.2, d: -4.6, o: 0.38, p: 'M18 118 C32 98 8 78 22 58 S32 24 18 2' },
  { x: 65, w: 6.5, h: 22, dur: 6.8, d: -2.4, o: 0.34, p: 'M20 118 C8 94 32 80 20 60 S10 26 20 2' },
  { x: 38, w: 5, h: 20, dur: 8, d: -5.8, o: 0.3, p: 'M20 118 C30 96 8 78 20 56 S30 24 20 2' },
  { x: 61, w: 5, h: 21, dur: 5.6, d: -6.6, o: 0.32, p: 'M20 118 C10 98 30 78 20 58 S10 22 20 2' },
];

/** Thin white steam wisps rising from the top edge of the pizza (SVG, transform/opacity only; off under reduced motion). */
export function HeroSteam() {
  return (
    <div className="pz-steam" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="steamg" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.25" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="steamb" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="1.1" /></filter>
        </defs>
      </svg>
      {WISPS.map((s, i) => (
        <svg key={i} className="pz-wisp" viewBox="0 0 40 120" preserveAspectRatio="none" style={{ left: `${s.x}%`, width: `${s.w}%`, height: `${s.h}%`, ['--dur' as string]: `${s.dur}s`, ['--d' as string]: `${s.d}s`, ['--o' as string]: Math.min(0.45, s.o * 1.15) }}>
          <g filter="url(#steamb)" fill="none" stroke="url(#steamg)" strokeLinecap="round">
            <path d={s.p} strokeWidth="5" />
            <path d={s.p} strokeWidth="2" strokeOpacity="0.9" />
          </g>
        </svg>
      ))}
    </div>
  );
}
