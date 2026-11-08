'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

/* Glossy sauce drizzle for the snacks screen (ketchup + mustard). Self-contained: delete this file, app/fx11.css, the mount line in EditorialMenu
   (and revert the SnacksDrop trigger to trigger: el, start 'top 85%', end 'center 50%') to remove.
   A thin ribbon falls from above the section, its tip draws a zig-zag line over the food, the ribbon thins, breaks and leaves only glossy sauce + drips.
   Geometry: 400x360 box laid over the section's .pm__art; the svg overflows upward to the section top. */
type Sauce = {
  k: 'r' | 'y'; base: string; edge: string; core: string; amb: string;
  sx: number; sy: number; d: string;
  blobs: { f: number; rx: number; ry: number }[];
  drips: { f: number; len: number; w: number; slow?: boolean }[];
  splash: [number, number, number][]; // dx, dy, r
};
const SAUCES: Sauce[] = [
  { k: 'r', base: '#F30009', edge: '#B80007', core: '#FF5A4E', amb: '#7E0005', sx: 160, sy: -330,
    d: 'M60 212C88 188 112 196 128 226C140 250 160 232 172 214C186 192 214 196 226 222C238 246 262 236 272 216C282 196 310 198 322 220C330 234 342 232 348 222',
    blobs: [{ f: 0.0, rx: 13, ry: 7 }, { f: 0.2, rx: 10, ry: 6 }, { f: 0.4, rx: 11, ry: 6.5 }, { f: 0.62, rx: 10, ry: 6 }, { f: 0.82, rx: 9, ry: 5.5 }, { f: 1, rx: 12, ry: 7 }],
    drips: [{ f: 0.2, len: 34, w: 3.6 }, { f: 0.62, len: 20, w: 3.2 }, { f: 0.83, len: 48, w: 4, slow: true }],
    splash: [[-26, 6, 2.6], [-14, 12, 1.8], [-34, -2, 1.4], [20, 12, 2.2], [32, 3, 1.5], [10, 18, 1.2], [-6, 20, 1.6]] },
  { k: 'y', base: '#EFFF00', edge: '#D9E600', core: '#FBFF8A', amb: '#A99600', sx: 250, sy: -330,
    d: 'M340 226C312 202 290 208 276 232C266 252 244 246 232 228C220 208 190 212 180 236C170 256 148 252 136 234C126 218 100 214 86 234C76 248 62 246 52 234',
    blobs: [{ f: 0.0, rx: 13, ry: 7 }, { f: 0.2, rx: 10, ry: 6 }, { f: 0.4, rx: 11, ry: 6.5 }, { f: 0.62, rx: 10, ry: 6 }, { f: 0.82, rx: 9, ry: 5.5 }, { f: 1, rx: 12, ry: 7 }],
    drips: [{ f: 0.2, len: 28, w: 3.6 }, { f: 0.4, len: 44, w: 4, slow: true }, { f: 0.83, len: 22, w: 3.2 }],
    splash: [[26, 6, 2.4], [14, 12, 1.8], [34, -2, 1.4], [-20, 12, 2.2], [-32, 3, 1.5], [-10, 18, 1.2], [6, 20, 1.6]] },
];


/* sauce runs: f = anchor on the drizzle line (mobile), u = position along the heading (desktop), len = length
   (fraction of the distance from the run's sauce to the heading's bottom edge: 0.55..1, so nothing ever hangs below the heading), long = elongated drop, creep = still moving in the hold, m = also on mobile */
