# Naming study — the light/dark theme control

Date: 2026-11-05. Method: official docs, component sources and pattern pages opened during this
study. "None found" means the pages opened ship no first-party component for it, not that the
system cannot build one. "Not confirmed" means the page opened does not say.

## Question

`OmniaThemeProvider` exposes a two-value theme axis (`light`/`dark`) through `theme` + `setTheme`
(plus `toggleTheme`). In Omnia "theme" means this light/dark axis only; the other axis is "skin"
(`default`/`pixel`). Omnia needs a catalogue control that lets a user flip the theme axis. Four
things to settle before code:

1. What is the control called?
2. Is it a two-option segmented control, a single icon button, a `Switch`, or a three-way chooser?
3. Are the options worded, icon-only, or both?
4. What are its props, checked against the prop-naming rule (no native HTML name with a custom type)?

Scope: exactly two themes exist today. The provider has no `system` value.

## Survey

| System                    | Dedicated component?  | Name used                                               | Form                                           | Option labels                                                          | Active state                                                   | Src      |
| ------------------------- | --------------------- | ------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- | -------- |
| MUI                       | No                    | hook `useColorScheme`; control unnamed                  | n/a                                            | modes `light`/`dark`/`system`                                          | no a11y guidance                                               | S1       |
| Ant Design                | No                    | `ConfigProvider` + `theme.darkAlgorithm`                | n/a (config)                                   | n/a                                                                    | n/a                                                            | S2       |
| Mantine                   | No (docs demos)       | `useMantineColorScheme`                                 | `ActionIcon` demo; 4-button demo               | sun/moon icons; demo buttons Light, Dark, Auto, Clear                  | not documented                                                 | S3       |
| Radix Themes              | No                    | `appearance` prop; next-themes for switching            | n/a                                            | n/a                                                                    | n/a                                                            | S4       |
| shadcn/ui                 | Docs recipe           | "mode toggle"                                           | not confirmed                                  | not confirmed                                                          | not confirmed                                                  | S5       |
| Chakra UI v3              | Yes (CLI snippet)     | `ColorModeButton`                                       | icon button, toggles                           | icon; markup not shown                                                 | not documented                                                 | S6       |
| Nuxt UI                   | Yes, three            | `ColorModeButton`, `ColorModeSwitch`, `ColorModeSelect` | button / switch / select (system, light, dark) | sun/moon icons, configurable                                           | not documented                                                 | S7       |
| Carbon (Svelte community) | Yes (not Carbon core) | `Theme` with `render`                                   | toggle or select                               | toggle label "Dark mode"; select "Themes"                              | not documented                                                 | S8       |
| Atlassian                 | No                    | `setGlobalTheme`, `colorMode`                           | n/a                                            | `auto` (others not listed)                                             | n/a                                                            | S9       |
| GitHub Primer             | None found            | —                                                       | —                                              | —                                                                      | —                                                              | S10      |
| Fluent 2                  | None found            | —                                                       | —                                              | —                                                                      | —                                                              | S11      |
| Adobe Spectrum            | None found            | —                                                       | —                                              | —                                                                      | —                                                              | S12      |
| Shopify Polaris           | None found            | —                                                       | —                                              | —                                                                      | —                                                              | S13      |
| GOV.UK Design System      | No                    | —                                                       | —                                              | —                                                                      | —                                                              | S14      |
| Docusaurus                | Yes (built-in)        | `ColorModeToggle`; docs say "navbar switch"             | one icon button cycling light/dark/system      | icons; `aria-label` "Switch between dark and light mode (currently …)" | no `aria-pressed`, no `role="switch"`; label carries the state | S15, S16 |
| VitePress                 | Yes (built-in)        | "dark mode switch"                                      | switch                                         | icon; titles "Switch to light/dark theme"                              | not documented                                                 | S17      |
| Starlight                 | Yes (built-in)        | `ThemeSelect`                                           | select (form not confirmed)                    | not confirmed                                                          | not confirmed                                                  | S18      |

## Patterns observed

