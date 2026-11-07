import Image from 'next/image';
import { formatPrice, menuData } from '@/lib/menu';
import type { Locale, Messages } from '@/lib/i18n';

export function EditorialMenu({ t, locale }: { t: Messages['menu']; locale: Locale }) {
  const { categories, pricesConfirmed, currency, isDemoContent } = menuData;
  return (
    <section className="fm" id="menu">
      <header className="fm__head" data-reveal>
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="display">{t.title}</h2>
        <p className="fm__lead">{t.body}</p>
        {isDemoContent && <p className="fm__demo" role="note">{t.demoNote}</p>}
      </header>

      {categories.map((cat, ci) => (
        <article className={`fm__cat${ci % 2 ? ' fm__cat--flip' : ''}`} id={`menu-${cat.id}`} key={cat.id}>
          <div className="fm__side">
            <span className="fm__no" aria-hidden="true">{String(ci + 1).padStart(2, '0')}</span>
            <h3>{cat.name[locale]}</h3>
            <p className="fm__note">{cat.note[locale]}</p>
            {cat.image && (
              <Image className="fm__photo" src={`/assets/${cat.image}`} alt="" aria-hidden width={1254} height={1254} sizes="(max-width: 899px) 60vw, 34vw" data-parallax="24" />
            )}
          </div>
          <ul className="fm__list">
            {cat.items.filter((i) => i.available).map((item) => (
              <li className="fm__item" key={item.id} data-reveal>
                <div className="fm__row">
                  <h4>{item.name[locale]}</h4>
                  <span className="fm__leader" aria-hidden="true" />
                  <span className="fm__price">
                    {item.variants.map((v, vi) => {
                      const known = pricesConfirmed && v.price != null;
                      return (
                        <span key={vi} className={known ? '' : 'fm__price--pending'}>
                          {v.label ? `${v.label} · ` : ''}
                          {known ? formatPrice(v.price as number, locale, currency) : vi === 0 ? t.pricePending : '—'}
                        </span>
                      );
                    })}
                  </span>
                </div>
                <p className="fm__desc">{item.description[locale]}</p>
              </li>
            ))}
          </ul>
        </article>
      ))}
      <p className="fm__pending">{t.pending}</p>
    </section>
  );
}
