import type { HTMLAttributes, Ref } from 'react';
import { t } from '../../../lib/i18n';
import { themes, useTheme, type Theme } from '../../../lib/OmniaThemeProvider';
import { Icon, type IconGlyph } from '../Icon';
import styles from './ThemeSwitcher.module.css';

export interface ThemeSwitcherProps extends HTMLAttributes<HTMLDivElement> {
  /** Reaches the group root. */
  ref?: Ref<HTMLDivElement>;
}

const glyphs: Record<Theme, IconGlyph> = { light: 'sun', dark: 'moon' };
const labels = {
  light: 'themeSwitcher.light',
  dark: 'themeSwitcher.dark',
} as const satisfies Record<Theme, string>;

/**
 * Segmented toggle for the light/dark theme axis (not the skin). Reads `theme` and calls `setTheme`
 * on the nearest `OmniaThemeProvider`, so it takes no value props — the provider is the single
 * source of truth. One icon-only button per theme, each with a localized accessible name; the active
 * one carries `aria-pressed`. The group root gets a localized accessible name; `className`, `style`
 * and `ref` land on it, and any other native attribute spreads onto it.
 */
export function ThemeSwitcher({ className, ref, ...rest }: ThemeSwitcherProps) {
  const { theme, setTheme, locale } = useTheme();
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      role="group"
      aria-label={t('themeSwitcher.label', locale)}
      className={classes}
      data-scope="theme-switcher"
      data-part="root"
      {...rest}
    >
      {themes.map((option) => {
        const active = option === theme;
        return (
          <button
            key={option}
            type="button"
            className={styles.option}
            aria-label={t(labels[option], locale)}
            aria-pressed={active}
            onClick={() => setTheme(option)}
            data-scope="theme-switcher"
            data-part="option"
            data-active={active || undefined}
          >
            <Icon glyph={glyphs[option]} variantStyle="solid" variantSize="sm" />
          </button>
        );
      })}
    </div>
  );
}
