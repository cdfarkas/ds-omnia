# ADR 0036 — Responsive heading type scale

## Status

Proposed <!-- extends ADR 0014 (responsive strategy) and ADR 0032 (brutalist skin) -->

## Context

`Heading` keeps one font size per step (`xs`…`2xl`) at every width. At 320 CSS px the widest
words of a realistic title no longer fit: measured with the shipped faces, a 13-letter word
such as "documentation" is 7.4 em wide in Fraunces 600, 9.7 em in Archivo Black uppercase
(brutalist) and 13 em in Press Start 2P (pixel). With a 16 px gutter each side (288 px of
content), the current `2xl` (3rem, 1.5rem in pixel) overflows in all three skins, and
`text-wrap: balance` cannot help a single word.

ADR 0014 keeps atoms fluid, and fluid type (`clamp()`) was ruled out by the owner on
2026-11-13 in favour of explicit values that can be reviewed cell by cell.

## Decision

**Heading takes one size per step × viewport breakpoint × skin, from the tables below.**
Every cell is declared in `Heading.module.css` as `--omnia-heading-size-<step>`, mobile-first,
under the ADR 0014 queries only; a step may repeat the previous value, but it is still
written. Sizes stay in `rem` (SC 1.4.4). The lg/xl columns keep the previous desktop values.
Values: rem / px at a 16 px root.

Default (neutral, Fraunces):

| Step | base (320 px up) | sm `30em` | md `48em` | lg `64em` | xl `80em` |
| --- | --- | --- | --- | --- | --- |
| `xs` | 1.0625 / 17 | 1.0625 / 17 | 1.0625 / 17 | 1.0625 / 17 | 1.0625 / 17 |
| `sm` | 1.125 / 18 | 1.125 / 18 | 1.25 / 20 | 1.25 / 20 | 1.25 / 20 |
| `md` | 1.25 / 20 | 1.375 / 22 | 1.5 / 24 | 1.5 / 24 | 1.5 / 24 |
| `lg` | 1.5 / 24 | 1.5 / 24 | 1.75 / 28 | 1.75 / 28 | 1.75 / 28 |
| `xl` | 1.75 / 28 | 2 / 32 | 2.25 / 36 | 2.25 / 36 | 2.25 / 36 |
| `2xl` | 2.25 / 36 | 2.5 / 40 | 2.75 / 44 | 3 / 48 | 3 / 48 |

Pixel (Press Start 2P, monospace 1 em per glyph):

| Step | base (320 px up) | sm `30em` | md `48em` | lg `64em` | xl `80em` |
| --- | --- | --- | --- | --- | --- |
| `xs` | 0.75 / 12 | 0.75 / 12 | 0.75 / 12 | 0.75 / 12 | 0.75 / 12 |
| `sm` | 0.85 / 13.6 | 0.85 / 13.6 | 0.85 / 13.6 | 0.85 / 13.6 | 0.85 / 13.6 |
| `md` | 0.9 / 14.4 | 1 / 16 | 1 / 16 | 1 / 16 | 1 / 16 |
| `lg` | 1 / 16 | 1.1 / 17.6 | 1.1 / 17.6 | 1.1 / 17.6 | 1.1 / 17.6 |
| `xl` | 1.125 / 18 | 1.25 / 20 | 1.25 / 20 | 1.25 / 20 | 1.25 / 20 |
| `2xl` | 1.25 / 20 | 1.5 / 24 | 1.5 / 24 | 1.5 / 24 | 1.5 / 24 |

Brutalist (Archivo Black, uppercase on `h1`–`h4`):

| Step | base (320 px up) | sm `30em` | md `48em` | lg `64em` | xl `80em` |
| --- | --- | --- | --- | --- | --- |
| `xs` | 1.0625 / 17 | 1.0625 / 17 | 1.0625 / 17 | 1.0625 / 17 | 1.0625 / 17 |
| `sm` | 1.125 / 18 | 1.125 / 18 | 1.25 / 20 | 1.25 / 20 | 1.25 / 20 |
| `md` | 1.25 / 20 | 1.25 / 20 | 1.5 / 24 | 1.5 / 24 | 1.5 / 24 |
| `lg` | 1.375 / 22 | 1.5 / 24 | 1.75 / 28 | 1.75 / 28 | 1.75 / 28 |
| `xl` | 1.5 / 24 | 1.75 / 28 | 2 / 32 | 2.25 / 36 | 2.25 / 36 |
| `2xl` | 1.75 / 28 | 2.25 / 36 | 2.5 / 40 | 3 / 48 | 3 / 48 |

The level → step map in `Heading.tsx` (`defaultSizeForLevel`) is unchanged: `h1` → `2xl`,
`h2` → `xl`, `h3` → `lg`, `h4` → `md`, `h5` → `sm`, `h6` → `xs`. `variantSize` still overrides
it, and the public API and `--omnia-heading-font-size` override are unchanged.

Rationale per skin, sized so a 13-letter word fits 288 px at base:

- **Default**: `2xl` 2.25rem puts "documentation" at 266 px; lower steps compress so the
  ratio between steps holds. `xs` stays 1.0625rem so it never drops to body size.
- **Pixel**: the face is monospaced at 1 em per glyph, so 13 glyphs need `2xl` ≤ 1.38rem;
  base uses 1.25rem (260 px). From `30em` the previous sizes return. `xs` is floored at
  0.75rem (12 px) at every width, up from 0.72rem; `sm` stays 0.85rem.
- **Brutalist**: Archivo Black uppercase is about 30 % wider than Fraunces, so it shrinks
  further at base: `2xl` 1.75rem ("documentation" 272 px, "accessibility" 237 px). It
  reaches the shared 3rem anchor only at `64em`. `xs` stays 1.0625rem at every width so it
  never matches body text, which lifts the base `sm`/`md`/`lg` to stay above it. The
  uppercase rule in `skins.css` stays on `h1`–`h4` only, so `h5`/`h6` keep mixed case.

## Consequences

- A long title keeps whole words at 320 px in every skin; `Heading.scale.test.ts` fails if
  any of the 90 cells is missing or not in `rem`, and the `TypeScale` story shows every
  step with its computed size per skin and viewport.
- Heading is the first atom with viewport `@media`; Responsive guideline and `CLAUDE.md` note
  the exception. The scale follows the viewport, not the container: a heading in a narrow
  column on a wide screen takes a smaller step through `variantSize`.
- A word longer than ~13 letters (e.g. "Internationalization") breaks without a hyphen via
  `overflow-wrap: anywhere`, only when it cannot fit on a line by itself. `break-word` was
  rejected because it leaves the min-content width at the full word, so a heading in a
  flex or grid item still overflows. `hyphens: auto` was rejected: Chromium does not
  hyphenate such words, and it breaks words that would fit on the next line ("ev-ery").
- 90 literal values to maintain; a new skin adds its own five blocks.
