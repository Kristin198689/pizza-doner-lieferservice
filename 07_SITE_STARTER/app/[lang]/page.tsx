import { Header } from '@/components/Header';
import { HeroMotion } from '@/components/HeroMotion';
import { Runway } from '@/components/Runway';
import { TypographyTakeover } from '@/components/TypographyTakeover';
import { BoxScene } from '@/components/BoxScene';
import { EditorialMenu } from '@/components/EditorialMenu';
import { DonerRotation } from '@/components/DonerRotation';
import { ProductRail } from '@/components/ProductRail';
import { EightTimes } from '@/components/EightTimes';
import { IngredientTunnel } from '@/components/IngredientTunnel';
import { SectionBreak } from '@/components/SectionBreak';
import { DepthLayers } from '@/components/DepthLayers';
import { Fulfillment } from '@/components/Fulfillment';
import { Footer } from '@/components/Footer';
import { ScrollFx } from '@/components/ScrollFx';
import { CallFab } from '@/components/CallFab';
import { getMessages, telHref } from '@/lib/i18n';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { locale, t } = getMessages(lang);
  const boxWords = t.box.eyebrow.split(/[.\s]+/).filter(Boolean).filter((w) => w.length > 2).slice(0, 2);
  return (
    <>
      <Header locale={locale} nav={t.nav} phonePending={t.order.phonePending} tel={telHref} />
      <main>
        <HeroMotion t={t.hero} order={t.order} limeT={t.lime} yufkaAlt={t.runway.yufkaAlt} />
        <TypographyTakeover t={t.takeover} sliceAlt={t.hero.sliceAlt} />
        <SectionBreak variant="words" from="red" short words={[t.takeover.a, t.takeover.b]} />
        <Runway t={t.runway} />
        <SectionBreak variant="roll" from="cream" words={[t.runway.pizza]} sprite="tomato_half.png" spriteSize={[304, 277]} />
        <DonerRotation t={t.doner} />
        <IngredientTunnel word={t.doner.accent} />
        <ProductRail t={t.orbit} />
        <EightTimes t={t.eight} />
        <SectionBreak variant="words" from="lime" tall words={boxWords} />
        <BoxScene t={t.box} />
        <DepthLayers t={t.depth} />
        <SectionBreak variant="roll" from="green" words={[t.takeover.b]} sprite="red_pepper_rings.png" spriteSize={[378, 301]} />
        <EditorialMenu t={t.menu} locale={locale} />
        <SectionBreak variant="wipe" from="cream" to="red" words={[t.fulfillment.title]} />
        <Fulfillment t={t.fulfillment} order={t.order} />
      </main>
      <Footer t={t.footer} locale={locale} />
      <CallFab label={t.nav.fabCall} tel={telHref} />
      <ScrollFx />
    </>
  );
}
