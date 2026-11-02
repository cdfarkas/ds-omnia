# Naming study — icon (inline SVG glyph)

Date: 2026-11-02. Method: official docs and, where a docs page was silent, the system's own source file, opened during this study. "None documented" means the pages opened do not mention it, not that the system lacks it. "Not verified" means no usable page was opened. Pages were read through a fetch tool that summarises each page, so cell values are as reported by that summary. Prop names for Omnia were checked in `node_modules/@types/react/index.d.ts` (`@types/react` 19.3.0) and against the real gate in `src/native-prop-names.check.ts` (ADR 0015), run on throwaway type copies outside the repo.

## Question

Omnia needs an `Icon` atom for a bilingual personal site: LinkedIn, GitHub, Bluesky, sun, moon, arrow-up-right, arrow-down. Icons are an inline SVG set (no icon font, no external icon library), they must follow text colour through `currentColor`, and they must be accessible (WCAG 1.1.1). Four sub-questions:

1. What is the component called?
2. One `Icon` that picks a glyph by a prop, or one exported component per icon (`<GithubIcon/>`)?
3. Which props recur (size, colour, accessible label, decorative flag), and which collide with native HTML names under ADR 0015?
4. Where do the SVGs live, and how does a consumer pick one?

## Survey

10 rows: the 9 systems asked for, with Material Symbols (a font) kept apart from MUI's icon components. Opened but not summarised in a row: Lucide v1 migration page, Simple Icons.

| System | Component / name pattern | Individual vs name prop | Size | Colour | A11y | Src |
| --- | --- | --- | --- | --- | --- | --- |
| MUI | `@mui/icons-material/<Name>` (variants `DeleteOutlined`); `SvgIcon` wraps custom SVG; `Icon` wraps a font ligature | Individual. `Icon` takes the name as children (`<Icon>star</Icon>`) | `fontSize`: `inherit`, `small`, `medium` (default, 24px), `large` | `color` (default `inherit`), `htmlColor` | `titleAccess` gives `role="img"` and a `<title>`; without it `aria-hidden=true` and `focusable="false"` (source) | S1 |
| Material Symbols | `<span class="material-symbols-outlined">home</span>`; SVG files also downloadable | Name as ligature text (snake_case) | CSS `font-size`; axes `FILL`, `wght`, `GRAD`, `opsz` | Not shown on the page | None documented | S2 |
| Chakra UI | `Icon` wrapper only (`asChild`, `createIcon`). Ships no icons: recommends react-icons or lucide-react | n/a (wrapper) | `size`: `inherit` (default), `xs` to `2xl` (recipe: `boxSize` 3 to 8) | Recipe base style `currentcolor` | `aria-hidden="true"` and `focusable={false}` set before the spread, so a caller can override; no role (source) | S3 |
| Radix Icons | `@radix-ui/react-icons`: `SunIcon`, `FaceIcon`, … | Individual ("All icons are available as individual React components") | 15x15 grid; width/height default `15` in the generated components read; props are `SVGAttributes` | `color?: string`, default `'currentColor'` in the components read | None documented; none set in the components read | S4 |
| Lucide (`lucide-react`) | One component per icon (`House`); `DynamicIcon name="camera"` from `lucide-react/dynamic` | Individual; name prop only in the dynamic variant | `size`, number, default `24` | `color`, default `'currentColor'` (source) | `aria-hidden="true"` by default; `aria-label` or a `<title>` child removes it. The source counts `aria-*`, `role` and `title` as a11y props | S5 |
| Heroicons | `@heroicons/react/24/outline`, `…/24/solid`, `…/20/solid`, `…/16/solid`: `BeakerIcon` | Individual | No size prop; `className="size-6"` | CSS `color`; the component sets `stroke="currentColor"` (source) | `aria-hidden="true"` by default; `title` and `titleId` props render a `<title>` and `aria-labelledby` (compiled source) | S6 |
| Ant Design | `@ant-design/icons`: `StarOutlined`, `StarFilled`, `StarTwoTone`; legacy `<Icon type="message" theme="outlined"/>` still shown | Individual (legacy name prop) | No size prop; `style` (`fontSize`). Custom SVG: `width`/`height` default `1em` | `style.color`; `twoToneColor`; custom SVG `fill` defaults `currentColor` | Outer `<span role="img" aria-label={icon name}>` by default, overridable; `spin`, `rotate` | S7 |
| IBM Carbon | `@carbon/icons-react`: `Add` | Individual | `size`: `16` (default), `20`, `24`, `32` | CSS `fill`; `currentColor` not stated | `aria-hidden="true"` unless `aria-label` or `aria-labelledby` is passed (which adds a role); `tabIndex` makes it focusable | S8 |
| GitHub Octicons | `@primer/octicons-react`: one component per icon (factory per name in source) | Individual | `size`: `small` (16), `medium` (32), `large` (64) | `fill`, default `currentColor` | `aria-label`, `aria-labelledby`, `title`; `focusable="false"` without `tabIndex`. `aria-hidden` not in the README | S9 |
| Adobe Spectrum | v3: `@spectrum-icons/workflow/<Name>`. S2: subpath imports such as `@react-spectrum/s2/icons/Folder` | Individual | v3 `size`: `XXS` to `XXL` (default M). S2: no size prop (private, set by `styles`) | v3 `color`: `negative`, `notice`, `positive`, `informative` only. S2: `currentColor` not confirmed | Decorative and hidden by default; `aria-label` on a standalone icon, or on the parent. S2 source: `role="img"`, `aria-hidden` true when no label | S10 |

