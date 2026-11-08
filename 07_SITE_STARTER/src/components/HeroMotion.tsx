'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { HalalSeal } from './HalalSeal';
import { OrderButtons } from './OrderButtons';
import { HeroToppings, HeroSteam } from './fx/HeroToppings';
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
          .from(q('.hero__txt--a .hero__ln'), { yPercent: 35, opacity: 0.25, duration: 0.4, stagger: 0.05 }, 0)
          .from(q('.hero__txt--a .hero__fade'), { opacity: 0.25, y: 10, duration: 0.35, stagger: 0.05 }, 0.05)
          .from(q('.pz-wrap'), { scale: 0.95, duration: 0.6 }, 0);

        // lime window = the pizza's own footprint (an ellipse): it only shows where slices have left; later it
        // grows past the screen edges so the whole lime scene is open by the time the last slice exits
        const win = { s: 0.97 };
        const paint = () => {
          const r = box.getBoundingClientRect();
          const cx = r.left + (r.width * G.cx) / 100;
          const cy = r.top + (r.height * G.cy) / 100;
          const Rx = (r.width * G.rx) / 100 * win.s;
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
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => `+=${Math.round(Math.max(TOTAL * UNIT, vh() * (mode === 'portrait' ? 5.6 : 4.6)))}`,
            scrub: 1.1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        const pz = q('.pz-wrap');
        const slices = q('.pz-slice');

        // A · 0–4.4 HOLD (text is visible from the first frame; the pizza only breathes), exit 4.4–5.1
        tl.fromTo(pz, { scale: 1 }, { scale: 1.02, duration: 4.4 }, 0);
        tl.to(q('.hero__txt--a .hero__ln'), { yPercent: -140, duration: 0.7, stagger: 0.06, ease: 'power3.in' }, 4.4);
        tl.to(q('.hero__txt--a .hero__fade'), { opacity: 0, y: -16, duration: 0.5 }, 4.4);

        // B · pizza pushes in 4.6–6.8; headline in 5.2–6.0; HOLD 6.0–9.8; exit 9.8–10.5
        tl.to(pz, { x: () => B().x - c0x(), y: () => B().y - c0y(), scale: () => B().s, duration: 2.2, ease: 'power2.inOut' }, 4.6);
        tl.to(q('.hero__txt--b .hero__ln'), { yPercent: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 5.2);
        tl.to(q('.pz-steam'), { opacity: 0, duration: 1.6, ease: 'power1.in' }, 8.6);

        // C · pizza to the cut position 9.9–10.9; headline in 10.3–11.0; cuts draw 10.7–11.8; HOLD 11.8–14.7
        tl.to(q('.hero__txt--b .hero__ln'), { yPercent: -140, duration: 0.6, stagger: 0.06, ease: 'power3.in' }, 9.8);
        tl.to(pz, { x: () => C().x - c0x(), y: () => C().y - c0y(), scale: () => C().s, duration: 1.1, ease: 'power1.inOut' }, 9.9);
        tl.to(q('.hero__txt--c .hero__ln'), { yPercent: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 10.3);
        tl.to(q('.seal--hero'), { opacity: 0, scale: 0.6, duration: 0.4 }, 10.0);
        tl.to(q('.pz-cut'), { strokeDashoffset: 0, duration: 1.0, stagger: 0.05, ease: 'power2.inOut' }, 10.7);

        // D · 14.8–18.6 : eight slices leave the centre along their own rays; the lime scene shows through the gaps
        const D0 = 14.8;
        tl.to(q('.pz-tops'), { opacity: 0, duration: 0.5 }, D0 - 0.4);
        tl.set(q('.pz-full'), { autoAlpha: 0 }, D0);
        tl.set(q('.pz-cuts'), { autoAlpha: 0 }, D0);
        tl.set(limeEl, { autoAlpha: 1 }, D0);
        tl.set(slices, { filter: 'drop-shadow(0 16px 22px rgba(0,0,0,0.5))' }, D0);
        tl.to(q('.hero__txt--c .hero__ln'), { yPercent: -140, duration: 0.6, stagger: 0.05, ease: 'power3.in' }, D0 - 0.1);
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
      };

      const RM = '(prefers-reduced-motion: no-preference)';
      const pinned = (mode: Mode) => () => {
        el.dataset.mode = 'pinned';
        build(mode);
        return () => { delete el.dataset.mode; };
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
        const hx = parseFloat(getComputedStyle(el).getPropertyValue('--hx')) || 88;
        const aMax = land ? H - 2 * hx - nonTitle : pizzaTop - txtA.offsetTop - 10 - nonTitle;
        fit(title, aMax);
        const h2Cap = short ? H * 0.62 : land ? H * 0.3 : H * 0.28;
        el.querySelectorAll<HTMLElement>('.hero__h2').forEach((n) => fit(n, h2Cap));
        fit(el.querySelector<HTMLElement>('.lime__title') ?? undefined, short ? H * 0.42 : land ? H * 0.36 : H * 0.2);
      };
      fitAll();
      ScrollTrigger.addEventListener('refreshInit', fitAll);
      window.addEventListener('resize', fitAll);
      document.fonts?.ready.then(() => { fitAll(); ScrollTrigger.refresh(); });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh, { once: true });
      return () => {
        window.removeEventListener('load', refresh);
        ScrollTrigger.removeEventListener('refreshInit', fitAll);
        window.removeEventListener('resize', fitAll);
        mm.revert();
      };
    },
    { scope: root },
  );

  const marquee = Array.from({ length: 8 }, () => t.yufka[0]).join('  ');
  return (
    <section className="hero" ref={root} id="top" data-mode="static" aria-label={t.eyebrow}>
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
