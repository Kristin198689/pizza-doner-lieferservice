'use client';
import { useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import { gsap, useGSAP } from '@/lib/gsap';

/* final composition (percent of the scene square) — rotation `r`, drop order `o`, fall delay in the scrub timeline */
type Item = { src: string; w: number; l: number; b: number; r: number; flip?: boolean; z: number; at: number };
const ITEMS: Item[] = [
  { src: 'fries', w: 60, l: 2, b: 8, r: -4, z: 1, at: 0 },
  { src: 'fries', w: 40, l: 40, b: 11, r: 9, flip: true, z: 2, at: 0.14 },
  { src: 'nuggets', w: 46, l: 50, b: 9, r: 5, z: 3, at: 0.28 },
  { src: 'nuggets', w: 30, l: 18, b: 8, r: -12, flip: true, z: 4, at: 0.42 },
  { src: 'nuggets', w: 22, l: 36, b: 25, r: 16, z: 5, at: 0.56 },
  { src: 'fries', w: 26, l: 60, b: 24, r: -18, flip: true, z: 5, at: 0.7 },
];

/** Black snacks screen: fries + nuggets fall into a kraft takeaway box while the screen scrolls through. */
export function SnacksDrop({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>('.sd__item', el);
        const tl = gsap.timeline({ scrollTrigger: { trigger: el.closest('.pm') ?? el, start: 'top 70%', end: 'top top', scrub: 0.7, invalidateOnRefresh: true } });
        items.forEach((it, i) => {
          const { at } = ITEMS[i];
          const dir = i % 2 ? 1 : -1;
          tl.fromTo(it, { y: () => -el.offsetHeight * (1.05 + i * 0.05), rotation: dir * (24 + i * 6) }, { y: 6, rotation: 0, duration: 0.34, ease: 'power2.in' }, at)
            .to(it, { y: -4, duration: 0.07, ease: 'power1.out' }, at + 0.34)
            .to(it, { y: 0, duration: 0.07, ease: 'power1.in' }, at + 0.41);
        });
        // opacity jumps in during the first part of each fall so nothing pops at the section's top edge
        items.forEach((it, i) => tl.fromTo(it, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'none' }, ITEMS[i].at));
        tl.to({}, { duration: 0.1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div className="pm__art sd" ref={root} aria-hidden="true">
      <div className="sd__scene">
        <div className="sd__back" />
        {ITEMS.map((it, i) => (
          <div key={i} className="sd__item" style={{ width: `${it.w}%`, left: `${it.l}%`, bottom: `${it.b}%`, zIndex: it.z }}>
            <Image className="sd__img" style={{ '--r': `${it.r}deg`, '--f': it.flip ? -1 : 1 } as CSSProperties} src={`/assets/food/${it.src}.png`} alt="" width={1254} height={1254} sizes="(max-width: 899px) 60vw, 34vw" loading="eager" />
          </div>
        ))}
        <div className="sd__front" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
