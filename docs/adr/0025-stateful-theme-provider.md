# ADR 0025 — Stateful OmniaThemeProvider (controlled + uncontrolled)

## Status

Accepted <!-- supersedes ADR 0017 -->

## Context

ADR 0017 made `OmniaThemeProvider` Omnia's single theming mechanism, writing `data-theme`/`data-skin`
on the document root and exposing the active pair through `useTheme()`. It was **props-only**: the
provider held no state and had no setter, so the active theme/skin could change only when a parent
re-rendered it with new props. Locale lived apart, as non-reactive module state in `src/lib/i18n`
(`setLocale`/`getLocale`), read by `t()`.

That shape cannot back a self-contained toggle. A `ThemeToggle` or `LanguageToggle` molecule needs to
read the current value and flip it from anywhere under the provider — i.e. a setter on the context —
and locale needs to be reactive so a `LanguageToggle` can drive it, not just module state.

## Decision

`OmniaThemeProvider` becomes **stateful**, following the standard controlled/uncontrolled pattern,
and folds locale into the same context.

- `useTheme()` returns `{ theme, skin, locale, setTheme, setSkin, setLocale, toggleTheme }`.
- **Controlled**: pass a `theme`/`skin`/`locale` prop and that axis is controlled — the prop wins and
  the setter calls `onThemeChange`/`onSkinChange`/`onLocaleChange` instead of mutating internal
  state. The callbacks use these non-native names, never `onChange`, per ADR 0015 (a native handler
  name carrying a custom payload is banned).
- **Uncontrolled**: omit the prop and the provider owns that axis. Setters mutate internal state,
  which is persisted to `localStorage` under one key (`omnia-theme`) and read back on init, guarded
  for SSR / no-storage. A `defaultTheme`/`defaultSkin`/`defaultLocale` prop seeds the initial value.
- The provider still writes `data-theme`/`data-skin` on the **document root** — ADR 0017's
  single-source-of-truth contract is unchanged.
- Locale is reactive provider state. To keep non-React callers of `t()`/`getLocale()` working, the
  provider mirrors its locale into the i18n module on change; `setLocale`/`getLocale` stay exported.
- **No flash**: `getThemeInitScript()` returns an inline `<head>` script that applies the persisted
  (or fallback) attributes before first paint, since the provider's attribute write runs in an effect
  after hydration.
- Storybook drives the provider in controlled mode from one decorator reading the `theme`/`skin`/
  `locale` toolbar globals — the catalogue behaves exactly as under ADR 0017.

`Localized`/`useLocale` (Storybook Docs/MDX helpers that read the toolbar global directly) are
unchanged; they remain the MDX-prose mechanism and are out of the provider's scope.

## Consequences

- A self-contained toggle molecule is now possible: `const { theme, toggleTheme } = useTheme()`.
- Trade-off: a stateful provider can conflict with an app that already owns its theme state. The
  controlled escape hatch is the answer — such an app passes the props and handles the callbacks, and
  the provider never writes `localStorage` for a controlled axis. Control is per-axis, so one axis can
  be controlled while another is owned by the provider.
- Persistence is best-effort: a private-mode or SSR environment with no `localStorage` simply keeps no
  state across reloads; both the init script and the provider no-op cleanly.
- The provider is not part of the generated component manifest (ADR 0023 indexes only the atoms
  exported via `export *` from `src/index.ts`), so this API change produces no manifest diff.
- Evidence: the acceptance gates pass — `pnpm lint`, `pnpm typecheck`, `pnpm test` (unit +
  interaction + a11y across the four modes, plus a new `OmniaThemeProvider.test.tsx` covering
  controlled, uncontrolled, persistence and locale), and `pnpm build-storybook`. No rendered output
  changed — Storybook drives the provider from the same toolbar globals — so `visual-check` is N/A.
  Per governance, this PR supersedes ADR 0017, which is marked superseded; its document-root contract
  stays in force.
