import Image from 'next/image';
import { DrinksArt } from './DrinksArt';
import { HalalBadge } from './HalalBadge';
import { formatPrice, menuData } from '@/lib/menu';
import type { Locale, Messages } from '@/lib/i18n';

/** Each category is a full product screen: the product is the hero, the list is a narrow editorial column. */
const LOOK: Record<string, { theme: string; side: 'l' | 'r'; imgs: string[] }> = {
  pizza: { theme: 'cream', side: 'l', imgs: ['food/pizza_toppings_airborne_reference.png'] },
  doner: { theme: 'ink', side: 'r', imgs: ['food/doner_sandwich.png'] },
  yufka: { theme: 'red', side: 'l', imgs: ['food/yufka_wrap.png'] },
  burger: { theme: 'cream', side: 'r', imgs: ['food/cheeseburger.png'] },
  snacks: { theme: 'ink', side: 'l', imgs: ['food/fries.png', 'food/nuggets.png'] },
  drinks: { theme: 'green', side: 'r', imgs: [] },
};

export function EditorialMenu({ t, locale }: { t: Messages['menu']; locale: Locale }) {
  const { categories, pricesConfirmed, currency, isDemoContent } = menuData;
  return (
    <div className="pms" id="menu">
      <header className="pms__head" data-reveal>
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="display">{t.title}</h2>
        <p className="pms__lead">{t.body}</p>
        <div className="pms__tags">
          <HalalBadge className="halal--ink" />
          {isDemoContent && <p className="pms__demo" role="note">{t.demoNote}</p>}
        </div>
      </header>

      {categories.map((cat, ci) => {
        const look = LOOK[cat.id] ?? { theme: 'cream', side: 'l' as const, imgs: [] };
        return (
          <section className={`pm pm--${look.theme} pm--${look.side}`} id={`menu-${cat.id}`} key={cat.id} aria-labelledby={`h-${cat.id}`}>
            <div className="pm__art" aria-hidden={cat.id === 'drinks' ? undefined : 'true'}>
              {cat.id === 'drinks' ? (
                <DrinksArt className="pm__drinks" />
              ) : (
                look.imgs.map((src, k) => (
                  <Image key={src} className={`pm__img pm__img--${k}`} src={`/assets/${src}`} alt="" width={1254} height={1254} sizes="(max-width: 899px) 100vw, 64vw" data-parallax={k ? '-30' : '30'} />
                ))
              )}
            </div>
            <div className="pm__body" data-reveal>
              <span className="pm__no" aria-hidden="true">{String(ci + 1).padStart(2, '0')}</span>
              <h3 id={`h-${cat.id}`}>{cat.name[locale]}</h3>
              <p className="pm__note">{cat.note[locale]}</p>
              <ul className="pm__list">
                {cat.items.filter((i) => i.available).map((item) => (
                  <li key={item.id}>
                    <div className="pm__row">
                      <h4>{item.name[locale]}</h4>
                      <span className="pm__leader" aria-hidden="true" />
                      <span className="pm__price">
                        {item.variants.map((v, vi) => {
                          const known = pricesConfirmed && v.price != null;
                          return (
                            <span key={vi} className={known ? '' : 'pm__price--pending'}>
                              {v.label ? `${v.label} · ` : ''}
                              {known ? formatPrice(v.price as number, locale, currency) : vi === 0 ? t.pricePending : '—'}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                    <p className="pm__desc">{item.description[locale]}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
      <p className="pms__pending">{t.pending}</p>
    </div>
  );
}
