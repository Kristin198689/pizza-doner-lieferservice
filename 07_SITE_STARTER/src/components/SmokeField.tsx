'use client';
import { useEffect, useRef } from 'react';

export type SmokeControl = { v: number };

/**
 * Soft volumetric smoke on a half-resolution canvas: many large, slowly rotating puffs with
 * curl-like drift. Intensity is read every frame from a mutable ref so scroll timelines can drive it.
 */
export function SmokeField({
  control,
  count = 34,
  className = '',
  tint = '250,246,240',
  originX = 0.62,
  originY = 0.7,
  spread = 0.55,
  seed = 1,
}: {
  control: { current: SmokeControl };
  count?: number;
  className?: string;
  tint?: string;
  originX?: number;
  originY?: number;
  spread?: number;
  seed?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth < 768;
    const n = small ? Math.round(count * 0.45) : count;
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);

    // pre-rendered puff sprites (cloudy, not a plain gradient)
    const sprites: HTMLCanvasElement[] = Array.from({ length: 4 }, () => {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d')!;
      for (let i = 0; i < 14; i++) {
        const x = 128 + (rnd() - 0.5) * 110;
        const y = 128 + (rnd() - 0.5) * 110;
        const r = 38 + rnd() * 62;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, `rgba(${tint},${0.2 + rnd() * 0.18})`);
        gr.addColorStop(0.55, `rgba(${tint},${0.08 + rnd() * 0.07})`);
        gr.addColorStop(1, `rgba(${tint},0)`);
        g.fillStyle = gr;
        g.fillRect(0, 0, 256, 256);
      }
      return c;
    });

    type P = { x: number; y: number; vx: number; vy: number; r: number; life: number; sp: number; rot: number; vr: number; spr: number; ph: number };
    let W = 1, H = 1;
    const spawn = (p?: P, fresh = false): P => {
      const q = p ?? ({} as P);
      q.x = (originX + (rnd() - 0.5) * spread) * W;
      q.y = (originY + (rnd() - 0.2) * 0.35) * H;
      q.vx = (rnd() - 0.5) * 8;
      q.vy = -(10 + rnd() * 22);
      q.r = (0.1 + rnd() * 0.17) * Math.max(W, H);
      q.life = fresh ? rnd() : 0;
      q.sp = 0.035 + rnd() * 0.05;
      q.rot = rnd() * 6.28;
      q.vr = (rnd() - 0.5) * 0.25;
      q.spr = Math.floor(rnd() * 4);
      q.ph = rnd() * 6.28;
      return q;
    };
    let parts: P[] = [];
    const resize = () => {
      const w = cv.clientWidth || 1;
      const h = cv.clientHeight || 1;
      W = Math.max(2, Math.round(w / 2));
      H = Math.max(2, Math.round(h / 2));
      cv.width = W;
      cv.height = H;
      parts = Array.from({ length: n }, () => spawn(undefined, true));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    let raf = 0;
    let last = 0;
    let visible = false;
    const draw = (dt: number) => {
      ctx.clearRect(0, 0, W, H);
      const k = Math.max(0, control.current.v);
      for (const p of parts) {
        p.life += p.sp * dt;
        if (p.life >= 1) spawn(p);
        const a = Math.sin(Math.PI * p.life) ** 1.3;
        p.x += (p.vx + Math.sin(p.ph + p.life * 7) * 12) * dt * 0.5;
        p.y += p.vy * dt * 0.5;
        p.rot += p.vr * dt;
        const r = p.r * (0.55 + p.life * 0.95);
        ctx.globalAlpha = Math.min(0.4, a * 0.17 * k);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(sprites[p.spr], -r, -r, r * 2, r * 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };
    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(cv);
    if (reduce) {
      for (let i = 0; i < 40; i++) draw(0.1);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [control, count, tint, originX, originY, spread, seed]);

  return <canvas ref={ref} className={`smoke ${className}`} aria-hidden="true" />;
}
