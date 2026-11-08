'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Messages } from '@/lib/i18n';

/** Short typographic scene: FRISCH (cream on ink) slides in from the left, HEISS (ink on yellow) is unmasked from the right,
 *  the slice drops onto the seam between the two words and stays there. Text is visible from the first frame. */
export function TypographyTakeover({ t, sliceAlt }: { t: Messages['takeover']; sliceAlt: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      /** each word is scaled so it spans the stage width (capped by the viewport height) */
      const fit = () => {
        const stage = el.querySelector<HTMLElement>('.tk__stage')!;
        const cs = getComputedStyle(stage);
        const avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const cap = window.innerHeight * (window.innerHeight < 501 ? 0.28 : 0.4);
        el.querySelectorAll<HTMLElement>('.tk__w').forEach((w) => {
          const s = w.firstElementChild as HTMLElement;
          if (parseInt(getComputedStyle(w).fontWeight, 10) < 800) return; // stylesheet not applied yet: later passes will fit it
          const cur = parseFloat(getComputedStyle(w).fontSize);
          const width = s.getBoundingClientRect().width;
          if (!width) return;
          const fs = Math.floor(Math.min((cur * avail) / width, cap) * 10) / 10;
          if (Math.abs(fs - cur) > 0.4) w.style.fontSize = `${fs}px`;
        });
      };
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      fit();
      fonts?.ready.then(fit);
      fonts?.addEventListener('loadingdone', fit);
      const late = [400, 1200, 2500].map((ms) => window.setTimeout(fit, ms));
      window.addEventListener('resize', fit);
      const ro = new ResizeObserver(fit);
      el.querySelectorAll('.tk__w > span').forEach((n) => ro.observe(n));

      const build = (end: string) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end, scrub: 0.6, pin: true, invalidateOnRefresh: true, onRefresh: fit },
        });
        // FRISCH: already on screen, slides to rest from the left
        tl.fromTo(q('.tk__w1'), { xPercent: -7 }, { xPercent: 0, duration: 1, ease: 'power2.out' }, 0);
        // HEISS band: yellow field opens from the right edge, word rests at its right
        tl.fromTo(q('.tk__band'), { clipPath: 'inset(-100vh 0% 0% 62%)' }, { clipPath: 'inset(-100vh 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, 0);
        tl.fromTo(q('.tk__w2'), { xPercent: 8 }, { xPercent: 0, duration: 1, ease: 'power3.inOut' }, 0);
        // slice: quick drop onto the seam, small settle, stays
        tl.fromTo(q('.tk__slice'), { y: () => -window.innerHeight * 0.75, rotation: 26, scale: 1.12 }, { y: 0, rotation: -9, scale: 1, duration: 0.8, ease: 'power3.in' }, 0.7);
        tl.to(q('.tk__slice'), { rotation: -5, y: -6, duration: 0.18, ease: 'sine.out' }, 1.5);
        tl.to(q('.tk__slice'), { rotation: -7, y: 0, duration: 0.22, ease: 'sine.inOut' }, 1.68);
        tl.fromTo(q('.tk__cap'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.7);
        tl.to({}, { duration: 0.3 }, 1.9);
      };

      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 600px) and (min-height: 501px)', () => build('+=150%'));
      mm.add('(prefers-reduced-motion: no-preference) and ((max-width: 599px) or (max-height: 500px))', () => build('+=130%'));
      return () => {
        window.removeEventListener('resize', fit);
        fonts?.removeEventListener('loadingdone', fit);
        late.forEach(window.clearTimeout);
        ro.disconnect();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section className="tk" ref={root} aria-label={t.label}>
      <h2 className="sr-only">{t.label}</h2>
      <div className="tk__stage" aria-hidden="true">
        <p className="tk__w tk__w1"><span>{t.a}</span></p>
        <div className="tk__band">
          <Image className="tk__slice" src="/assets/food/pizza_slice_cheese_pull.png" alt="" width={1254} height={1254} sizes="(max-width: 600px) 60vw, 40vw" loading="eager" />
          <p className="tk__w tk__w2"><span>{t.b}</span></p>
          <p className="tk__cap">{t.caption}</p>
        </div>
      </div>
      <span className="sr-only">{sliceAlt}</span>
    </section>
  );
}
