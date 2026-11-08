import { IconArrow, IconPhone } from './Icons';
import { lieferandoHref, phoneLabel, telHref } from '@/lib/i18n';

type Order = { call: string; callLong: string; viewMenu: string; lieferando: string; lieferandoSoon?: string; phonePending?: string };

/**
 * Primary route is a phone call once a number is configured; until then the button leads to the menu.
 * No placeholder/disabled buttons are ever rendered. Lieferando appears only when a real URL is configured.
 */
export function OrderButtons({ order, long = false, className = '' }: { order: Order; long?: boolean; className?: string }) {
  return (
    <div className={`order ${className}`}>
      {telHref ? (
        <a className="btn btn--red" href={telHref}>
          <IconPhone className="btn__icon" />
          <span>{long ? order.callLong : order.call}</span>
        </a>
      ) : (
        <a className="btn btn--red" href="#menu">
          <span>{order.viewMenu}</span>
          <IconArrow className="btn__icon btn__arrow" />
        </a>
      )}
      {lieferandoHref && (
        <a className="btn btn--ghost" href={lieferandoHref} target="_blank" rel="noopener noreferrer">
          <span>{order.lieferando}</span>
          <IconArrow className="btn__icon btn__arrow" />
        </a>
      )}
      {telHref && phoneLabel && <span className="order__number">{phoneLabel}</span>}
    </div>
  );
}
