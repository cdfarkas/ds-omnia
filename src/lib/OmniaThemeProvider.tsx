import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getLocale, locales, setLocale as setModuleLocale, type Locale } from './i18n';

export const themes = ['light', 'dark'] as const;
export type Theme = (typeof themes)[number];

export const skins = ['default', 'pixel', 'brutalist'] as const;
export type Skin = (typeof skins)[number];

export interface ThemeState {
  theme: Theme;
  skin: Skin;
  locale: Locale;
}

export interface ThemeContextValue extends ThemeState {
  setTheme: (theme: Theme) => void;
  setSkin: (skin: Skin) => void;
  setLocale: (locale: Locale) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'omnia-theme';

function readStored(): Partial<ThemeState> {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<ThemeState>) : {};
  } catch {
    return {};
  }
}

function writeStored(state: Partial<ThemeState>): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort: no storage (SSR, private mode) just means no persistence.
  }
}

function pickStored<T extends string>(
  key: keyof ThemeState,
  allowed: readonly T[],
  fallback: T,
): T {
  const stored = readStored()[key];
  return typeof stored === 'string' && (allowed as readonly string[]).includes(stored)
    ? (stored as T)
    : fallback;
}

function useAxis<T>(
  controlled: T | undefined,
  init: () => T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [internal, setInternal] = useState(init);
  const value = controlled ?? internal;
  const set = useCallback(
    (next: T) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [value, set];
}

export interface OmniaThemeProviderProps {
  theme?: Theme;
  skin?: Skin;
  locale?: Locale;
  defaultTheme?: Theme;
  defaultSkin?: Skin;
  defaultLocale?: Locale;
  onThemeChange?: (theme: Theme) => void;
  onSkinChange?: (skin: Skin) => void;
  onLocaleChange?: (locale: Locale) => void;
  children?: ReactNode;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  skin: 'default',
  locale: 'en',
  setTheme: () => {},
  setSkin: () => {},
  setLocale: () => {},
  toggleTheme: () => {},
});

/**
 * Omnia's single theming mechanism, now stateful (ADR 0025, supersedes ADR 0017). Sets
 * `data-theme`/`data-skin` and `lang` on the document root — the single source of truth the token layer reads —
 * and exposes `{ theme, skin, locale }` plus setters through `useTheme()`. Controlled when a
 * `theme`/`skin`/`locale` prop is passed (props win, setters fire `onThemeChange`/`onSkinChange`/
 * `onLocaleChange`); otherwise the provider owns the state and persists it to `localStorage`.
 */
export function OmniaThemeProvider({
  theme: themeProp,
  skin: skinProp,
  locale: localeProp,
  defaultTheme = 'light',
  defaultSkin = 'default',
  defaultLocale = 'en',
  onThemeChange,
  onSkinChange,
  onLocaleChange,
  children,
}: OmniaThemeProviderProps): ReactNode {
  const [theme, setTheme] = useAxis(
    themeProp,
    () => pickStored('theme', themes, defaultTheme),
    onThemeChange,
  );
  const [skin, setSkin] = useAxis(
    skinProp,
    () => pickStored('skin', skins, defaultSkin),
    onSkinChange,
  );
  const [locale, setLocale] = useAxis(
    localeProp,
    () => pickStored('locale', locales, defaultLocale),
    onLocaleChange,
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Keep the non-reactive i18n module in step so `t()`/`getLocale()` work for non-React callers.
  if (getLocale() !== locale) setModuleLocale(locale);

  useEffect(() => {
    const { documentElement } = document;
    documentElement.setAttribute('data-theme', theme);
    documentElement.setAttribute('data-skin', skin);
    documentElement.lang = locale;
  }, [theme, skin, locale]);

  useEffect(() => {
    const next: Partial<ThemeState> = {};
    if (themeProp === undefined) next.theme = theme;
    if (skinProp === undefined) next.skin = skin;
    if (localeProp === undefined) next.locale = locale;
    if (Object.keys(next).length > 0) writeStored({ ...readStored(), ...next });
  }, [theme, skin, locale, themeProp, skinProp, localeProp]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, skin, locale, setTheme, setSkin, setLocale, toggleTheme }),
    [theme, skin, locale, setTheme, setSkin, setLocale, toggleTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

/** Read the active theme, skin and locale, plus their setters, from the nearest provider. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Inline `<head>` script that applies the persisted (or fallback) theme/skin to the document root
 * before first paint, avoiding a flash before the provider's effect runs. Inject the returned string
 * via `dangerouslySetInnerHTML` on a `<script>` placed ahead of the app markup.
 */
export function getThemeInitScript(
  fallback: { theme?: Theme; skin?: Skin } = {},
): string {
  const theme = JSON.stringify(fallback.theme ?? 'light');
  const skin = JSON.stringify(fallback.skin ?? 'default');
  return `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||'{}'),r=document.documentElement;r.setAttribute('data-theme',s.theme||${theme});r.setAttribute('data-skin',s.skin||${skin});}catch(e){}})();`;
}