Of 17 rows, **6 ship a dedicated control** (Chakra, Nuxt UI, Carbon-Svelte, Docusaurus, VitePress,
Starlight), 2 document a recipe or demo (shadcn, Mantine), and 9 leave it to the app (MUI, Ant,
Radix, Atlassian, Primer, Fluent, Spectrum, Polaris, GOV.UK). Primer, Fluent, Spectrum and Polaris
rest on pages that do not mention the topic, so they are weak "no" rows.

The survey does **not** support the sibling's noun:

- **No surveyed control is called a "switcher".** The nouns are Button (Chakra, Nuxt), Toggle
  (Docusaurus, shadcn "mode toggle", Carbon-Svelte `render="toggle"`), Switch (Nuxt, VitePress) and
  Select (Nuxt, Starlight, Carbon-Svelte).
- **The dominant form is one icon button** (Chakra, Nuxt, Mantine, Docusaurus, web.dev). No system
  ships a dedicated two-option segmented light/dark control; Mantine's four-button demo is the
  nearest.
- **Three states are common**: `system`/`auto` appears in MUI, Mantine, Atlassian, Nuxt Select
  and Docusaurus. Omnia's provider has none.
- **The concept has four names**: "color mode" (Chakra, Nuxt, Atlassian, Docusaurus), "color scheme"
  (MUI, Mantine), "theme" (shadcn, Starlight, Carbon-Svelte, VitePress titles) and "appearance"
  (Radix). Omnia's provider already says `theme`.

Accessibility sources disagree on the semantics but agree on one rule:

- **Keep the accessible name constant when state changes.** The WAI-ARIA Authoring Practices say it
  is "critical" for a switch (S19); MDN says the same for `aria-pressed` and adds that a label that
  changes between states should drop `aria-pressed` (S20).
- Docusaurus follows the second route: a changing `aria-label` and no pressed state (S16). web.dev
  puts the current state in the `aria-label` and adds `aria-live="polite"` (S22). Josh Comeau uses a
  native checkbox with a visible "Dark" label (S21).
- The group of options is a valid pattern too: constant per-option names plus `aria-pressed` on the
  active one needs no live region.

## Form decision

Four candidate forms:

- **Single icon button** (market norm). Compact, but the state is not visible by construction: a
  lone sun or moon cannot say whether it shows the current theme or the target. It then needs either
  a changing label (Docusaurus, S16) or a live region (web.dev, S22) to recover what two options
  show on their own. Rejected for the same reason the language study rejected it.
- **Reuse `Switch`** (Nuxt `ColorModeSwitch`, S7; Carbon-Svelte "Dark mode", S8). The cheapest option,
  and a legitimate mental model ("Dark mode: on/off"). Rejected on a narrower ground: it makes
  `light` the unlabelled "off" and needs a constant name such as "Dark mode", so the two themes are
  never both named on screen, unlike the sibling.
- **Three-option with `system`** (MUI, Mantine, Atlassian, Docusaurus, Nuxt Select). Rejected as
  speculative: the provider has no `system` value, so it would require provider work (read
  `prefers-color-scheme`, store a preference separate from the resolved theme) that nothing asks for.
  Revisit if the provider ever gains it; the control would then grow a third option.
- **Two-option segmented control**, mirroring `LanguageSwitcher`: both themes named, the active one
  marked, constant names, no live region. **Chosen form.**

Two native `<button type="button">`s in a `role="group"` with a localized accessible name, the active
one with `aria-pressed="true"`, clicking one calls `setTheme`. It is the same structure as
`LanguageSwitcher`, so the two read as siblings in a toolbar. A radiogroup was dropped for the same
reason as there: roving focus for no gain on two items.

## Option labels (owner decision)

The language study required endonyms; that rule does not apply here. Both themes need accessible
names in every case, so new `en`/`fr` translation keys are needed whichever label style wins.

Fact: the `Icon` atom ships both glyphs. `ICON_GLYPHS` in
`src/components/atoms/Icon/glyphMap.ts` lists `sun` and `moon`, and eight SVGs exist:
`src/icons/{default,pixel}/{regular,solid}/{sun,moon}.svg`. `Icon` is decorative by default
(`aria-hidden`). A grep for `Icon` and `Spinner` imports across `src/components/atoms` (excluding
stories and tests) found no atom importing another atom today.

