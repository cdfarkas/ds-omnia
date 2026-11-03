# ADR 0020 — Icon component: glyph prop, skin-driven set swap, build-time SVG bundling

## Status

Accepted <!-- fulfils ADR 0019's first "Next step": the Icon component -->

## Context

ADR 0019 vendored two SVG icon sets, `default` (MingCute, Apache-2.0) and `pixel` (Omnia-owned,
MIT), each in `regular` and `solid` styles, under 33 shared semantic glyph names, at
`src/icons/<set>/<style>/<name>.svg` — 132 files. Every file paints with `currentColor`, carries no
colour literal, and needs no network at runtime (ADR 0008). ADR 0019 named three follow-ups, each
needing its own ADR: the `Icon` component, the mechanism that swaps the set with the active skin,
and the consumer API for overriding glyphs. This ADR covers the component and the set-swap
mechanism; the glyph-override API is deferred (see Consequences).

The naming study (`docs/naming/icon.md`) predates ADR 0019. Two findings still hold and are adopted:
the component name **`Icon`**, and a single component that picks its glyph by a prop. Its glyph
**sourcing** (an inline-JSX table, no build step) and its **brand glyphs** (github, linkedin,
bluesky) are superseded by ADR 0019, which made the glyphs vendored files and did not include brand
marks in its 33-name set.

Forces the component must satisfy:

- **Prop naming rule (ADR 0015).** A prop whose name is native on any HTML element keeps the native
  type; a visual variant axis with a native name becomes `variant<Axis>`; any other custom prop with
  a native name takes a non-native word. `src/native-prop-names.check.ts` enforces this on every
  component exported from `src/index.ts` under `pnpm typecheck`.
- **Token contract (ADR 0003/0013).** Colour comes from `currentColor`; the CSS module reads only
  semantic or `--omnia-icon-*` custom properties, no raw colour.
- **Theming runtime (ADR 0017).** `OmniaThemeProvider` writes `data-theme`/`data-skin` on the
  document root; `data-skin` is the single source of truth, and a consumer can set it without the
  React provider.
- **Override API (ADR 0010).** A component exposes `data-scope`/`data-part` and reads
  `--omnia-<name>-*` variables with a token fallback. `Spinner` is the reference atom: a `<span>`
  wrapper, `variantSize` for the size axis, `--omnia-spinner-*` hooks.

## Decision

### 1. Prop API

One atom, `Icon`, selecting its glyph by a prop.

- **`glyph: IconGlyph`** — the union of the 33 ADR-0019 names, derived from one source
  (`ICON_GLYPHS`) that also drives the glyph map and the stories. Chosen over `name`: `name` is
  native with another meaning (a form-control name) and reaches no attribute on the rendered span,
  so ADR 0015 rules it out. `icon` would stutter (`<Icon icon="home"/>`); `glyph` is non-native.
- **`variantStyle: 'regular' | 'solid'`, default `'regular'`.** The native word is `style`
  (`CSSProperties`), so this visual variant axis takes `variant<Axis>` (ADR 0015 rule 2), pairing
  with `variantSize`. ADR 0019's "`regular` is the default; `solid` marks an active or selected
  state" maps to it directly.
- **`variantSize?: 'sm' | 'md' | 'lg'`**, reusing `Spinner`'s scale and the `data-variant-size`
  hook. With no `variantSize`, the icon is `1em` square and follows the surrounding type (as a link
  arrow does).
- **No colour prop.** The glyph inherits `currentColor`. The CSS module exposes
  `color: var(--omnia-icon-color, currentcolor)` as the per-component override hook (ADR 0010),
  mirroring `--omnia-spinner-color`. `color` is native anyway (ADR 0015).
- **Accessibility.** Decorative by default: the atom sets `aria-hidden="true"` and no role — the
  common case is an icon inside a labelled `Button` or `Link`. When the caller passes `aria-label`
  or `aria-labelledby`, the atom sets `role="img"` and drops `aria-hidden`; the label is the
  caller's (localised through their own `t()`). The atom ships no default label, because a built-in
  name would make every icon meaningful and contradict the decorative default. This is the WCAG
  1.1.1 behaviour of Lucide, Carbon and Spectrum.
