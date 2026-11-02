# ADR 0019 — Icon sets: MingCute (default skin) and an Omnia pixel set (pixel skin), regular and solid

## Status

Accepted

## Context

Each skin needs one icon set that matches its look. The set ships inside `@cdfarkas/omnia`, an MIT
npm package, so it must be free to use and to redistribute there.

Colour must come from the semantic tokens like everything else (ADR 0003): a glyph paints with
`currentColor`, so it follows the theme and skin and stays under the WCAG 2.1 AA gate (ADR 0006). A
glyph must not depend on the network at runtime, the same rule that has the fonts self-hosted (ADR
0008).

Today's components need 33 core glyphs. IconPark was ruled out because its repository is archived;
the third-party pixel sets were ruled out on licence terms or on style.

## Decision

Omnia ships two vendored SVG icon sets, one per skin. Each set ships two styles, `regular` and
`solid`, under the same 33 semantic glyph names: close, check, chevron-down, chevron-right,
arrow-left, arrow-right, external-link, search, plus, minus, menu, info, warning, error, success,
eye, eye-off, calendar, user, settings, home, trash, edit, copy, download, upload, heart, star, bell,
sun, moon, globe, loader.

```text
src/icons/default/LICENSE, NOTICE.md
src/icons/default/regular/<name>.svg
src/icons/default/solid/<name>.svg
src/icons/pixel/regular/<name>.svg
src/icons/pixel/solid/<name>.svg
```

- **Default skin — MingCute.** The glyphs come from `@mingcute/svg` 3.0.2: `regular` is its
  `core-regular` style, `solid` its `core-filled` style. They are vendored as SVG files, unmodified
  apart from the file name. They are Apache-2.0: the licence text (`LICENSE`) and the attribution
  (`NOTICE.md`) sit in `src/icons/default/`. `NOTICE.md` holds the mapping, the same for both styles,
  wherever the MingCute source glyph has a different name.
- **Pixel skin — an Omnia-owned set.** Each glyph is drawn on a 16 × 16 grid in 2px blocks, radius
  0, as a single `<path>` with `fill="currentColor"` and `shape-rendering="crispEdges"`. `regular`
  glyphs are outline drawings in 2px strokes; `solid` glyphs are filled shapes with knocked-out
  details. The set is MIT with the rest of the package. `scripts/pixel-icons.py` rebuilds both styles
  (`python scripts/pixel-icons.py <out-dir>` writes `<out-dir>/regular/` and `<out-dir>/solid/`).
- **Line glyphs.** In the pixel set, 15 glyphs are the same file in both styles: arrow-left,
  arrow-right, check, chevron-down, chevron-right, close, download, edit, external-link, loader, menu,
  minus, moon, plus, upload. In MingCute no glyph is shared: the solid line glyphs (close, check, the
  chevrons and arrows, plus, minus, menu, loader) are drawn 3 units wide on the 24-unit grid, the
  regular ones 2 units.
- **Use.** `regular` is the default rendering; `solid` marks an active or selected state.

## Example

The same glyph in each set, `check`. MingCute solid (`src/icons/default/solid/check.svg`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M21.546 5.112a1.5 1.5 0 0 1 0 2.121L10.232 18.547a1.5 1.5 0 0 1-2.121 0L2.454 12.89a1.5 1.5 0 1 1 2.121-2.121l4.596 4.596L19.424 5.112a1.5 1.5 0 0 1 2.122 0" clip-rule="evenodd"/></svg>
```

Omnia pixel (`src/icons/pixel/solid/check.svg`, the same file as `regular/check.svg`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges"><path d="M12 3h2v1h-2zM11 4h3v1h-3zM10 5h3v1h-3zM9 6h3v1h-3zM2 7h2v1h-2zM8 7h3v1h-3zM2 8h3v1h-3zM7 8h3v1h-3zM3 9h6v1h-6zM4 10h4v1h-4zM5 11h2v1h-2z"/></svg>
```

The two styles of one pixel glyph, `heart`. Regular (`src/icons/pixel/regular/heart.svg`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges"><path d="M2 2h4v1h-4zM10 2h4v1h-4zM1 3h6v1h-6zM9 3h6v1h-6zM1 4h2v1h-2zM6 4h4v1h-4zM13 4h2v1h-2zM1 5h2v1h-2zM7 5h2v1h-2zM13 5h2v1h-2zM1 6h2v1h-2zM13 6h2v1h-2zM2 7h2v1h-2zM12 7h2v1h-2zM3 8h2v1h-2zM11 8h2v1h-2zM4 9h2v1h-2zM10 9h2v1h-2zM5 10h2v1h-2zM9 10h2v1h-2zM6 11h4v1h-4zM7 12h2v1h-2z"/></svg>
```

Solid (`src/icons/pixel/solid/heart.svg`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges"><path d="M2 2h4v1h-4zM10 2h4v1h-4zM1 3h6v1h-6zM9 3h6v1h-6zM1 4h14v1h-14zM1 5h14v1h-14zM1 6h14v1h-14zM2 7h12v1h-12zM3 8h10v1h-10zM4 9h8v1h-8zM5 10h6v1h-6zM6 11h4v1h-4zM7 12h2v1h-2z"/></svg>
```

No file names a colour. An inline glyph inherits it from its parent, which reads a semantic token:

```css
.toolbar {
  color: var(--omnia-color-text-primary); /* the glyph's currentColor */
}
```

## Consequences

- Glyph colour follows the semantic tokens in all four theme × skin modes, with no per-mode SVG.
- No icon font, CDN or runtime package: the glyphs are static files in the repository.
- One name list serves both skins and both styles, so a component asks for `close` and gets the
  right drawing for the active skin.
- The Apache-2.0 `LICENSE` and `NOTICE.md` must ship with the package wherever the MingCute files do.
  `package.json` publishes only `dist/` today, so the build that first bundles the icons must carry
  both files with them.
- Two MingCute glyphs are stand-ins for the semantic name: `loader` is `loading-3` (a static ring and
  arc) and `globe` is `earth`.
- The pixel set is crisp at 16, 32 and 48 px; at 24 px its blocks fall between device pixels and
  blur.
- Every new glyph has to exist in four places under the same name (two sets × two styles), and both
  pixel styles drawn in `scripts/pixel-icons.py`.
- Next steps, each with its own ADR: an `Icon` component (after its naming study, per `CLAUDE.md`),
  the mechanism that swaps the set with the skin, and the consumer API for overriding glyphs.
