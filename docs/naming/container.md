# Naming study — generic max-width page wrapper

Date: 2026-11-10. Method: official docs opened during this study. "Not documented here"
means the pages opened do not mention it, not that the system lacks it.

## Question

The layout layer (ADR 0033) needs a generic wrapper that caps content to a readable width,
centres it, and adds horizontal gutters. What should it be called, how should the width be
chosen, and should "no cap" be a separate flag or part of the width scale?

## Survey

| System          | Name        | Width choice (prop / values)                              | No-cap option            | Gutters                                   | Centres by default | Src |
| --------------- | ----------- | --------------------------------------------------------- | ------------------------ | ----------------------------------------- | ------------------ | --- |
| MUI (v4)        | `Container` | `maxWidth` = `xs`/`sm`/`md`/`lg`/`xl`/`false`             | `maxWidth={false}`       | Default padding (removed via the API prop)| Yes                | S1  |
| Bootstrap 5.3   | `.container`| `.container` + `.container-{sm…xxl}` (max-width per bp)   | `.container-fluid`       | `$container-padding-x` (padding l/r)      | Yes (margin auto)  | S2  |
| Chakra UI (v3)  | `Container` | `maxWidth` (default `8xl` = 90rem/1440px)                 | `fluid` prop             | Not documented here (padding via props)   | Yes                | S3  |
| Radix Themes    | `Container` | `size` = `1`/`2`/`3`/`4` → 448/688/880/1136px (default 4) | `maxWidth`/`width` props | None built in (page padding via `px`)     | Yes                | S4  |

Notes on cells:

- MUI: the Container page documents `maxWidth`, `fixed` and horizontal centring; it does not
  list the gutter prop on that page (`disableGutters` lives on the API reference).
- Bootstrap: the generated classes are breakpoint-responsive — a `.container-md` is 100% wide
  until 768px, then capped. The Sass mixin shows `margin-right/left: auto` and symmetric
  `padding`.
- Chakra v3: the `Container` props table lists `centerContent` and `fluid`; width is set
  through the standard `maxWidth` style prop.
- Radix: `Container` only constrains max-width and aligns (`align`). It ships no gutter; page
  padding is applied with the shared `px`/`p` props or a surrounding `Section`.

## Patterns observed

- **Name.** Four of four call it `Container` (MUI, Chakra, Radix) or `.container` (Bootstrap).
  No system in the sample uses another name for this role. The name is unambiguous and the
  obvious pick.
- **Width as a small named scale.** Every system caps width through a short scale, not a free
  length: MUI breakpoint tokens, Bootstrap breakpoint classes, Chakra size tokens, Radix 1–4.
- **No-cap folded in or a flag.** Bootstrap (`-fluid`), Chakra (`fluid`) and MUI
  (`maxWidth={false}`) all offer a full-width mode. Bootstrap folds it into the class family;
  MUI folds it into the same `maxWidth` prop; Chakra adds a boolean.
- **Centring is the default** in all four; none asks the caller to opt in.
- **Gutters vary.** MUI and Bootstrap ship default horizontal padding; Radix ships none and
  leans on page padding; Chakra applies it through style props.

## Prop-name check (ADR 0015)

Omnia forbids a custom prop whose name is native on any HTML element when it carries custom
values; a width/size variant axis becomes `variant<Axis>`.

- **`size`** is native on `<input>`, `<select>`, `<textarea>` and others, so it cannot be a
  custom prop with the values `sm`/`md`/`lg`/`xl`/`full`. Omnia uses **`variantSize`**, matching
  Avatar, Button, Input, Checkbox, Switch and Spinner. This rules out Radix's `size`.
- **`maxWidth`** is not a native HTML attribute, so it would pass the gate, but it names a CSS
  property rather than a variant axis and would break the repo's one-name-for-one-axis
  convention. Not chosen.
- **No-cap as a flag** (`fluid`/`fixed`) adds a second axis for one value. Omnia folds it into
  the scale as `variantSize="full"`, keeping a single axis.
- Gutters are not a prop: Container always gutters (it is a layout primitive) and the gutter is
  re-pointed through `--omnia-container-gutter` for consumers that need a different one.

No proposed prop name collides with a native name once `size` is expressed as `variantSize`.

## Decision

Chosen by the owner on 2026-11-10: the component is **`Container`**; the width is chosen with
**`variantSize`** over `sm | md | lg | xl | full`, where `full` removes the max-width. The name
matches every system surveyed, and `variantSize` satisfies the native-prop rule (ADR 0015) while
staying consistent with the other Omnia atoms.

## Sources

All opened 2026-11-10.

- S1 MUI (v4): https://v4.mui.com/components/container/
- S2 Bootstrap 5.3: https://getbootstrap.com/docs/5.3/layout/containers/
- S3 Chakra UI (v3): https://chakra-ui.com/docs/components/container
- S4 Radix Themes: https://www.radix-ui.com/themes/docs/components/container
