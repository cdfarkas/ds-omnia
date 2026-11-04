# Naming study — the FR/EN locale switch control

Date: 2026-11-04. Method: official docs and pattern pages opened during this study. "None
dedicated" means the pages opened ship no first-party component for it, not that the system cannot
build one.

## Question

`OmniaThemeProvider` exposes a two-value locale axis (`en`/`fr`) through `locale` + `setLocale`
(stateful since ADR 0025). Omnia needs a catalogue control that lets a user flip that axis. Three
things to settle before code:

1. What is the control called?
2. Is it a two-state toggle, a single cycling button, or a selector/dropdown?
3. What are its props, checked against the prop-naming rule (no native HTML name with a custom type)?

Scope: exactly two locales exist today. No speculative N-locale dropdown.

## Survey

| System                  | Dedicated component? | Name used                        | Form                          | Option labels            | Active state         | Src |
| ----------------------- | -------------------- | -------------------------------- | ----------------------------- | ------------------------ | -------------------- | --- |
| MUI                     | No (first-party)     | react-admin `LocalesMenuButton`  | Menu button                   | per app                  | not documented       | S1  |
| Ant Design              | No                   | `ConfigProvider` (locale config) | n/a (config, not a picker)    | n/a                      | n/a                  | S2  |
| IBM Carbon              | No                   | compose from `Select`            | native `<select>`             | per app                  | selected option      | S3  |
| Adobe React Spectrum    | No dedicated         | —                                | —                             | —                        | —                    | S4  |
| Shopify Polaris         | No dedicated         | —                                | —                             | —                        | —                    | S4  |
| shadcn/ui (community)   | No (first-party)     | "Language switcher" / "selector" | `ToggleGroup` or dropdown     | endonyms or flags        | active/pressed       | S5  |
| GOV.UK Design System    | Yes                  | "Language navigation"            | nav links                     | endonyms (own language)  | `aria-current`       | S6  |
| DWP Design System       | Yes                  | "Language toggle"                | nav, two languages            | endonyms                 | `aria-current`       | S7  |
| HMRC Frontend           | Yes                  | "Welsh Language Toggle"          | two-language switch           | endonyms                 | `aria-current`       | S7  |
| GOV.UK publishing       | Yes                  | "Translation nav"                | nav links                     | endonyms                 | focusable links      | S8  |
| specification.website   | Pattern (spec)       | "language switcher"              | `<nav aria-label>`            | endonyms + `lang` attr   | `aria-current="true"`| S9  |
| General Translation KB  | Pattern (guide)      | "language switcher"              | links or menu                 | endonyms via `Intl`      | `aria-current`       | S10 |

## Patterns observed

Of the general-purpose component libraries, **none ships a dedicated language control**. MUI, Ant,
Carbon, Spectrum and Polaris treat locale as application config (an i18n provider or
`ConfigProvider`) and leave the picker to be composed from `Select`, a dropdown, or a toggle group.
So there is no cross-library component name to inherit — the name comes from the i18n and
government design systems instead.

The systems that do name it split on language count:

- **Two languages → "toggle".** DWP and HMRC call the exactly-two-language control a "Language
  toggle" / "Welsh Language Toggle". This is Omnia's case.
- **Many languages → "navigation" / "switcher".** GOV.UK ("Language navigation"), GOV.UK publishing
  ("Translation nav"), and the community/i18n guides ("Language switcher", "Locale switcher") name
  the open-ended version.

Accessibility guidance is consistent across every i18n source (S6–S10):

- Label each option **in its own language** — "English", "Français" — never translated into the
  current UI language. Set `lang` on each option so a screen reader pronounces it correctly.
- Mark the active language for assistive tech (`aria-current`, or a pressed state).
- Give the control itself an accessible name in the page's language.
- Avoid flags: a flag is a country, not a language.

## Form decision

Three candidate forms, against the simplicity ladder and the a11y consensus:

- **Dropdown / `Select`.** Overkill for two values, and the task rules out a speculative N-locale
  dropdown. Rejected.
- **Single cycling button** (shows the current language, click flips). Minimal, but ambiguous — a
  lone "FR" cannot say whether it means "you are in French" or "switch to French" — and it needs a
  verbose `aria-label` to recover what the two-option form shows by construction. No precedent for
  the two-language government case. Rejected.
