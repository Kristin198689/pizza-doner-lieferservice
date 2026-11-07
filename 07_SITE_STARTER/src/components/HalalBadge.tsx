import { biz } from '@/lib/i18n';

/** Shown only when the owner confirmed halal status (business.json → halalConfirmedByOwner). No certificate is implied. */
export function HalalBadge({ className = '' }: { className?: string }) {
  if (!biz.halalConfirmedByOwner) return null;
  return (
    <span className={`halal ${className}`} role="img" aria-label="Halal">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path d="M15.2 3.2a9 9 0 1 0 0 17.6A7.4 7.4 0 0 1 15.2 3.2Z" fill="currentColor" />
        <path d="m18.4 7.4.7 1.9 2 .1-1.6 1.2.6 1.9-1.7-1.1-1.6 1.2.5-1.9-1.6-1.2 2-.1.7-2Z" fill="currentColor" />
      </svg>
      <span>HALAL</span>
    </span>
  );
}
