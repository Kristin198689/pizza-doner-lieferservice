'use client';
import { useRef } from 'react';
import Image, { type ImageProps } from 'next/image';
import { gsap, useGSAP } from '@/lib/gsap';

/** next/image with a desktop-only cursor tilt (inner wrapper) and a depth-shifting soft shadow.
 *  className / style / data-* go to the OUTER wrapper so other transform systems (data-parallax) keep working. */
export function TiltImage(props: ImageProps) {
  const { className, style, ...rest } = props;
  const outerProps: Record<string, unknown> = {};
  const imgProps: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) (k.startsWith('data-') ? outerProps : imgProps)[k] = v;

  const stage = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const st = stage.current;
      const ti = tilt.current;
      const sh = shadow.current;
      const section = st?.closest('.pm');
      if (!st || !ti || !sh || !section) return;
      const mm = gsap.matchMedia();
      mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        gsap.set(ti, { transformPerspective: 1000, transformOrigin: '50% 50%' });
        const rx = gsap.quickTo(ti, 'rotationX', { duration: 0.7, ease: 'power3.out' });
        const ry = gsap.quickTo(ti, 'rotationY', { duration: 0.7, ease: 'power3.out' });
        const sx = gsap.quickTo(sh, 'x', { duration: 0.9, ease: 'power3.out' });
        const sy = gsap.quickTo(sh, 'y', { duration: 0.9, ease: 'power3.out' });
        let visible = false;
        let raf = 0;
        let ev: PointerEvent | null = null;
        const reset = () => { rx(0); ry(0); sx(0); sy(0); };
        const frame = () => {
          raf = 0;
          if (!ev || !visible) return;
          const r = st.getBoundingClientRect();
          const s = section.getBoundingClientRect();
          const nx = Math.max(-1, Math.min(1, (ev.clientX - (r.left + r.width / 2)) / (s.width / 2)));
          const ny = Math.max(-1, Math.min(1, (ev.clientY - (r.top + r.height / 2)) / (s.height / 2)));
          ry(nx * 6);
          rx(-ny * 6);
          sx(-nx * 22);
          sy(-ny * 12);
        };
        const move = (e: Event) => { ev = e as PointerEvent; if (!raf) raf = requestAnimationFrame(frame); };
        const leave = () => { ev = null; reset(); };
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (!visible) leave(); });
        io.observe(section);
        section.addEventListener('pointermove', move, { passive: true });
        section.addEventListener('pointerleave', leave);
        return () => {
          io.disconnect();
          section.removeEventListener('pointermove', move);
          section.removeEventListener('pointerleave', leave);
          if (raf) cancelAnimationFrame(raf);
          gsap.set([ti, sh], { clearProps: 'all' });
        };
      });
      return () => mm.revert();
    },
    { scope: stage },
  );

  return (
    <div className={`fx-tilt${className ? ` ${className}` : ''}`} style={style} {...outerProps}>
      <div className="fx-tilt__stage" ref={stage}>
        <span className="fx-tilt__shadow" ref={shadow} aria-hidden="true" />
        <div className="fx-tilt__inner" ref={tilt}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image {...(imgProps as unknown as ImageProps)} className="fx-tilt__img" />
        </div>
      </div>
    </div>
  );
}
