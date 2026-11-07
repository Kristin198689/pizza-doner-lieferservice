'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { HalalSeal } from './HalalSeal';
import { IconBag, IconMoped } from './Icons';
import { OrderButtons } from './OrderButtons';
import { SmokeField, type SmokeControl } from './SmokeField';
import { createHeroPhysics, type HeroPhysics } from '@/lib/heroPhysics';
import type { Messages } from '@/lib/i18n';

type Props = { t: Messages['hero']; order: Messages['order']; quick: Messages['quick'] };

/** Ingredient cloud above the pizza. x / y in % of the square stage (y may be negative), size in % of stage width. */
const FX = [
  { src: 'basil_leaf_single', x: 14, y: 6, size: 17, rot: -24 },
  { src: 'tomato_half', x: 70, y: -1, size: 16, rot: 22 },
  { src: 'red_onion_ring', x: 90, y: 17, size: 15, rot: 12 },
  { src: 'mushroom_slice', x: 37, y: 0, size: 13, rot: -14 },
  { src: 'cherry_tomatoes', x: 55, y: 8, size: 13, rot: 16 },
  { src: 'basil_sprig', x: 27, y: 16, size: 12, rot: 28 },
  { src: 'mushrooms_group', x: 80, y: 7, size: 12, rot: -10 },
  { src: 'red_pepper_rings', x: 47, y: 18, size: 11, rot: 20 },
  { src: 'black_olives', x: 63, y: 20, size: 9, rot: -26 },
  { src: 'mozzarella_shreds', x: 8, y: 22, size: 11, rot: 8 },
  { src: 'basil_leaf_single', x: 48, y: -6, size: 7, rot: 40 },
  { src: 'tomato_half', x: 4, y: 0, size: 7, rot: -32 },
  { src: 'red_onion_ring', x: 96, y: -3, size: 6, rot: 16 },
  { src: 'mixed_herbs_spices', x: 60, y: -8, size: 9, rot: 0 },
] as const;

