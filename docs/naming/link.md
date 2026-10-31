# Naming study — link

Date: 2026-10-31. Method: official docs and, where a docs page was silent, the system's own
source, for the design systems surveyed below. "None documented" means the pages consulted do not
mention it, not that the system lacks it. Prop names for Omnia were checked against
`node_modules/@types/react/index.d.ts` (`@types/react` 19.3.0) and ADR 0015.

## Question

Omnia needs a text-link atom rendering a native `<a>`. Four sub-questions:

1. What is it called: `Link`, `TextLink`, `Anchor`, or something else?
2. What is the one meaningful variant axis — inline (inside running text) versus standalone (on its
   own line), or something else (size, intent, underline-as-a-prop)?
3. How is an external / new-tab link handled accessibly and safely?
4. Which props does Omnia expose, and do any collide with a native attribute name (ADR 0015)?

## Survey

| System             | (1) Name        | (2) Variant axis                                  | (3) External / new tab                                         |
| ------------------ | --------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| MUI                | `Link`          | `underline` (`none`/`hover`/`always`); typography | `target`/`rel` left to the consumer                            |
| Shopify Polaris    | `Link`          | `monochrome`, `removeUnderline`                   | `external` opens a new tab; `target`/`rel` set accordingly     |
| Welcome UI         | `Link`          | `variant` (primary/secondary); inline in text     | `isExternal` adds an icon and `rel`                            |
| React Aria         | `Link`          | unstyled primitive; inline by default             | native `target`/`rel`; focus and press states handled          |
| Toyota CDS         | `Link`          | `inline` vs `standalone`                           | external indicator pattern                                     |
| Singapore OUI      | `Link`          | `inline` vs `standalone`                           | new-tab affordance                                             |
| ServiceTitan       | `Link`          | typographic                                        | external handling                                              |
| Unkey              | `Link`          | `inline` vs `standalone`                           | external handling                                              |

## Patterns observed

**Name.** `Link` is universal across the systems surveyed (MUI, Polaris, Welcome UI, React Aria,
Toyota CDS, Singapore OUI, ServiceTitan, Unkey). `TextLink` and `Anchor` appear elsewhere but are the
minority; no surveyed system needed a longer name to disambiguate, because none ships a second
link-like component that would collide. `Link` matches the element it renders and the word users
already know. There is no reason to diverge.

**Variant axis.** The one axis that recurs with a clear meaning is **inline vs standalone**: Toyota
CDS, Singapore OUI and Unkey name exactly this pair. An inline link sits inside running text and must
inherit that text's size and weight so it does not break the line; a standalone link stands on its
own and carries its own typography. Other axes systems expose (`underline` as a tri-state in MUI,
`monochrome`/`removeUnderline` in Polaris, a colour `variant` in Welcome UI) are either styling knobs
that belong to the token layer and the variant, or options Omnia does not need. Underline in
particular is **not** a separate prop in Omnia: links must be distinguishable without relying on
colour alone (WCAG 1.4.1), so both variants are underlined by default, and that is the variant's job.

**External / new-tab.** The accessible, safe pattern is consistent across the systems that document
it (Polaris `external`, Welcome UI `isExternal`): for a link that opens a new window, set
`target="_blank"` **and** `rel="noopener noreferrer"`, expose an accessible "opens in new window"
indication to assistive technology, and optionally show a presentational trailing icon. The default
is same-tab (no `target`). The icon is decorative (`aria-hidden`) because the accessible name already
carries the meaning through the hidden label.

## Options for Omnia

ADR 0015 constrains the names. Checked in `@types/react` 19.3.0:

- `variant`: **not** a native attribute of any HTML element — keeps the name.
- `external`: **not** native — keeps the name. It is a new design-system prop, so it must not reuse a
  native prop name with custom values: `target` is native and stays native, passable, and a caller's
  own `target` wins.
- `href`, `target`, `rel`, `children`, `className`: native, native meaning, pass through.

### A. `Link`, `variant: 'inline' | 'standalone'`, `external?: boolean`

The shared shape above and no more. `href` required; extends `AnchorHTMLAttributes`.

- Pro: matches every surveyed system on the name and the one variant axis three of them name
  explicitly. Native `href`/`target`/`rel` pass through, which is what a native `<a>` consumer needs.
- Pro: `external` is the Polaris/Welcome UI affordance, with the WCAG-safe `rel` and an accessible
  new-window label built in, so a consumer cannot forget the `rel` or the announcement.
- Con: no colour `intent` on a link (MUI, Welcome UI expose one). Deferred: a link is brand-coloured
  by the `--omnia-color-link` token; an intent axis can be added later without a break.

### B. A, plus an `underline` tri-state and a colour `variant`

MUI's and Polaris's fuller surface.

- Con: `underline` as a prop invites turning the underline off, which breaks WCAG 1.4.1 for a
  colour-only link. Omnia makes underline the variant's job instead.
- Con: a colour `variant` is speculative today; nothing in the repo asks for it.

## Recommendation

**Take option A.** Name it `Link`. One variant axis, `inline | standalone`, default `standalone`.
`external` for the new-tab affordance, with `target="_blank"`, `rel="noopener noreferrer"`, a
visually-hidden bilingual "opens in new window" label and a decorative trailing icon. No polymorphic
`as`/router prop, no `visited` styling, no `disabled` — a disabled link is not a link. Underline
belongs to the variant, not a prop.

## Decision

Option A (owner, agreed before implementation).

`Link` renders a native `<a>`, extends `AnchorHTMLAttributes<HTMLAnchorElement>` with `href`
required, takes `variant: 'inline' | 'standalone'` (default `standalone`) and `external?: boolean`,
and exposes the override contract (`data-scope="link"`, `data-part="link"`/`"icon"`,
`data-variant`, `data-external`; `--omnia-link-color`/`--omnia-link-color-hover`).

## Sources

Design systems surveyed (official documentation, 2026-10-31): MUI (`Link`), Shopify Polaris
(`Link`), Welcome UI (`Link`), Adobe React Aria (`Link`), Toyota CDS (`Link`), Singapore OUI
(`Link`), ServiceTitan (`Link`), Unkey (`Link`). Standards: WCAG 2.1 SC 1.4.1 Use of Color (A),
SC 1.4.3 Contrast (Minimum) (AA); HTML `rel="noopener noreferrer"` on `target="_blank"`. Local:
`node_modules/@types/react/index.d.ts` (19.3.0), `docs/adr/0015-native-attribute-prop-names.md`,
`docs/naming/switch.md`.