- **Worded** — "Light"/"Dark", FR "Clair"/"Sombre". Mirrors the sibling, no new dependency, readable
  in every skin. Wider than icon-only.
- **Icon-only** — sun/moon with `aria-label` "Light"/"Dark". The market's choice wherever a control
  has a visual (Chakra, Nuxt, Mantine, Docusaurus, web.dev) and the most compact. Adds an atom-to-atom
  import, and the hidden names must be right in FR and EN.
- **Icon + text** — both. Most explicit and shows off the pixel glyphs; widest.

Recommendation: **worded** for the first version. It copies a shipped, tested pattern and can gain
icons later without renaming anything. Against it: sun/moon is the one affordance every surveyed
control shares, Omnia already vendors the glyphs (including pixel variants that showcase the skin
axis), and a text pair is the widest cheap option in a toolbar. If the owner values compactness or
the skin showcase, icon + text is the safer upgrade than icon-only.

## Name options

**A. `ThemeSwitcher`.** Sibling-consistent: `LanguageSwitcher` set a `<Axis>Switcher` convention
(ADR 0024 asks that a reader predict names without opening files), and "theme" is the provider's word
(`theme`, `setTheme`). Segmented controls are not what the market calls a "toggle" (that is the
single button or switch), so "switcher" fits the chosen form better than "toggle" does.
Recommended.

**B. `ThemeToggle`.** The nearest market noun (Docusaurus, shadcn, Carbon-Svelte). Reads as a single
two-state control, which it is. But it breaks the pair: `LanguageSwitcher` and `ThemeToggle` side by
side, for two identical controls, invites the question why.

**C. `ColorSchemeSwitcher`** (or `ColorModeSwitcher`, the Chakra/Nuxt word). Unambiguous: no reader
mistakes it for the skin axis. But it uses a word the provider does not (`theme`, never `colorScheme`),
and it names the control after a vocabulary Omnia does not speak.

Singular PascalCase in every case (ADR 0024); no parts, so no compound.

## Prop-naming check (the enforced rule)

Proposed minimal API: `<ThemeSwitcher />` reads `theme` + `setTheme` from `useTheme()` — the provider
is the single source of truth. The only props are native-typed pass-throughs: `className` and `style`
land on the group root, `ref` reaches it, and remaining native attributes spread onto it.

- **No custom-named props**, so no native-name collision is possible and the component passes
  `src/native-prop-names.check.ts` trivially.
- Deliberately **not added**: `value`/`defaultValue`/`onChange` (native names, and the provider owns
  the state), `theme` (not an HTML name in `@types/react` 19.3.0, but it would duplicate the provider),
  `label` and `title` (native on other elements; the group name is localized internally and an
  `aria-label` override spreads onto the root), `size`/`variant` axes (speculative; if wanted they
  become `variantSize` / `variant<Axis>` per ADR 0015), and `system`/`mode` (`mode` is only on React's
  `Activity` and SVG, not HTML, but a `system` option is out of scope until the provider has one).

## Recommendation

Opinion, built on the facts above: **option A, `ThemeSwitcher`, a two-option segmented control with
worded labels.**

Devil's advocate:

- **The survey votes against the name and the form.** No surveyed system says "switcher" for a theme
  control, and the single icon button is the norm. A is a consistency choice with a shipped sibling,
  not a market one. If the owner weighs market fit above sibling symmetry, B is the honest pick.
- **The same "Switcher" was picked last time** over the study's recommendation, and the language case
  had a growth argument (a third locale). Theme has none today: `themes` is `['light', 'dark']`.
  A `system` option would be the only growth path, and it needs provider work first.
- **"Theme" is ambiguous in Omnia.** The provider name says it covers theme and skin, so a reader may
  expect `ThemeSwitcher` to flip the pixel skin too. C avoids that at the cost of a foreign word. A
  one-line TSDoc and the MDX can carry the distinction.