- **Base prop type.** Extending `SVGAttributes`/`HTMLAttributes` fails the native-prop gate on the
  event handlers. The minimal compliant surface is
  `AriaAttributes & Pick<HTMLAttributes<HTMLSpanElement>, 'className' | 'style' | 'id' | 'role'>`
  plus `glyph`, `variantStyle`, `variantSize`. A clickable icon is a `Button`/`Link` holding an
  `Icon`, so DOM handlers are not needed on it.

### 2. Skin-swap mechanism — CSS-only, driven by the `[data-skin]` ancestor

`Icon` renders **both** the `default` and the `pixel` SVG for the requested glyph and style inside
its wrapper, and the CSS module shows exactly one by matching the `data-skin` on an ancestor. The
pixel SVG is hidden by default (so a page with no provider, which ADR 0017 allows, still renders the
`default` glyph); the `[data-skin='pixel']` selector swaps them.

Chosen over a `useTheme()` hook that renders only the active SVG. The hook couples the icon to the
React provider: a shell that sets `data-skin` on the root directly — which ADR 0017 explicitly
allows — would get the context default and diverge from the CSS-themed rest of the page. ADR 0017
makes `data-skin` the single source of truth, and the hook quietly introduces a second, React-only
one. CSS-only keeps one source, works under SSR with no hydration branch, and needs no React
runtime. The cost — two SVG nodes per icon in the rendered HTML — is accepted and noted.

### 3. SVG bundling — eager `import.meta.glob(... ?raw)` into a typed map

The glyph files reach the bundle at build time with no runtime network (ADR 0008/0019):

```ts
import.meta.glob('../../../icons/*/*/*.svg', { query: '?raw', eager: true, import: 'default' });
```

`eager: true` inlines the raw SVG strings. A `*.test.ts` asserts the map holds all 33 × 2 × 2 = 132
entries, so a missing or misnamed file fails the suite rather than rendering blank. Chosen over a
lazy glob (reintroduces a runtime fetch, breaking ADR 0008) and over a generated index module (a
second generator to keep in step with `scripts/pixel-icons.py`, not worth it over the one-line glob).
All 132 files bundle with no per-glyph tree-shaking — accepted, because the set is small and the
skin-swap renders both sets anyway, so no glyph is dead code at the set level.

Because the vendored files are full `<svg>` elements and the skin-swap needs a wrapper holding both
variants plus `data-scope`/`data-part`/`role`/`aria-*`, `Icon` renders a `<span>` wrapper (as
`Spinner` does) and injects each raw `<svg>` string with `dangerouslySetInnerHTML`. The string comes
from a vendored file in this repository, never from a consumer or the network, so the injection is
not an untrusted-HTML sink. No new dependency (no SVGR); `?raw` is native to Vite.

## Consequences

- Omnia gains its first SVG-rendering atom, following the `Spinner` structure (span wrapper,
  `variantSize`, `data-scope`/`data-part`, `--omnia-icon-*` hook) and the ADR 0015 gate (`glyph`,
  `variantStyle`, `variantSize`; no `name`, `style`, `color`, `size`).
- A component asks for `glyph="close"` and gets the right drawing for the active skin and style with
  no per-call skin logic, exactly as ADR 0019 intended.
- All 132 SVG files are bundled; no runtime network, no icon font, no new build dependency. A test
  guards the 132-entry map.
- The skin swap costs two SVG nodes per icon in the DOM. If this proves heavy on an icon-dense page,
  moving to the hook mechanism is a contained follow-up behind the same public API.
- **The glyph-override API is deferred.** ADR 0019 named a "consumer API for overriding glyphs" as a
  follow-up; no consumer needs it yet, so per the simplicity ladder nothing is shipped
  speculatively. The `--omnia-icon-color` hook is the only override surface today. Supplying a
  one-off glyph the set lacks (raw-SVG `children`) and swapping a vendored glyph app-wide (an
  `IconProvider` map) are each their own later decision.
- **Brand logos are out of scope.** `github`, `linkedin`, `bluesky` are not in ADR 0019's 33-name
  set; they are brand marks with their own licensing and no pixel equivalent, and belong to a
  separate ADR.
- New public surface a superseding ADR must guard: the `IconGlyph` union, `variantStyle` values, the
  `data-scope="icon"` / `data-part` contract, and `--omnia-icon-*`.
- `Link` draws its own private external-link glyph. Once `Icon` ships, `arrow-right`/`external-link`
  could replace it — a follow-up, not this ADR.
