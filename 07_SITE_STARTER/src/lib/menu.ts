import menu from '../content/menu.json';
import type { Locale } from './i18n';

type L = Record<Locale, string>;
export type MenuVariant = { label: string | null; price: number | null };
export type MenuItem = { id: string; name: L; description: L; variants: MenuVariant[]; tags: string[]; allergens: string[]; available: boolean };
export type MenuCategory = { id: string; name: L; note: L; image: string | null; items: MenuItem[] };
export type MenuData = { currency: string; isDemoContent: boolean; pricesConfirmed: boolean; categories: MenuCategory[] };

export const menuData = menu as unknown as MenuData;

export function formatPrice(price: number, locale: Locale, currency: string) {
  return new Intl.NumberFormat(locale === 'uk' ? 'uk-UA' : locale === 'en' ? 'en-GB' : 'de-DE', { style: 'currency', currency }).format(price);
}
