'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { IconBag, IconMoped, IconSlice, IconSpit, IconWrap } from './Icons';
import { HalalBadge } from './HalalBadge';
import { OrderButtons } from './OrderButtons';
import { SmokeField, type SmokeControl } from './SmokeField';
import type { Messages } from '@/lib/i18n';

type Props = { t: Messages['hero']; order: Messages['order']; quick: Messages['quick'] };

/**
 * One designed cloud of ingredients above the pizza. x / y = rest position (% of the square stage,
 * y may be negative = above it), size = % of stage width, d = depth (parallax + camera push strength).
 */
const FX = [
  { src: 'basil_leaf_single', x: 14, y: 6, size: 17, d: 1.6, rot: -24 },
  { src: 'tomato_half', x: 70, y: -1, size: 16, d: 1.5, rot: 22 },
  { src: 'red_onion_ring', x: 90, y: 17, size: 15, d: 1.5, rot: 12 },
  { src: 'mushroom_slice', x: 37, y: 0, size: 13, d: 1.1, rot: -14 },
  { src: 'cherry_tomatoes', x: 55, y: 8, size: 13, d: 1.1, rot: 16 },
  { src: 'basil_sprig', x: 27, y: 16, size: 12, d: 1.0, rot: 28 },
  { src: 'mushrooms_group', x: 80, y: 7, size: 12, d: 1.0, rot: -10 },
  { src: 'red_pepper_rings', x: 47, y: 18, size: 11, d: 1.0, rot: 20 },
  { src: 'black_olives', x: 63, y: 20, size: 9, d: 0.9, rot: -26 },
  { src: 'mozzarella_shreds', x: 8, y: 22, size: 11, d: 0.9, rot: 8 },
  { src: 'basil_leaf_single', x: 48, y: -6, size: 7, d: 0.5, rot: 40 },
  { src: 'tomato_half', x: 4, y: 0, size: 7, d: 0.5, rot: -32 },
  { src: 'red_onion_ring', x: 96, y: -3, size: 6, d: 0.5, rot: 16 },
  { src: 'mixed_herbs_spices', x: 60, y: -8, size: 9, d: 0.6, rot: 0 },
] as const;

const S2 = [
  { src: 'basil_leaf_single', x: 6, y: 20, size: 15, d: 1.4, rot: -30 },
  { src: 'tomato_half', x: 88, y: 8, size: 13, d: 1.2, rot: 24 },
  { src: 'mushroom_slice', x: 94, y: 48, size: 11, d: 1.0, rot: -14 },
  { src: 'red_onion_ring', x: 2, y: 64, size: 10, d: 0.8, rot: 20 },
] as const;

