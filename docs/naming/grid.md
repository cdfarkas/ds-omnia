# Naming study — generic responsive columns primitive

Date: 2026-11-10. Method: official docs opened during this study. "Not documented here"
means the pages opened do not mention it, not that the system lacks it.

## Question

The layout layer (ADR 0033) needs a generic primitive that lays a set of items out in even
columns with a gap and adapts to the space it is given. What should it be called, what prop
names the column count and the gap, should it reflow by viewport breakpoints or by its own
width, and should it be one flat element or a container-plus-items split?

## Survey

| System          | Name                | Column count (prop / values)                          | Reflow mechanism                                  | Gap prop                       | Container/item split | Src |
| --------------- | ------------------- | ----------------------------------------------------- | ------------------------------------------------- | ------------------------------ | -------------------- | --- |
| MUI (v6 System) | `Grid`              | `columns` = total tracks, default `12`                | Breakpoint props (`size={{ xs, md }}`), flexbox   | `spacing` / `rowSpacing` / `columnSpacing` | Yes (`container` + items with `size`) | S1  |
| Chakra UI (v3)  | `SimpleGrid`        | `columns` = number of columns (responsive)            | `minChildWidth` → CSS grid `auto-fit` + `minmax()`| `gap` / `rowGap` / `columnGap` | No (flat, equal cells) | S2  |
| Radix Themes    | `Grid`              | `columns` = `Responsive<enum \| string>`, no default  | Responsive breakpoint object (`{ initial, md }`)  | `gap` / `gapX` / `gapY`        | No (flat, CSS grid)  | S3  |
| Carbon (2x Grid)| `Grid` + `Column`   | Fixed per breakpoint: 4 (sm) / 8 (md) / 16 (lg+)      | Breakpoint column count, or fixed-box auto-wrap   | Gutter modes (condensed / narrow) | Yes (`Grid` + `Column` spans) | S4  |

Notes on cells:

- MUI: `columns` changes the 12-track default; items declare a `size` (1–12 or responsive) and
  the layout changes at viewport breakpoints. It is flexbox, has no concept of rows, and does
  not auto-place by available width.
- Chakra: `SimpleGrid` is the equal-cell grid. Pass `columns` for a fixed (responsive) count,
  or `minChildWidth` to reflow automatically — the docs state this "uses css grid auto-fit and
  minmax() internally".
- Radix: `Grid` is a flat CSS-grid div. `columns` accepts a count like `"3"` or a full template
  string; every layout prop is `Responsive`, so reflow is per breakpoint object.
- Carbon: a `Grid` wrapper with `Column` children. Column count is fixed per breakpoint (4 / 8 /
  16); a separate "fixed box" mode tiles equal boxes that wrap as width grows (auto-fit-like).

## Patterns observed

- **Name.** Three of four name the layout component `Grid` (MUI, Radix, Carbon). Chakra's
  equal-cell variant is `SimpleGrid`, but its general grid is `Grid`. `Grid` is the unambiguous
  role name.
- **Column count is `columns`.** MUI, Chakra and Radix all name the count prop `columns`; Carbon
  fixes it per breakpoint. `columns` is the near-universal name for "how many columns".
- **Two reflow families.** Breakpoint-driven (MUI, Radix, Carbon fluid) swap the count at
  viewport breakpoints; content-driven (Chakra `minChildWidth`, Carbon fixed-box) use `auto-fit`
  + `minmax()` to wrap by the available width with no breakpoints. Only the content-driven family
  follows the element's own width.
- **Gap is a named scale.** Every system has a gap/spacing prop — `gap` (Chakra, Radix) or
  `spacing` (MUI) — taking a small scale, not raw lengths.
- **Flat vs. container+item.** MUI and Carbon split a container from spanned items; Chakra
  `SimpleGrid` and Radix are a single flat element with equal cells.

## Prop-name check (ADR 0015)

Omnia forbids a custom prop whose name is native on any HTML element when it carries custom
values; a visual variant axis with a native name becomes `variant<Axis>`.

- **`columns`** is not a native HTML attribute on any element — the native neighbours are `cols`
  (`<textarea>`, `<frameset>`) and `span` (`<col>`); `columns` is a CSS property only. It passes
  the native-prop gate and needs no `variant` prefix. Confirmed by `pnpm typecheck`.
- **`gap`** is not a native HTML attribute either (CSS property only), so it passes the gate and
  needs no prefix. Its values are a small named scale `sm | md | lg` mapped to spacing tokens,
  matching the other Omnia atoms and keeping raw lengths out of the API.
- **Flat, equal-cell shape.** Omnia takes the Chakra `SimpleGrid` / Radix shape — one `<div>`
  with `columns` equal tracks — not a `Grid` + `Column` span model. It is the simpler, lower-
  dependency primitive the layer asks for; per-item spans belong to the consuming app.
- **Own-width reflow.** Omnia follows the content-driven family (Chakra `minChildWidth`, and the
  repo's own `Stat`): `auto-fit` + `minmax()` capped at `columns`, so the grid reflows by its own
  width with no breakpoints and works at 320px (ADR 0014). `columns` is therefore the maximum
  column count, and no min-width prop is added — the reflow floor is an overridable CSS variable.

No proposed prop name collides with a native name.

## Decision

Chosen by the owner on 2026-11-10: the component is **`Grid`**; it takes **`columns`** (the
maximum column count, default `3`) and **`gap`** (`sm | md | lg`, default `md`). The name matches
MUI, Radix and Carbon; `columns` and `gap` match the common prop names and both satisfy the
native-prop rule (ADR 0015), while a flat equal-cell element with own-width reflow keeps the API
to two props.

## Sources

All opened 2026-11-10.

- S1 MUI (v6 System): https://v6.mui.com/system/react-grid/
- S2 Chakra UI (v3): https://chakra-ui.com/docs/components/simple-grid
- S3 Radix Themes: https://www.radix-ui.com/themes/docs/components/grid
- S4 Carbon (2x Grid): https://www.carbondesignsystem.com/building-blocks/foundations/2x-grid/overview
