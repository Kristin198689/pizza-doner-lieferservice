import Image from 'next/image';
import { IconBag, IconMoped } from './Icons';
import { OrderButtons } from './OrderButtons';
import { biz } from '@/lib/i18n';
import type { Messages } from '@/lib/i18n';

export function Fulfillment({ t, order }: { t: Messages['fulfillment']; order: Messages['order'] }) {
  const addr = [biz.streetAddress, [biz.postalCode, biz.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return (
    <section className="ful" id="delivery">
      <div className="ful__main">
        <p className="eyebrow" data-reveal>{t.eyebrow}</p>
        <h2 className="display ful__title" data-reveal>
          {t.title}
          <em>{t.accent}</em>
        </h2>
        <ul className="ful__modes" data-reveal>
          <li><IconMoped className="ful__icon" /><div><b>{t.delivery}</b><span>{t.deliveryText}</span></div></li>
          <li><IconBag className="ful__icon" /><div><b>{t.pickup}</b><span>{t.pickupText}</span></div></li>
        </ul>
        <OrderButtons order={order} long className="ful__order" />
        <p className="ful__noseats">{t.noSeats}</p>
        <dl className="ful__facts">
          <div><dt>{t.address}</dt><dd>{addr || t.pending}</dd></div>
          <div><dt>{t.hours}</dt><dd>{biz.businessHours.length ? biz.businessHours.join(' · ') : t.pending}</dd></div>
        </dl>
      </div>
      <div className="ful__art" aria-hidden="false">
        <Image className="ful__bag" src="/assets/packaging/kraft_bag_provisional.png" alt={t.bagAlt} width={273} height={316} sizes="280px" data-parallax="30" />
        <Image className="ful__deco ful__deco--a" src="/assets/ingredients/red_pepper_rings.png" alt="" aria-hidden width={378} height={301} sizes="200px" data-parallax="-50" />
        <Image className="ful__deco ful__deco--b" src="/assets/ingredients/mixed_herbs_spices.png" alt="" aria-hidden width={366} height={319} sizes="200px" data-parallax="40" />
        <Image className="ful__deco ful__deco--c" src="/assets/ingredients/cherry_tomatoes.png" alt="" aria-hidden width={357} height={329} sizes="180px" data-parallax="60" />
      </div>
    </section>
  );
}
