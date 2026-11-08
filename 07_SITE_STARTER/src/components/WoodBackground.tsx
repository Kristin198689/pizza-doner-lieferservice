/**
 * Burnt-wood planks. This used to be a full-screen SVG with eight stacked feTurbulence filters; iOS WebKit rasterises those in software
 * and froze the main thread for seconds when the Döner section scrolled into view. The exact same picture is now a pre-rendered
 * 58 KB WebP (public/assets/backgrounds/wood_burnt.webp), which costs nothing to paint.
 */
export function WoodBackground({ className = '' }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src="/assets/backgrounds/wood_burnt.webp" alt="" aria-hidden="true" width={1600} height={900} decoding="async" draggable={false} style={{ objectFit: 'cover' }} />;
}
