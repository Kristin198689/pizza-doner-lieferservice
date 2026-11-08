'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

const Word = ({ cls, children }: { cls: string; children: string }) => (
  <p className={`tk__w ${cls}`}>
    <span className="tk__mask">
      <span className="tk__inner">{children}</span>
    </span>
  </p>
);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Art-direction pause: two giant words, one slice on one deliberate path (enter right, rest in the gap, exit left). */
export function TypographyTakeover({ t, sliceAlt }: { t: Messages['takeover']; sliceAlt: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      const easeOut = gsap.parseEase('power2.out');
      const easeIn = gsap.parseEase('power1.in');
      const easeIO = gsap.parseEase('sine.inOut');

      const build = (end: string) => {
        const slice = q('.tk__slice')[0] as HTMLElement;
        const p = { s: 0 };
        const place = () => {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const w = slice.offsetWidth;
          const xIn = vw / 2 + w * 0.6; // fully off the right edge
          const xOut = -(vw / 2 + w * 0.6); // fully off the left edge
          const s = p.s;
          let x: number, rot: number, sc: number;
          if (s < 0.4) {
            const u = easeOut(s / 0.4);
            x = lerp(xIn, 0, u);
            rot = lerp(12, -4, u);
            sc = lerp(1, 1.15, u);
          } else if (s < 0.64) {
            const u = easeIO((s - 0.4) / 0.24); // slow drift while resting
            x = lerp(0, -vw * 0.03, u);
            rot = lerp(-4, -7, u);
            sc = 1.15;
          } else {
            const u = easeIn((s - 0.64) / 0.36);
            x = lerp(-vw * 0.03, xOut, u);
            rot = lerp(-7, -18, u);
            sc = lerp(1.15, 1.04, u);
          }
          // gentle arch: lower at the edges, level in the middle
          const k = Math.min(1, Math.abs(x) / (vw * 0.7));
          const y = vh * 0.1 * k * k;
          gsap.set(slice, { x, y, rotation: rot, scale: sc });
        };
        place();

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end, scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true, onRefresh: place },
        });
        tl.fromTo(q('.tk__w1 .tk__inner'), { yPercent: 115 }, { yPercent: 0, duration: 1.4, ease: 'power3.out' }, 0);
        tl.fromTo(q('.tk__w2 .tk__inner'), { yPercent: 115 }, { yPercent: 0, duration: 1.4, ease: 'power3.out' }, 0.6);
        tl.fromTo(q('.tk__cap'), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.4);
        tl.to(p, { s: 1, duration: 7, onUpdate: place }, 1.6);
        tl.to({}, { duration: 0.6 }, 8.6);
      };

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => build('+=300%'));
      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => build('+=150%'));
      // reduced motion: static composition, CSS rest pose
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="tk" ref={root} aria-label={t.label}>
      <h2 className="sr-only">{t.label}</h2>
      <div className="tk__stage" aria-hidden="true">
        <Word cls="tk__w1">{t.a}</Word>
        <span />
        <Word cls="tk__w2">{t.b}</Word>
      </div>
      <p className="tk__cap" aria-hidden="true">{t.caption}</p>
      <div className="tk__fx" aria-hidden="true">
        <Image className="tk__slice" src="/assets/food/pizza_slice_cheese_pull.png" alt="" width={1254} height={1254} sizes="(max-width: 767px) 88vw, 46vw" />
      </div>
      <span className="sr-only">{sliceAlt}</span>
    </section>
  );
}
