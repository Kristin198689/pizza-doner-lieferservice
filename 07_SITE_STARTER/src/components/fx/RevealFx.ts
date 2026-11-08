import { gsap, ScrollTrigger } from '@/lib/gsap';

const HEADINGS = '.pms__head .display, .runway__head .display, .pm__body h3, .ful__title';
const VIS = (el: Element, k = 0.88) => el.getBoundingClientRect().top < window.innerHeight * k;

/** Mask-style rise for big headings: clip-path wipe + small lift (transform/clip only). */
function headings(small: boolean) {
  document.querySelectorAll<HTMLElement>(HEADINGS).forEach((h) => {
    if (VIS(h, 0.78)) return;
    gsap.set(h, { clipPath: 'inset(0 0 100% 0)', yPercent: small ? 22 : 38 });
    ScrollTrigger.create({
      trigger: h, start: 'top 78%', once: true,
      onEnter: () => gsap.to(h, { clipPath: 'inset(-12% -3% -12% -3%)', yPercent: 0, duration: small ? 1.1 : 1.3, ease: 'power3.out', clearProps: 'clipPath,transform' }),
    });
  });
}

/** Product images: inset wipe from the bottom + settle scale of the inner <img>. */
function images(small: boolean) {
  document.querySelectorAll<HTMLElement>('.pm__art .pm__img').forEach((box) => {
    if (VIS(box, 0.8)) return;
    const img = box.querySelector('img');
    gsap.set(box, { clipPath: 'inset(100% 0 0 0)' });
    if (img && !small) gsap.set(img, { scale: 1.14 });
    ScrollTrigger.create({
      trigger: box, start: 'top 82%', once: true,
      onEnter: () => {
        gsap.to(box, { clipPath: 'inset(-20% -20% -20% -20%)', duration: small ? 0.9 : 1.3, ease: 'expo.out', clearProps: 'clipPath' });
        if (img && !small) gsap.to(img, { scale: 1, duration: 1.6, ease: 'expo.out', clearProps: 'transform' });
      },
    });
  });
}

/** Menu rows: staggered entrance + background bar sweep (CSS keyframes, class toggled here). */
function rows() {
  const root = document.documentElement;
  const lists = document.querySelectorAll<HTMLElement>('.pm__list');
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      (e.target as HTMLElement).classList.add('fx-in');
    });
  }, { rootMargin: '0px 0px -22% 0px', threshold: 0.2 });
  lists.forEach((ul) => Array.from(ul.children).forEach((li, i) => {
    (li as HTMLElement).style.setProperty('--i', String(Math.min(i, 6)));
    io.observe(li);
  }));
  root.dataset.fx6 = 'on';
  return () => { io.disconnect(); delete root.dataset.fx6; document.querySelectorAll('.fx-in').forEach((n) => n.classList.remove('fx-in')); };
}

/** Menu index number ticks through digits before landing on its value. */
function ticks() {
  const timers: number[] = [];
  document.querySelectorAll<HTMLElement>('.pm__no').forEach((el) => {
    const final = el.textContent || '';
    if (!final) return;
    ScrollTrigger.create({
      trigger: el, start: 'top 80%', once: true,
      onEnter: () => {
        let n = 0;
        const id = window.setInterval(() => {
          n++;
          if (n >= 7) { window.clearInterval(id); el.textContent = final; return; }
          el.textContent = final.replace(/\d/g, () => String(Math.floor(Math.random() * 10)));
        }, 90);
        timers.push(id);
      },
    });
  });
  return () => timers.forEach((t) => window.clearInterval(t));
}

/** Footer wordmark rises like a mask reveal. */
function footer(small: boolean) {
  const w = document.querySelector<HTMLElement>('.footer__brand');
  if (!w) return;
  gsap.set(w, { clipPath: 'inset(0 0 100% 0)', yPercent: small ? 25 : 45 });
  ScrollTrigger.create({
    trigger: w, start: 'top 98%', once: true,
    onEnter: () => gsap.to(w, { clipPath: 'inset(-12% -3% -12% -3%)', yPercent: 0, duration: 1.3, ease: 'expo.out', clearProps: 'clipPath,transform' }),
  });
}

/** Decorative words: scroll-linked scale (y parallax is already handled by data-parallax). */
function words() {
  document.querySelectorAll<HTMLElement>('.chapter__word').forEach((el) => {
    gsap.fromTo(el, { scale: 0.9 }, { scale: 1.08, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

export function initRevealFx(small: boolean) {
  headings(small);
  images(small);
  footer(small);
  const c1 = rows();
  const c2 = ticks();
  if (!small) words();
  return () => { c1(); c2(); };
}

/** Magnetic pull for primary buttons via CSS vars (consumed by `translate`, so hover/active transforms keep working). */
export function initMagnetic() {
  const cleanups: Array<() => void> = [];
  document.querySelectorAll<HTMLElement>('.btn--red, .rail__link').forEach((b) => {
    const qx = gsap.quickTo(b, '--mx', { duration: 0.5, ease: 'power3.out' });
    const qy = gsap.quickTo(b, '--my', { duration: 0.5, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = b.getBoundingClientRect();
      qx(Math.max(-10, Math.min(10, (e.clientX - r.left - r.width / 2) * 0.22)));
      qy(Math.max(-8, Math.min(8, (e.clientY - r.top - r.height / 2) * 0.28)));
    };
    const leave = () => { qx(0); qy(0); };
    b.addEventListener('pointermove', move);
    b.addEventListener('pointerleave', leave);
    b.dataset.magnetic = '';
    cleanups.push(() => { b.removeEventListener('pointermove', move); b.removeEventListener('pointerleave', leave); delete b.dataset.magnetic; b.style.removeProperty('--mx'); b.style.removeProperty('--my'); });
  });
  return () => cleanups.forEach((c) => c());
}
