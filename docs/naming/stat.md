# Naming study — stat (headline figure with caption)

Date: 2026-11-09. Method: the survey was run with the owner in an earlier session; the pages below were not reopened for this record, so each row is as recorded then. Prop names for Omnia were checked in `node_modules/@types/react/index.d.ts` (`@types/react` 19.3.0), against ADR 0015.

## Question

Omnia needs a molecule that puts one figure forward with its caption ("30+ / components") on a landing or portfolio page. What is it called, is it flat or compound, and which prop names would collide with native HTML names?

## Survey

| System | Component | Shape | Src |
| --- | --- | --- | --- |
| Chakra UI | `Stat` | Compound: `StatLabel`, `StatNumber`, `StatHelpText`, plus `StatGroup` | S1 |
| Ant Design | `Statistic` | Flat props: `title`, `value`, `prefix`, `suffix`, `precision` | S2 |
| Tremor | `Metric` + `Text` | Composed inside a `Card` | S3 |
| MUI, Polaris, Tailwind UI | none | "Stats" page sections only, no dedicated component | — |

## Patterns

- **Name.** `Stat` (Chakra), `Statistic` (Ant) and `Metric` (Tremor) are the three names; no two systems agree.
- **Shape.** Chakra composes parts as children; Ant passes the figure and caption as props. Tremor has no single component.
- **Grouping.** Only Chakra has a group component; elsewhere a row of figures is page layout.

## Prop-name check

Checked in `@types/react` 19.3.0:

- `value` is native (`string | readonly string[] | number`, on `input`, `option`, `li`, `meter`, `progress`, `data`, `button`, `select`, `textarea`, `param`). On `<data>` it is the machine-readable value. Not offered: the figure is `children` of `Stat.Value`.
- `title` is native (`string`, global on `HTMLAttributes`, the tooltip). Not used as a caption: the caption is `Stat.Label`.
- `prefix` is native (`string`, an RDFa attribute on `HTMLAttributes`). Not offered.
- `label` is native (`string`, on `option`, `optgroup`, `track`). Not a prop: it is a part name.
- `orientation` is not an HTML attribute: `@types/react` has it only on `SVGAttributes` (`number | string`); HTML elements get `aria-orientation` alone. `Stat` keeps the plain name `orientation` (`'horizontal' | 'vertical'`), like Divider. It is reflected as `data-orientation`, never as `aria-orientation`, which a `<dl>` does not allow.

No Stat prop carries a native name with custom values. The only custom prop is `Stat`'s `orientation`, which is not native on any HTML element; the rest are native ones passed through, plus `children`.

## Decision

Chosen by the owner on 2026-11-09.

- **Name `Stat`.** It fits Omnia's short naming register for atoms and molecules.
- **Compound, children-based:** `Stat` / `Stat.Item` / `Stat.Label` / `Stat.Value` / `Stat.Hint` on `<dl>` / `<div>` / `<dt>` / `<dd>` / `<dd>`. No `value` prop, which avoids the native-prop collision ADR 0015 forbids.
- **Out of scope:** a size or variant axis, component-supplied text (no translation keys).
- **Updated on 2026-11-09:** `Stat` is the list itself (`<dl>`, `orientation`: `horizontal` default, a wrapping row; `vertical`, one column) with a required `Stat.Item` (`<div>`) per figure, even a single one, mirroring `DescriptionList`; a screen reader announces one list however many figures it holds. A `Stat.Group` wrapper was tried and dropped because a part wrapping its root inverts the compound hierarchy.

## Sources

- S1 Chakra UI: https://npmjs.com/package/@chakra-ui/stat
- S2 Ant Design: https://ant.design/components/statistic/
- S3 Tremor: https://www.tremor.so/docs/getting-started/first-component
