import { describe, expect, test } from 'vitest';
import {
  getLocale,
  locales,
  localeNames,
  setLocale,
  t,
  translations,
  type TranslationKey,
} from './i18n';

describe('t()', () => {
  test('resolves against the current locale', () => {
    setLocale('fr');
    expect(getLocale()).toBe('fr');
    expect(t('button.loading')).toBe('Chargement');
    setLocale('en');
    expect(t('button.loading')).toBe('Loading');
  });

  test('an explicit locale argument overrides the current one', () => {
    setLocale('en');
    expect(t('button.loading', 'fr')).toBe('Chargement');
  });

  test('an out-of-contract key resolves through the English fallback to undefined', () => {
    expect(t('does-not-exist' as TranslationKey, 'en')).toBeUndefined();
  });
});

describe('translations export', () => {
  test('every locale covers the same keys', () => {
    const [reference, ...rest] = locales.map((locale) =>
      Object.keys(translations[locale]).sort(),
    );
    for (const keys of rest) {
      expect(keys).toEqual(reference);
    }
  });
});

describe('localeNames', () => {
  test('covers every locale', () => {
    expect(Object.keys(localeNames).sort()).toEqual([...locales].sort());
  });
});
