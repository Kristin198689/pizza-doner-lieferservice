import Image from 'next/image';
import { OrderButtons } from './OrderButtons';
import { IconArrow } from './Icons';
import { biz, telHref } from '@/lib/i18n';
import type { Messages } from '@/lib/i18n';

export function Fulfillment({ t, order }: { t: Messages['fulfillment']; order: Messages['order'] }) {
  const addr = [biz.streetAddress, [biz.postalCode, biz.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const hours = biz.businessHours.length ? biz.businessHours.join(' · ') : '';
  return (
    <section className="cta" id="delivery">
      <div className="cta__main">
        <p className="eyebrow" data-reveal>{t.eyebrow}</p>
        <div className="cta__titlebox">
          <h2 className="display cta__title" data-reveal>
            {t.title}
            <em>{t.accent}</em>
          </h2>
        </div>
        <div className="cta__btns" data-reveal>
          <OrderButtons order={order} long className="cta__order" />
          {telHref && (
            <a className="btn btn--ghost" href="#menu">
              <span>{order.viewMenu}</span>
              <IconArrow className="btn__icon btn__arrow" />
            </a>
          )}
        </div>
        {(addr || hours) && (
          <dl className="cta__facts" data-reveal>
            {addr && <div><dt>{t.address}</dt><dd>{addr}</dd></div>}
            {hours && <div><dt>{t.hours}</dt><dd>{hours}</dd></div>}
          </dl>
        )}
      </div>
      <div className="cta__art">
        <Image className="cta__bag" src="/assets/packaging/kraft_bag_provisional.png" alt={t.bagAlt} width={273} height={316} sizes="(max-width: 760px) 62vw, 380px" data-parallax="24" />
      </div>
    </section>
  );
}
