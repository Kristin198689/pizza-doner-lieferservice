'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { IconBag, IconMoped, IconSlice, IconSpit, IconWrap } from './Icons';
import { OrderButtons } from './OrderButtons';
import type { Messages } from '@/lib/i18n';

type Props = { t: Messages['hero']; order: Messages['order']; quick: Messages['quick'] };

/** x/y = landing position on the pizza (% of the square stage); size = % of stage width. */
const RAW = [
  { src: 'basil_leaf_single', x: 31, y: 50, size: 13, cheese: true },
  { src: 'tomato_half', x: 61, y: 43, size: 12, cheese: true },
  { src: 'red_onion_ring', x: 71, y: 60, size: 12, cheese: true },
  { src: 'mushroom_slice', x: 40, y: 64, size: 12, cheese: true },
  { src: 'mozzarella_shreds', x: 52, y: 37, size: 12, cheese: false },
  { src: 'cherry_tomatoes', x: 25, y: 38, size: 12, cheese: false },
  { src: 'basil_sprig', x: 55, y: 55, size: 13, cheese: true },
  { src: 'mushrooms_group', x: 76, y: 46, size: 12, cheese: false },
  { src: 'red_pepper_rings', x: 47, y: 49, size: 11, cheese: false },
  { src: 'black_olives', x: 63, y: 67, size: 10, cheese: false },
  { src: 'mixed_herbs_spices', x: 50, y: 43, size: 13, cheese: false },
] as const;

/* hover/peak are derived from the landing spot so nothing flies out of the frame */
const TOPPINGS = RAW.map((r) => {
  const peak = Math.max(24, r.y - 6);
  return { ...r, peak, hover: Math.round(peak * 0.78) };
});

