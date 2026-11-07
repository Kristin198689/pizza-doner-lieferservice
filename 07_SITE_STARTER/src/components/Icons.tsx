type P = { className?: string };
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const, focusable: false as const };

export const IconMoped = ({ className }: P) => (
  <svg {...base} className={className}><circle cx="6" cy="17" r="2.5" /><circle cx="18" cy="17" r="2.5" /><path d="M8.5 17h6.2l-1.7-8H10M13 9h3.2l2 5.5M4 11h5v4" /><path d="M3 8h4" /></svg>
);
export const IconBag = ({ className }: P) => (
  <svg {...base} className={className}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
);
export const IconPhone = ({ className }: P) => (
  <svg {...base} className={className}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
);
export const IconArrow = ({ className }: P) => (
  <svg {...base} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconSlice = ({ className }: P) => (
  <svg {...base} className={className}><path d="M3 6c6-3 12-3 18 0l-9 15L3 6Z" /><circle cx="10" cy="10" r="1.2" /><circle cx="14" cy="11" r="1.2" /><circle cx="12" cy="15" r="1" /></svg>
);
export const IconSpit = ({ className }: P) => (
  <svg {...base} className={className}><path d="M12 2v3M12 19v3M8 5h8c1.5 2 2 5 2 7s-.5 5-2 7H8c-1.5-2-2-5-2-7s.5-5 2-7Z" /><path d="M8 9h8M7.5 13h9" /></svg>
);
export const IconWrap = ({ className }: P) => (
  <svg {...base} className={className}><path d="M4 16 16 4l4 4L8 20l-4-4Z" /><path d="m13 7 4 4M10 10l4 4" /></svg>
);
