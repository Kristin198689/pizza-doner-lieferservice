import Image from 'next/image';
import Link from 'next/link';
import de from '../../src/content/de.json';
import en from '../../src/content/en.json';
import uk from '../../src/content/uk.json';
import business from '../../src/config/business.json';
import {HeroMotion} from '../../src/components/HeroMotion';
const messages={de,en,uk}; type Locale=keyof typeof messages;
export function generateStaticParams(){return [{lang:'de'},{lang:'en'},{lang:'uk'}]}
export default async function Page({params}:{params:Promise<{lang:string}>}){
 const {lang}=await params; const locale=(lang in messages?lang:'de') as Locale;const t=messages[locale];
 const tel=business.phoneE164?`tel:${business.phoneE164}`:null;
 return <><header className="header"><Link href={`/${locale}`} className="brand">PIZZA <span>&</span> DÖNER</Link><nav><a href="#menu">{t.nav.menu}</a><a href="#delivery">{t.nav.delivery}</a><a href="#delivery">{t.nav.pickup}</a></nav><div className="lang">{(['de','en','uk'] as const).map(l=><Link key={l} href={`/${l}`} aria-current={l===locale?'page':undefined}>{l.toUpperCase()}</Link>)}</div>{tel?<a className="cta small" href={tel}>{t.nav.call} ↗</a>:<span className="call-pending">{t.ui.disabledPhone}</span>}</header>
 <main><HeroMotion t={t.hero}/><section className="statement" id="products"><p className="eyebrow">{t.runway.eyebrow}</p><h2>{t.runway.title}<em>{t.runway.accent}</em></h2><div className="food-runway"><div><Image src="/assets/food/pizza_slice_cheese_pull.png" alt="Pizza with melted cheese" width={800} height={800}/><b>{t.runway.pizza}</b></div><div><Image src="/assets/food/doner_sandwich.png" alt="Döner sandwich" width={800} height={800}/><b>{t.runway.doner}</b></div><div><Image src="/assets/food/yufka_wrap.png" alt="Yufka wrap" width={800} height={800}/><b>{t.runway.yufka}</b></div></div></section>
 <section className="box-scene"><p className="eyebrow">{t.box.eyebrow}</p><h2>{t.box.title}</h2><Image src="/assets/packaging/pizza_box_open_steam.png" alt="Hot pizza in open takeaway box" width={1200} height={900}/><p>{t.box.body}</p></section>
 <section className="lime-scene"><p className="eyebrow">{t.lime.eyebrow}</p><h2>{t.lime.title}<em>{t.lime.accent}</em></h2><Image src="/assets/food/yufka_wrap.png" alt="Yufka wrap" width={900} height={900}/><p>{t.lime.body}</p></section>
 <section className="menu" id="menu"><p className="eyebrow">{t.menu.eyebrow}</p><h2>{t.menu.title}</h2><p>{t.menu.body}</p><div className="menu-categories">{Object.entries(t.menu.categories).map(([key,value])=><span key={key}>{value}</span>)}</div><p className="muted">{t.menu.pending}</p></section>
 <section className="contact" id="delivery"><p className="eyebrow">{t.fulfillment.eyebrow}</p><h2>{t.fulfillment.title}<em>{t.fulfillment.accent}</em></h2><div className="contact-options"><span>{t.fulfillment.delivery}</span><span>{t.fulfillment.pickup}</span></div>{tel?<a className="cta" href={tel}>{t.fulfillment.call} ↗</a>:<p>{t.fulfillment.pending}</p>}<Image src="/assets/packaging/kraft_bag_provisional.png" alt="Takeaway kraft bag, placeholder branding" width={650} height={800}/></section></main>
 <footer><span>PIZZA & DÖNER</span><a href="#top">{t.footer.back} ↑</a><small>{t.footer.placeholder}</small></footer></>;
}
