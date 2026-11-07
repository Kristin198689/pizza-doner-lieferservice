'use client';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { IconArrow } from './Icons';
import type { Messages } from '@/lib/i18n';

const SRC: Record<string, string> = {
  pizza: 'food/pizza_slice_cheese_pull.png',
  doner: 'food/doner_sandwich.png',
  yufka: 'food/yufka_wrap.png',
  burger: 'food/cheeseburger.png',
  pommes: 'food/fries.png',
  nuggets: 'food/nuggets.png',
};

type Pose = { x: number; y: number; s: number; o: number; z: number };

/** Position of dish i on the invisible oval when the carousel is at fractional index p. */
function pose(i: number, p: number, n: number, rx: number, h: number): Pose {
  let d = (((i - p) % n) + n) % n;
  if (d > n / 2) d -= n;
  const a = (d * 2 * Math.PI) / n;
  const depth = (Math.cos(a) + 1) / 2; // 1 = front, 0 = back
  return {
    x: Math.sin(a) * rx,
    y: h * (0.12 - 0.36 * (1 - depth)),
    s: 0.4 + 0.8 * depth,
    o: 0.28 + 0.72 * depth ** 1.2,
    z: Math.round(depth * 100),
  };
}
const css = (q: Pose) => ({ transform: `translate3d(${q.x}px, ${q.y}px, 0) scale(${q.s})`, opacity: q.o, zIndex: q.z });

export function FoodOrbit({ t }: { t: Messages['orbit'] }) {
  const n = t.dishes.length;
  const stage = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const pos = useRef({ p: 0 });
  const size = useRef({ w: 1200, h: 600 });
  const drag = useRef<{ id: number; x0: number; p0: number; moved: boolean; t0: number; i0: number } | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  // SSR / first paint: dish 0 in front
  const initial = useMemo(() => t.dishes.map((_, i) => css(pose(i, 0, n, 440, 600))), [t.dishes, n]);

  const render = useCallback(() => {
    const { w, h } = size.current;
    const rx = w * (w < 700 ? 0.4 : 0.36);
    items.current.forEach((el, i) => {
      if (!el) return;
      const q = pose(i, pos.current.p, n, rx, h);
      el.style.transform = `translate3d(${q.x}px, ${q.y}px, 0) scale(${q.s})`;
      el.style.opacity = String(q.o);
      el.style.zIndex = String(q.z);
    });
  }, [n]);

  const goTo = useCallback(
    (target: number) => {
      tween.current?.kill();
      const cur = pos.current.p;
      // shortest way round the oval
      let delta = (((target - cur) % n) + n) % n;
      if (delta > n / 2) delta -= n;
      const to = cur + delta;
      setActive((((Math.round(to) % n) + n) % n));
      if (reduced) {
        pos.current.p = to;
        render();
        return;
      }
      tween.current = gsap.to(pos.current, { p: to, duration: 0.85, ease: 'power3.out', onUpdate: render });
    },
    [n, reduced, render],
  );

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      size.current = { w: el.clientWidth, h: el.clientHeight };
      render();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      tween.current?.kill();
    };
  }, [render]);

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    tween.current?.kill();
    drag.current = { id: e.pointerId, x0: e.clientX, p0: pos.current.p, moved: false, t0: performance.now(), i0: Math.round(pos.current.p) };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      stage.current?.setPointerCapture(e.pointerId);
      stage.current?.classList.add('is-drag');
    }
    if (d.moved) {
      const k = size.current.w * 0.2; // px of drag per dish
      // never more than one dish away from where the gesture started (fast swipes can't skip)
      pos.current.p = Math.max(d.i0 - 1.15, Math.min(d.i0 + 1.15, d.p0 - dx / k));
      render();
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    stage.current?.classList.remove('is-drag');
    if (!d.moved) return;
    const dx = e.clientX - d.x0;
    const v = dx / Math.max(1, performance.now() - d.t0); // px per ms
    let target = Math.round(pos.current.p - v * 0.9);
    target = Math.max(d.i0 - 1, Math.min(d.i0 + 1, target));
    goTo(target);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.round(pos.current.p) + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.round(pos.current.p) - 1); }
  };

  const cur = t.dishes[active];
  return (
    <section className="orbit" id="orbit" aria-label={t.label}>
      <div className="orbit__sparks" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 70}%`, animationDelay: `${-i * 0.9}s`, animationDuration: `${7 + (i % 5)}s` }} />
        ))}
      </div>
      <p className="eyebrow orbit__eyebrow">{t.eyebrow}</p>

      <div
        className="orbit__stage"
        ref={stage}
        role="group"
        aria-roledescription="carousel"
        aria-label={t.label}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <span className="orbit__glow" aria-hidden="true" />
        {t.dishes.map((dish, i) => (
          <button
            key={dish.key}
            ref={(el) => { items.current[i] = el; }}
            type="button"
            className="orbit__dish"
            suppressHydrationWarning
            style={initial[i]}
            aria-label={dish.name}
            aria-current={i === active ? 'true' : undefined}
            onClick={() => { if (!drag.current?.moved) goTo(i); }}
            draggable={false}
          >
            <Image src={`/assets/${SRC[dish.key]}`} alt="" aria-hidden width={1254} height={1254} sizes="(max-width: 767px) 70vw, 36vw" draggable={false} priority={i === 0} />
          </button>
        ))}
      </div>

      <div className="orbit__info">
        <div className="orbit__titles" aria-hidden="true">
          {t.dishes.map((dish, i) => (
            <span key={dish.key} className={`orbit__title${i === active ? ' on' : ''}`}>{dish.name}</span>
          ))}
        </div>
        <div className="orbit__side">
          <p className="orbit__hint">{cur.hint}</p>
          <a className="btn btn--red" href={`#menu-${cur.menuId}`}>
            <span>{t.toMenu}</span>
            <IconArrow className="btn__icon btn__arrow" />
          </a>
        </div>
      </div>

      <div className="orbit__nav">
        <button type="button" className="orbit__arrow" aria-label={t.prev} onClick={() => goTo(Math.round(pos.current.p) - 1)}>
          <IconArrow className="orbit__arrow-icon orbit__arrow-icon--flip" />
        </button>
        <span className="orbit__dots" aria-hidden="true">
          {t.dishes.map((d, i) => <i key={d.key} className={i === active ? 'on' : ''} />)}
        </span>
        <button type="button" className="orbit__arrow" aria-label={t.next} onClick={() => goTo(Math.round(pos.current.p) + 1)}>
          <IconArrow className="orbit__arrow-icon" />
        </button>
        <span className="orbit__drag">{t.drag}</span>
      </div>
      <p className="sr-only" aria-live="polite">{cur.name}. {cur.hint}</p>
    </section>
  );
}
