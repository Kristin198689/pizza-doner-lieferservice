'use client';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconArrow } from './Icons';
import type { Messages } from '@/lib/i18n';

const SRC: Record<string, string> = {
  pizza: 'food/pizza_hero_assembled.png',
  slice: 'food/pizza_slice_cheese_pull.png',
  doner: 'food/doner_sandwich.png',
  yufka: 'food/yufka_wrap.png',
  burger: 'food/cheeseburger.png',
  pommes: 'food/fries.png',
  nuggets: 'food/nuggets.png',
};

/** Flat panel colour + name colour per dish, chosen so each dish reads best. */
const LOOK: Record<string, string> = {
  pizza: 'red',
  slice: 'lime',
  doner: 'ink',
  yufka: 'cream',
  burger: 'green',
  pommes: 'red',
  nuggets: 'lime',
};

const pad = (n: number) => String(n).padStart(2, '0');

export function ProductRail({ t }: { t: Messages['orbit'] }) {
  const n = t.dishes.length;
  const track = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const root = useRef<HTMLElement>(null);
  const drag = useRef<{ x0: number; s0: number; moved: boolean; lx: number; lt: number; v: number } | null>(null);
  const reduced = useRef(false);
  const justDragged = useRef(false);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const touchedRef = useRef(false);
  const activeRef = useRef(0);

  const goTo = useCallback((i: number) => {
    const tr = track.current;
    const el = panels.current[Math.max(0, Math.min(n - 1, i))];
    if (!tr || !el) return;
    const left = el.offsetLeft - (tr.clientWidth - el.offsetWidth) / 2;
    tr.scrollTo({ left, behavior: reduced.current ? 'auto' : 'smooth' });
  }, [n]);

  // Scroll-driven parallax + progress + active index. rAF-throttled, only writes CSS custom properties.
  useEffect(() => {
    const tr = track.current;
    if (!tr) return;
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const cx = tr.scrollLeft + tr.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      panels.current.forEach((el, i) => {
        if (!el) return;
        const p = (el.offsetLeft + el.offsetWidth / 2 - cx) / el.offsetWidth;
        if (!reduced.current) el.style.setProperty('--p', Math.max(-1.5, Math.min(1.5, p)).toFixed(3));
        if (Math.abs(p) < bestD) { bestD = Math.abs(p); best = i; }
      });
      const max = tr.scrollWidth - tr.clientWidth;
      root.current?.style.setProperty('--prog', max > 0 ? (tr.scrollLeft / max).toFixed(4) : '0');
      if (best !== activeRef.current) { activeRef.current = best; setActive(best); }
    };
    const onScroll = () => {
      if (!touchedRef.current && tr.scrollLeft > 12) { touchedRef.current = true; setTouched(true); }
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    tr.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      tr.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Mouse drag-to-scroll (touch and trackpad use native scrolling).
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !track.current) return;
    drag.current = { x0: e.clientX, s0: track.current.scrollLeft, moved: false, lx: e.clientX, lt: performance.now(), v: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const tr = track.current;
    if (!d || !tr) return;
    const dx = e.clientX - d.x0;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      tr.setPointerCapture(e.pointerId);
      tr.classList.add('is-drag');
    }
    if (d.moved) {
      tr.scrollLeft = d.s0 - dx;
      const now = performance.now();
      if (now - d.lt > 8) { d.v = (e.clientX - d.lx) / (now - d.lt); d.lx = e.clientX; d.lt = now; }
    }
  };
  const onUp = () => {
    const d = drag.current;
    const tr = track.current;
    drag.current = null;
    if (!d?.moved || !tr) return;
    tr.classList.remove('is-drag');
    justDragged.current = true;
    window.setTimeout(() => { justDragged.current = false; }, 60);
    const cx = tr.scrollLeft + tr.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    panels.current.forEach((el, i) => {
      if (!el) return;
      const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - cx);
      if (dist < bestD) { bestD = dist; best = i; }
    });
    // a quick flick moves one panel in its direction even when the drag was short
    if (Math.abs(d.v) > 0.5 && performance.now() - d.lt < 120) best = Math.max(0, Math.min(n - 1, activeRef.current + (d.v < 0 ? 1 : -1)));
    goTo(best);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    // a drag that ends on a link must not follow it
    if (justDragged.current || drag.current?.moved) { e.preventDefault(); e.stopPropagation(); }
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.target !== track.current) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(activeRef.current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(activeRef.current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(n - 1); }
  };

  const cur = t.dishes[active];
  return (
    <section className="rail" id="orbit" ref={root} aria-label={t.label}>
      <div className="rail__head">
        <p className="eyebrow rail__eyebrow">{t.eyebrow}</p>
        <div className="rail__ctrl">
          <span className="rail__count" aria-hidden="true"><b>{pad(active + 1)}</b> / {pad(n)}</span>
          <button type="button" className="rail__arrow" aria-label={t.prev} disabled={active === 0} onClick={() => goTo(active - 1)}>
            <IconArrow className="rail__arrow-icon rail__arrow-icon--flip" />
          </button>
          <button type="button" className="rail__arrow" aria-label={t.next} disabled={active === n - 1} onClick={() => goTo(active + 1)}>
            <IconArrow className="rail__arrow-icon" />
          </button>
        </div>
        <p className={`rail__swipe${touched ? ' is-gone' : ''}`} aria-hidden="true">
          <span>{t.swipe}</span>
          <IconArrow className="rail__swipe-icon" />
        </p>
        <span className="rail__bar" aria-hidden="true"><i /></span>
      </div>

      <div
        className="rail__track"
        ref={track}
        role="region"
        aria-roledescription="carousel"
        aria-label={t.label}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={onClickCapture}
      >
        {t.dishes.map((dish, i) => (
          <article
            key={dish.key}
            ref={(el) => { panels.current[i] = el; }}
            className={`rail__panel rail__panel--${LOOK[dish.key] ?? 'ink'}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${dish.name}, ${i + 1} / ${n}`}
            style={{ '--n': dish.name.length } as React.CSSProperties}
          >
            <h3 className="rail__name">{dish.name}</h3>
            <div className="rail__fig">
              <Image src={`/assets/${SRC[dish.key]}`} alt={dish.alt} width={1254} height={1254} sizes="(max-width: 767px) 92vw, 50vw" draggable={false} priority={i < 2} />
            </div>
            <div className="rail__foot">
              <p className="rail__hint">{dish.hint}</p>
              <a className="rail__link" href={`#menu-${dish.menuId}`}>
                <span>{t.toMenu}</span>
                <IconArrow className="rail__link-icon" />
              </a>
            </div>
          </article>
        ))}
      </div>
      <p className="rail__drag" aria-hidden="true">{t.drag}</p>
      <p className="sr-only" aria-live="polite">{cur.name}. {cur.hint}</p>
    </section>
  );
}
