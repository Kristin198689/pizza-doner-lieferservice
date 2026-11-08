'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { HalalSeal } from './HalalSeal';
import { OrderButtons } from './OrderButtons';
import { HeroToppings, HeroSteam, HeroBasil } from './fx/HeroToppings';
import type { Messages } from '@/lib/i18n';

type Props = { t: Messages['hero']; order: Messages['order']; limeT: Messages['lime']; yufkaAlt: string };

/**
 * Geometry of /assets/hero/pizza_whole.png (percent of the square image): the pizza is an ellipse (3/4 view).
 * All 8 sectors are cut from THIS ONE image with polygon clip-paths along rays of that ellipse, so nothing changes
 * (ingredients, crust, light) when the pizza falls apart.
 */
const G = { cx: 50.08, cy: 55.18, rx: 49.6, ry: 33.6 };
const FLAT = G.ry / G.rx;
const N = 8;
const rad = (d: number) => (d * Math.PI) / 180;
const pt = (deg: number) => `${(G.cx + G.rx * Math.cos(rad(deg))).toFixed(2)}% ${(G.cy + G.ry * Math.sin(rad(deg))).toFixed(2)}%`;
/** sector k is centred on 45·k degrees (0 = right, 90 = down): sides, top, bottom, diagonals */
const SECTORS = Array.from({ length: N }, (_, k) => {
  const a0 = 45 * k - 22.5 - 0.3;
  const a1 = 45 * k + 22.5 + 0.3;
  const pts = [`${G.cx}% ${G.cy}%`];
  for (let a = a0; a < a1; a += 4.5) pts.push(pt(a));
  pts.push(pt(a1));
  return `polygon(${pts.join(',')})`;
});
const CUTS = Array.from({ length: N }, (_, k) => {
  const a = 45 * k + 22.5;
  return { x2: G.cx + G.rx * Math.cos(rad(a)), y2: G.cy + G.ry * Math.sin(rad(a)) };
});
const ELLIPSE = `ellipse(${G.rx}% ${G.ry}% at ${G.cx}% ${G.cy}%)`;
const SPIN = [-14, 12, -10, 16, -12, 10, -16, 14];

