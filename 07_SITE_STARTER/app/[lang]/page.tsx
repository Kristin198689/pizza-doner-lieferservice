import { Header } from '@/components/Header';
import { HeroMotion } from '@/components/HeroMotion';
import { Runway } from '@/components/Runway';
import { TypographyTakeover } from '@/components/TypographyTakeover';
import { LimeScene } from '@/components/LimeScene';
import { BoxScene } from '@/components/BoxScene';
import { EditorialMenu } from '@/components/EditorialMenu';
import { DonerRotation } from '@/components/DonerRotation';
import { FoodOrbit } from '@/components/FoodOrbit';
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
        <TypographyTakeover t={t.takeover} sliceAlt={t.hero.sliceAlt} />
        <Runway t={t.runway} />
        <DonerRotation t={t.doner} />
        <FoodOrbit t={t.orbit} />
        <LimeScene t={t.lime} alt={t.runway.yufkaAlt} word={t.runway.yufka} />
        <BoxScene t={t.box} />
        <EditorialMenu t={t.menu} locale={locale} />
        <Fulfillment t={t.fulfillment} order={t.order} />
      </main>
      <Footer t={t.footer} locale={locale} />
      {telHref && <div className="stickycall"><OrderButtons order={t.order} /></div>}
      <ScrollFx />
    </>
  );
}
