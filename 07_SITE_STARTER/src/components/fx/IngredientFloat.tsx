'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

type Bit = { src: string; x: number; y: number; w: number; r: number; tx: number; ty: number; dur: number; delay: number; mobile?: boolean };
const I = (f: string) => `/assets/ingredients/${f}.webp`;

/** Small real ingredient cut-outs resting on the product photo; each one idles with a gentle wiggle.
 *  x / y = centre in % of the photo, w = width in % of the photo, r = base rotation (deg), tx / ty = travel (px), dur = period (s). */
const SETS: Record<string, Bit[]> = {
  pizza: [
    /* pyramid above the photo: wide row on the upper edge, narrowing to one leaf at the apex */
    { src: I('red_pepper_rings'), x: 14, y: 11, w: 14, r: -14, tx: 5, ty: 4, dur: 4.2, delay: -0.8, mobile: true },
    { src: I('tomato_half'), x: 29, y: 8, w: 18, r: 18, tx: 4, ty: 5, dur: 5.4, delay: -2.1, mobile: true },
    { src: I('basil_leaf_single'), x: 43, y: 11, w: 12, r: -30, tx: 5, ty: 3, dur: 3.6, delay: -1.2 },
    { src: I('red_onion_ring'), x: 57, y: 9, w: 14, r: 24, tx: 4, ty: 6, dur: 5, delay: -3.2, mobile: true },
    { src: I('mushroom_slice'), x: 71, y: 10, w: 15, r: -12, tx: 5, ty: 5, dur: 4.6, delay: -1.7 },
    { src: I('tomato_half'), x: 86, y: 9, w: 17, r: -20, tx: 4, ty: 4, dur: 5.8, delay: -0.4, mobile: true },
    { src: I('basil_leaf_single'), x: 24, y: -3, w: 11, r: 34, tx: 6, ty: 4, dur: 3.9, delay: -2.6 },
    { src: I('red_pepper_rings'), x: 37, y: -2, w: 16, r: -8, tx: 5, ty: 6, dur: 4.9, delay: -3.6, mobile: true },
    { src: I('tomato_half'), x: 51, y: -4, w: 20, r: 12, tx: 4, ty: 5, dur: 5.2, delay: -1.4, mobile: true },
    { src: I('mushroom_slice'), x: 64, y: -2, w: 13, r: 20, tx: 5, ty: 4, dur: 4.4, delay: -2.9, mobile: true },
    { src: I('red_onion_ring'), x: 77, y: -3, w: 12, r: -26, tx: 6, ty: 3, dur: 3.8, delay: -0.9 },
    { src: I('basil_leaf_single'), x: 40, y: -13, w: 9, r: -34, tx: 4, ty: 5, dur: 5.6, delay: -3 , mobile: true },
    { src: I('red_pepper_rings'), x: 50, y: -14, w: 13, r: 10, tx: 5, ty: 4, dur: 4.3, delay: -1.9 },
    { src: I('cherry_tomatoes'), x: 61, y: -12, w: 12, r: -10, tx: 4, ty: 5, dur: 5.1, delay: -2.4, mobile: true },
    { src: I('mushroom_slice'), x: 45, y: -22, w: 8, r: 16, tx: 5, ty: 4, dur: 3.7, delay: -0.5 },
    { src: I('red_onion_ring'), x: 55, y: -21, w: 8, r: -18, tx: 4, ty: 5, dur: 4.7, delay: -3.3 },
    { src: I('basil_leaf_single'), x: 50, y: -29, w: 7, r: 8, tx: 4, ty: 4, dur: 5.3, delay: -1.1, mobile: true },
    /* a few on the pizza body */
    { src: I('basil_leaf_single'), x: 17, y: 52, w: 10, r: -24, tx: 5, ty: 4, dur: 4.4, delay: -1.3, mobile: true },
    { src: I('tomato_half'), x: 76, y: 62, w: 12, r: 16, tx: 4, ty: 5, dur: 5, delay: -2.2, mobile: true },
    { src: I('red_onion_ring'), x: 36, y: 74, w: 10, r: -12, tx: 5, ty: 4, dur: 3.9, delay: -0.6 },
    { src: I('mushroom_slice'), x: 62, y: 80, w: 9.5, r: 14, tx: 5, ty: 5, dur: 4.8, delay: -2.8 },
  ],
  doner: [
    { src: I('basil_leaf_single'), x: 16, y: 38, w: 10, r: -20, tx: 5, ty: 4, dur: 4.4, delay: -1, mobile: true },
    { src: I('tomato_half'), x: 86, y: 30, w: 10, r: 16, tx: 4, ty: 5, dur: 5.2, delay: -2.4, mobile: true },
    { src: I('red_onion_ring'), x: 78, y: 74, w: 10, r: 24, tx: 5, ty: 4, dur: 3.8, delay: -0.6 },
    { src: I('black_olives'), x: 22, y: 76, w: 9, r: -8, tx: 4, ty: 5, dur: 5.6, delay: -3 },
  ],
};

export function IngredientFloat({ id }: { id: string }) {
  const root = useRef<HTMLDivElement>(null);
  const bits = SETS[id];

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-live', e.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!bits) return null;
  return (
    <div className={`fxi fxi--${id}`} ref={root} aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className={`fxi__bit${b.mobile ? '' : ' fxi__bit--d'}`}
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, margin: `${-b.w * 0.4}% 0 0 ${-b.w / 2}%`, '--r0': `${b.r}deg`, '--ra': '6deg', '--tx': `${b.tx}px`, '--ty': `${b.ty}px`, '--dur': `${b.dur}s`, '--dl': `${b.delay}s` } as React.CSSProperties}
        >
          <Image src={b.src} alt="" width={360} height={300} sizes="12vw" draggable={false} />
        </span>
      ))}
    </div>
  );
}
