# Naming study — generic one-direction flow-spacing primitive

Date: 2026-11-10. Method: official docs opened during this study (Polaris's component pages now
redirect to the web-components hub, so its props were read from the Polaris React source). "Not
documented here" means the pages opened do not mention it, not that the system lacks it.

## Question

The layout layer (ADR 0033) needs a generic primitive that lays a set of items out in one
direction — a row or a column — with a consistent gap between them. What should it be called, how
should the axis be expressed (one component with a direction prop, or one component per axis), what
names the gap, and should it be one flat flex element or a container-plus-items split?

## Survey

| System          | Name                       | Axis / direction                                              | Gap prop (type)                          | Container/item split | Default direction | Src |
| --------------- | -------------------------- | ------------------------------------------------------------- | ---------------------------------------- | -------------------- | ----------------- | --- |
| Chakra UI (v3)  | `Stack` (+ `HStack`/`VStack`) | `direction` prop; `HStack`/`VStack` are convenience wrappers | `gap` (spacing token scale)              | No (flat flex)       | `column`          | S1  |
| Shopify Polaris | `BlockStack` + `InlineStack` | Split by axis: BlockStack is vertical, InlineStack horizontal | `gap` (`SpaceScale` token, responsive)   | No (flat flex, two components) | BlockStack fixed column; InlineStack `direction` = `row`/`row-reverse`, default `row` | S2 |
| MUI (Material)  | `Stack`                    | `direction` prop (`row`/`row-reverse`/`column`/`column-reverse`) | `spacing` (theme-scale number; `useFlexGap`) | No (flat flex)   | `column`          | S3  |
| Radix Themes    | `Flex`                     | `direction` prop (`Responsive<enum>`)                         | `gap` / `gapX` / `gapY` (scale enum or string) | No (flat flex)  | none (CSS default `row`) | S4 |

Notes on cells:

- **Chakra**: `Stack` applies `flex-direction: column` and a `gap` by default; the `direction` prop
  flips it to a row. `HStack` and `VStack` are thin wrappers that preset the direction — the base
  component is a single `Stack` with a `direction` prop.
- **Polaris**: there is no single stack. `BlockStack` is the vertical one (fixed column, with a
  `reverseOrder` flag); `InlineStack` is the horizontal one (`direction` = `row` / `row-reverse`,
  `wrap` defaulting to `true`). Both take `gap` as a `SpaceScale` token.
- **MUI**: one `Stack` for one-dimensional layouts (it points to `Grid` for two-dimensional). The
  axis is the `direction` prop, default `column`; spacing is a theme-scale `spacing` number, with an
  opt-in `useFlexGap` to use real CSS `gap`.
- **Radix**: the one-direction primitive is `Flex`, a flat div with a `direction` prop and a `gap`
  scale. It adds `align`, `justify` and `wrap` props; there is no preset default direction.

## Patterns observed

- **Name.** Two of four name the one-direction primitive `Stack` (Chakra, MUI); Radix calls its flex
  box `Flex`; Polaris splits it by axis into `BlockStack` / `InlineStack`. `Stack` is the clearest
  role name for "items in one direction with spacing".
- **Axis is usually one `direction` prop.** Chakra, MUI and Radix all express the axis with a single
  `direction` prop on one component; only Polaris ships a separate component per axis. Chakra even
  keeps `HStack`/`VStack` as wrappers over the same `direction`-driven `Stack`.
- **Default direction is `column`.** Chakra and MUI both default to a vertical column; Polaris's
  vertical `BlockStack` is the block-flow default; Radix sets no default. Vertical is the common
  starting axis.
- **Gap is a named scale.** Every system spaces children with a small named scale — `gap` (Chakra,
  Polaris, Radix) or `spacing` (MUI) — never raw lengths as the primary API.
- **Flat, not container+item.** All four are a single flat flex element (Polaris just has two of
  them); none uses a container-plus-spanned-item model. One-direction layout does not need spans.

## Prop-name check (ADR 0015)

Omnia forbids a custom prop whose name is native on any HTML element when it carries custom values;
a visual variant axis with a native name becomes `variant<Axis>`.

- **`direction`** is not a native HTML attribute on any element — the native neighbour is `dir`
  (`'ltr' | 'rtl' | 'auto'`), and `direction` is a CSS property (and an SVG presentation attribute,
  which the gate does not scan). It passes the native-prop gate and needs no `variant` prefix.
  Confirmed by `pnpm typecheck`.
- **`gap`** is not a native HTML attribute either (CSS property only), so it passes the gate and
  needs no prefix. It reuses the exact scale `Grid` ships — `none | sm | md | lg` mapped to spacing
  tokens — so the two layout primitives read the same.
- **`justify`** (main-axis alignment, `start | center | end | between`) is not a native HTML
  attribute, so it passes the gate as-is. It matches Radix's `justify`.
- **`align` → `alignItems`** (cross-axis alignment, `start | center | end | stretch`). `align` **is**
  a native HTML attribute (on `img`, `table`, cells, etc.) with a narrow non-flex value type, so a
  flex value set collides and `src/native-prop-names.check.ts` fails `pnpm typecheck` on it. Per
  ADR 0015 the custom prop is renamed to the non-native `alignItems` (the CSS property name, as MUI
  uses). `justify` does not have the same native clash, so it keeps its short name — the pair is
  `alignItems` / `justify`.
- **Single flat element.** Omnia takes the Chakra / MUI / Radix flat shape — one `<div>` with a
  `direction` prop — not the Polaris two-component split. One component with `direction` is the
  lower-surface primitive the layer asks for.
- **Axis set.** Omnia keeps `direction` to `row | column` (no `*-reverse`) and adds no `wrap` prop:
  wrapping belongs to the consuming app, and nothing wraps by default. Base layout is a column, which
  works at 320px (ADR 0014).

`justify` does not collide with a native name; `align` does, so the cross-axis prop is `alignItems`.

## Decision

Chosen by the owner on 2026-11-10: the component is a single **`Stack`** — not a `BlockStack` /
`InlineStack` split — with a **`direction`** prop (`row | column`, default `column`) and a **`gap`**
prop (`none | sm | md | lg`, default `md`, the same token scale as `Grid`). The name matches Chakra
and MUI; one `direction` prop matches Chakra, MUI and Radix; and a flat single-element shape keeps it
the one-direction primitive the layer asks for.

On the same day the owner added the two alignment props and the nesting composition pattern:
**`alignItems`** (`start | center | end | stretch`, cross-axis) and **`justify`**
(`start | center | end | between`, main-axis), both optional (unset = the flex default). `align` was
the requested name for the cross axis, but it is a native HTML attribute and fails the ADR 0015 gate,
so it is `alignItems` (see the prop-name check). With the two axes a Stack nests to compose small
two-dimensional layouts (a column of rows), which the `Nested` story illustrates; an even grid of
equal cells is `Grid`, not nested Stacks.

## Sources

All opened 2026-11-10.

- S1 Chakra UI (v3) Stack: https://chakra-ui.com/docs/components/stack
- S2 Shopify Polaris — component pages redirect to the Polaris web-components hub
  (https://shopify.dev/docs/api/polaris); props read from the Polaris React source:
  BlockStack https://github.com/Shopify/polaris/blob/main/polaris-react/src/components/BlockStack/BlockStack.tsx
  and InlineStack https://github.com/Shopify/polaris/blob/main/polaris-react/src/components/InlineStack/InlineStack.tsx
- S3 MUI (Material UI) Stack: https://mui.com/material-ui/react-stack/
- S4 Radix Themes Flex: https://www.radix-ui.com/themes/docs/components/flex