export function HeroMotion({ t, order, quick }: Props) {
  const root = useRef<HTMLElement>(null);
  const smokeBack = useRef<SmokeControl>({ v: 0.5 });
  const smokeFront = useRef<SmokeControl>({ v: 0.25 });

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      const stageH = () => (q('.hero__stage')[0] as HTMLElement).offsetHeight;

      /* ================= DESKTOP: pinned cinematic sequence ================= */
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        el.dataset.mode = 'pinned';
        el.dataset.scene = '1';
        gsap.set(q('.fx'), { transformPerspective: 900 });

        // intro (time based): smoke breathes in, pizza rises out of the black, type masks open
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from(q('.hero__pizza'), { scale: 0.82, yPercent: 10, opacity: 0, duration: 1.8 }, 0)
          .from(q('.hero__line'), { yPercent: 115, duration: 1.1, stagger: 0.14 }, 0.25)
          .from(q('.hero__fade'), { opacity: 0, y: 26, duration: 0.9, stagger: 0.1 }, 0.7)
          .from(q('.fx--s1 .fx__img'), { opacity: 0, y: 50, scale: 0.6, rotation: (i: number) => (i % 2 ? 20 : -20), duration: 1.4, stagger: 0.06, ease: 'back.out(1.4)' }, 0.6)
          .to(smokeBack.current, { v: 0.9, duration: 2.4, ease: 'power2.out' }, 0);

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el, start: 'top top', end: '+=330%', scrub: 0.9, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => { el.dataset.scene = self.progress > 0.56 ? '2' : '1'; },
          },
        });

        // A (0–1) quiet breathing
        tl.fromTo(q('.hero__stage-inner'), { scale: 1 }, { scale: 1.03, duration: 1 }, 0);

        // B (1–4) one composition lifts: depth layers rise at different speeds, turn in 3D, hang
        FX.forEach((f, i) => {
          const lift = (7 + f.d * 7) / 100;
          tl.to(`.fx-s1-${i}`, { y: () => -stageH() * lift, rotationY: (i % 2 ? 1 : -1) * 34 * f.d, rotationX: (i % 3 ? 1 : -1) * 18, rotation: `+=${(i % 2 ? 1 : -1) * 16}`, scale: 1 + f.d * 0.1, duration: 2.4 + f.d * 0.4, ease: 'power3.out' }, 1 + (1.6 - f.d) * 0.35 + i * 0.02);
        });
        tl.to(q('.hero__pizza'), { scale: 1.05, yPercent: 1.5, duration: 3 }, 1);
        tl.to(smokeBack.current, { v: 1.5, duration: 3 }, 1);
        tl.to(smokeFront.current, { v: 0.7, duration: 3 }, 1);

        // C (4–5.4) suspended: slow drift, composition floats
        FX.forEach((f, i) => tl.to(`.fx-s1-${i}`, { y: `-=${6 + f.d * 8}`, x: `+=${(i % 2 ? 1 : -1) * 6 * f.d}`, rotation: `+=${(i % 2 ? -1 : 1) * 8}`, duration: 1.4, ease: 'sine.inOut' }, 4));

        // D (5.2–8.6) the camera turns: a horizontal pan to a different place, layers move at different speeds
        const vw = () => window.innerWidth;
        tl.to(q('.hero__quick, .hero__scroll'), { opacity: 0, duration: 0.5 }, 5.2);
        tl.to(q('.hero__track'), { x: () => -vw(), duration: 3.4, ease: 'power3.inOut' }, 5.2);
        tl.to(q('.hero__track'), { rotation: 0.7, duration: 1.7, ease: 'sine.inOut', transformOrigin: '50% 50%' }, 5.2);
        tl.to(q('.hero__track'), { rotation: 0, duration: 1.7, ease: 'sine.inOut' }, 6.9);
        tl.to(q('.hero__copy'), { x: () => -vw() * 0.16, opacity: 0, duration: 2.6, ease: 'power2.in' }, 5.2);
        tl.to(q('.hero__stage-inner'), { x: () => -vw() * 0.1, scale: 1.08, duration: 3.4, ease: 'power2.inOut' }, 5.2);
        FX.forEach((f, i) => tl.to(`.fx-s1-${i}`, { x: () => -vw() * (0.04 + f.d * 0.16), rotation: `+=${(i % 2 ? 1 : -1) * 20 * f.d}`, duration: 3.4, ease: 'power2.inOut' }, 5.2));
        tl.to(smokeFront.current, { v: 1.6, duration: 1.7, ease: 'power2.inOut' }, 5.4);
        tl.to(smokeFront.current, { v: 0.5, duration: 1.7, ease: 'power2.out' }, 7.1);

        // E (7–12) the new place: another light, another pizza, a mirrored composition
        tl.fromTo(q('.hero__s2-pizza'), { x: () => vw() * 0.2, scale: 0.94, rotation: 6 }, { x: 0, scale: 1, rotation: 0, duration: 3.2, ease: 'power3.out' }, 5.6);
        tl.fromTo(q('.hero__s2-copy'), { x: () => vw() * 0.22 }, { x: 0, duration: 3.2, ease: 'power3.out' }, 5.6);
        S2.forEach((f, i) => tl.fromTo(`.fx-s2-${i}`, { x: () => vw() * (0.12 + f.d * 0.2) }, { x: 0, duration: 3.2, ease: 'power3.out' }, 5.6));
        tl.fromTo(q('.hero__s2-line'), { yPercent: 115 }, { yPercent: 0, duration: 1.3, stagger: 0.16, ease: 'power3.out' }, 7.2);
        tl.fromTo(q('.hero__s2-fade'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out' }, 7.8);
        tl.to(q('.hero__s2-pizza'), { scale: 1.06, rotation: -1.5, duration: 3.6 }, 8.8);
        S2.forEach((f, i) => tl.to(`.fx-s2-${i}`, { y: (i % 2 ? 1 : -1) * 18, rotation: `+=${(i % 2 ? 1 : -1) * 10}`, duration: 3, ease: 'sine.inOut' }, 8.8));
        tl.to({}, { duration: 0.5 }, 12);

        return () => {
          delete el.dataset.mode;
          delete el.dataset.scene;
        };
      });

      /* ================= MOBILE: autoplay scene, no scroll trap ================= */
      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        el.dataset.mode = 'mobile';
        const set = FX.filter((_, i) => i < 10);

        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from(q('.hero__pizza'), { scale: 0.85, yPercent: 8, opacity: 0, duration: 1.4 }, 0)
          .from(q('.hero__line'), { yPercent: 115, duration: 0.9, stagger: 0.12 }, 0.15)
          .from(q('.hero__fade'), { opacity: 0, y: 20, duration: 0.7, stagger: 0.08 }, 0.55)
          .from(q('.fx--s1 .fx__img'), { opacity: 0, y: 40, scale: 0.6, duration: 1.1, stagger: 0.05, ease: 'back.out(1.4)' }, 0.5);

        const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6, delay: 1.2, defaults: { ease: 'sine.inOut' } });
        set.forEach((f, i) => loop.to(`.fx-s1-${i}`, { y: () => -stageH() * (0.06 + f.d * 0.07), rotationY: (i % 2 ? 1 : -1) * 28, rotation: `+=${(i % 2 ? 1 : -1) * 14}`, duration: 2.2 }, i * 0.05));
        set.forEach((f, i) => loop.to(`.fx-s1-${i}`, { y: 0, rotationY: 0, rotation: `-=${(i % 2 ? 1 : -1) * 14}`, duration: 2 }, 2.6 + i * 0.05));
        ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? loop.play() : loop.pause()) });
        gsap.to(q('.hero__stage-inner'), { yPercent: -5, scale: 1.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });

        gsap.from(q('.hero__s2-pizza'), { scale: 0.7, yPercent: 12, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: q('.hero__s2')[0], start: 'top 75%' } });
        gsap.from(q('.hero__s2-line'), { yPercent: 115, duration: 1, stagger: 0.14, ease: 'power3.out', scrollTrigger: { trigger: q('.hero__s2')[0], start: 'top 70%' } });
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

  return (
    <section className="hero" ref={root} id="top" data-mode="static" data-scene="1">
      <div className="hero__track">
      {/* ---------------- Scene 1: pure black, huge pizza ---------------- */}
      <div className="hero__s1">
        <div className="hero__glow" aria-hidden="true" />
        <SmokeField control={smokeBack} className="smoke--back" count={36} originX={0.68} originY={0.72} spread={0.6} seed={3} />

        <div className="hero__copy">
          <p className="eyebrow hero__fade">{t.eyebrow}</p>
          <h1 className="hero__title">
            <span className="hero__mask"><span className="hero__line">{t.title}</span></span>
            <span className="hero__mask"><span className="hero__line hero__accent">{t.accent}</span></span>
          </h1>
          <p className="hero__caption hero__fade">{t.caption}</p>
          <ul className="hero__modes hero__fade">
            <li><IconMoped className="hero__modeicon" />{t.delivery}</li>
            <li><IconBag className="hero__modeicon" />{t.pickup}</li>
            <li><HalalBadge /></li>
          </ul>
          <OrderButtons order={order} className="hero__order hero__fade" />
        </div>

        <div className="hero__stage">
          <div className="hero__stage-inner">
            <Image className="hero__pizza" src="/assets/food/pizza_hero_assembled.png" alt={t.pizzaAlt} width={1254} height={1254} priority sizes="(max-width: 767px) 130vw, 78vw" />
            {FX.map((f, i) => (
              <span key={i} className={`fx fx--s1 fx-s1-${i}${i >= 10 ? ' fx--desktop' : ''}`} aria-hidden="true" style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.size}%`, zIndex: f.d > 1 ? 4 : f.d > 0.7 ? 3 : 2, opacity: f.d < 0.7 ? 0.8 : 1 }}>
                <Image className="fx__img" src={`/assets/ingredients/${f.src}.png`} alt="" width={360} height={320} sizes="200px" style={{ rotate: `${f.rot}deg`, animationDelay: `${-i * 0.43}s` }} />
              </span>
            ))}
          </div>
        </div>

        <nav className="hero__quick" aria-label="Menu">
          <a href="#menu-pizza"><IconSlice className="hero__quickicon" />{quick.pizza}</a>
          <a href="#menu-doner"><IconSpit className="hero__quickicon" />{quick.doner}</a>
          <a href="#menu-yufka"><IconWrap className="hero__quickicon" />{quick.yufka}</a>
        </nav>
        <p className="hero__scroll hero__fade"><span aria-hidden="true">↓</span> {t.scroll}</p>
      </div>

      {/* ---------------- Scene 2: a different world ---------------- */}
      <div className="hero__s2">
        <div className="hero__s2-bg" aria-hidden="true" />
        <div className="hero__s2-copy">
          <p className="eyebrow hero__s2-fade">{t.shot2eyebrow}</p>
          <p className="hero__h2">
            <span className="hero__mask"><span className="hero__s2-line">{t.shot2title}</span></span>
            <span className="hero__mask"><span className="hero__s2-line hero__accent2">{t.shot2accent}</span></span>
          </p>
          <OrderButtons order={order} className="hero__s2-order hero__s2-fade" />
        </div>
        <div className="hero__s2-stage">
          <Image className="hero__s2-pizza" src="/assets/food/pizza_toppings_airborne_reference.png" alt={t.sliceAlt} width={1254} height={1254} sizes="(max-width: 767px) 120vw, 80vw" />
          {S2.map((f, i) => (
            <span key={i} className={`fx fx--s2 fx-s2-${i}`} aria-hidden="true" style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.size}%` }}>
              <Image className="fx__img" src={`/assets/ingredients/${f.src}.png`} alt="" width={360} height={320} sizes="200px" style={{ rotate: `${f.rot}deg` }} />
            </span>
          ))}
        </div>
      </div>

      </div>

      <SmokeField control={smokeFront} className="smoke--front" count={18} originX={0.6} originY={0.95} spread={0.9} seed={7} />
    </section>
  );
}
