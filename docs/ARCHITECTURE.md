# Architecture

How Omnia is laid out and why. Rules here are binding; the summaries in `CLAUDE.md` point at
this file for the detail.

## Folder layering

Atomic Design, strict:

```
src/
  styles/        tokens.css, reset.css, layers.css
  lib/           i18n.ts (t() + locale global + typed strings), intents.ts (shared intent list)
  translations/  en.ts, fr.ts
  components/
    atoms/       smallest building blocks (Button, Input, …)
    molecules/   small compositions of atoms (FormField, Card, …)
    organisms/   larger, self-contained sections (Dialog, AppHeader, …)
    templates/   page-level layout, no real content (DashboardTemplate)
```

A component only ever imports from its own layer or a **lower** one: molecules use atoms, organisms
use molecules and atoms, templates use everything. Never upward, never sideways within a layer
without a deliberate reason.

### Co-location

Everything a component needs sits in one folder, `components/<layer>/<Name>/`:

- `<Name>.tsx` — the component
- `<Name>.module.css` — its styles (semantic tokens only)
- `<Name>.stories.tsx` — the catalogue entry, with `play` where it earns one
- `<Name>.mdx` — authored prose, locale-switched via `<Localized>` (one language at a time)
- `<Name>.test.tsx` — edge-case assertions on composed stories
- `<Name>.test.ts` — pure-logic tests (only when there is pure logic)
- `index.ts` — the public surface of the component

## Compound components — decision tree

Compound components are the default shape for anything with parts. Choose the mechanism by whether
the parts share state:

- **Shared state between parts** (open/close, selected value, validation status) → **React Context**.
  The parent owns the state and exposes it through a context the sub-parts consume. Examples:
  `Dialog` (open state, focus trap), `FormField` (id wiring, error state shared by label/input/hint).
- **No shared state**, parts are just a documented slot layout → **plain dot-notation**, no context.
  The parent attaches sub-components as static properties. Example: `Card.Header`, `Card.Body`,
  `Card.Footer` — purely structural.

Reach for Context only when there is genuinely shared state to carry. A context with nothing to share
is ceremony; use dot-notation instead.

## Token contract — two tiers

All tokens live in one file, `src/styles/tokens.css`, in two tiers:

1. **Primitive palette** — raw values, named by what they *are*: `--omnia-palette-cobalt`,
   `--omnia-palette-ink`, `--omnia-palette-space-4`, `--omnia-palette-radius-md`,
   `--omnia-palette-border-thick`, `--omnia-palette-font-sans`. The only place raw colour values
   exist.
2. **Semantic aliases** — named by what they *do*, referencing primitives:
   `--omnia-color-bg-surface`, `--omnia-color-text-primary`, `--omnia-color-border-focus`,
   `--omnia-radius-md`, `--omnia-shadow-raised`. The vocabulary spans four families: colour
   (`--omnia-color-*`, including the status pairs `--omnia-color-success/warning/info/danger` each
   with `--omnia-color-text-on-<status>`, ADR 0012), shape (`--omnia-radius-sm/md/lg`,
   `--omnia-border-width-regular/thick`, the flat `--omnia-shadow-raised`), and type
   (`--omnia-font-display` serif, `--omnia-font-sans` grotesk). The maximalist base aesthetic that
   fills these is recorded in ADR 0008.

Every Omnia custom property — primitive, semantic, intent and per-component — shares the `--omnia-`
namespace, so a consuming app's own `--color-primary` or `--radius-sm` never collides with it
(ADR 0013).

An **intent map** closes the file: each `[data-intent]` sets `--omnia-intent-bg`,
`--omnia-intent-bg-hover`, `--omnia-intent-bg-active` and `--omnia-intent-fg` from the semantic
tier, so every intent-coloured component reads its rest/hover/press colours from one place;
`src/lib/intents.ts` shares the list (ADR 0012).

**Components consume the semantic layer only.** No `*.module.css` may contain a raw `hex`, `rgb()`
or `hsl()` literal — a stylelint rule bans it (see ADR 0003). This is the fitness function that keeps
the contract real: a reskin changes tokens, never component CSS.

Themes and skins reassign **only the semantic layer** — they re-point `--omnia-color-*` /
`--omnia-radius-*` / `--omnia-shadow-*` at different primitives (or, for the pixel skin, at different
values). Primitive names and semantic names are both stable contracts; do not rename them.

The file is hand-authored now but shaped to be generated later (Style-Dictionary-style), so keep the
two tiers cleanly separated.

## Theming — one provider, two independent axes

Two orthogonal axes — **`theme` (light / dark)** and **`skin` (default / pixel)** — both resolve
against the semantic token layer on the **document root**. One exported component drives them:
`OmniaThemeProvider` sets `data-theme` and `data-skin` on `<html>` and exposes `{ theme, skin,
locale }` plus their setters (`setTheme`, `setSkin`, `setLocale`, `toggleTheme`) through `useTheme()`
(ADR 0025, superseding ADR 0017). It is the single theming mechanism for the library, Storybook and
the docs.

The provider is stateful. Passing a `theme`/`skin`/`locale` prop makes that axis **controlled** —
props win and each setter fires the matching `onThemeChange`/`onSkinChange`/`onLocaleChange`
callback. Omit the prop and the provider **owns** that axis, persisting the choice to `localStorage`
(`omnia-theme`). An uncontrolled app wraps once and lets a toggle flip the theme:

```tsx
import { OmniaThemeProvider, useTheme } from '@cdfarkas/omnia';
import '@cdfarkas/omnia/styles.css';

<OmniaThemeProvider defaultTheme="dark" defaultSkin="pixel">
  <App />
</OmniaThemeProvider>;
```