type Run = { f: number; u: number; k: 'r' | 'y'; w: number; len: number; dur: number; dl: number; long?: boolean; creep?: boolean; m?: boolean };
const RUNS: Run[] = [
  { u: 0.04, f: 0.12, k: 'r', w: 6, len: 1.0, dur: 0.6, dl: 0.02, m: true },
  { u: 0.11, f: 0.08, k: 'y', w: 7.5, len: 0.62, dur: 0.43, dl: 0.1, m: true },
  { u: 0.19, f: 0.3, k: 'r', w: 6.5, len: 0.8, dur: 0.51, dl: 0.2, m: true },
  { u: 0.27, f: 0.22, k: 'y', w: 5.5, len: 0.95, dur: 0.58, dl: 0.08, long: true, creep: true, m: true },
  { u: 0.35, f: 0.5, k: 'r', w: 8, len: 0.55, dur: 0.4, dl: 0.28 },
  { u: 0.43, f: 0.46, k: 'y', w: 6.5, len: 0.72, dur: 0.47, dl: 0.16, creep: true, m: true },
  { u: 0.51, f: 0.4, k: 'r', w: 6, len: 0.9, dur: 0.56, dl: 0.05, long: true, m: true },
  { u: 0.59, f: 0.7, k: 'y', w: 7.5, len: 0.6, dur: 0.42, dl: 0.24 },
  { u: 0.67, f: 0.64, k: 'r', w: 8, len: 0.58, dur: 0.41, dl: 0.12, m: true },
  { u: 0.74, f: 0.78, k: 'y', w: 5.5, len: 1.0, dur: 0.6, dl: 0, long: true },
  { u: 0.82, f: 0.86, k: 'r', w: 7, len: 0.68, dur: 0.46, dl: 0.18 },
  { u: 0.9, f: 0.93, k: 'y', w: 8, len: 0.56, dur: 0.4, dl: 0.3 },
  { u: 0.96, f: 0.97, k: 'r', w: 6, len: 0.85, dur: 0.53, dl: 0.22, creep: true },
];
const SC: Record<'r' | 'y', { base: string; edge: string; core: string; amb: string }> = { r: SAUCES[0], y: SAUCES[1] };