export function HeroMotion({ t, order, limeT, yufkaAlt }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      const box = q('.hero__pizza')[0] as HTMLElement;
      const limeEl = q('.hero__lime')[0] as HTMLElement;

      type Mode = 'portrait' | 'landscape' | 'short';
      const build = (mode: Mode) => {
        const vw = () => window.innerWidth;
        const vh = () => window.innerHeight;
        // untransformed centre of the pizza in stage coordinates (CSS placement of scene A)
        const c0x = () => box.offsetLeft + (box.offsetWidth * G.cx) / 100;
        const c0y = () => box.offsetTop + (box.offsetHeight * G.cy) / 100;
        const ew = () => (box.offsetWidth * 2 * G.rx) / 100; // ellipse width at scale 1
        const eh = () => ew() * FLAT;
        const txtB = q('.hero__txt--b')[0] as HTMLElement;
        const txtC = q('.hero__txt--c')[0] as HTMLElement;
        /**
         * Where the pizza stands while a given headline is on screen, derived from the real viewport:
         * portrait / landscape: centred under the headline, as large as the free band allows;
         * short landscape: right half, headline on the left.
         */
        const place = (txt: HTMLElement, grow: number) => {
          const W = vw();
          const H = vh();
          if (mode === 'short') {
            const s = Math.min((W * 0.5 * grow) / ew(), (H * 0.82) / eh());
            return { x: W * 0.72, y: H * 0.54, s };
          }
          const top = txt.offsetTop + txt.offsetHeight + H * 0.025;
          const bottom = H - (mode === 'portrait' ? Math.max(H * 0.07, 78) : H * 0.05);
          const avail = Math.max(bottom - top, eh() * 0.5);
          const s = Math.min((W * (mode === 'portrait' ? 1.06 : 0.84) * grow) / ew(), avail / eh());
          return { x: W / 2, y: top + avail / 2, s };
        };
        const B = () => place(txtB, 1);
        const C = () => place(txtC, 1.06);

        gsap.set(q('.hero__txt--b .hero__ln, .hero__txt--c .hero__ln'), { yPercent: 140 });
        gsap.set(q('.pz-cut'), { strokeDashoffset: 100 });
        gsap.set(limeEl, { autoAlpha: 0 });
        gsap.set(q('.lime__l1, .lime__l2'), { yPercent: 140 });
        gsap.set(q('.lime__wrap'), { xPercent: 125, rotation: -420 });
        gsap.set(q('.lime__eyebrow, .lime__body, .lime__deco, .lime__order'), { opacity: 0 });

        // intro (time based, ≤0.6s): text and pizza are already on screen (SSR), this is only a quick settle
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          // the intro animates the CONTAINER only, never the lines/fade the scrub timeline drives (a finishing intro used to overwrite scrub values and bring headline A back over the lime scene)
          .from(q('.hero__txt--a'), { opacity: 0.25, y: 18, duration: 0.4, immediateRender: false, overwrite: 'auto' }, 0)
          .from(q('.pz-wrap'), { scale: 0.95, duration: 0.6 }, 0);

        // lime window = the pizza's own footprint (an ellipse): it only shows where slices have left; later it
        // grows past the screen edges so the whole lime scene is open by the time the last slice exits
        const win = { s: 0.97 };
        // cached geometry (refreshed on ScrollTrigger refresh only): no layout reads while scrolling
        const geo = { x: 0, y: 0, w: 0 };
        const readGeo = () => {
          // the lime window opens exactly where the cut pizza stands (position C, scale C)
          const c = C();
          geo.x = c.x;
          geo.y = c.y;
          geo.w = (box.offsetWidth * c.s);
        };
        const paint = () => {
          const cx = geo.x;
          const cy = geo.y;
          const Rx = (geo.w * G.rx) / 100 * win.s;
          const parts: string[] = [];
          for (let a = 0; a < 360; a += 6) parts.push(`${(cx + Rx * Math.cos(rad(a))).toFixed(1)}px ${(cy + Rx * FLAT * Math.sin(rad(a))).toFixed(1)}px`);
          limeEl.style.clipPath = `polygon(${parts.join(',')})`;
        };

        /**
         * Scroll length: the timeline has TOTAL units and one unit is ≥ UNIT px of scroll, so every text beat (incl. its HOLD
         * plateau, where nothing moves) lasts ≥ ~4 units ≈ 760 px ≈ 1.9 s at a 400 px/s thumb. Mobile ≈ +=560 %, desktop ≈ +=530 %.
         */
        const TOTAL = 26;
        const UNIT = 190;
        const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true });
        // The scroll position is the TARGET; the timeline follows it through a critically damped spring (SmoothDamp,
        // ≈ scrub 1.8 s). Unlike scrub's restarted power3 tween, position AND velocity stay continuous when the target
        // jumps (mouse-wheel notches, touch flings, instant jumps), so nothing ever pops.
        const SMOOTH = 0.6;
        let target = 0;
        let cur = 0;
        let vel = 0;
        let last = 0;
        const tick = () => {
          const time = performance.now();
          const dt = Math.min(Math.max((time - last) / 1000, 0.001), 0.08);
          last = time;
          if (cur === target && vel === 0) return;
          const om = 2 / SMOOTH;
          const x = om * dt;
          const ex = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
          const ch = cur - target;
          const tmp = (vel + om * ch) * dt;
          vel = (vel - om * tmp) * ex;
          cur = target + (ch + tmp) * ex;
          if (Math.abs(cur - target) < 2e-5 && Math.abs(vel) < 2e-4) { cur = target; vel = 0; }
          tl.progress(cur);
        };
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: () => `+=${Math.round(Math.max(TOTAL * UNIT, vh() * (mode === 'portrait' ? 5.6 : 4.6)))}`,
          pin: true,
         
          invalidateOnRefresh: true,
          onUpdate: (self) => { target = self.progress; },
          onRefresh: (self) => {
            // after a refresh the scene is rebuilt at the real scroll position (no catch-up animation)
            target = self.progress;
            cur = target;
            vel = 0;
            tl.progress(0).invalidate(); // re-evaluate the function-based values for the new viewport
            tl.progress(cur);
            readGeo();
            paint();
          },
        });
        last = performance.now();
        gsap.ticker.add(tick);
        const pz = q('.pz-wrap');
        const slices = q('.pz-slice');

        // A · 0–4.4 HOLD (text is visible from the first frame; the pizza only breathes), exit 4.4–5.1
        tl.to(q('.hero__txt--a .hero__ln'), { yPercent: -140, duration: 0.7, stagger: 0.06, ease: 'power2.inOut' }, 4.4);
        tl.to(q('.hero__txt--a .hero__fade'), { opacity: 0, y: -16, duration: 0.5 }, 4.4);
        // scene-A basil leaves fade as the headline leaves (they ride with the pizza / headline block until then)
        tl.to(q('.bsl'), { opacity: 0, duration: 0.9, ease: 'sine.inOut' }, 4.1);
        // slow scroll-linked drift of the loose toppings, a different rate per piece (their own float loops run in CSS)
        tl.to(q('.pz-top'), { y: (i: number) => -(8 + ((i * 7) % 5) * 7), x: (i: number) => ((i % 2 ? 1 : -1) * (3 + ((i * 5) % 4) * 3)), rotation: (i: number) => ((i % 3) - 1) * 6, duration: 9.4, ease: 'none' }, 0);
        // hard guarantee: once a headline has exited it is not just translated out of its mask but hidden (reversible)
        tl.set(q('.hero__txt--a'), { visibility: 'hidden' }, 5.2);

        // B · ONE camera move 4.0–6.8 (sine in-out: starts and ends at rest, no stop-start before it); headline in 5.2–6.0; HOLD 6.0–9.8; exit 9.8–10.5
        tl.to(pz, { x: () => B().x - c0x(), y: () => B().y - c0y(), scale: () => B().s, duration: 2.8, ease: 'sine.inOut' }, 4.0);
        tl.to(q('.hero__txt--b .hero__ln'), { yPercent: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, 5.2);
        tl.to(q('.pz-steam'), { opacity: 0, duration: 1.6, ease: 'power1.in' }, 8.6);

        // C · pizza to the cut position 9.9–10.9; headline in 10.3–11.0; cuts draw 10.7–11.8; HOLD 11.8–14.7
        tl.to(q('.hero__txt--b .hero__ln'), { yPercent: -140, duration: 0.7, stagger: 0.06, ease: 'power2.inOut' }, 9.8);
        tl.set(q('.hero__txt--b'), { visibility: 'hidden' }, 10.6);
        tl.to(pz, { x: () => C().x - c0x(), y: () => C().y - c0y(), scale: () => C().s, duration: 1.4, ease: 'sine.inOut' }, 9.9);
        tl.to(q('.hero__txt--c .hero__ln'), { yPercent: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out' }, 10.3);
        tl.to(q('.seal--hero'), { opacity: 0, scale: 0.6, duration: 0.4 }, 10.0);
        tl.to(q('.pz-cut'), { strokeDashoffset: 0, duration: 1.2, stagger: 0.05, ease: 'sine.inOut' }, 10.7);

        // D · 14.8–18.6 : eight slices leave the centre along their own rays; the lime scene shows through the gaps
        const D0 = 14.8;
        tl.to(q('.pz-tops'), { opacity: 0, duration: 0.5 }, D0 - 0.4); // safety net
        // at the very moment the cut starts the toppings fly UP and away (staggered, drifting + spinning), then are gone
        tl.to(q('.pz-top'), { yPercent: (i: number) => -(500 + ((i * 53) % 7) * 70), xPercent: (i: number) => ((i % 2 ? 1 : -1) * (20 + ((i * 29) % 5) * 12)), rotation: (i: number) => ((i % 2 ? 1 : -1) * (40 + ((i * 17) % 5) * 22)), opacity: 0, duration: 2.6, ease: 'power1.in', stagger: { each: 0.1, from: 'end' } }, 10.55);
        // the slices already lie exactly on the whole image: the whole fades UNDER them while they have started to move,
        // the shadow grows from zero, the cut lines fade; nothing is swapped in one frame
        tl.to(q('.pz-full'), { opacity: 0, duration: 0.6, ease: 'none' }, D0);
        tl.set(q('.pz-full'), { visibility: 'hidden' }, D0 + 0.6);
        tl.to(q('.pz-cuts'), { opacity: 0, duration: 0.4, ease: 'none' }, D0);
        tl.set(q('.pz-cuts'), { visibility: 'hidden' }, D0 + 0.4);
        tl.set(limeEl, { autoAlpha: 1 }, D0);
        tl.fromTo(slices, { filter: 'drop-shadow(0px 0px 0px rgba(0,0,0,0))' }, { filter: 'drop-shadow(0px 16px 22px rgba(0,0,0,0.5))', duration: 1.2, ease: 'sine.out', immediateRender: false }, D0);
        tl.to(q('.hero__txt--c .hero__ln'), { yPercent: -140, duration: 0.7, stagger: 0.05, ease: 'power2.inOut' }, D0 - 0.1);
        tl.set(q('.hero__txt--c'), { visibility: 'hidden' }, D0 + 0.7);
        slices.forEach((s, k) => {
          const a = rad(45 * k);
          const diag = k % 2 ? 1.22 : 1;
          // travel = distance from the cut centre to the screen edge in that direction + the slice's own reach
          const reach = (axis: 'x' | 'y') => {
            const c = C();
            const half = ((axis === 'x' ? ew() : eh()) * c.s) / 2;
            const edge = axis === 'x' ? Math.max(c.x, vw() - c.x) : Math.max(c.y, vh() - c.y);
            return (edge + half * 1.15) * diag;
          };
          tl.to(s, { x: () => Math.cos(a) * reach('x'), y: () => Math.sin(a) * reach('y'), rotation: SPIN[k], scale: 1.1, duration: 3.8, ease: 'power1.in' }, D0);
        });
        // the window must outgrow the farthest screen corner (ellipse metric) by the time the last slice leaves
        const winEnd = () => {
          const c = C();
          const rx = (ew() * c.s * 0.97) / 2;
          const far = Math.max(
            ...[[0, 0], [vw(), 0], [0, vh()], [vw(), vh()]].map(([px, py]) => Math.hypot(px - c.x, (py - c.y) / FLAT)),
          );
          return (far / rx) * 1.06;
        };
        tl.to(win, { s: winEnd, duration: 3.6, ease: 'power1.in', onUpdate: paint }, D0 + 0.05);
        tl.set(limeEl, { clipPath: 'none' }, D0 + 3.8);

        // E · 17.0–21.2 : lime headline, yufka rolls in, body + button; HOLD 21.2–25 (nothing moves)
        tl.to(q('.lime__l1, .lime__l2'), { yPercent: 0, duration: 0.9, stagger: 0.2, ease: 'power3.out' }, 17.0);
        tl.to(q('.lime__eyebrow'), { opacity: 1, duration: 0.6 }, 17.4);
        tl.to(q('.lime__wrap'), { xPercent: 0, rotation: 0, duration: 3.0, ease: 'power1.out' }, 17.8);
        tl.to(q('.lime__body, .lime__deco, .lime__order'), { opacity: 1, duration: 1.0 }, 20.2);
        tl.to({}, { duration: TOTAL - 21.2 }, 21.2);
        cur = target = st.progress;
        tl.progress(0).invalidate();
        tl.progress(cur);
        readGeo();
        paint();
        return () => {
          gsap.ticker.remove(tick);
          st.kill();
        };
      };

      const RM = '(prefers-reduced-motion: no-preference)';
      const pinned = (mode: Mode) => () => {
        el.dataset.mode = 'pinned';
        const off = build(mode);
        return () => { off(); delete el.dataset.mode; };
      };
      mm.add(`(orientation: portrait) and ${RM}`, pinned('portrait'));
      mm.add(`(orientation: landscape) and (min-height: 501px) and ${RM}`, pinned('landscape'));
      mm.add(`(orientation: landscape) and (max-height: 500px) and ${RM}`, pinned('short'));
      mm.add('(prefers-reduced-motion: reduce)', () => {
        el.dataset.mode = 'static';
        return () => { delete el.dataset.mode; };
      });

      /**
       * XXL type: every big heading is fitted to the real box (largest size where no line overflows the width and
       * the block stays under a height cap), so mobile titles span the full width and nothing runs into the pizza.
       */
      const fit = (node: HTMLElement | undefined, maxH: number, maxFs = 460) => {
        if (!node || !node.offsetWidth) return;
        const lns = Array.from(node.querySelectorAll<HTMLElement>('.hero__ln, .lime__l1, .lime__l2'));
        const ok = (fs: number) => {
          node.style.fontSize = `${fs}px`;
          return node.offsetHeight <= maxH && lns.every((l) => l.scrollWidth <= l.clientWidth + 0.5);
        };
        let lo = 12;
        let hi = maxFs;
        for (let i = 0; i < 14; i++) {
          const mid = (lo + hi) / 2;
          if (ok(mid)) lo = mid; else hi = mid;
        }
        node.style.fontSize = `${(lo * 0.985).toFixed(2)}px`;
      };
      const fitAll = () => {
        const H = window.innerHeight;
        const land = window.matchMedia('(orientation: landscape)').matches;
        const short = land && H <= 500;
        const pbox = q('.hero__pizza')[0] as HTMLElement;
        const txtA = q('.hero__txt--a')[0] as HTMLElement;
        const title = q('.hero__title')[0] as HTMLElement;
        const nonTitle = txtA.offsetHeight - title.offsetHeight;
        const pizzaTop = pbox.offsetTop + (pbox.offsetHeight * (G.cy - G.ry)) / 100;
        // header bottom (76px + safe-area top) drives every top offset; mirrors the --hx rule in hero.css
        const hb = document.querySelector<HTMLElement>('.header')?.getBoundingClientRect().bottom ?? 76;
        const hx = short ? hb + 12 : land ? Math.max(hb + 16, H * 0.12) : hb + 12;
        const aMax = land ? H - 2 * hx - nonTitle : pizzaTop - txtA.offsetTop - 10 - nonTitle;
        fit(title, aMax);
        const h2Cap = short ? H * 0.62 : land ? H * 0.3 : H * 0.28;
        el.querySelectorAll<HTMLElement>('.hero__h2').forEach((n) => fit(n, h2Cap));
        fit(el.querySelector<HTMLElement>('.lime__title') ?? undefined, short ? H * 0.42 : land ? H * 0.36 : H * 0.2);
      };
      fitAll();
      // mobile browser bars change innerHeight while scrolling: only re-fit on a real size change (no text jumps mid-scroll)
      let lw = window.innerWidth;
      let lh = window.innerHeight;
      const onResize = () => {
        if (window.innerWidth === lw && Math.abs(window.innerHeight - lh) < 140) return;
        lw = window.innerWidth;
        lh = window.innerHeight;
        fitAll();
      };
      ScrollTrigger.addEventListener('refreshInit', fitAll);
      window.addEventListener('resize', onResize);
      document.fonts?.ready.then(() => { fitAll(); ScrollTrigger.refresh(); });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh, { once: true });
      return () => {
        window.removeEventListener('load', refresh);
        ScrollTrigger.removeEventListener('refreshInit', fitAll);
        window.removeEventListener('resize', onResize);
        mm.revert();
      };
    },
    { scope: root },
  );

  const marquee = Array.from({ length: 8 }, () => t.yufka[0]).join('  ');
  return (
    <section className="hero" ref={root} data-mode="static" aria-label={t.eyebrow}>
      <div className="hero__stage">
        <div className="hero__pizza">
          <div className="pz-wrap">
            <div className="pz-full">
              <Image className="pz-img" src="/assets/hero/pizza_whole.webp" alt={t.pizzaAlt} fill priority unoptimized sizes="(max-width: 899px) 100vw, 60vw" style={{ clipPath: ELLIPSE }} />
            </div>
            {SECTORS.map((poly, k) => (
              <div className="pz-slice" key={k} aria-hidden="true" style={{ transformOrigin: `${(G.cx + 0.55 * G.rx * Math.cos(rad(45 * k))).toFixed(1)}% ${(G.cy + 0.55 * G.ry * Math.sin(rad(45 * k))).toFixed(1)}%` }}>
                <Image className="pz-img" src="/assets/hero/pizza_whole.webp" alt="" fill unoptimized sizes="(max-width: 899px) 100vw, 60vw" style={{ clipPath: poly }} />
              </div>
            ))}
            <HeroToppings />
            <HeroBasil kind="rim" />
            <svg className="pz-cuts" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {CUTS.map((c, k) => (
                <line key={k} className="pz-cut" x1={G.cx} y1={G.cy} x2={c.x2} y2={c.y2} pathLength={100} strokeDasharray={100} />
              ))}
            </svg>
            <HeroSteam />
            <HalalSeal className="seal--hero" />
          </div>
        </div>

        <div className="hero__txt hero__txt--a">
          <p className="eyebrow hero__fade">{t.eyebrow}</p>
          <h1 className="hero__title">
            {t.title.map((l) => (
              <span className="hero__mask" key={l}><span className="hero__ln">{l}</span></span>
            ))}
          </h1>
          <p className="hero__sub hero__fade">
            <span>{t.sub[0]}</span>
            <span>{t.sub[1]}</span>
          </p>
        </div>

        <h2 className="hero__txt hero__txt--b hero__h2" aria-hidden="true">
          {t.zoom.map((l) => (
            <span className="hero__mask" key={l}><span className="hero__ln">{l}</span></span>
          ))}
        </h2>
        <h2 className="hero__txt hero__txt--c hero__h2" aria-hidden="true">
          {t.cut.map((l) => (
            <span className="hero__mask" key={l}><span className="hero__ln">{l}</span></span>
          ))}
        </h2>
      </div>

      <div className="hero__lime lime" id="yufka">
        <div className="lime__marq" aria-hidden="true">
          <span className="lime__row lime__row--a">{marquee}</span>
          <span className="lime__row lime__row--b">{marquee}</span>
        </div>
        <p className="eyebrow lime__eyebrow">{limeT.eyebrow}</p>
        <h2 className="display lime__title">
          <span className="lime__mask"><span className="lime__l1">{t.yufka[0]}</span></span>
          <span className="lime__mask"><span className="lime__l2">{t.yufka[1]}</span></span>
        </h2>
        <div className="lime__wrap">
          <Image className="lime__img" src="/assets/food/yufka_wrap.png" alt={yufkaAlt} width={1254} height={1254} sizes="(orientation: portrait) 100vw, 50vw" />
        </div>
        <Image className="lime__deco lime__deco--a" src="/assets/ingredients/red_pepper_rings.png" alt="" aria-hidden width={378} height={301} sizes="180px" />
        <Image className="lime__deco lime__deco--b" src="/assets/ingredients/tomato_half.png" alt="" aria-hidden width={304} height={277} sizes="160px" />
        <Image className="lime__deco lime__deco--c" src="/assets/ingredients/basil_leaf_single.png" alt="" aria-hidden width={325} height={297} sizes="160px" />
        <p className="lime__body">{limeT.body}</p>
        <OrderButtons order={order} className="lime__order" />
      </div>
    </section>
  );
}
