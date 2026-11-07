'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const SRC = '/assets/food/doner_spit_provisional.png';
const TEX_FROM = 40; // central part of the meat used as a repeating texture
const TEX_TO = 230;

/**
 * Pseudo-rotation of the flat döner spit: the meat texture is wrapped around a
 * cylinder (per-row silhouette from the PNG alpha) and scrolled sideways, with moving
 * firelight. It is an illusion built from ONE front photo, not a real 3D model.
 */
export function DonerSpit({ alt }: { alt: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = false;
    let theta = 0;
    let last = 0;
    let dead = false;

    const img = new window.Image();
    img.src = SRC;
    img.onload = () => {
      if (dead) return;
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      cv.width = W;
      cv.height = H;
      ctx.drawImage(img, 0, 0);
      const src = ctx.getImageData(0, 0, W, H);
      const sd = src.data;

      // row extents of the meat silhouette + body rows
      const xl = new Int16Array(H).fill(-1);
      const xr = new Int16Array(H).fill(-1);
      let y0 = H;
      let y1 = 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) if (sd[(y * W + x) * 4 + 3] > 140) { xl[y] = x; break; }
        for (let x = W - 1; x >= 0; x--) if (sd[(y * W + x) * 4 + 3] > 140) { xr[y] = x; break; }
        if (xl[y] >= 0 && xr[y] - xl[y] > 90) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      }
      y0 += 10; // keep the original top plate untouched
      y1 -= 6;

      // seamless strip: texture + its mirror
      const span = TEX_TO - TEX_FROM;
      const TW = span * 2;
      const strip = new Uint8ClampedArray(TW * H * 4);
      for (let y = 0; y < H; y++)
        for (let c = 0; c < TW; c++) {
          const sx = c < span ? TEX_FROM + c : TEX_FROM + (TW - 1 - c);
          const si = (y * W + sx) * 4;
          const di = (y * TW + c) * 4;
          strip[di] = sd[si]; strip[di + 1] = sd[si + 1]; strip[di + 2] = sd[si + 2]; strip[di + 3] = 255;
        }

      const out = ctx.createImageData(W, H);
      const od = out.data;
      const draw = (time: number) => {
        od.set(sd);
        const flick = 0.5 + 0.5 * Math.sin(time * 0.0031) * Math.sin(time * 0.0017 + 1);
        const lightAng = -0.7 + Math.sin(time * 0.0009) * 0.5;
        for (let y = y0; y <= y1; y++) {
          const l = xl[y];
          const r = xr[y];
          if (l < 0) continue;
          const cx = (l + r) / 2;
          const R = (r - l) / 2;
          if (R < 20) continue;
          for (let x = l; x <= r; x++) {
            const nx = Math.max(-0.999, Math.min(0.999, (x - cx) / R));
            const phi = Math.asin(nx);
            let u = ((phi + theta) / (2 * Math.PI)) % 1;
            if (u < 0) u += 1;
            const tx = Math.min(TW - 1, Math.floor(u * TW));
            const si = (y * TW + tx) * 4;
            const di = (y * W + x) * 4;
            const lit = 0.52 + 0.48 * Math.cos(phi - lightAng) * (0.82 + 0.18 * flick);
            const edge = 0.62 + 0.38 * Math.cos(phi);
            const k = lit * edge * 1.12;
            od[di] = Math.min(255, strip[si] * k * (1 + 0.1 * flick));
            od[di + 1] = Math.min(255, strip[si + 1] * k);
            od[di + 2] = Math.min(255, strip[si + 2] * k * 0.94);
          }
        }
        ctx.putImageData(out, 0, 0);
      };

      const tick = (now: number) => {
        raf = 0;
        if (!visible) return;
        const dt = Math.min(64, now - last || 16);
        last = now;
        theta += dt * 0.00042;
        draw(now);
        raf = requestAnimationFrame(tick);
      };
      draw(0);
      setReady(true);
      if (reduce) return;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
      });
      io.observe(cv);
      cleanup = () => io.disconnect();
    };
    let cleanup = () => {};
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, []);

  return (
    <div className="spit">
      {!ready && <Image className="spit__fallback" src={SRC} alt="" width={267} height={507} aria-hidden />}
      <canvas ref={canvas} className="spit__canvas" role="img" aria-label={alt} data-ready={ready || undefined} />
      <span className="spit__glow" aria-hidden="true" />
    </div>
  );
}