- **Segmented costs more than the cheapest option.** `Switch` reuse needs no new component; the
  segmented form needs a new atom, CSS in four theme x skin modes, and translations. It buys named
  states and an exact mirror of the sibling, not capability.

Not decided here: visual spec (segmented pill vs. two plain buttons), the label style (owner
decision above), the translation key names, and whether a `system` theme is ever wanted.

## Decision

On 2026-11-05 the owner picked option A, **`ThemeSwitcher`**: a two-option segmented control
mirroring `LanguageSwitcher`, with icon-only options (the `Icon` atom's `sun` and `moon`) and a
localized accessible name on each button (EN "Light"/"Dark", FR "Clair"/"Sombre"). Accepted
trade-off: with no visible text, a voice-control user must guess the spoken name to say it
(WCAG 2.5.3 is still met, as there is no visible label to mismatch).

## Sources

All opened 2026-11-05 unless noted.

- S1 MUI dark mode: https://mui.com/material-ui/customization/dark-mode/
- S2 Ant Design customize theme: https://ant.design/docs/react/customize-theme
- S3 Mantine color schemes: https://mantine.dev/theming/color-schemes/
- S4 Radix Themes dark mode: https://www.radix-ui.com/themes/docs/theme/dark-mode
- S5 shadcn/ui dark mode (Next.js): https://ui.shadcn.com/docs/dark-mode/next
- S6 Chakra UI color mode: https://www.chakra-ui.com/docs/components/concepts/color-mode
- S7 Nuxt UI: https://ui.nuxt.com/components/color-mode-button ,
  https://ui.nuxt.com/components/color-mode-switch ,
  https://ui.nuxt.com/components/color-mode-select
- S8 carbon-components-svelte `Theme` typings (community package, not Carbon core):
  https://app.unpkg.com/carbon-components-svelte@0.90.1/files/types/Theme/Theme.svelte.d.ts
- S9 Atlassian tokens in code: https://atlassian.design/foundations/tokens/use-tokens-in-code
- S10 GitHub Primer React getting started: https://primer.style/product/getting-started/react/
- S11 Fluent 2 design tokens: https://fluent2.microsoft.design/design-tokens
- S12 Adobe Spectrum theming: https://spectrum.adobe.com/page/theming/
- S13 Shopify Polaris: https://shopify.dev/docs/api/polaris
  (`https://polaris-react.shopify.com/foundations/design/dark-mode` redirected here; the page does not
  mention theming)
- S14 GOV.UK Design System components: https://design-system.service.gov.uk/components/
- S15 Docusaurus theme configuration: https://docusaurus.io/docs/api/themes/configuration
- S16 Docusaurus `ColorModeToggle` source:
  https://raw.githubusercontent.com/facebook/docusaurus/main/packages/docusaurus-theme-classic/src/theme/ColorModeToggle/index.tsx
- S17 VitePress default theme config: https://vitepress.dev/reference/default-theme-config
- S18 Starlight overrides: https://starlight.astro.build/reference/overrides/
  (the `ThemeSelect.astro` source URL tried returned 404, so its form is not confirmed)
- S19 WAI-ARIA APG switch pattern: https://www.w3.org/WAI/ARIA/apg/patterns/switch/
- S20 MDN `aria-pressed`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed
- S21 Josh Comeau, dark mode in React: https://www.joshwcomeau.com/react/dark-mode/
- S22 web.dev, building a theme switch component: https://web.dev/articles/building/a-theme-switch-component
- Not opened: Material 3 (`https://m3.material.io/foundations/designing/color-roles` returned 404),
  Carbon core themes docs (only seen as a search result), the shadcn mode-toggle source.
- Local: `src/lib/OmniaThemeProvider.tsx`, `src/components/atoms/LanguageSwitcher/LanguageSwitcher.tsx`,
  `src/components/atoms/Icon/{glyphMap.ts,Icon.tsx}`, `src/icons/`, `docs/naming/languagetoggle.md`,
  `docs/adr/0015-native-attribute-prop-names.md`, `docs/adr/0024-component-naming-convention.md`,
  `@types/react` 19.3.0 (main checkout `node_modules`).
