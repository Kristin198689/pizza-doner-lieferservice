import de from '../content/de.json';
import en from '../content/en.json';
import uk from '../content/uk.json';
import business from '../config/business.json';

export const locales = ['de', 'en', 'uk'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';
export type Messages = typeof de;

const messages: Record<Locale, Messages> = { de, en, uk } as Record<Locale, Messages>;

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}
export function getMessages(lang: string): { locale: Locale; t: Messages } {
  const locale = isLocale(lang) ? lang : defaultLocale;
  return { locale, t: messages[locale] };
}

export const biz = business;
export const telHref = business.phoneE164 ? `tel:${business.phoneE164}` : null;
export const phoneLabel = business.phoneDisplay || business.phoneE164 || '';
export const lieferandoHref = business.lieferandoUrl ? business.lieferandoUrl : null;
