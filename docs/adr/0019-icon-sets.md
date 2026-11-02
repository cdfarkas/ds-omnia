# ADR 0019 — Icon sets: MingCute fill (default skin) and an Omnia pixel set (pixel skin)

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

Omnia ships two vendored SVG icon sets, one per skin, under the same 33 semantic glyph names: close,
check, chevron-down, chevron-right, arrow-left, arrow-right, external-link, search, plus, minus,
menu, info, warning, error, success, eye, eye-off, calendar, user, settings, home, trash, edit, copy,
download, upload, heart, star, bell, sun, moon, globe, loader.

- **Default skin — MingCute, fill style.** The glyphs come from `@mingcute/svg` 3.0.2 and are
  vendored as SVG files, unmodified apart from the file name, in `src/icons/default/`. They are
  Apache-2.0: the licence text (`LICENSE`) and the attribution (`NOTICE.md`) sit next to the files.
  `NOTICE.md` holds the mapping wherever the MingCute source glyph has a different name.
- **Pixel skin — an Omnia-owned set**, in `src/icons/pixel/`. Each glyph is drawn on a 16 × 16 grid
  in solid 2px blocks, radius 0, as a single `<path>` with `fill="currentColor"` and
  `shape-rendering="crispEdges"`. The set is MIT with the rest of the package. `scripts/pixel-icons.py`
  rebuilds every file from its source (`python scripts/pixel-icons.py <out-dir>`).

## Example

The same glyph in each set, `check`. MingCute fill (`src/icons/default/check.svg`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M21.546 5.112a1.5 1.5 0 0 1 0 2.121L10.232 18.547a1.5 1.5 0 0 1-2.121 0L2.454 12.89a1.5 1.5 0 1 1 2.121-2.121l4.596 4.596L19.424 5.112a1.5 1.5 0 0 1 2.122 0" clip-rule="evenodd"/></svg>
```

Omnia pixel (`src/icons/pixel/check.svg`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges"><path d="M12 3h2v1h-2zM11 4h3v1h-3zM10 5h3v1h-3zM9 6h3v1h-3zM2 7h2v1h-2zM8 7h3v1h-3zM2 8h3v1h-3zM7 8h3v1h-3zM3 9h6v1h-6zM4 10h4v1h-4zM5 11h2v1h-2z"/></svg>
```

Neither file names a colour. An inline glyph inherits it from its parent, which reads a semantic
token:

```css
.toolbar {
  color: var(--omnia-color-text-primary); /* the glyph's currentColor */
}
```

## Consequences

- Glyph colour follows the semantic tokens in all four theme × skin modes, with no per-mode SVG.
- No icon font, CDN or runtime package: the glyphs are static files in the repository.
- One name list serves both skins, so a component asks for `close` and gets the right drawing for
  the active skin.
- The Apache-2.0 `LICENSE` and `NOTICE.md` must ship with the package wherever the MingCute files do.
  `package.json` publishes only `dist/` today, so the build that first bundles the icons must carry
  both files with them.
- Two MingCute glyphs are stand-ins for the semantic name: `loader` is `loading-3` (a static ring and
  arc) and `globe` is `earth`.
- The pixel set is crisp at 16, 32 and 48 px; at 24 px its blocks fall between device pixels and
  blur.
- Every new glyph has to be added to both sets under the same name, and the pixel one drawn in
  `scripts/pixel-icons.py`.
- Next steps, each with its own ADR: an `Icon` component (after its naming study, per `CLAUDE.md`),
  the mechanism that swaps the set with the skin, and the consumer API for overriding glyphs.