function Defs({ s }: { s: Sauce }) {
  const k = s.k;
  return (
    <defs>
      <radialGradient id={`sf-b-${k}`} cx="40%" cy="32%" r="75%">
        <stop offset="0" stopColor={s.core} /><stop offset="0.4" stopColor={s.base} /><stop offset="0.8" stopColor={s.base} /><stop offset="1" stopColor={s.edge} />
      </radialGradient>
      <linearGradient id={`sf-h-${k}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={s.amb} /><stop offset="0.25" stopColor={s.edge} /><stop offset="0.42" stopColor={s.core} /><stop offset="0.65" stopColor={s.base} /><stop offset="1" stopColor={s.edge} />
      </linearGradient>
    </defs>
  );
}

function Blob({ s, i, b }: { s: Sauce; i: number; b: Sauce['blobs'][number] }) {
  return (
    <g className="sf__blob" data-f={b.f} data-i={i}>
      <ellipse cx="0" cy="3" rx={b.rx} ry={b.ry} fill={s.amb} opacity="0.55" />
      <ellipse cx="0" cy="0" rx={b.rx} ry={b.ry} fill={`url(#sf-b-${s.k})`} />
      <ellipse cx={-b.rx * 0.3} cy={-b.ry * 0.45} rx={b.rx * 0.45} ry={b.ry * 0.22} fill="#fff" opacity="0.75" />
    </g>
  );
}

function Lines({ s }: { s: Sauce }) {
  const common = { d: s.d, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 0, className: 'sf__ln' };
  return (
    <>
      <g transform="translate(0 4)"><path {...common} stroke="#09090B" strokeOpacity="0.3" strokeWidth="12" /></g>
      <g transform="translate(0 1)"><path {...common} stroke={s.amb} strokeWidth="10.5" /></g>
      <path {...common} stroke={s.edge} strokeWidth="9" />
      <path {...common} stroke={s.base} strokeWidth="7.2" />
      <g transform="translate(0 -1.2)"><path {...common} stroke={s.core} strokeWidth="3.4" strokeOpacity="0.9" /></g>
    </>
  );
}

function Spec({ s }: { s: Sauce }) {
  return (
    <g className="sf__shim">
      <g transform="translate(0 -2.1)">
        <path d={s.d} fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={0} className="sf__ln" />
      </g>
    </g>
  );
}

function Feed({ s }: { s: Sauce }) {
  return (
    <g className="sf__feed" opacity="0">
      <path className="sf__fp" data-w="9" fill="none" stroke={s.amb} strokeLinecap="round" />
      <path className="sf__fp" data-w="7" fill="none" stroke={s.edge} strokeLinecap="round" />
      <path className="sf__fp" data-w="5" fill="none" stroke={s.base} strokeLinecap="round" />
      <path className="sf__fp" data-w="2.2" fill="none" stroke={s.core} strokeLinecap="round" />
      <path className="sf__fp" data-w="0.9" fill="none" stroke="#fff" strokeOpacity="0.8" strokeLinecap="round" />
    </g>
  );
}

export function SauceFlow() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const sec = el?.closest<HTMLElement>('.pm');
      const art = sec?.querySelector<HTMLElement>('.pm__art');
      if (!el || !sec || !art) return;
      const measure = () => {
        const s = sec.getBoundingClientRect();
        const a = art.getBoundingClientRect();
        el.style.setProperty('--ax', `${a.left - s.left}px`);
        el.style.setProperty('--ay', `${a.top - s.top}px`);
        el.style.setProperty('--aw', `${a.width}px`);
        el.style.setProperty('--ah', `${a.height}px`);
      };

      // runs (drips) live in section pixel space: mobile = hang from the box lip down onto the heading, desktop = hang from a smear above the heading
      const svgR = el.querySelector<SVGSVGElement>('.sf__runs')!;
      const runEls = Array.from(el.querySelectorAll<SVGGElement>('.sf__run'));
      const smear = el.querySelector<SVGGElement>('.sf__smear')!;
      const info = runEls.map(() => ({ L: 0, w: 0, x: 0 }));
      const layout = () => {
        const sr = sec.getBoundingClientRect();
        svgR.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
        const mob = window.innerWidth < 900;
        const a = art.getBoundingClientRect();
        const h3 = sec.querySelector<HTMLElement>('.pm__body h3');
        let hr = { left: a.left, right: a.right, top: a.bottom + 80, height: 80 };
        if (h3) { const rg = document.createRange(); rg.selectNodeContents(h3); const r = rg.getBoundingClientRect(); const hb = h3.getBoundingClientRect(); hr = { left: r.left, right: r.right, top: hb.top, height: Math.max(hb.height, r.height) }; }
        const hl = hr.left - sr.left, hw = hr.right - hr.left, ht = hr.top - sr.top;
        const ps = Math.min(a.width / 400, a.height / 360), ox = a.left - sr.left + (a.width - 400 * ps) / 2, oy = a.top - sr.top + (a.height - 360 * ps) / 2;
        const vh = window.innerHeight;
        const sc = mob ? 1.05 : 1.1;
        runEls.forEach((g, i) => {
          const r = RUNS[i];
          const on = !mob || r.m;
          g.style.display = on ? '' : 'none';
          const w = r.w * sc * (mob ? 1.1 : 1);
          let x: number, y0: number;
          if (mob) { const o = geo[r.k === 'r' ? 0 : 1]; const pt = o.at(r.f); x = ox + pt.x * ps; y0 = oy + pt.y * ps; }
          else { x = hl + hw * (0.03 + 0.94 * r.u); y0 = ht - 8; }
          const hb = hr.top - sr.top + hr.height;
          const Lmax = Math.max(40, hb - y0);
          const L = Math.max(20, Math.min((r.len / (r.creep ? 1.12 : 1)) * Lmax - w * 1.35, vh - y0 - 20));
          info[i] = { L, w, x };
          g.setAttribute('transform', `translate(${x} ${y0})`);
          const [st, hi] = g.querySelectorAll<SVGPathElement>('.sf__rs');
          const sw = (((i * 7) % 5) - 2) * w * 0.12; // slight sideways sway, different per run
          const fd = Math.min(w * 1.9, L * 0.45);
          const tw = w * 0.55; // width just above the drop
          st.setAttribute('d', `M${-w * 1.05} -3C${-w * 0.75} -3 ${-w * 0.56} ${fd * 0.2} ${-w * 0.52} ${fd}C${-w * 0.46 + sw} ${L * 0.4} ${-tw / 2 + sw} ${L * 0.78} ${-tw / 2 + sw * 0.5} ${L}H${tw / 2 + sw * 0.5}C${tw / 2 + sw} ${L * 0.78} ${w * 0.46 + sw} ${L * 0.4} ${w * 0.52} ${fd}C${w * 0.56} ${fd * 0.2} ${w * 0.75} -3 ${w * 1.05} -3Z`);
          hi.setAttribute('d', `M${-w * 0.3} ${w * 0.8}H${-w * 0.1}C${-w * 0.1 + sw} ${L * 0.4} ${-w * 0.08 + sw} ${L * 0.7} ${-w * 0.06 + sw * 0.6} ${L * 0.86}H${-w * 0.12 + sw * 0.6}C${-w * 0.2 + sw} ${L * 0.7} ${-w * 0.24 + sw} ${L * 0.4} ${-w * 0.3} ${w * 0.8}Z`);
          const bd = g.querySelector<SVGElement>('.sf__rbd')!;
          const by = r.long ? L + w * 0.35 : L + w * 0.1;
          const bx = (((i * 7) % 5) - 2) * w * 0.12 * 0.5;
          if (r.long) { bd.setAttribute('cx', String(bx)); bd.setAttribute('cy', String(by)); bd.setAttribute('rx', String(w * 0.55)); bd.setAttribute('ry', String(w * 1.0)); }
          else { bd.setAttribute('cx', String(bx)); bd.setAttribute('cy', String(by)); bd.setAttribute('r', String(w * 0.72)); }
          const bh = g.querySelector<SVGElement>('.sf__rbh')!;
          bh.setAttribute('cx', String(bx - w * 0.25)); bh.setAttribute('cy', String(by - w * 0.25)); bh.setAttribute('rx', String(w * 0.17)); bh.setAttribute('ry', String(w * 0.3));
        });
        // heading smear (desktop only): two glossy lines, yellow lying over the end of the red one
        smear.style.display = mob ? 'none' : '';
        if (!mob) {
          const sy = ht - 8;
          const seg = (x0: number, x1: number, ph: number) => { const n = 6; let d = `M${x0} ${sy + Math.sin(ph) * 3}`; for (let i = 1; i <= n; i++) { const xx = x0 + ((x1 - x0) * i) / n; d += `S${xx - (x1 - x0) / n / 2} ${sy + Math.sin(ph + i * 1.7) * 4} ${xx} ${sy + Math.sin(ph + i * 1.3) * 3}`; } return d; };
          const rd = seg(hl - 4, hl + hw * 0.62, 0.4), yd = seg(hl + hw * 0.5, hl + hw + 6, 2.1);
          smear.querySelectorAll<SVGPathElement>('[data-smear="r"] .sf__sm').forEach((q) => { q.setAttribute('d', rd); q.setAttribute('stroke-width', String(Number(q.dataset.w))); });
          smear.querySelectorAll<SVGPathElement>('[data-smear="y"] .sf__sm').forEach((q) => { q.setAttribute('d', yd); q.setAttribute('stroke-width', String(Number(q.dataset.w))); });
        }
      };
      measure();

      // static layout: put blobs / drips / splash on their path points (also the final reduced-motion look)
      const geo = SAUCES.map((s) => {
        const g = el.querySelector(`[data-sauce="${s.k}"]`)!;
        const path = g.querySelector<SVGPathElement>('.sf__ln')!;
        const len = path.getTotalLength();
        const at = (f: number) => path.getPointAtLength(len * f);
        g.querySelectorAll<SVGGElement>('.sf__blob').forEach((b) => { const p = at(Number(b.dataset.f)); b.setAttribute('transform', `translate(${p.x} ${p.y})`); });
        const p0 = at(0), p1 = at(1);
        g.querySelectorAll<SVGCircleElement>('.sf__sp').forEach((c) => { c.setAttribute('cx', String(p0.x)); c.setAttribute('cy', String(p0.y)); });
        g.querySelectorAll<SVGCircleElement>('.sf__fall').forEach((c) => { c.setAttribute('cx', String(p1.x)); c.setAttribute('cy', String(p1.y)); });
        return { s, g, at, p0, p1, lns: Array.from(g.querySelectorAll<SVGPathElement>('.sf__ln')), fps: Array.from(el.querySelectorAll<SVGPathElement>(`[data-feed="${s.k}"] .sf__fp`)), feed: el.querySelector(`[data-feed="${s.k}"]`)! };
      });
      el.classList.add('is-ready');

      const io = new IntersectionObserver(([e]) => el.classList.toggle('is-live', e.isIntersecting), { threshold: 0.05 });
      io.observe(el);

      let mm: gsap.MatchMedia;
      const setup = () => {
      layout();
      mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const vh = () => window.innerHeight;
        const st = geo.map(() => ({ a: 0, p: 0, q: 0, w: 1 }));
        const update = () => {
          geo.forEach((o, i) => {
            const v = st[i];
            const S = { x: o.s.sx, y: o.s.sy };
            const T = v.a < 1 ? { x: S.x + (o.p0.x - S.x) * v.a * v.a, y: S.y + (o.p0.y - S.y) * v.a * v.a } : o.at(v.p);
            const B = { x: T.x + (S.x - T.x) * v.q, y: T.y + (S.y - T.y) * v.q };
            const wob = Math.sin(T.y * 0.045 + T.x * 0.03) * 7;
            const dx = B.x - S.x, dy = B.y - S.y;
            const d = `M${S.x} ${S.y}C${S.x + dx * 0.35 + wob} ${S.y + dy * 0.35} ${S.x + dx * 0.7 - wob} ${S.y + dy * 0.7} ${B.x} ${B.y}`;
            o.fps.forEach((f) => { f.setAttribute('d', d); f.setAttribute('stroke-width', String(Number(f.dataset.w) * 0.8 * v.w)); });
            o.feed.setAttribute('opacity', v.a > 0.001 && v.q < 0.995 ? '1' : '0');
            o.lns.forEach((l) => { l.setAttribute('stroke-dashoffset', String(1 - v.p)); l.setAttribute('visibility', v.p > 0.002 ? 'visible' : 'hidden'); });
          });
        };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec, start: 'top top', end: () => `+=${Math.round(vh() * 2.7)}`, pin: sec, pinSpacing: true, anticipatePin: 1, scrub: 0.7, invalidateOnRefresh: true,
            onRefresh: measure,
            onUpdate: (self) => { el.classList.toggle('is-done', self.progress > 0.5); },
            onScrubComplete: () => update(),
          },
          onUpdate: update,
        });
        geo.forEach((o, i) => {
          const v = st[i];
          const t0 = i * 0.22; // yellow comes second
          const fallEnd = t0 + 0.1, drawEnd = fallEnd + 0.36;
          tl.fromTo(v, { a: 0 }, { a: 1, duration: 0.1, ease: 'power1.in' }, t0)
            .fromTo(v, { p: 0 }, { p: 1, duration: 0.36, ease: 'none' }, fallEnd)
            .to(v, { w: 0.3, duration: 0.05, ease: 'power1.in' }, drawEnd)
            .to(v, { q: 1, duration: 0.1, ease: 'power2.in' }, drawEnd + 0.05);
          // blobs thicken where the tip pauses
          o.g.querySelectorAll('.sf__blob').forEach((b) => {
            tl.fromTo(b, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.05, ease: 'back.out(2)' }, fallEnd + Number((b as HTMLElement).dataset.f) * 0.36);
          });
          // splash at impact: droplets fly in an arc and settle as beads
          o.g.querySelectorAll<SVGCircleElement>('.sf__sp').forEach((c, j) => {
            const [dx, dy] = o.s.splash[j];
            const h = 18 + (j % 3) * 8;
            tl.fromTo(c, { x: 0, y: 0, opacity: 0, scale: 0.4 }, { x: dx * 0.55, y: -h, opacity: 1, scale: 1, duration: 0.04, ease: 'power2.out' }, fallEnd)
              .to(c, { x: dx, y: dy, duration: 0.05, ease: 'power2.in' }, fallEnd + 0.04);
          });
          // thread snaps: one drop falls from the break, a second small bead settles beside it
          o.g.querySelectorAll<SVGCircleElement>('.sf__fall').forEach((c, j) => {
            tl.fromTo(c, { y: -46 - j * 30, x: j * 9, opacity: 0 }, { y: j * 5, opacity: 1, duration: 0.07, ease: 'power2.in' }, drawEnd + 0.07 + j * 0.03);
          });
        });
        // runs: different length / width / speed / delay / drop shape; some still creep during the hold
        runEls.forEach((g, i) => {
          const r = RUNS[i];
          if (g.style.display === 'none') return;
          const { L } = info[i];
          const [st, hi] = g.querySelectorAll('.sf__rs');
          const bulb = g.querySelector('.sf__rb')!;
          const t = (r.k === 'r' ? 0.5 : 0.66) + r.dl;
          tl.fromTo([st, hi], { scaleY: 0.02, opacity: 0 }, { scaleY: 1, opacity: 1, duration: r.dur, ease: 'power1.in' }, t)
            .fromTo(bulb, { y: -L, opacity: 0 }, { y: 0, opacity: 1, duration: r.dur, ease: 'power1.in' }, t);
          if (r.creep) tl.to([st, hi], { scaleY: 1.12, duration: 0.45, ease: 'power1.inOut' }, t + r.dur).to(bulb, { y: L * 0.12, duration: 0.45, ease: 'power1.inOut' }, t + r.dur);
        });
        if (!(window.innerWidth < 900)) tl.fromTo(smear.querySelectorAll('[data-smear]'), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.14, ease: 'power1.out', stagger: 0.07 }, 0.45);
        if (tl.duration() < 1.6) tl.to({}, { duration: 1.6 - tl.duration() }); // hold with the finished sauce (scroll length of the hold ~ 0.5/1.5 of the pin)
        update();
        return () => el.classList.remove('is-done');
      });
      };
      setup();
      let lw = window.innerWidth, rt = 0;
      const onResize = () => { window.clearTimeout(rt); rt = window.setTimeout(() => { if (window.innerWidth === lw) return; lw = window.innerWidth; mm.revert(); setup(); }, 250); };
      window.addEventListener('resize', onResize);
      return () => { window.removeEventListener('resize', onResize); window.clearTimeout(rt); io.disconnect(); mm.revert(); };
    },
    { scope: root },
  );

  return (
    <div className="sf" ref={root} aria-hidden="true">
      <svg className="sf__pool" viewBox="0 0 400 360" preserveAspectRatio="xMidYMid meet" focusable="false">
        {SAUCES.map((s) => <Defs key={s.k} s={s} />)}
        {SAUCES.map((s) => (
          <g key={s.k} data-sauce={s.k}>
            <Lines s={s} />
            {s.blobs.map((b, i) => <Blob key={i} s={s} i={i} b={b} />)}
            <Spec s={s} />
            {s.splash.map(([, , r], i) => <circle key={i} className="sf__sp" r={r} fill={`url(#sf-b-${s.k})`} />)}
            <circle className="sf__fall" r="3.4" fill={`url(#sf-b-${s.k})`} />
            <circle className="sf__fall" r="2" fill={`url(#sf-b-${s.k})`} />
          </g>
        ))}
        {SAUCES.map((s) => <g key={`f${s.k}`} data-feed={s.k}><Feed s={s} /></g>)}
      </svg>
      <svg className="sf__runs" preserveAspectRatio="none" focusable="false">
        <g className="sf__smear" data-d="0">
          {(['r', 'y'] as const).map((k) => (
            <g key={k} data-smear={k}>
              <path className="sf__sm" data-w="12" stroke="#09090B" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
              <path className="sf__sm" data-w="10" stroke={SC[k].amb} fill="none" strokeLinecap="round" />
              <path className="sf__sm" data-w="8.5" stroke={SC[k].edge} fill="none" strokeLinecap="round" />
              <path className="sf__sm" data-w="6.5" stroke={SC[k].base} fill="none" strokeLinecap="round" />
              <path className="sf__sm" data-w="3" stroke={SC[k].core} strokeOpacity="0.9" fill="none" strokeLinecap="round" />
              <path className="sf__sm" data-w="1.2" stroke="#fff" strokeOpacity="0.8" fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>
        {RUNS.map((r, i) => (
          <g key={i} className="sf__run" data-i={i} data-m={r.m ? 1 : 0}>
            <path className="sf__rs" fill={`url(#sf-h-${r.k})`} />
            <path className="sf__rs sf__rh" fill="#fff" fillOpacity="0.7" />
            <g className="sf__rb">
              {r.long ? <ellipse className="sf__rbd" fill={`url(#sf-b-${r.k})`} /> : <circle className="sf__rbd" fill={`url(#sf-b-${r.k})`} />}
              <ellipse className="sf__rbh" fill="#fff" opacity="0.85" />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
