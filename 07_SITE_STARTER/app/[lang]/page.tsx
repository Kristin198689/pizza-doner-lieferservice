import { Header } from '@/components/Header';
import { HeroMotion } from '@/components/HeroMotion';
import { Runway } from '@/components/Runway';
import { LimeScene } from '@/components/LimeScene';
import { BoxScene } from '@/components/BoxScene';
import { MenuList } from '@/components/MenuList';
import { Fulfillment } from '@/components/Fulfillment';
import { Footer } from '@/components/Footer';
import { ScrollFx } from '@/components/ScrollFx';
import { OrderButtons } from '@/components/OrderButtons';
import { getMessages, telHref } from '@/lib/i18n';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { locale, t } = getMessages(lang);
  return (
    <>
      <Header locale={locale} nav={t.nav} phonePending={t.order.phonePending} tel={telHref} />
      <main>
        <HeroMotion t={t.hero} order={t.order} quick={t.quick} />
        <Runway t={t.runway} />
        <LimeScene t={t.lime} alt={t.runway.yufkaAlt} />
        <BoxScene t={t.box} />
        <MenuList t={t.menu} />
        <Fulfillment t={t.fulfillment} order={t.order} />
      </main>
      <Footer t={t.footer} locale={locale} />
      {telHref && <div className="stickycall"><OrderButtons order={t.order} /></div>}
      <ScrollFx />
    </>
  );
}
