'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

/** Individual pizza ingredients only. No finished dishes. */
const FILES = [
  'basil_leaf_single', 'tomato_half', 'mushroom_slice', 'red_pepper_rings', 'cherry_tomatoes', 'basil_sprig',
  'red_onion_ring', 'black_olives', 'mozzarella_shreds', 'mushrooms_group', 'mixed_herbs_spices',
  'basil_leaf_single', 'red_onion_ring', 'tomato_half', 'mozzarella_shreds', 'black_olives', 'red_pepper_rings',
];
/** small sprites use the 256px variant (smaller bitmaps), large near-lens ones the full 360px file */
const srcFor = (f: string, w: number) => (w <= 150 ? `/assets/ingredients/s/${f}.webp` : `/assets/ingredients/${f}.webp`);

const COUNT = 168;
const PHONE_COUNT = 72;
const TABLET_COUNT = 120;
const DEPTH = 6000;
const TRAVEL = 6700;

type Sprite = { src: string; x: number; y: number; z: number; w: number; r: number; rx: number; ry: number; k: number; sx: number; sy: number; sz: number };

const rnd = (i: number, n: number) => {
  const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
  return Math.round((v - Math.floor(v)) * 1000) / 1000; // 0..1, deterministic, SSR-safe
};

const SPRITES: Sprite[] = Array.from({ length: COUNT }, (_, i) => {
  const big = i % 9 === 3; // a few large near-lens pieces for the whoosh
  const zi = (i * 79) % COUNT; // interleaved so the first half already span the whole depth
  const a = (i * 137.508 * Math.PI) / 180;
  const rad = big ? 0.55 + rnd(i, 1) * 0.4 : 0.2 + rnd(i, 2) * 0.8;
  const sign = (n: number) => (rnd(i, n) > 0.5 ? 1 : -1);
  const w = big ? Math.round(300 + rnd(i, 4) * 130) : Math.round(60 + Math.pow(rnd(i, 4), 1.6) * 200);
  return {
    src: srcFor(FILES[(i * 5 + (i >> 3)) % FILES.length], w),
    x: Math.round(Math.cos(a) * rad * 62 * 10) / 10,
    y: Math.round(Math.sin(a) * rad * 54 * 10) / 10,
    z: big ? Math.round(-DEPTH + rnd(i, 3) * (DEPTH - 150)) : Math.round(-DEPTH + (zi / (COUNT - 1)) * DEPTH),
    w,
    r: Math.round((rnd(i, 5) - 0.5) * 360),
    rx: Math.round((rnd(i, 6) - 0.5) * 70),
    ry: Math.round((rnd(i, 7) - 0.5) * 80),
    k: Math.round((0.85 + rnd(i, 8) * 0.4) * 100) / 100, // layered speed: parallax
    sx: sign(9) * (0.004 + rnd(i, 10) * 0.008),
    sy: sign(11) * (0.004 + rnd(i, 12) * 0.009),
    sz: sign(13) * (0.002 + rnd(i, 14) * 0.006),
  };
});

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function IngredientTunnel({ word }: { word: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const world = el.querySelector<HTMLElement>('.it__world')!;
      const nodes = Array.from(el.querySelectorAll<HTMLElement>('.it__s'));
      const mm = gsap.matchMedia();

      const run = (count: number, end: string) => {
        const items = nodes.map((node, i) => ({ node, s: SPRITES[i], on: i < count, last: -1, vis: false }));
        nodes.forEach((n, i) => { if (i >= count) n.style.display = 'none'; });
        // p.pre = gentle pre-roll while the section is still scrolling INTO view (so the ingredients are never static), p.main = the pinned travel
        const p = { pre: 0, main: 0, t: 0 };
        const PRE = TRAVEL * 0.2;
        let clock = 0; // seconds, drives an always-on slow sway of the whole field while it is on screen
        const setWorld = () => {
          const vw = window.innerWidth / 100;
          const vh = window.innerHeight / 100;
          const prog = p.t / TRAVEL;
          // camera: slow roll + sideways swirl drift (+ idle sway so nothing is ever perfectly still)
          world.style.transform = `translate3d(${(Math.sin(prog * Math.PI * 4) * 3.2 * vw + Math.sin(clock * 0.7) * 0.9 * vw).toFixed(1)}px,${(Math.cos(prog * Math.PI * 3) * 1.8 * vh + Math.cos(clock * 0.55) * 0.9 * vh).toFixed(1)}px,${p.t.toFixed(1)}px) rotateZ(${(prog * 28 + Math.sin(prog * 12.56) * 5 + Math.sin(clock * 0.45) * 1.6).toFixed(2)}deg)`;
        };
        const apply = () => {
          const vw = window.innerWidth / 100;
          const vh = window.innerHeight / 100;
          p.t = p.pre + p.main;
          setWorld();
          for (const it of items) {
            if (!it.on) continue;
            const s = it.s;
            const ze = s.z + p.t * s.k; // total depth in front of the lens
            const o = Math.min(clamp((ze + DEPTH + 300) / 900), clamp(1 - (ze - 350) / 380));
            const v = Math.round(o * 100) / 100;
            if (v === 0 && !it.vis) continue; // off-lens: nothing to do
            it.vis = v > 0;
            if (v !== it.last) {
              it.last = v;
              it.node.style.opacity = String(v);
            }
            if (!it.vis) continue;
            it.node.style.transform = `translate3d(${(s.x * vw).toFixed(1)}px,${(s.y * vh).toFixed(1)}px,${(s.z + p.t * (s.k - 1)).toFixed(1)}px) rotateX(${(s.rx + p.t * s.sx).toFixed(1)}deg) rotateY(${(s.ry + p.t * s.sy).toFixed(1)}deg) rotateZ(${(s.r + p.t * s.sz).toFixed(1)}deg)`;
          }
        };
        apply();
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: apply,
          scrollTrigger: { trigger: el, start: 'top top', end, scrub: 0.6, pin: true, invalidateOnRefresh: true, onRefresh: apply },
        });
        tl.to(p, { main: TRAVEL - PRE, duration: 10 }, 0);
        // pre-roll: starts as soon as the section's top edge enters the screen, ends exactly when the pin starts (continuous hand-over)
        const pre = gsap.to(p, { pre: PRE, ease: 'none', onUpdate: apply, scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: 0.5, invalidateOnRefresh: true } });
        // idle sway while on screen (one transform on the world element only: cheap)
        let live = false;
        const io = new IntersectionObserver(([e]) => { live = e.isIntersecting; });
        io.observe(el);
        const tick = (_t: number, dt: number) => { if (!live) return; clock += dt / 1000; setWorld(); };
        gsap.ticker.add(tick);
        return () => {
          gsap.ticker.remove(tick);
          io.disconnect();
          pre.scrollTrigger?.kill();
          pre.kill();
          nodes.forEach((n) => { n.style.display = ''; });
        };
      };

      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 600px)', () => run(COUNT, '+=340%'));
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 600px) and (max-width: 1023px) and (min-height: 501px)', () => run(TABLET_COUNT, '+=280%'));
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (max-height: 599px) and (min-height: 501px)', () => run(TABLET_COUNT, '+=280%'));
      mm.add('(prefers-reduced-motion: no-preference) and ((max-width: 599px) or (max-height: 500px))', () => run(PHONE_COUNT, '+=200%'));
      mm.add('(prefers-reduced-motion: reduce)', () => {
        nodes.slice(0, 10).forEach((n, i) => {
          const s = SPRITES[i];
          n.style.opacity = '0.9';
          n.style.transform = `translate(${s.x}vw,${s.y}vh) rotate(${s.r}deg)`;
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="it" aria-label={word}>
      <div className="it__stage" aria-hidden="true">
        <div className="it__world">
          {SPRITES.map((s, i) => (
            <div key={i} className={`it__s${i >= PHONE_COUNT ? ' it__s--far' : ''}`} style={{ '--w': `${s.w}px`, opacity: 0 } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" aria-hidden="true" decoding="async" draggable={false} />
            </div>
          ))}
        </div>
      </div>
      <span className="it__sr">{word}</span>
    </section>
  );
}
