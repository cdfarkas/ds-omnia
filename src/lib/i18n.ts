import { en } from '../translations/en';
import { fr } from '../translations/fr';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export type TranslationKey = keyof typeof en;

/** Each locale's own name (endonym), for rendering a locale with its matching `lang`. */
export const localeNames: Record<Locale, string> = { en: 'English', fr: 'Français' };

/** Component wordings as one synchronizable object; a consuming app merges these into its own store. */
export const translations: Record<Locale, Record<TranslationKey, string>> = { en, fr };

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

/** Resolve a typed key to its string in the given (or current) locale, falling back to English. */
export function t(key: TranslationKey, locale: Locale = currentLocale): string {
  return translations[locale][key] ?? translations.en[key];
}
