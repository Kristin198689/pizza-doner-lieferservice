'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

/** [file, left %, top %, width % of the pizza, resting rotation, float rotation, dx px, dy px, period s, delay s, parallax] */
const ITEMS: [string, number, number, number, number, number, number, number, number, number, number][] = [
  ['basil_leaf_single', 20, 68, 11, -24, 6, 4, -6, 4.2, -1.1, 14],
  ['mushroom_slice', 73, 72, 10, 14, -5, -5, 5, 5.4, -2.6, -12],
  ['tomato_half', 79, 53, 11, 20, 6, 5, -4, 3.6, -0.4, 10],
  ['red_onion_ring', 36, 80, 11, -10, -6, -4, 6, 4.8, -3.2, -10],
  ['red_pepper_rings', 54, 41, 12, 8, 5, 6, 4, 5.8, -1.9, 16],
  ['basil_leaf_single', 13, 52, 9, 38, -6, 3, 6, 3.2, -2.2, -14],
  ['black_olives', 62, 87, 8, -6, 5, -6, -4, 4.4, -0.8, 12],
  ['red_onion_ring', 85, 70, 10, 30, -5, 4, 6, 5, -2.9, -8],
  ['mushroom_slice', 30, 44, 9, -18, 6, -3, -6, 3.9, -1.5, 8],
  ['tomato_half', 46, 68, 10, 10, -6, 5, 5, 4.6, -3.6, -16],
];

/** Pyramid rising above the pizza: [file, centre x %, centre y % (negative = above the photo), width %, rotation, shown on phones].
 *  Wide row along the upper edge, narrowing to one small leaf at the apex. */
const PYR: [string, number, number, number, number, boolean][] = [
  ['red_pepper_rings', 13, 9, 14, -14, true], ['tomato_half', 28, 7, 18, 18, true], ['basil_leaf_single', 42, 10, 12, -30, false],
  ['red_onion_ring', 57, 8, 14, 24, true], ['mushroom_slice', 71, 9, 15, -12, false], ['tomato_half', 86, 8, 17, -20, true],
  ['basil_leaf_single', 23, -4, 11, 34, false], ['red_pepper_rings', 37, -3, 16, -8, true], ['tomato_half', 51, -5, 20, 12, true],
  ['mushroom_slice', 64, -3, 13, 20, true], ['red_onion_ring', 77, -4, 12, -26, false],
  ['basil_leaf_single', 40, -15, 9, -34, true], ['red_pepper_rings', 50, -16, 13, 10, false], ['cherry_tomatoes', 61, -14, 12, -10, true],
  ['mushroom_slice', 45, -25, 8, 16, false], ['red_onion_ring', 55, -24, 8, -18, false],
  ['basil_leaf_single', 50, -32, 7, 8, true],
];
const PYR_ITEMS: [string, number, number, number, number, number, number, number, number, number, number][] = PYR.map(([f, x, y, w, r0], i) => [
  f, x, y, w, r0, (i % 2 ? -1 : 1) * (3 + (i % 4)), ((i * 3) % 7) - 3 || 4, ((i * 5) % 7) - 3 || -4, 3 + ((i * 7) % 30) / 10, -((i * 13) % 50) / 10, y < 0 ? 10 + (i % 5) * 4 : -8 - (i % 4) * 3,
]);

/** Toppings coming alive on top of the pizza photo: idle float (CSS, transform only) + parallax via [data-parallax]. */
export function PizzaToppings() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => { el.dataset.on = e.isIntersecting ? '1' : ''; }, { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="pt" ref={root} aria-hidden="true">
      {PYR_ITEMS.map(([f, l, t, w, r0, r, dx, dy, dur, dl, par], i) => (
        <span key={`y${i}`} className={`pt__p pt__p--c${PYR[i][5] ? '' : ' pt__p--more'}`} style={{ left: `${l}%`, top: `${t}%`, width: `${w}%` }} data-parallax={par}>
          <span className="pt__i" style={{ '--r0': `${r0}deg`, '--r': `${r}deg`, '--dx': `${dx}px`, '--dy': `${dy}px`, '--dur': `${dur}s`, '--dl': `${dl}s` } as React.CSSProperties}>
            <Image src={`/assets/ingredients/${f}.png`} alt="" width={360} height={300} sizes="(max-width: 767px) 20vw, 12vw" />
          </span>
        </span>
      ))}
      {ITEMS.map(([f, l, t, w, r0, r, dx, dy, dur, dl, par], i) => (
        <span key={i} className={`pt__p${i >= 5 ? ' pt__p--more' : ''}`} style={{ left: `${l}%`, top: `${t}%`, width: `${w}%` }} data-parallax={par}>
          <span className="pt__i" style={{ '--r0': `${r0}deg`, '--r': `${r}deg`, '--dx': `${dx}px`, '--dy': `${dy}px`, '--dur': `${dur}s`, '--dl': `${dl}s` } as React.CSSProperties}>
            <Image src={`/assets/ingredients/${f}.png`} alt="" width={360} height={300} sizes="(max-width: 767px) 12vw, 7vw" />
          </span>
        </span>
      ))}
    </div>
  );
}
