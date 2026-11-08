'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Touch devices: a collapsing/expanding URL bar changes innerHeight by ~60-100 px mid-scroll; ignoreMobileResize drops such height-only
  // resizes. The default refresh events (load, resize, DOMContentLoaded, visibilitychange) stay ON: without the `load` refresh the trigger
  // positions go stale once images/fonts settle (pins start late / sections overlap).
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (process.env.NODE_ENV !== 'production') (window as unknown as { ScrollTrigger: typeof ScrollTrigger }).ScrollTrigger = ScrollTrigger;
}

export { gsap, ScrollTrigger, useGSAP };
