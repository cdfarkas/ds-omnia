import type { HTMLAttributes, Ref } from 'react';
import { locales, t, type Locale } from '../../../lib/i18n';
import { useTheme } from '../../../lib/OmniaThemeProvider';
import styles from './LanguageSwitcher.module.css';

/** Each locale's name in its own language (endonym), rendered with the matching `lang`. */
const endonyms: Record<Locale, string> = { en: 'English', fr: 'Français' };

export interface LanguageSwitcherProps extends HTMLAttributes<HTMLDivElement> {
  /** Reaches the group root. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Segmented toggle for the FR/EN locale axis. Reads `locale` and calls `setLocale` on the nearest
 * `OmniaThemeProvider`, so it takes no value props — the provider is the single source of truth.
 * One button per locale, each labelled with its own endonym and `lang`; the active one carries
 * `aria-pressed`. The group root gets a localized accessible name; `className`, `style` and `ref`
 * land on it, and any other native attribute spreads onto it.
 */
export function LanguageSwitcher({ className, ref, ...rest }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTheme();
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      role="group"
      aria-label={t('languageSwitcher.label', locale)}
      className={classes}
      data-scope="language-switcher"
      data-part="root"
      {...rest}
    >
      {locales.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            className={styles.option}
            aria-pressed={active}
            onClick={() => setLocale(option)}
            data-scope="language-switcher"
            data-part="option"
            data-active={active || undefined}
          >
            {endonyms[option]}
          </button>
        );
      })}
    </div>
  );
}
