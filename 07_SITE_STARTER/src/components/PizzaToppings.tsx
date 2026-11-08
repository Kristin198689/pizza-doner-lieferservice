'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

/** [file, left %, top %, width % of the pizza, resting rotation, float rotation, dx px, dy px, period s, delay s, parallax] */
const ITEMS: [string, number, number, number, number, number, number, number, number, number, number][] = [
  ['basil_leaf_single', 20, 68, 11, -24, 9, 8, -9, 4.2, -1.1, 14],
  ['tomato_half', 79, 53, 11, 20, -9, -9, 8, 3.4, -0.4, -10],
  ['red_onion_ring', 36, 80, 11, -10, 10, -8, 9, 4.8, -3.2, 12],
  ['mushroom_slice', 73, 72, 10, 14, -9, 9, -8, 5, -2.6, -12],
  ['red_pepper_rings', 54, 41, 12, 8, 10, 8, 9, 2.9, -1.9, 16],
];

/** Pyramid rising above the pizza: [file, centre x %, centre y % (negative = above the photo), width %, rotation, float rot, dx, dy, period, delay, parallax, shown on phones].
 *  Wide row of 4 along the upper edge, 3, 1, then one small leaf at the apex. */
const PYR: [string, number, number, number, number, number, number, number, number, number, number, boolean][] = [
  ['red_pepper_rings', 15, 8, 15, -14, 9, 9, -8, 3.6, -0.7, -8, true],
  ['tomato_half', 38, 6, 19, 18, -10, -8, 9, 4.6, -2.1, -11, false],
  ['red_onion_ring', 62, 7, 15, 24, 10, 8, 10, 3.0, -1.4, -9, false],
  ['tomato_half', 85, 8, 18, -20, -9, -14, -9, 5.0, -3.3, -12, true],
  ['basil_leaf_single', 27, -5, 12, 34, 10, 14, 10, 3.2, -2.6, 16, false],
  ['mushroom_slice', 50, -6, 17, 12, -9, 9, -9, 4.2, -0.3, 12, true],
  ['red_pepper_rings', 73, -5, 13, -26, 9, -10, 8, 2.8, -3.8, 20, false],
  ['cherry_tomatoes', 50, -17, 12, -8, -10, -9, 10, 3.8, -1.7, 22, true],
  ['basil_leaf_single', 50, -28, 8, 8, 10, 8, -14, 3.3, -2.9, 26, true],
];
const PYR_ITEMS = PYR;

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
      {PYR_ITEMS.map(([f, l, t, w, r0, r, dx, dy, dur, dl, par, ph], i) => (
        <span key={`y${i}`} className={`pt__p pt__p--c${ph ? '' : ' pt__p--more'}`} style={{ left: `${l}%`, top: `${t}%`, width: `${w}%` }} data-parallax={par}>
          <span className="pt__i" style={{ '--r0': `${r0}deg`, '--r': `${r}deg`, '--dx': `${dx}px`, '--dy': `${dy}px`, '--dur': `${dur}s`, '--dl': `${dl}s` } as React.CSSProperties}>
            <Image src={`/assets/ingredients/${f}.png`} alt="" width={360} height={300} sizes="(max-width: 767px) 20vw, 12vw" />
          </span>
        </span>
      ))}
      {ITEMS.map(([f, l, t, w, r0, r, dx, dy, dur, dl, par], i) => (
        <span key={i} className={`pt__p${i >= 3 ? ' pt__p--more' : ''}`} style={{ left: `${l}%`, top: `${t}%`, width: `${w}%` }} data-parallax={par}>
          <span className="pt__i" style={{ '--r0': `${r0}deg`, '--r': `${r}deg`, '--dx': `${dx}px`, '--dy': `${dy}px`, '--dur': `${dur}s`, '--dl': `${dl}s` } as React.CSSProperties}>
            <Image src={`/assets/ingredients/${f}.png`} alt="" width={360} height={300} sizes="(max-width: 767px) 12vw, 7vw" />
          </span>
        </span>
      ))}
    </div>
  );
}
