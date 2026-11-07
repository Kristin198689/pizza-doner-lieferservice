/** Unbranded drinks illustration (can, bottle, tall glass with ice). Replace with real photos when available. */
export function DrinksArt({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 900 760" role="img" aria-label="Drinks" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dCan" x1="0" x2="1">
          <stop offset="0" stopColor="#8f0006" />
          <stop offset="0.25" stopColor="#ff2a33" />
          <stop offset="0.55" stopColor="#f30009" />
          <stop offset="1" stopColor="#74000a" />
        </linearGradient>
        <linearGradient id="dMetal" x1="0" x2="1">
          <stop offset="0" stopColor="#9a9aa0" />
          <stop offset="0.5" stopColor="#f2f2f4" />
          <stop offset="1" stopColor="#8a8a92" />
        </linearGradient>
        <linearGradient id="dBottle" x1="0" x2="1">
          <stop offset="0" stopColor="#bfe9ff" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#8ccdf0" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="dCola" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a3a12" />
          <stop offset="1" stopColor="#2c1204" />
        </linearGradient>
        <linearGradient id="dGlass" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id="dShadow">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="450" cy="700" rx="400" ry="38" fill="url(#dShadow)" />
      {/* can */}
      <g transform="translate(70 170)">
        <rect x="0" y="22" width="190" height="460" rx="26" fill="url(#dCan)" />
        <ellipse cx="95" cy="26" rx="94" ry="20" fill="url(#dMetal)" />
        <ellipse cx="95" cy="26" rx="62" ry="11" fill="#d8d8dc" />
        <rect x="0" y="170" width="190" height="120" fill="#f6f2e9" />
        <path d="M0 230c32-34 62 34 95 0s63 34 95 0v60H0Z" fill="#09090b" opacity="0.9" />
        <rect x="22" y="40" width="22" height="420" rx="11" fill="#fff" opacity="0.22" />
        <ellipse cx="95" cy="486" rx="92" ry="16" fill="#5c0008" />
      </g>
      {/* bottle */}
      <g transform="translate(640 120)">
        <rect x="52" y="0" width="56" height="62" rx="10" fill="#39ff14" />
        <rect x="46" y="54" width="68" height="16" rx="6" fill="#2bd10b" />
        <path d="M60 70h40c6 40 52 62 52 128v380c0 24-18 42-42 42H50c-24 0-42-18-42-42V198c0-66 46-88 52-128Z" fill="url(#dBottle)" stroke="#9fd4f2" strokeWidth="3" />
        <path d="M8 330h144v248c0 24-18 42-42 42H50c-24 0-42-18-42-42Z" fill="#6fc2f0" opacity="0.5" />
        <rect x="8" y="280" width="144" height="110" fill="#f6f2e9" opacity="0.95" />
        <rect x="8" y="318" width="144" height="34" fill="#39ff14" />
        <rect x="26" y="90" width="16" height="470" rx="8" fill="#fff" opacity="0.55" />
      </g>
      {/* tall glass with cola and ice */}
      <g transform="translate(330 60)">
        <rect x="190" y="0" width="16" height="250" rx="8" transform="rotate(14 198 125)" fill="#f30009" />
        <rect x="196" y="4" width="8" height="240" rx="4" transform="rotate(14 198 125)" fill="#f6f2e9" opacity="0.7" />
        <path d="M20 90h220l-26 540c-1 22-19 40-41 40h-86c-22 0-40-18-41-40Z" fill="url(#dGlass)" stroke="#e8e4da" strokeWidth="4" />
        <path d="M30 150h200l-22 470c-1 20-17 36-37 36h-82c-20 0-36-16-37-36Z" fill="url(#dCola)" />
        <g fill="#ffffff" opacity="0.62">
          <rect x="52" y="168" width="78" height="72" rx="14" transform="rotate(-12 91 204)" />
          <rect x="134" y="190" width="70" height="66" rx="13" transform="rotate(10 169 223)" />
          <rect x="74" y="270" width="72" height="68" rx="13" transform="rotate(8 110 304)" />
        </g>
        <circle cx="96" cy="420" r="9" fill="#fff" opacity="0.4" />
        <circle cx="152" cy="480" r="6" fill="#fff" opacity="0.4" />
        <circle cx="120" cy="560" r="8" fill="#fff" opacity="0.35" />
        <path d="M28 96h204" stroke="#fff" strokeWidth="6" opacity="0.5" />
        <circle cx="226" cy="100" r="46" fill="#39ff14" stroke="#1ab300" strokeWidth="5" />
        <path d="M226 54v92M180 100h92M193 67l66 66M259 67l-66 66" stroke="#eaffd9" strokeWidth="3" opacity="0.7" />
        <rect x="46" y="110" width="14" height="520" rx="7" fill="#fff" opacity="0.4" />
      </g>
    </svg>
  );
}
