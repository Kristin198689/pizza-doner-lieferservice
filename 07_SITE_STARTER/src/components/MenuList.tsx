import Image from 'next/image';
import type { Messages } from '@/lib/i18n';

const IMG: Record<string, { src: string; w?: number }[]> = {
  pizza: [{ src: 'food/pizza_slice_cheese_pull.png' }],
  doner: [{ src: 'food/doner_sandwich.png' }],
  yufka: [{ src: 'food/yufka_wrap.png' }],
  burger: [{ src: 'food/cheeseburger.png' }],
  snacks: [{ src: 'food/fries.png' }, { src: 'food/nuggets.png' }],
};

function DrinkArt() {
  return (
    <svg className="menu__drink" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <g stroke="#09090b" strokeWidth="5" strokeLinejoin="round">
        <rect x="40" y="52" width="74" height="150" rx="12" fill="#f21d32" />
        <rect x="40" y="96" width="74" height="40" fill="#f6f2e9" />
        <ellipse cx="77" cy="52" rx="37" ry="9" fill="#c6c6c2" />
        <path d="M130 84h76l-9 118a10 10 0 0 1-10 9h-38a10 10 0 0 1-10-9l-9-118Z" fill="#c9ff27" fillOpacity=".55" />
        <path d="M168 84 186 28l14 4" fill="none" />
      </g>
      <circle cx="152" cy="130" r="7" fill="#f6f2e9" /><circle cx="176" cy="156" r="5" fill="#f6f2e9" /><circle cx="160" cy="180" r="6" fill="#f6f2e9" />
    </svg>
  );
}

export function MenuList({ t }: { t: Messages['menu'] }) {
  return (
    <section className="menu" id="menu">
      <header className="menu__head" data-reveal>
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="display">{t.title}</h2>
        <p className="menu__lead">{t.body}</p>
      </header>
      <ol className="menu__rows">
        {t.items.map((it, i) => (
          <li className="menu__row" id={`menu-${it.key}`} key={it.key} data-reveal>
            <span className="menu__no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div className="menu__text">
              <h3>{it.name}</h3>
              <p>{it.hint}</p>
            </div>
            <div className="menu__art" aria-hidden={it.key === 'drinks' ? 'true' : undefined}>
              {it.key === 'drinks' ? (
                <DrinkArt />
              ) : (
                IMG[it.key].map((im, k) => (
                  <Image key={im.src} className={`menu__img menu__img--${k}`} src={`/assets/${im.src}`} alt={k === 0 ? it.alt : ''} width={1254} height={1254} sizes="(max-width: 767px) 120px, 280px" />
                ))
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="menu__pending">{t.pending}</p>
      <Image className="menu__deco menu__deco--a" src="/assets/ingredients/black_olives.png" alt="" aria-hidden width={360} height={292} sizes="150px" data-parallax="40" />
      <Image className="menu__deco menu__deco--b" src="/assets/ingredients/basil_leaf_single.png" alt="" aria-hidden width={325} height={297} sizes="150px" data-parallax="-40" />
    </section>
  );
}
