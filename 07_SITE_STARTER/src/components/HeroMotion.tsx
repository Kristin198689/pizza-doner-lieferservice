'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { HalalSeal } from './HalalSeal';
import { OrderButtons } from './OrderButtons';
import { SmokeField, type SmokeControl } from './SmokeField';
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
  const smoke = useRef<SmokeControl>({ v: 0.55 });

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      const box = q('.hero__pizza')[0] as HTMLElement;
      const limeEl = q('.hero__lime')[0] as HTMLElement;

      const build = (mobile: boolean) => {
        const vw = () => window.innerWidth;
        const vh = () => window.innerHeight;
        // untransformed centre of the pizza in stage coordinates (CSS placement of scene A)
        const c0x = () => box.offsetLeft + (box.offsetWidth * G.cx) / 100;
        const c0y = () => box.offsetTop + (box.offsetHeight * G.cy) / 100;
        const B = mobile ? { x: 0.5, y: 0.6, s: 1.1 } : { x: 0.5, y: 0.66, s: 1.2 };
        const C = mobile ? { x: 0.5, y: 0.58, s: 1.12 } : { x: 0.5, y: 0.64, s: 1.3 };

        gsap.set(q('.hero__txt--b .hero__ln, .hero__txt--c .hero__ln'), { yPercent: 140 });
        gsap.set(q('.pz-cut'), { strokeDashoffset: 100 });
        gsap.set(limeEl, { autoAlpha: 0 });
        gsap.set(q('.lime__l1, .lime__l2'), { yPercent: 140 });
        gsap.set(q('.lime__wrap'), { xPercent: 125, rotation: -420 });
        gsap.set(q('.lime__eyebrow, .lime__body, .lime__deco, .lime__order'), { opacity: 0 });

        // intro (time based): type opens, pizza rises out of the black
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from(q('.hero__txt--a .hero__ln'), { yPercent: 140, duration: 1.1, stagger: 0.12 }, 0.1)
          .from(q('.hero__txt--a .hero__fade'), { opacity: 0, y: 22, duration: 0.8, stagger: 0.1 }, 0.55)
          .from(q('.pz-wrap'), { scale: 0.9, opacity: 0, duration: 1.4 }, 0)
          .to(smoke.current, { v: 1, duration: 2 }, 0);

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

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end: mobile ? '+=210%' : '+=270%', scrub: mobile ? 0.5 : 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
        });
        const pz = q('.pz-wrap');
        const slices = q('.pz-slice');

        // A · 0–2 : the opening frame breathes
        tl.fromTo(pz, { scale: 1 }, { scale: 1.02, duration: 2 }, 0);

        // B · 2–4.2 : the camera pushes in; the pizza drifts to the centre; the headline changes
        tl.to(q('.hero__txt--a .hero__ln'), { yPercent: -140, duration: 0.7, stagger: 0.06, ease: 'power3.in' }, 2.0);
        tl.to(q('.hero__txt--a .hero__fade'), { opacity: 0, y: -16, duration: 0.5 }, 2.0);
        tl.to(pz, { x: () => vw() * B.x - c0x(), y: () => vh() * B.y - c0y(), scale: B.s, duration: 2.2, ease: 'power2.inOut' }, 2.0);
        tl.to(q('.hero__txt--b .hero__ln'), { yPercent: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 2.8);
        tl.to(smoke.current, { v: 0.6, duration: 1.5 }, 2.2);

        // C · 4.2–5.8 : the cut lines draw along the pizza
        tl.to(q('.hero__txt--b .hero__ln'), { yPercent: -140, duration: 0.6, stagger: 0.06, ease: 'power3.in' }, 4.2);
        tl.to(pz, { x: () => vw() * C.x - c0x(), y: () => vh() * C.y - c0y(), scale: C.s, duration: 1.6, ease: 'power1.inOut' }, 4.2);
        tl.to(q('.hero__txt--c .hero__ln'), { yPercent: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 4.55);
        tl.to(q('.seal--hero'), { opacity: 0, scale: 0.6, duration: 0.4 }, 4.3);
        tl.to(q('.pz-cut'), { strokeDashoffset: 0, duration: 1.1, stagger: 0.07, ease: 'power2.inOut' }, 4.5);

        // D · 5.8–8.5 : eight slices leave the centre along their own rays; the lime scene shows through the gaps
        tl.set(q('.pz-full'), { autoAlpha: 0 }, 5.8);
        tl.set(q('.pz-cuts'), { autoAlpha: 0 }, 5.8);
        tl.set(limeEl, { autoAlpha: 1 }, 5.8);
        tl.set(slices, { filter: 'drop-shadow(0 16px 22px rgba(0,0,0,0.5))' }, 5.8);
        tl.to(q('.hero__txt--c .hero__ln'), { yPercent: -140, duration: 0.5, stagger: 0.05, ease: 'power3.in' }, 5.75);
        slices.forEach((s, k) => {
          const a = rad(45 * k);
          const diag = k % 2 ? 1.12 : 1;
          tl.to(s, { x: () => Math.cos(a) * vw() * 0.72 * diag, y: () => Math.sin(a) * vh() * 0.9 * diag, rotation: SPIN[k], scale: 1.1, duration: 2.7, ease: 'power2.in' }, 5.8);
        });
        tl.to(win, { s: 4.2, duration: 2.5, ease: 'power2.in', onUpdate: paint }, 5.85);
        tl.to(smoke.current, { v: 0, duration: 0.6 }, 5.8);
        tl.set(limeEl, { clipPath: 'none' }, 8.45);

        // E · 8.5–10 : the lime screen is fully open: headline, then the yufka rolls in from the right
        tl.to(q('.lime__l1, .lime__l2'), { yPercent: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 8.1);
        tl.to(q('.lime__eyebrow'), { opacity: 1, duration: 0.5 }, 8.5);
        tl.to(q('.lime__wrap'), { xPercent: 0, rotation: 0, duration: 1.5, ease: 'power2.out' }, 8.3);
        tl.to(q('.lime__body, .lime__deco, .lime__order'), { opacity: 1, duration: 0.6 }, 9.3);
        tl.to({}, { duration: 0.6 }, 9.9);
      };

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        el.dataset.mode = 'pinned';
        build(false);
        return () => { delete el.dataset.mode; };
      });
      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        el.dataset.mode = 'pinned';
        build(true);
        return () => { delete el.dataset.mode; };
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        el.dataset.mode = 'static';
        return () => { delete el.dataset.mode; };
      });

      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener('load', refresh, { once: true });
      return () => {
        window.removeEventListener('load', refresh);
        mm.revert();
      };
    },
    { scope: root },
  );

  const marquee = Array.from({ length: 8 }, () => t.yufka[0]).join('  ');
  return (
    <section className="hero" ref={root} id="top" data-mode="static" aria-label={t.eyebrow}>
      <div className="hero__stage">
        <SmokeField control={smoke} className="smoke--back" count={22} originX={0.7} originY={0.55} spread={0.45} seed={3} />

        <div className="hero__pizza">
          <div className="pz-wrap">
            <div className="pz-full">
              <Image className="pz-img" src="/assets/hero/pizza_whole.png" alt={t.pizzaAlt} fill priority quality={95} sizes="(max-width: 767px) 112vw, 60vw" style={{ clipPath: ELLIPSE }} />
            </div>
            {SECTORS.map((poly, k) => (
              <div className="pz-slice" key={k} aria-hidden="true" style={{ transformOrigin: `${(G.cx + 0.55 * G.rx * Math.cos(rad(45 * k))).toFixed(1)}% ${(G.cy + 0.55 * G.ry * Math.sin(rad(45 * k))).toFixed(1)}%` }}>
                <Image className="pz-img" src="/assets/hero/pizza_whole.png" alt="" fill quality={95} sizes="(max-width: 767px) 112vw, 60vw" style={{ clipPath: poly }} />
              </div>
            ))}
            <svg className="pz-cuts" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {CUTS.map((c, k) => (
                <line key={k} className="pz-cut" x1={G.cx} y1={G.cy} x2={c.x2} y2={c.y2} pathLength={100} strokeDasharray={100} />
              ))}
            </svg>
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
          <Image className="lime__img" src="/assets/food/yufka_wrap.png" alt={yufkaAlt} width={1254} height={1254} sizes="(max-width: 767px) 100vw, 50vw" />
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