export function HeroMotion({ t, order }: Props) {
  const root = useRef<HTMLElement>(null);
  const smoke = useRef<SmokeControl>({ v: 0.5 });

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      /* ================= DESKTOP: one continuous take ================= */
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        el.dataset.mode = 'pinned';
        const vh = () => window.innerHeight;
        const vw = () => window.innerWidth;
        const inner = q('.hero__stage-inner')[0];
        let phys: HeroPhysics | null = null;
        let burst = false;
        let dead = false;

        // physics (loaded lazily): ingredients are rigid bodies that collide with the headline lines
        (async () => {
          const stage = q('.hero__stage')[0] as HTMLElement;
          const sprites = q('.ph') as HTMLElement[];
          const lines = q('.hero__line') as HTMLElement[];
          const p = await createHeroPhysics(stage, sprites.map((s, i) => ({ el: s, x: FX[i].x, y: FX[i].y, size: FX[i].size, rot: FX[i].rot })), lines);
          if (dead) { p.destroy(); return; }
          phys = p;
          p.setRunning(true);
          window.addEventListener('resize', p.remeasure);
        })();

        // intro: type opens, pizza rises out of black, cloud floats in
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from(q('.hero__pizza'), { scale: 0.86, yPercent: 8, opacity: 0, duration: 1.7 }, 0)
          .from(q('.hero__line'), { yPercent: 115, duration: 1.1, stagger: 0.14 }, 0.25)
          .from(q('.hero__fade'), { opacity: 0, y: 26, duration: 0.9, stagger: 0.1 }, 0.7)
          .from(q('.ph .fx__img'), { opacity: 0, y: 50, scale: 0.6, duration: 1.3, stagger: 0.05, ease: 'back.out(1.4)' }, 0.6)
          .to(smoke.current, { v: 0.9, duration: 2.2 }, 0);

        gsap.set(inner, { transformPerspective: 1400 });
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el, start: 'top top', end: '+=250%', scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              if (!phys) return;
              if (p > 0.12 && !burst) { burst = true; phys.burst(); }
              else if (p < 0.09 && burst) { burst = false; phys.reset(); }
              phys.setColliders(burst && p < 0.34);
            },
          },
        });

        // 1 · the toss: the pizza is thrown up, tilting away, while the ingredients explode off it
        tl.to(inner, { y: () => -vh() * 1.3, rotationX: 64, rotation: -12, scale: 1.2, duration: 1.7, ease: 'power2.out' }, 1);
        tl.to(smoke.current, { v: 1.4, duration: 1.2 }, 1);

        // 2 · copy leaves, a clean red floor slides up from below (no circle, no fade)
        tl.to(q('.hero__copy'), { xPercent: -14, opacity: 0, duration: 1, ease: 'power2.in' }, 3.2);
        tl.to(q('.hero__scroll'), { opacity: 0, duration: 0.4 }, 3.2);
        tl.fromTo(q('.hero__s2'), { yPercent: 100 }, { yPercent: 0, duration: 1.6, ease: 'power3.inOut' }, 3.1);
        tl.set(inner, { x: () => -vw() * 0.42 }, 3.9);

        // 3 · the same pizza falls back from above and lands on the red surface
        tl.fromTo(inner, { y: () => -vh() * 1.3, rotationX: -48, rotation: 10, scale: 1.18 }, { y: 0, rotationX: 0, rotation: 0, scale: 0.84, duration: 1.6, ease: 'back.out(1.15)', immediateRender: false }, 4.4);
        tl.fromTo(q('.seal--hero'), { scale: 2.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.2)', immediateRender: false }, 5.9);
        tl.to(q('.hero__stage-inner'), { y: 10, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.out' }, 6.0);

        // 4 · new headline
        tl.fromTo(q('.hero__s2-line'), { yPercent: 115 }, { yPercent: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out' }, 5.5);
        tl.fromTo(q('.hero__s2-fade'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out' }, 6.1);
        tl.to(inner, { scale: 0.88, duration: 2.6 }, 7.2);
        tl.to({}, { duration: 0.6 }, 9.4);

        return () => {
          dead = true;
          phys?.destroy();
          delete el.dataset.mode;
        };
      });

      /* ================= MOBILE: autoplay scene, no scroll trap ================= */
      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        el.dataset.mode = 'mobile';
        const stageH = () => (q('.hero__stage')[0] as HTMLElement).offsetHeight;
        const set = FX.filter((_, i) => i < 10);

        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from(q('.hero__pizza'), { scale: 0.85, yPercent: 8, opacity: 0, duration: 1.4 }, 0)
          .from(q('.hero__line'), { yPercent: 115, duration: 0.9, stagger: 0.12 }, 0.15)
          .from(q('.hero__fade'), { opacity: 0, y: 20, duration: 0.7, stagger: 0.08 }, 0.55)
          .from(q('.ph .fx__img'), { opacity: 0, y: 40, scale: 0.6, duration: 1.1, stagger: 0.05, ease: 'back.out(1.4)' }, 0.5);

        const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6, delay: 1.2, defaults: { ease: 'sine.inOut' } });
        set.forEach((_, i) => loop.to(`.fx-s1-${i}`, { y: () => -stageH() * (0.07 + (i % 3) * 0.03), rotation: `+=${(i % 2 ? 1 : -1) * 14}`, duration: 2.2 }, i * 0.05));
        set.forEach((_, i) => loop.to(`.fx-s1-${i}`, { y: 0, rotation: `-=${(i % 2 ? 1 : -1) * 14}`, duration: 2 }, 2.6 + i * 0.05));
        ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? loop.play() : loop.pause()) });

        gsap.from(q('.hero__s2-pizza'), { scale: 0.7, yPercent: -30, rotation: -14, opacity: 0, duration: 1.4, ease: 'back.out(1.2)', scrollTrigger: { trigger: q('.hero__s2')[0], start: 'top 75%' } });
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
    <section className="hero" ref={root} id="top" data-mode="static">
      <div className="hero__s1">
        <SmokeField control={smoke} className="smoke--back" count={26} originX={0.66} originY={0.58} spread={0.5} seed={3} />

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
          </ul>
          <OrderButtons order={order} className="hero__order hero__fade" />
        </div>

        <div className="hero__stage">
          <div className="hero__stage-inner">
            <Image className="hero__pizza" src="/assets/food/pizza_hero_assembled.png" alt={t.pizzaAlt} width={1254} height={1254} priority quality={95} sizes="(max-width: 767px) 130vw, 78vw" />
            <HalalSeal className="seal--hero" />
          </div>
          <div className="hero__phys">
            {FX.map((f, i) => (
              <span key={i} className={`fx ph fx-s1-${i}${i >= 10 ? ' fx--desktop' : ''}`} aria-hidden="true" style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.size}%`, opacity: f.size < 8 ? 0.85 : 1 }}>
                <Image className="fx__img" src={`/assets/ingredients/${f.src}.png`} alt="" width={360} height={320} sizes="200px" style={{ rotate: `${f.rot}deg`, animationDelay: `${-i * 0.43}s` }} />
              </span>
            ))}
          </div>
        </div>
        <p className="hero__scroll hero__fade"><span aria-hidden="true">↓</span> {t.scroll}</p>
      </div>

      <div className="hero__s2">
        <div className="hero__s2-copy">
          <p className="eyebrow hero__s2-fade">{t.shot2eyebrow}</p>
          <p className="hero__h2">
            <span className="hero__mask"><span className="hero__s2-line">{t.shot2title}</span></span>
            <span className="hero__mask"><span className="hero__s2-line hero__accent2">{t.shot2accent}</span></span>
          </p>
          <OrderButtons order={order} className="hero__s2-order hero__s2-fade" />
        </div>
        <div className="hero__s2-stage">
          <Image className="hero__s2-pizza" src="/assets/food/pizza_toppings_airborne_reference.png" alt={t.sliceAlt} width={1254} height={1254} quality={95} sizes="(max-width: 767px) 120vw, 80vw" />
        </div>
      </div>
    </section>
  );
}