export function HeroMotion({ t, order, quick }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      const stageH = () => (q('.hero__stage')[0] as HTMLElement).offsetHeight;
      const unit = (v: number) => () => (stageH() * v) / 100;

      /* ---------- DESKTOP / TABLET LANDSCAPE: pinned cinematic timeline ---------- */
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        el.dataset.mode = 'pinned';

        // Intro on load (time based, not scroll based)
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro
          .from(q('.hero__stage-intro'), { scale: 0.86, opacity: 0, y: 60, duration: 1.3 }, 0)
          .from(q('.hero__line'), { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.15)
          .from(q('.hero__fade'), { opacity: 0, y: 24, duration: 0.8, stagger: 0.1 }, 0.55)
          .from(q('.topping__img'), { opacity: 0, y: 40, scale: 0.7, duration: 0.9, stagger: 0.05 }, 0.5);

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end: '+=285%', scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
        });

        // A (0–1.5): quiet push-in, cheese strands already stretched at rest
        tl.fromTo(q('.hero__stage-inner'), { scale: 1 }, { scale: 1.03, duration: 1.5 }, 0);

        // B (1.5–3.8): ingredients lift, cheese stretches, smoke rises
        TOPPINGS.forEach((tp, i) => {
          const o = 1.5 + i * 0.08;
          tl.fromTo(`.topping-${i}`, { y: () => -unit(tp.hover)() }, { y: () => -unit(tp.peak)(), rotation: (i % 2 ? 1 : -1) * (12 + i * 2), duration: 1.9, ease: 'power2.out' }, o);
          if (tp.cheese) tl.fromTo(`.strand-${i}`, { scaleY: tp.hover / tp.peak }, { scaleY: 1, duration: 1.9, ease: 'power2.out' }, o);
        });
        tl.to(q('.hero__smoke'), { opacity: 0.55, yPercent: -8, duration: 2.3 }, 1.5);

        // C (3.8–5.7): they fall back onto registered landing spots and settle
        TOPPINGS.forEach((tp, i) => {
          const o = 3.8 + i * 0.07;
          tl.to(`.topping-${i}`, { y: 0, rotation: 0, duration: 1.5, ease: 'power2.in' }, o);
          tl.to(`.topping-${i} .topping__img`, { scale: 0.96, duration: 0.2, ease: 'power1.in' }, o + 1.4);
          tl.to(`.topping-${i} .topping__img`, { scale: 1, duration: 0.3, ease: 'power2.out' }, o + 1.6);
          if (tp.cheese) tl.to(`.strand-${i}`, { scaleY: 0, opacity: 0, duration: 1.5, ease: 'power2.in' }, o);
        });
        tl.to(q('.hero__smoke'), { opacity: 0.3, duration: 1.2 }, 4.6);

        // D (5.7–7.8): camera pivot — perspective turn on the plane + headline hand-over
        tl.to(q('.hero__title-wrap'), { opacity: 0, y: -50, duration: 0.9, ease: 'power2.in' }, 5.7);
        tl.to(q('.hero__stage-inner'), { rotateY: -14, xPercent: -6, scale: 1.14, rotateZ: 3, duration: 2, ease: 'power2.inOut' }, 5.7);
        tl.fromTo(q('.hero__whip'), { xPercent: 120 }, { xPercent: -130, duration: 1.1, ease: 'power3.inOut' }, 6.9);

        // E (7.8–10): next shot — slice with cheese pull takes the foreground
        tl.to(q('.hero__stage'), { opacity: 0, xPercent: -18, duration: 1, ease: 'power2.in' }, 7.35);
        tl.fromTo(q('.hero__slice'), { xPercent: 70, yPercent: 8, rotation: 14, opacity: 0, scale: 0.8 }, { xPercent: 0, yPercent: 0, rotation: -6, opacity: 1, scale: 1, duration: 1.8, ease: 'power3.out' }, 7.5);
        tl.fromTo(q('.hero__shot2 .hero__s2'), { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }, 7.7);
        tl.to(q('.hero__slice'), { rotation: -2, yPercent: -4, duration: 1.5 }, 9);
        tl.to({}, { duration: 0.4 }, 9.6);

        return () => {
          delete el.dataset.mode;
        };
      });

      /* ---------- MOBILE: short autoplay scene, no pin, no scroll trap ---------- */
      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        el.dataset.mode = 'mobile';
        const mobileSet = TOPPINGS.filter((_, i) => i < 8);

        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from(q('.hero__stage-intro'), { scale: 0.88, opacity: 0, y: 40, duration: 1.1 }, 0)
          .from(q('.hero__line'), { yPercent: 110, duration: 0.8, stagger: 0.1 }, 0.1)
          .from(q('.hero__fade'), { opacity: 0, y: 20, duration: 0.7, stagger: 0.08 }, 0.5);

        const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.1, defaults: { ease: 'power2.out' }, delay: 1.2 });
        mobileSet.forEach((tp, i) => {
          const o = i * 0.05;
          loop.to(`.topping-${i}`, { y: () => -unit(tp.peak)(), rotation: (i % 2 ? 1 : -1) * 12, duration: 1.2 }, o);
          if (tp.cheese) loop.to(`.strand-${i}`, { scaleY: 1, duration: 1.2 }, o);
        });
        mobileSet.forEach((tp, i) => {
          const o = 1.7 + i * 0.05;
          loop.to(`.topping-${i}`, { y: () => -unit(tp.hover)(), rotation: 0, duration: 1, ease: 'power2.in' }, o);
          if (tp.cheese) loop.to(`.strand-${i}`, { scaleY: tp.hover / tp.peak, duration: 1, ease: 'power2.in' }, o);
        });
        // pause the loop whenever the hero is off-screen (battery / CPU)
        ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? loop.play() : loop.pause()) });

        // gentle scroll parallax of the pizza instead of a pinned story
        gsap.to(q('.hero__stage-inner'), { yPercent: -6, scale: 1.04, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.from(q('.hero__shot2 .hero__s2'), { y: 50, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: q('.hero__shot2')[0], start: 'top 80%' } });
        gsap.from(q('.hero__slice'), { xPercent: 40, rotation: 12, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: q('.hero__shot2')[0], start: 'top 85%' } });
        return () => {
          delete el.dataset.mode;
        };
      });

      /* ---------- REDUCED MOTION: calm static frame ---------- */
      mm.add('(prefers-reduced-motion: reduce)', () => {
        el.dataset.mode = 'static';
        return () => {
          delete el.dataset.mode;
        };
      });

      // Positions depend on font + image sizes: refresh once they are ready.
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
      <div className="hero__bg" aria-hidden="true" />
      <Image className="hero__smoke hero__smoke--l" src="/assets/effects/smoke_overlay.png" alt="" width={1300} height={1000} sizes="60vw" aria-hidden />
      <Image className="hero__smoke hero__smoke--r" src="/assets/effects/smoke_overlay.png" alt="" width={1300} height={1000} sizes="60vw" aria-hidden />

      <div className="hero__copy">
        <div className="hero__title-wrap">
          <p className="eyebrow hero__fade">{t.eyebrow}</p>
          <h1 className="hero__title">
            <span className="hero__mask"><span className="hero__line">{t.title}</span></span>
            <span className="hero__mask"><em className="hero__line hero__accent">{t.accent}</em></span>
          </h1>
          <p className="hero__caption hero__fade">{t.caption}</p>
          <ul className="hero__modes hero__fade">
            <li><IconMoped className="hero__modeicon" />{t.delivery}</li>
            <li><IconBag className="hero__modeicon" />{t.pickup}</li>
          </ul>
        </div>
        <OrderButtons order={order} className="hero__order hero__fade" />
      </div>

      <div className="hero__stage" aria-hidden="false">
        <div className="hero__stage-intro"><div className="hero__stage-inner">
          <Image className="hero__pizza" src="/assets/food/pizza_hero_assembled.png" alt={t.pizzaAlt} width={1254} height={1254} priority sizes="(max-width: 767px) 110vw, 66vw" />
          {TOPPINGS.map((tp, i) =>
            tp.cheese ? (
              <span key={`s${i}`} className={`strand strand-${i}`} aria-hidden="true" style={{ left: `${tp.x}%`, top: `${tp.y}%`, height: `${tp.peak}%` }} />
            ) : null,
          )}
          {TOPPINGS.map((tp, i) => (
            <span key={tp.src} className={`topping topping-${i}${i >= 8 ? ' topping--desktop' : ''}`} aria-hidden="true" style={{ left: `${tp.x}%`, top: `${tp.y}%`, width: `${tp.size}%` }}>
              <Image className="topping__img" src={`/assets/ingredients/${tp.src}.png`} alt="" width={360} height={320} sizes="160px" style={{ animationDelay: `${-i * 0.37}s` }} />
            </span>
          ))}
        </div></div>
      </div>

      <span className="hero__whip" aria-hidden="true" />

      <div className="hero__shot2">
        <div className="hero__s2-copy">
          <p className="eyebrow hero__s2">{t.shot2eyebrow}</p>
          <p className="hero__h2 hero__s2">
            <span>{t.shot2title}</span>
            <em>{t.shot2accent}</em>
          </p>
        </div>
        <Image className="hero__slice" src="/assets/food/pizza_slice_cheese_pull.png" alt={t.sliceAlt} width={1254} height={1254} sizes="(max-width: 767px) 90vw, 46vw" />
      </div>

      <nav className="hero__quick" aria-label="Menu">
        <a href="#menu-pizza"><IconSlice className="hero__quickicon" />{quick.pizza}</a>
        <a href="#menu-doner"><IconSpit className="hero__quickicon" />{quick.doner}</a>
        <a href="#menu-yufka"><IconWrap className="hero__quickicon" />{quick.yufka}</a>
      </nav>
      <p className="hero__scroll hero__fade"><span aria-hidden="true">↓</span> {t.scroll}</p>
    </section>
  );
}
