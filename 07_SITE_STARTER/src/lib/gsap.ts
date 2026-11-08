'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Touch devices: a collapsing/expanding URL bar changes innerHeight by ~60-100 px mid-scroll. Never let that (or the load event
  // firing mid-fling) refresh the triggers: ignoreMobileResize drops height-only resizes < 25 %, and on coarse pointers the automatic
  // resize/load refreshes are replaced by the deferred, idle-gated refresh in ScrollFx (width change / page-height change only).
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  ScrollTrigger.config(coarse ? { ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded' } : { ignoreMobileResize: true });
  if (process.env.NODE_ENV !== 'production') (window as unknown as { ScrollTrigger: typeof ScrollTrigger }).ScrollTrigger = ScrollTrigger;
}

export { gsap, ScrollTrigger, useGSAP };
