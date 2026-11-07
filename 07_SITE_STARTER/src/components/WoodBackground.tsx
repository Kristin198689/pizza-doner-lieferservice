/** Procedural burnt-wood planks (SVG filters, rasterised once). No image asset needed. */
const PLANKS = 8;
const TONES = ['#1c130d', '#170f0a', '#211610', '#150e09', '#1e140e', '#18100b', '#231710', '#160f0a'];

export function WoodBackground({ className = '' }: { className?: string }) {
  const w = 1600 / PLANKS;
  return (
    <svg className={className} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        {Array.from({ length: 4 }, (_, i) => (
          <filter key={i} id={`wg${i}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency={`${0.16 + i * 0.04} ${0.0045 + i * 0.0012}`} numOctaves="4" seed={11 + i * 7} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.26  0 0 0 0 0.12  1.5 0 0 0 -0.62" />
          </filter>
        ))}
        <filter id="wcrack" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.012" numOctaves="3" seed="5" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.3  0 0 0 0 0.04  0 0 0 12 -8.1" />
        </filter>
        <filter id="wchar" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.03" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -0.9" />
        </filter>
        <radialGradient id="wvig" cx="50%" cy="48%" r="75%">
          <stop offset="45%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
        <linearGradient id="wember" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff5a0a" stopOpacity="0.3" />
          <stop offset="0.35" stopColor="#ff3d00" stopOpacity="0.1" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="wknot">
          <stop offset="0" stopColor="#050302" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#0c0704" stopOpacity="0.6" />
          <stop offset="1" stopColor="#0c0704" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: PLANKS }, (_, i) => (
        <g key={i}>
          <rect x={i * w} y="0" width={w} height="900" fill={TONES[i]} />
          <rect x={i * w} y="0" width={w} height="900" filter={`url(#wg${i % 4})`} opacity="0.55" />
          <rect x={i * w} y="0" width={w} height="900" filter="url(#wchar)" opacity="0.55" />
          <rect x={i * w} y="0" width="3" height="900" fill="#030201" />
          <rect x={i * w + 3} y="0" width="2" height="900" fill="#fff" opacity="0.05" />
        </g>
      ))}
      <ellipse cx="380" cy="300" rx="46" ry="90" fill="url(#wknot)" />
      <ellipse cx="1180" cy="640" rx="40" ry="80" fill="url(#wknot)" />
      <rect width="1600" height="900" filter="url(#wcrack)" opacity="0.32" />
      <rect width="1600" height="900" fill="url(#wember)" />
      <rect width="1600" height="900" fill="url(#wvig)" />
    </svg>
  );
}