To avoid a theme flash before the provider's effect runs, inject `getThemeInitScript()` as an inline
`<script>` in `<head>` — it applies the persisted (or fallback) attributes before first paint.

Storybook drives the same provider in controlled mode from one decorator reading the `theme`, `skin`
and `locale` toolbar globals; the `theme` global defaults to the viewer's `prefers-color-scheme`. CSS
selectors combine the two visual axes (`:root[data-theme][data-skin]`) to resolve the semantic layer.
Theming is document-wide — one active theme per document; nested, differently-themed subtrees are not
supported (ADR 0025).

### Structural carve-out for the pixel skin

The pixel-art skin needs things that are **not colour/space tokens** and legitimately live in CSS,
not in `tokens.css`:

- the pixel `@font-face` declaration,
- `image-rendering: pixelated` on relevant surfaces,
- the pixel skin's notched offset shadow geometry (a `drop-shadow` filter on the non-clipped frame),
- notched / stepped borders.

This is a **documented, deliberate** carve-out: these are structural style rules, not design tokens,
so forcing them through the token layer would distort it. Colour still comes from semantic tokens.

## Interaction & motion

The offset shadow is a physical affordance, so it responds to interaction — this is the house
standard, defined once on Button and reused by every future interactive atom (ADR 0009). Rest shows
the flat `--omnia-shadow-raised` (`4px`, the ground reference); hover lifts the control
`translate(-3px, -3px)` and grows the shadow to `--omnia-shadow-raised-hover` (`7px`); the signature
press slams flat — `translate(--omnia-press-offset)` (`4px`) drops the control onto its shadow while
the shadow collapses to `--omnia-shadow-pressed` (`0`).
Elevation is shadow thickness (7 > 4 > 0) with the ground fixed: `translate + shadow offset` stays `4`
in every state. The pixel skin gets the same model through a `drop-shadow` filter on the non-clipped `.frame`
wrapper, fed the same shadow tokens, because the button's notch `clip-path` would clip a shadow drawn
on the button itself (a `::before` there left axe unable to read the label background, ADR 0009).

Motion is tokenised and asymmetric: hover and release settle over `--omnia-dur-fast` (200ms) with
`--omnia-ease-out` (easeOutCubic), press-in is quicker at `--omnia-dur-press` (110ms). It transitions
only `transform` / `box-shadow` / `background-color` / `border-color`, so neighbours never reflow. Interaction
motion is wrapped in `@media (prefers-reduced-motion: reduce)`, which disables transitions and transforms
while keeping the colour and shadow state cues, so states stay distinguishable without movement; the
loading spinner is exempt and keeps turning, since it is essential progress feedback. Every state holds
WCAG 2.2 AA (ADR 0026).

## CSS Modules + `@layer`

Styling is **CSS Modules + CSS custom properties + native `@layer`** — no Sass, no CSS-in-JS
(ADR 0002). The cascade-layer order is declared **once** in `src/styles/layers.css` (reset →
tokens → base → components → utilities → overrides) so specificity is predictable and a component
never has to fight the cascade.

## Responsive

Mobile-first, three mechanisms, chosen by what the layout depends on (ADR 0014):

- **Viewport `@media`** for Dialog and page templates, on one em scale only: `(width >= 30em)` sm,
  `48em` md, `64em` lg, `80em` xl, written in range notation. A stylelint
  `media-feature-name-value-allowed-list` rule rejects any other width value in a media query.
- **`@container`** inside components whose layout follows their own width (FormField, Card, Tabs),
  with `rem` thresholds local to the component. The container needs a width given by its parent.
- **Fluid CSS, no breakpoint** for atoms.

The unprefixed style must work at 320 CSS px (WCAG 1.4.10); the visual gate shoots every story at
that width. No responsive props, no utility classes, and no `useMediaQuery` hook until a component
needs JavaScript.

## Overriding components

Consumers restyle components — and their internal sub-parts — through a layered, public API, never by
touching the hashed CSS-Module class names, which are private and change every build. The tiers, from
most-sanctioned to escape hatch: semantic tokens → per-component `--omnia-<name>-*` variables → a
stable `data-scope`/`data-part` attribute contract selected from `@layer overrides` (the last layer,
so consumer rules win without `!important`) → the `style` prop. Every component documents its own
contract in its `.mdx`. Full specification and the per-component contract format: `docs/overrides.md`
(ADR 0010).

## Prop names

A prop whose name is native on any HTML element keeps the native type and reaches the native element;
a narrower subset of values is allowed (`Input.type`). A visual variant axis with a native name is
prefixed `variant<Axis>` (`variantSize`, reflected as `data-size`), any other custom prop with a
native name gets a non-native word (`pending`, reflected as `data-loading`). The `data-*` contract
keeps its names (ADR 0015).

## Tooling

- **ESLint** (flat config) + **Prettier** for TS/JS and formatting.
- **stylelint** for CSS, including the no-raw-color rule that enforces the token contract.
- **`tsc --noEmit`** (`pnpm typecheck`), which also runs `src/native-prop-names.check.ts`: every
  component exported from `src/index.ts` is checked against React's HTML prop types, so a prop that
  reuses a native name with another type fails the build. The file is not imported by the library
  entry, so it never ships, and vitest does not collect it.
- **Vite** as the builder, **Storybook 10** (`@storybook/react-vite`) as the catalogue and test host.
- **Packaging**: `pnpm build` emits an ESM library (`dist/index.js` + `tsc` declarations) and one
  `dist/styles.css`; versions and releases go through Changesets (ADR 0011).

See `docs/adr/` for the decisions behind these choices.
