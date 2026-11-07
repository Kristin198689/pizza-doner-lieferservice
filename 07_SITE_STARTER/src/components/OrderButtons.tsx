import { IconArrow, IconPhone } from './Icons';
import { lieferandoHref, phoneLabel, telHref } from '@/lib/i18n';

type Order = { call: string; callLong: string; lieferando: string; lieferandoSoon: string; phonePending: string };

/**
 * Primary order route is a phone call. Lieferando is prepared as a second route:
 * it renders as a real link once `lieferandoUrl` is set in business.json,
 * otherwise as a non-clickable "coming soon" chip (no fake link).
 */
export function OrderButtons({ order, long = false, className = '' }: { order: Order; long?: boolean; className?: string }) {
  return (
    <div className={`order ${className}`}>
      {telHref ? (
        <a className="btn btn--red" href={telHref}>
          <IconPhone className="btn__icon" />
          <span>{long ? order.callLong : order.call}</span>
          <IconArrow className="btn__icon btn__arrow" />
        </a>
      ) : (
        <span className="btn btn--pending" role="note">
          <IconPhone className="btn__icon" />
          <span>{order.phonePending}</span>
        </span>
      )}
      {lieferandoHref ? (
        <a className="btn btn--ghost" href={lieferandoHref} target="_blank" rel="noopener noreferrer">
          <span>{order.lieferando}</span>
          <IconArrow className="btn__icon btn__arrow" />
        </a>
      ) : (
        <span className="btn btn--chip" role="note">
          <span>{order.lieferandoSoon}</span>
        </span>
      )}
      {telHref && phoneLabel && <span className="order__number">{phoneLabel}</span>}
    </div>
  );
}