Notes on cells:

- Radix: the `SunIcon` definition was not reached (the bundle is 492,915 characters; 200,000 read). The width/height/colour defaults come from the icons before it, which share one wrapper. `IconProps` extends `SVGAttributes<SVGElement>`, adds `color?: string` and `children?: never` (S4).
- Lucide: the source file sets the defaults and the a11y flag; the `aria-hidden` default itself is documented on the accessibility page (S5).
- Carbon: the README says the component "sets `aria-hidden="true"` unless certain props are passed"; the shared `getAttributes` helper was not readable (S8).
- Octicons: the docs site pages (`primer.style/octicons/`) returned navigation only; the README is the source for props (S9).
- Spectrum: S2 docs pages returned 404; S2 facts come from `Icon.tsx` (S10).

## Patterns observed

**Individual component or name prop.**

- Individual component per icon: 8 of 10 (MUI, Radix, Lucide, Heroicons, Ant, Carbon, Octicons, Spectrum).
- Wrapper only, no icons shipped: Chakra.
- Name as text: Material Symbols (ligature).
- A name prop exists in three places, none of them the main React API: Lucide `DynamicIcon` (docs warn that every icon is imported at build time, one module each, and may flicker), Ant's legacy `type`, MUI's ligature `Icon`. Lucide recommends direct imports for static use (S5).
- Every individual-component library ships hundreds to thousands of icons. That is the case where tree-shaking pays. None of them targets a set of 7.

**Size.** No shared word. `size` in 5 (Chakra, Lucide, Carbon, Octicons, Spectrum v3), `fontSize` in MUI, CSS or `className` in Heroicons, Radix, Ant. Values: number (Lucide, Carbon 16 to 32), t-shirt (Chakra, Spectrum), `small`/`medium`/`large` (Octicons, MUI). Three systems default to following the surrounding font size (MUI `inherit`, Chakra `inherit`, Ant `1em`).

