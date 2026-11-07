import Image from 'next/image';
import { DonerSpit } from './DonerSpit';
import type { Messages } from '@/lib/i18n';

export function Runway({ t }: { t: Messages['runway'] }) {
  return (
    <section className="runway" id="products">
      <header className="runway__head" data-reveal>
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="display">
          {t.title}
          <em>{t.accent}</em>
        </h2>
      </header>

      <article className="chapter chapter--pizza">
        <span className="chapter__word" aria-hidden="true" data-parallax="60">PIZZA</span>
        <div className="chapter__media" data-parallax="40">
          <Image src="/assets/food/pizza_toppings_airborne_reference.png" alt="" aria-hidden width={1254} height={1254} sizes="(max-width: 767px) 100vw, 58vw" />
          <Image className="chapter__deco chapter__deco--a" src="/assets/ingredients/basil_sprig.png" alt="" aria-hidden width={360} height={316} sizes="160px" data-parallax="-50" />
          <Image className="chapter__deco chapter__deco--b" src="/assets/ingredients/cherry_tomatoes.png" alt="" aria-hidden width={357} height={329} sizes="160px" data-parallax="70" />
        </div>
        <div className="chapter__text" data-reveal>
          <span className="chapter__no" aria-hidden="true">01</span>
          <h3>{t.pizza}</h3>
          <p>{t.pizzaText}</p>
        </div>
      </article>

      <article className="chapter chapter--doner">
        <span className="chapter__word" aria-hidden="true" data-parallax="60">DÖNER</span>
        <div className="chapter__text" data-reveal>
          <span className="chapter__no" aria-hidden="true">02</span>
          <h3>{t.doner}</h3>
          <p>{t.donerText}</p>
        </div>
        <div className="chapter__media chapter__media--doner">
          <DonerSpit alt={t.spitAlt} />
          <div className="chapter__sandwich" data-parallax="30">
            <Image src="/assets/food/doner_sandwich.png" alt={t.donerAlt} width={1254} height={1254} sizes="(max-width: 767px) 90vw, 44vw" />
          </div>
          <Image className="chapter__deco chapter__deco--c" src="/assets/ingredients/red_pepper_rings.png" alt="" aria-hidden width={378} height={301} sizes="160px" data-parallax="-40" />
          <Image className="chapter__deco chapter__deco--d" src="/assets/ingredients/mixed_herbs_spices.png" alt="" aria-hidden width={366} height={319} sizes="160px" data-parallax="50" />
        </div>
      </article>
    </section>
  );
}
