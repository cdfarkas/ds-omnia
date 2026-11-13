# ADR 0014 — Responsive strategy: em breakpoints, container queries, no utilities

## Status

Proposed

## Context

Omnia has no responsive rules today: no breakpoint, container or viewport token, and the only
`@media` rules in `src` are `prefers-reduced-motion` (Button) and `prefers-color-scheme`
(`Introduction.css`). `scripts/visual-check.mjs` rendered every story at 440 CSS px, and the Vitest
Storybook runner defaults to 1200 × 900, so no story was ever checked narrow.

The next components need it: Input, Checkbox, Switch and Link only have to fill their width;
FormField, Card and Tabs change layout with their own width; Dialog and the settings-form page
template change with the viewport.

Accessibility sets the floor (ADR 0006, WCAG 2.1 AA):

- **SC 1.4.10 Reflow**: content works without two-dimensional scrolling at 320 CSS px wide.
- **SC 1.4.4 Resize Text**: text enlarges to 200% without loss of content, in every layout variant.

Repo constraints: CSS Modules in `@layer components` (ADR 0002), the `--omnia-` prefix on every custom
property (ADR 0013), and `stylelint-config-standard`, which requires media-query range notation
(`(width >= 48em)`, not `(min-width: 48em)`). Custom properties cannot be used inside `@media` or
`@container` conditions, and `@custom-media` is implemented by no browser.

The study `docs/research/responsive.md` surveys 15 design systems and compares four options:
A (breakpoint scale + container queries + an eventual hook), B (container queries only), C
(responsive props) and D (a utility-class layer). The owner chose on 2026-10-30.

## Decision

**We use a mobile-first em breakpoint scale for viewport media queries, container queries inside
components with a width-dependent layout, and fluid CSS everywhere else.**

| Name | Query               | Pixels at 16px default |
| ---- | ------------------- | ---------------------- |
| sm   | `(width >= 30em)`   | 480                    |
| md   | `(width >= 48em)`   | 768                    |
| lg   | `(width >= 64em)`   | 1024                   |
| xl   | `(width >= 80em)`   | 1280                   |

The unprefixed style is the narrowest layout and must work at 320 CSS px; each step adds styles at
`min-width`. Steps ship only when a component uses them.

Where each mechanism applies:

- **Viewport `@media`** with the scale above: Dialog and page templates.
- **`@container`** inside FormField, Card, Tabs and any later component whose layout follows its own
  width. Thresholds are local to the component, in `rem`, not shared names.
- **No breakpoint**: atoms (Input, Checkbox, Switch, Link, and the existing Button and Badge) are
  fluid.

Sharing is by **literal values plus lint**. `.stylelintrc.json` sets the built-in
`media-feature-name-value-allowed-list` so a `width`, `min-width` or `max-width` media query accepts
only `30em`, `48em`, `64em` and `80em` in all `src/**/*.css`. `@container` and `prefers-*` queries are
not affected. Height features are not listed: the scale is a width scale and no component needs a
height query yet.

`scripts/visual-check.mjs` also shoots every story at 320 CSS px in all four theme × skin modes.

Explicitly not done:

- No `useMediaQuery` hook and no `breakpoints.ts` until a first component needs JavaScript; a
  `*.test.ts` will then check the constant against the CSS scale.
- No responsive props (`{ base, md }`) and no utility classes in `@layer utilities`.
- No `@custom-media`, no PostCSS or Lightning CSS config, no new dependency. Revisit
  `@custom-media` only if literal queries spread to about a dozen files; the output is literal CSS,
  so the move is mechanical.

## Consequences

- One scale, checked by a build gate: an off-scale or px breakpoint fails `pnpm lint`. The lint checks
  values only; it does not catch a missing breakpoint or a `max-width` query written against the
  mobile-first rule.
- Each use repeats the literal (`48em`) instead of a name. The table above is the only definition.
- Em queries follow the browser's default font size in Chrome and Firefox, which supports SC 1.4.4.
  Em has no proven gain in Safari: the one 2023 retest found px, em and rem all fixed there. If Safari
  matters most, px would behave the same there and read more simply.
- Container queries need a parent-given inline size: `container-type: inline-size` stops the box
  from sizing to its content. They must sit on a wrapper with a known width, never on an atom that
  shrinks to fit, and their stories need a fixed-width wrapper rather than a viewport global.
- No surveyed system was verified to use container queries inside its own components, so Omnia is
  early here.
- No layout primitive (Stack, Grid) exists, and this ADR adds none. The settings-form template will
  hand-write its layout; if that repeats, a layout primitive is a separate decision.
- Two mechanisms (media and container) to teach and test.
- The visual gate doubles its story shots. The 320 px pass is the first narrow evidence; the scale
  can still change after it.
- Follow-up: choose container thresholds per component when FormField, Card and Tabs are built, and
  drop `sm` if no component needs it.

Study and sources: [`docs/research/responsive.md`](../research/responsive.md).

## Update 2026-11-13

AppHeader's panel-stacking rules (`AppHeader.module.css`) use `@media not (width >= 48em)`, an
accepted exception to the mobile-first rule above. Desktop keeps NavBar's own CSS untouched, because
copying NavBar's desktop styles into AppHeader would couple the two components.