**Colour.** `currentColor` or inheritance in 7 (MUI, Chakra, Radix, Lucide, Heroicons, Ant custom SVG, Octicons). Carbon uses CSS `fill`; Spectrum v3 offers semantic colours only. Where colour is inherited, no colour prop is needed (as in Omnia's `Spinner`).

**A11y.**

- Decorative by default with `aria-hidden="true"`: 6 (MUI, Chakra, Lucide, Heroicons, Carbon, Spectrum).
- The opposite default: Ant labels every icon with its own name (`role="img"`, `aria-label`).
- Radix documents nothing; Material Symbols documents nothing.
- Ways to make one meaningful: `aria-label` (Lucide, Carbon, Spectrum, Octicons, Ant), `aria-labelledby` (Carbon, Octicons), `titleAccess` (MUI), `title` (Heroicons, Octicons) or a `<title>` child (Lucide). The mechanism is one switch: a label turns `aria-hidden` off. Carbon, Lucide and Spectrum S2 all work this way.
- Three systems add `focusable="false"` (MUI, Chakra, and Octicons when there is no `tabIndex`). That is a legacy IE/Edge workaround; not verified as needed today.

**Standards.** WCAG 1.1.1 (S11): decoration is "implemented in a way that it can be ignored by assistive technology"; a control or input needs a name that "describes its purpose". An icon inside a button or link is therefore named by the control, not the icon (Lucide says the same, S5; Spectrum v3 says it, S10).

**Brand marks are a separate supply problem.** Lucide 1.0 removed all brand icons, naming legal pressure around trademarks, and points to Simple Icons (S12). GitHub and LinkedIn are in that set; Bluesky is not mentioned on the pages opened.

## Omnia constraints

- **ADR 0015**: a prop whose name is native on any HTML element keeps its native type and meaning and reaches the native element (narrower values allowed). A native-named variant axis becomes `variant<Axis>`. Any other custom prop with a native name gets a non-native name. SVG-only names are out of scope.
- **Token contract**: the CSS module reads semantic or `--omnia-icon-*` custom properties only; the glyphs carry `currentColor`, never a hex.
- **Naming study first** (`CLAUDE.md`): one component, one study. That is an argument for a single `Icon`, since 7 exported icon components would each need a name picked.
- Packaging (S13): the package has one entry (`"."`) and `"sideEffects": ["*.css"]`, so a barrel of per-icon components would be tree-shakeable by a bundler. Not tested.

Names checked in `@types/react` 19.3.0:

- **Native** (so they keep the native type and meaning): `name` (`string`, on a dozen-plus elements), `size` (`number`, on `input`/`select`), `color` (`string`, on `HTMLAttributes`), `title` (`string`), `label` (`string`, on `option`, `optgroup`, `track`), `width`, `height` (`number | string`), `type`, `value`.
- **Not native** (no HTML attribute of that name): `glyph`, `icon`, `symbol`, `variantSize`, `decorative`. `glyphName`, `glyphRef` and two `glyphOrientation*` names exist, but only on SVG attributes (out of scope under ADR 0015).

### Gate findings (run on throwaway copies of `native-prop-names.check.ts`)

1. **`name` as a literal union passes the gate.** `name: 'github' | 'sun'` is narrower than the native `string`, so it type-checks. It still breaks rule 1: it does not mean what native `name` means (a form-control name) and reaches no native attribute on `<svg>`. Rule 3 asks for a non-native name. Passing the gate does not make it compliant.
2. **`size: 'sm' | 'md'` fails** (`Icon.size reuses a native prop name…`), as for `Input`. `color?: 'x'` and `title?: string` pass; `label?: boolean` fails.
3. **Extending `SVGAttributes<SVGSVGElement>` fails the gate on about 165 event-handler props** (`onCopy`, `onClick`, …). They are typed on `SVGSVGElement`, the native ones on HTML elements, and the handler types are not assignable. `HTMLAttributes<SVGSVGElement>` fails the same way. `HTMLAttributes<HTMLElement>` and `HTMLAttributes<HTMLSpanElement>` (what `Spinner` uses) pass. These two also pass: `SVGAttributes` with the `on*` keys stripped, and `AriaAttributes` plus a picked `className`, `style`, `role`. This is the first Omnia atom to render a bare `<svg>`, so it needs one of those shapes. It also holds for any later SVG atom.

## Options for Omnia

### Shared base for A, B and C

A bare `<svg viewBox="0 0 24 24">` root, decorative unless labelled, drawn with `currentColor`, sized in CSS.

| Prop | Type | Native name? | Where it lands |
| --- | --- | --- | --- |
| `variantSize` | `'sm' \| 'md' \| 'lg'` (`IconSize`), optional | **Collision**: `size` is native (`number`); fails the gate as `size`. Compliant name: `variantSize` | root `data-variant-size`; sets `--omnia-icon-size` |
| `aria-label`, `aria-labelledby` | `string` | native ARIA names, pass through | the root; their presence turns the icon meaningful (`role="img"`, no `aria-hidden`) |
| `aria-hidden` | native | native, passes through | the root; set to `true` by the atom unless a label is present; a caller's value is spread after |
| `role` | native | native, same meaning | set by the atom before the spread |
| `className`, `style`, `ref`, `id` | native | native names, root target | the `<svg>` |
| `color` | not offered | **Collision**: native `string` on `HTMLAttributes`. Colour comes from the parent's `color` through `currentColor`; if an axis is ever needed, `intent` (not native) | none |
| `title` | not offered | **Collision risk**: native `string` (tooltip meaning); a `<title>` child also shows a native tooltip. Use `aria-label` | none |
| `label` | not offered | **Collision**: native `string` on `option`, `optgroup`, `track`; would reach nothing on `<svg>`. Use `aria-label` | none |
| `width`, `height` | not offered | native `number \| string`; size is set by `variantSize` | none |
| `children` | not offered | n/a; the atom owns the paths (Radix types `children?: never`) | none |
| `fill`, `stroke`, `viewBox` | not offered | SVG-only, out of ADR 0015 scope; the atom owns them | none |
| `spin`, `rotate` | not offered | not native; Ant has them. Rotation is a later composition | none |

Data attributes follow the other atoms: `data-scope="icon"`, `data-part="root"`, `data-variant-size`. Colour hook: `color: var(--omnia-icon-color, currentcolor)`, as `--omnia-spinner-color` does. Size scale: `sm` 1rem, `md` 1.5rem, `lg` 2rem (the `Spinner` scale). With no `variantSize`, the icon is `1em` square and follows the text, as `Link`'s private `ExternalIcon` does.

Base prop type (see gate finding 3): `AriaAttributes & Pick<SVGAttributes<SVGSVGElement>, 'className' | 'style' | 'role' | 'id'> & { ref?: Ref<SVGSVGElement> }`, or `SVGAttributes` minus its `on*` keys. The first is the smaller surface. A clickable icon is a `Button` or `Link` holding an `Icon`, so handlers are not needed on it.

A11y rule shared by A, B and C:

- No label: `aria-hidden="true"`, no role. The icon is decoration inside a labelled control (the usual case: theme toggle, external-link arrow).
- `aria-label` or `aria-labelledby`: `role="img"`, `aria-hidden` removed. A standalone icon that conveys meaning has a name (WCAG 1.1.1, S11).
- No built-in `t()` string. A default "GitHub" label would make every icon meaningful, which contradicts the decorative default. The caller passes the localised label.

### A. One `Icon`, glyph chosen by a `glyph` prop

```tsx
<Icon glyph="github" aria-label="GitHub" />
<Button aria-label={t('theme.toggle')}><Icon glyph={dark ? 'sun' : 'moon'} /></Button>
```

`glyph` is the union `IconGlyph`, derived from the glyph table (`keyof typeof glyphs`).

- Pro: one component, one naming study, one story set, one prop gate entry. Choosing a glyph from state (`sun` or `moon`) is a plain expression.
- Pro: the union is checked at compile time; a typo fails `pnpm typecheck`.
- Pro: 7 glyphs are a few hundred bytes of path data each (estimate, not measured), so shipping them all costs little. The tree-shaking argument of the survey does not apply at this size.
- Con: the whole table ships with the first import. At 50 or more glyphs, and with brand marks heavier than UI glyphs, that stops being free. Not measured.
- Con: no survey system uses a name prop as its main API; `glyph` has no precedent at all. `Icon` plus `name` is the closest (Lucide `DynamicIcon`, Ant legacy), and `name` is rejected above.
- Con: a consumer cannot add their own icon. MUI (`SvgIcon`), Chakra (`createIcon`) and Spectrum (custom `Icon`) all allow it.

### B. One component per icon (`<GithubIcon/>`)

Eight survey systems do it. Each export is a PascalCase function and is checked by the gate.

- Pro: ships exactly what is imported; the standard shape, so the expectations of someone arriving from Lucide or Heroicons are met.
- Con: 7 exports to name, document, story and test, and a new export per future icon. Each export is a public API, so a rename after release is breaking.
- Con: a state-driven choice (`sun` or `moon`) needs a component picked from a ternary.
- Con: the tree-shaking benefit is not measurable at 7 glyphs, and `sideEffects: ["*.css"]` means A would be dropped by a bundler only if the whole `Icon` is unused anyway.

### C. A generic `Icon` wrapper that takes SVG children (MUI `SvgIcon`, Chakra `Icon`)

`<Icon aria-label="…"><path d="…"/></Icon>`; Omnia ships no glyphs.

- Pro: smallest component; any icon works.
- Con: does not meet the need. The site wants a ready v1 set, and the glyph source still has to live somewhere. It is a possible later addition to A (children when no `glyph`), not a replacement.

### D. Names

- **`Icon`**: Chakra, Spectrum (custom), Ant (legacy) and MUI (`Icon`) use it as a component name; every other system names it per icon. Plain and unambiguous.
- **`SvgIcon`** (MUI): says the implementation, which Omnia does not want to promise.
- **`Glyph`**: precise, but the site and the stories all say "icon".

## Recommendation

Opinion, built on the facts above.

- **Name**: `Icon`.
- **Shape**: option A, a single `Icon` with a required `glyph` prop of type `IconGlyph`. Props: `glyph`, `variantSize`, native pass-through (`aria-*`, `role`, `className`, `style`, `ref`, `id`). No `color`, `title`, `label`, `width`, `height`, `children`.
- **Why not `name`**: it passes the gate as a literal union but is native on many elements with another meaning. ADR 0015 rule 3 asks for a non-native word, and the owner's reason for the rule (an integrator must never wonder whether a prop is native) applies. `icon` would read `<Icon icon="github"/>`; `glyph` does not stutter.
- **A11y**: decorative by default (`aria-hidden`), meaningful when `aria-label` or `aria-labelledby` is present (`role="img"`). The label comes from the caller.

Devil's advocate on the pick:

- **`glyph` has no precedent in the sample.** It is a new word to learn, like `variantSize`. If familiarity wins, `name` is the common word and the cost is a documented exception to ADR 0015, which the owner has said they do not want.
- **A name prop shuts out custom icons and ships all of them.** If the set grows past a few dozen, or a second app wants only two glyphs, B is the better shape. The move is cheap: the glyph table can generate per-icon exports without changing `Icon`, so A does not close B off. The reverse (B to A) breaks every import.
- **Implicit decorative default.** A standalone icon with no label is silently hidden. For an icon-only link the parent then has no name; axe's `link-name` rule catches it under the a11y gate, which is the safety net here. This is also how Lucide, Carbon and Spectrum S2 behave.
- **Stroke and fill in one component.** UI glyphs (arrows, sun, moon) are strokes; brand marks are filled shapes. The root can set `fill="none" stroke="currentColor"` with the brand paths overriding to `fill="currentColor" stroke="none"`, or every glyph can be redrawn as a fill. The second is more work; the first puts rendering details inside the table.
- **Pixel skin.** A smooth 2px stroke may clash with the pixel skin. Not checked here (the skin's rules live in ADR 0008 and the token file).
- **Brand marks carry trademark terms.** See the open questions.
- **The existing private icon is a consumer.** `Link` draws its own external-link glyph (`ExternalIcon`, with `aria-hidden`). If `Icon` ships, `arrow-up-right` makes it redundant, the same follow-up as `Button` and `Spinner`. Not this task.

## How the v1 set is organised

```
src/components/atoms/Icon/
  Icon.tsx            component: picks glyphs[glyph], applies the a11y rule
  glyphs.tsx          the table: one entry per glyph, inline SVG children
  Icon.module.css     size scale + color hook, tokens only
  Icon.stories.tsx    one story per state; a grid of every glyph x 4 modes
  Icon.mdx
  Icon.test.tsx       decorative default, labelled -> role="img", every glyph renders
  index.ts            exports Icon, IconProps, IconSize, IconGlyph
```

- **Table**: `glyphs.tsx` exports `const glyphs = { github: <path d="…"/>, linkedin: …, bluesky: …, sun: …, moon: …, 'arrow-up-right': …, 'arrow-down': … } as const` on one `0 0 24 24` grid. `IconGlyph = keyof typeof glyphs`. Adding a glyph means adding one entry; the union, the stories and the types follow.
- **No build step**: no SVGR, no Vite plugin, no `?raw` import. The paths are JSX, so they are type-checked, themeable by `currentColor`, and shipped by the existing library build.
- **Consumer**: `import { Icon } from '@cdfarkas/omnia'`, then `<Icon glyph="moon" />` or `<Icon glyph="github" aria-label="GitHub" />`. The type `IconGlyph` is exported for code that stores a glyph name. Whether the list of names is exported as a value is open.
- **Kebab-case names** for multi-word glyphs, as `data-*` and CSS do. The survey has no verified rule: Material uses snake_case (S2), Lucide's dynamic docs show only a single word (S5).
- **Tokens**: no raw hex in the CSS module or in the path attributes. Colour is `currentColor`. Size lengths are in the CSS module, as `Spinner`'s are.
- **Contrast**: an inherited colour carries the parent's token. A standalone meaningful icon must still reach 3:1 against its background (the SC 1.4.11 rule in the `CLAUDE.md` a11y gate). The `Link` or `Button` that holds it already sets that colour.

## Scope

Build now: `Icon` with the 7 v1 glyphs, `variantSize`, the label-driven a11y rule, a gallery story, tests. Skip for now: custom SVG children, per-icon exports, colour or intent axis, `spin`/`rotate`, default localised labels, more glyphs than the 7.

## Open questions for the owner

1. **Prop that picks the glyph**: `glyph` (recommended), `icon`, or `name` with a documented exception to ADR 0015? Any of the three is a one-word rename before the first release and breaking after.
2. **A or B**: is this set expected to stay near a dozen glyphs, or become the shared set for other apps? If the second, B (or A with generated per-icon exports) is safer.
3. **Default size**: no `variantSize` means `1em` and follows the text (recommended). The alternative is a fixed default such as `md`. Which do you want on a link arrow versus a social button?
4. **Glyph source and licence**: Lucide dropped brand icons in 1.0 and recommends Simple Icons, which is CC0 overall with a disclaimer that individual icons may carry their own trademark terms (S12). For GitHub, LinkedIn and Bluesky: Simple Icons paths, or each company's official brand SVG? Is Bluesky in Simple Icons (not verified)? Which set supplies sun, moon and the arrows, and under which licence (not verified for Lucide or Octicons)?
5. **Stroke or fill**: draw UI glyphs as strokes and brand marks as fills (two styles in one component), or redraw everything as filled shapes?
6. **Pixel skin**: should the pixel skin change how glyphs render (square caps, no antialiasing), or are icons skin-neutral?
7. **Default labels**: should Omnia ship localised FR/EN names for the brand glyphs (so `aria-label` could be optional), or always leave the label to the caller?
8. **Base prop type**: the picked-attributes shape (smaller) or `SVGAttributes` without handlers (wider)? Does any consumer need a handler on the bare `<svg>`?
9. **Replace `Link`'s private arrow**: do it in the Icon PR or in a follow-up?

## Decision

Not decided. Awaiting the owner's answers on questions 1 to 4.

## Sources

All opened 2026-11-02 unless noted.

- S1 MUI: https://mui.com/material-ui/icons/ , https://mui.com/material-ui/api/svg-icon/ , https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-material/src/SvgIcon/SvgIcon.js
- S2 Material Symbols: https://developers.google.com/fonts/docs/material_symbols
- S3 Chakra UI: https://chakra-ui.com/docs/components/icon , https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/packages/react/src/components/icon/icon.tsx , https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/packages/react/src/theme/recipes/icon.ts
- S4 Radix Icons: https://www.radix-ui.com/icons , https://github.com/radix-ui/icons/blob/master/README.md , https://unpkg.com/@radix-ui/react-icons/dist/types.d.ts , https://unpkg.com/@radix-ui/react-icons/dist/react-icons.esm.js (characters 0 to 200,000 of 492,915 read; `SunIcon` not reached)
- S5 Lucide: https://lucide.dev/guide/packages/lucide-react , https://lucide.dev/guide/react/advanced/accessibility , https://lucide.dev/guide/react/advanced/dynamic-icon-component , https://lucide.dev/guide/react/basics/sizing , https://raw.githubusercontent.com/lucide-icons/lucide/main/packages/lucide-react/src/Icon.ts , https://raw.githubusercontent.com/lucide-icons/lucide/main/packages/shared/src/utils/hasA11yProp.ts
- S6 Heroicons: https://raw.githubusercontent.com/tailwindlabs/heroicons/master/README.md , https://raw.githubusercontent.com/tailwindlabs/heroicons/master/react/README.md , https://unpkg.com/@heroicons/react/24/outline/esm/SunIcon.js
- S7 Ant Design: https://ant.design/components/icon , https://raw.githubusercontent.com/ant-design/ant-design-icons/master/packages/icons-react/src/components/AntdIcon.tsx
- S8 Carbon: https://github.com/carbon-design-system/carbon/blob/main/packages/icons-react/README.md , https://carbondesignsystem.com/elements/icons/usage/ , https://unpkg.com/@carbon/icons-react/lib/Icon.js
- S9 Octicons: https://raw.githubusercontent.com/primer/octicons/main/lib/octicons_react/README.md , https://raw.githubusercontent.com/primer/octicons/main/lib/octicons_react/src/createIconComponent.tsx (`renderOcticon`, where the a11y attributes are set, was not opened)
- S10 Spectrum: https://react-spectrum.adobe.com/react-spectrum/workflow-icons.html , https://raw.githubusercontent.com/adobe/react-spectrum/main/packages/@react-spectrum/s2/src/Icon.tsx , plus a web-search result quoting the S2 skill file (https://react-spectrum.adobe.com/.well-known/skills/react-spectrum-s2/SKILL.md, not opened directly)
- S11 WCAG 2.1 Understanding 1.1.1: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
- S12 Brand marks: https://lucide.dev/guide/version-1 , https://raw.githubusercontent.com/simple-icons/simple-icons/develop/README.md , https://raw.githubusercontent.com/simple-icons/simple-icons/develop/DISCLAIMER.md , https://raw.githubusercontent.com/simple-icons/simple-icons/develop/LICENSE.md
- S13 Local: `package.json` (`exports`, `sideEffects`), `src/native-prop-names.check.ts`, `docs/adr/0015-native-attribute-prop-names.md`, `src/components/atoms/Link/Link.tsx` (`ExternalIcon`), `src/components/atoms/Spinner/Spinner.tsx` and `Spinner.module.css`, `node_modules/@types/react/index.d.ts` (19.3.0). The gate findings come from a throwaway `tsc` run on a copy of the check in the session scratchpad; nothing was added to the repo.

Could not open (404, empty, or navigation only): Radix icons props page, `radix-ui/icons` build script, Primer Octicons docs pages (`primer.style/octicons/`, Primer React icons page), React Spectrum `Icon.html` and S2 `icons.html`, the octicons React test files and snapshot, Carbon `Icon.js` at the GitHub path, Carbon docs accessibility tab. Lucide's `absoluteStrokeWidth` prop was not confirmed. Apple SF Symbols, Fluent, Atlassian, Mantine, shadcn were out of scope.
