# ADR 0027 — i18n export contract (extends ADR 0007)

## Status

Accepted — extends ADR 0007 (bilingual via typed strings + `t()`).

## Context

ADR 0007 made the system bilingual with a typed `t()` over `Record<Locale, …>` dictionaries, plus
locale-switched MDX prose. Those dictionaries (`src/translations/en.ts`, `fr.ts`), the `t()`
resolver and the `TranslationKey` type were internal to the package. A consuming app that embeds
Omnia components inherits their fixed wordings — ARIA labels, "Loading", the LanguageSwitcher's
accessible name — but had no way to read or synchronize them: it could not enumerate the keys,
pre-translate a locale it adds, or be warned when a key changes across an upgrade.

The LanguageSwitcher also carried a second, separate copy of locale metadata: an `endonyms` map
`{ en: 'English', fr: 'Français' }` hardcoded in the component, duplicating knowledge that belongs
beside `locales`.

## Decision

Export the component runtime wordings as a typed, synchronizable public contract from
`src/index.ts`:

- `translations: Record<Locale, Record<TranslationKey, string>>` — the `{ en, fr }` dictionaries as
  one object. This is the synchronizable unit, and it maps directly onto an i18next `resources`
  payload, honouring ADR 0007's two-way door.
- `TranslationKey` — the union of every wording key. An app that pins this type is warned at compile
  time when a key is added, removed or renamed on upgrade.
- `t` — the design system's resolver, for an app that wants to read a single string directly.
- `localeNames: Record<Locale, string>` — each locale's endonym (`English`, `Français`), locale
  metadata living beside `locales`. The LanguageSwitcher now reads this map instead of a private
  copy, so the endonyms have one home.

### The exported boundary — what stays Storybook-only

Authored MDX prose (`<Localized fr={…} en={…}/>` in `*.mdx`) is catalogue documentation, not
component runtime wording. It never lived in the dictionaries, is authored inline per docs page, and
carries no key. It is therefore outside this contract and stays Storybook-only. The export covers
exactly the strings a rendered component emits — labels and ARIA — and nothing the docs site renders.

### Synchronization intent

A consuming app imports `translations` and merges `translations.en` / `translations.fr` into its own
i18n store, keeping its own resolver, and pins `TranslationKey` to track the DS's keys as it evolves.
It reads `localeNames` when it renders its own locale picker. Omnia ships no sync tool and no runtime
bridge: the contract is the typed data plus the type, and the app owns the merge.

## Consequences

- `TranslationKey` values are now a public contract, like the semantic token names. Renaming or
  removing a key is a breaking change to consumers and is governed like any other ADR'd contract.
- The exported `t` carries ADR 0007's module-level `currentLocale` singleton: an app that calls it
  shares Omnia's single locale state (driven by `OmniaThemeProvider`). An app that needs independent
  locale state should merge `translations` into its own store rather than rely on the exported `t`.
- Endonyms have a single source (`localeNames`); the LanguageSwitcher and any future locale picker
  read the same map.
- No surface beyond data and types: no sync utility, no bridge, nothing added "for later".
