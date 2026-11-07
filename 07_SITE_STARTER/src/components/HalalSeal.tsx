import { biz } from '@/lib/i18n';

/**
 * Round HALAL seal (SVG, drawn for this project — replace with the owner's official mark if one exists).
 * Rendered only when the owner confirmed halal status (business.json → halalConfirmedByOwner).
 */
export function HalalSeal({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  if (!biz.halalConfirmedByOwner) return null;
  const ink = '#0b6b1a';
  return (
    <svg className={`seal ${className}`} style={style} viewBox="0 0 200 200" role="img" aria-label="Halal" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="sealRing" d="M100 100 m-68 0 a68 68 0 1 1 136 0 a68 68 0 1 1 -136 0" />
      </defs>
      <circle cx="100" cy="100" r="97" fill="#f6f2e9" />
      <circle cx="100" cy="100" r="91" fill="none" stroke={ink} strokeWidth="5" />
      <circle cx="100" cy="100" r="50" fill="none" stroke={ink} strokeWidth="2.5" />
      <text fontFamily="Anton, 'Oswald Variable', Impact, sans-serif" fontSize="24" fill={ink}>
        <textPath href="#sealRing" startOffset="0" textLength="418" lengthAdjust="spacing">HALAL • HALAL • HALAL • HALAL •</textPath>
      </text>
      <path d="M112 66a24 24 0 1 0 0 40 19 19 0 0 1 0-40Z" fill={ink} transform="translate(-6 -2)" />
      <path d="m118 74 3.2 7 7.6.8-5.7 5.2 1.7 7.5-6.8-3.9-6.8 3.9 1.7-7.5-5.7-5.2 7.6-.8 3.2-7Z" fill={ink} transform="translate(0 -2)" />
      <text x="100" y="128" textAnchor="middle" fontSize="34" fontWeight="700" fill={ink} fontFamily="'Geeza Pro','Noto Naskh Arabic','Arial',sans-serif">حلال</text>
    </svg>
  );
}