- **Reuse `Switch`** (boolean on/off). Rejected: neither locale is "on", so a checkbox role
  misrepresents a language choice, and it cannot label each option in its own language.
- **Two-option segmented toggle** — both endonyms shown, the active one marked. Matches DWP/HMRC
  "Language toggle", and satisfies the a11y consensus by construction (each option carries its own
  `lang`; the active one is marked; the group carries a localized accessible name). **Chosen form.**

Two native `<button>`s in a `role="group"`, each labelled with its endonym and its own `lang`, the
active one with `aria-pressed="true"`, clicking one calls `setLocale`. `aria-pressed` fits a control
that changes client state (not page navigation, where `aria-current` would fit). A radiogroup was
considered and dropped: it would add roving-tabindex focus management for no gain on two items.

## Name options

**A. `LanguageToggle`.** Matches the DWP/HMRC authoritative name for the exactly-two-language case;
"toggle" signals two values; "Language" is the user-facing word (the catalogue names controls for
users, like `Switch`, not `Locale*`). Recommended.

**B. `LanguageSwitcher`.** The generic community/i18n name. Better if the control ever grows to N
locales, but "switcher" implies a larger surface than a two-value control, and today there are two.

**C. `LocaleSwitcher`.** Accurate to the provider's internal vocabulary (`locale`, `setLocale`,
`Locale`), but "locale" is jargon for end users; the catalogue keeps user-facing names.

## Prop-naming check (the enforced rule)

Proposed minimal API: `<LanguageToggle />` reads `locale` + `setLocale` from `useTheme()` — the
provider is the single source of truth, so there are no controlled `value`/`defaultValue` props. The
only props are native-typed pass-throughs: `className` and `style` land on the group root, `ref`
reaches it, and any remaining native attributes (e.g. an `aria-label` override) spread onto it.

- **No custom-named props** → no native-name collision is possible, so the component passes
  `src/native-prop-names.check.ts` trivially.
- Deliberately **not** added: `lang` (a native global attribute — it would both collide and be
  mistaken for the DOM language of the element), `value`/`defaultValue` (native, and unneeded), and
  any `size`/`variant` axis (speculative; if one is wanted later it becomes `variantSize` /
  `variant<Axis>` per the rule).

## Recommendation

Opinion, built on the facts above: **option A, `LanguageToggle`, as a two-option segmented toggle.**
It is the name the two-language government pattern uses, it reads for end users, and the two-option
form is the one the accessibility sources describe.

Devil's advocate: if the roadmap expects a third locale soon, B (`LanguageSwitcher`) ages better and
a dropdown form becomes right — renaming a shipped, exported component is the expensive kind of
change. But nothing today points past two locales, and the name is cheap to supersede before ship.

Not decided here: visual spec (segmented pill vs. two plain buttons), and whether a size axis is
ever wanted.

## Decision

Option B, chosen by the owner on 2026-11-04: the control ships as `LanguageSwitcher`, a two-option
segmented toggle. "Switcher" is the generic i18n name and leaves room if a third locale ever lands;
the two-option form (both endonyms shown, the active one `aria-pressed`) is the one the accessibility
sources describe. The recommendation above was `LanguageToggle`; the owner chose the more general
name.

## Sources

All opened 2026-11-04.

- S1 react-admin `LocalesMenuButton`: https://marmelab.com/react-admin/LocalesMenuButton.html
- S2 Ant Design internationalization: https://ant.design/docs/react/i18n
- S3 IBM Carbon Select: https://www.carbondesignsystem.com/components/select/usage/
- S4 Adobe React Spectrum components: https://react-spectrum.adobe.com/react-spectrum/ ; Shopify Polaris components: https://polaris.shopify.com/components
- S5 shadcn community blocks (language selector / switcher): https://www.shadcn.io/blocks/navbar-language-switcher
- S6 GOV.UK Design System — Language navigation: https://design-system.service.gov.uk/components/language-navigation/
- S7 DWP Design System — Language toggle: https://design-system.dwp.gov.uk/components/language-toggle
- S8 GOV.UK publishing — Translation nav: https://components.publishing.service.gov.uk/component-guide/translation_nav
- S9 specification.website — i18n language switcher: https://specification.website/spec/i18n/language-switcher/
- S10 General Translation — language switcher best practices: https://generaltranslation.com/en-US/kb/language-switcher
