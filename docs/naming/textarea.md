# Naming study — multi-line text field

Date: 2026-11-25. Method: official docs or the system's own source, opened during this study as raw files or page HTML, not through a summariser. "Not documented" means the pages opened do not say, not that the system lacks it. Source files were read at the head of their default branch, so they may be ahead of the published package. "Probe" marks a measurement made for this study in headless Chromium 159.0.8154.6 only (S19).

## Question

Omnia needs a bare multi-line text control, for a short comment as well as a long editable text. Already decided: a **separate atom** (`docs/naming/input.md` § Decision), display only (ADR 0016), unaware of `FormField` (ADR 0029). `FormField` already accepts an `HTMLTextAreaElement`. `input.md` also wrote the name `Textarea`; its spelling is put back to the owner here. Open points:

- Is it `Textarea` or `TextArea`?
- How is the height set: `rows`, a handle, or the content? Which option names does that take?
- Does it need sizes, and a character counter?

## Survey

### Table 1 — name and height

| System          | Name (structure)                                                   | Default height behaviour                           | Handle option                                                                 | Grow option and bounds                                                           | Src |
| --------------- | ------------------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --- |
| MUI             | `TextField multiline` (prop); `TextareaAutosize` utility           | grows, unless `rows` is set; CSS `resize: none`    | none                                                                          | default; `minRows`, `maxRows`                                                    | S1  |
| Material (M3)   | Compose `TextField` + `lineLimits`; web `type="textarea"` (prop)   | Compose grows; web fixed, `rows` 2                 | web: CSS `resize`                                                             | Compose `MultiLine(minHeightInLines, maxHeightInLines)`; web: CSS `field-sizing` | S2  |
| Ant Design      | `Input.TextArea` (sub-component)                                   | CSS `resize: vertical`, `none` on coarse pointers  | none (CSS)                                                                    | `autoSize`: boolean or `{ minRows, maxRows }`, default `false`                   | S3  |
| Mantine         | `Textarea` (separate)                                              | fixed, no handle                                   | `resize`, default `none`                                                      | `autosize`, default `false`; `minRows`, `maxRows`                                | S4  |
| shadcn/ui       | `Textarea` (separate)                                              | grows: class `field-sizing-content min-h-16`       | none (class)                                                                  | always on, no prop                                                               | S5  |
| Radix Themes    | `TextArea` (separate)                                              | fixed, CSS `resize: none`; min-height per size     | `resize`: `none`, `vertical`, `horizontal`, `both`; no default                | none                                                                             | S6  |
| Chakra UI       | `Textarea` (separate)                                              | preflight CSS `resize: vertical`                   | `resize` (style prop)                                                         | `autoresize`, default `false`; max: `maxH="5lh"`                                 | S7  |
| Fluent UI v9    | `Textarea` (separate)                                              | fixed, no handle; min- and max-height per size     | `resize`: `none`, `horizontal`, `vertical`, `both`; default `none`            | none: "tricky to implement"                                                      | S8  |
| Atlassian       | "Text area", code `TextArea` (separate)                            | grows                                              | `resize`: `auto`, `vertical`, `horizontal`, `smart`, `none`                   | `resize="smart"` is the default; `minimumRows`, `maxHeight`                      | S9  |
| Shopify Polaris | `s-text-area` (separate)                                           | `rows`, default 2; handle not documented           | not documented                                                                | not documented                                                                   | S10 |
| GitHub Primer   | `Textarea` (separate)                                              | handle on both axes; `rows` 7, `cols` 30           | `resize`: `none`, `both`, `horizontal`, `vertical`; default `both`            | `autoSize`, default `false`; `minHeight`, `maxHeight` (numbers)                  | S11 |
| IBM Carbon      | "Text area", code `TextArea` (separate)                            | CSS `resize: vertical`, min 40px, no max; `rows` 4 | none                                                                          | none                                                                             | S12 |
| Adobe Spectrum  | S2 `TextArea` (separate); React Aria `TextArea` inside `TextField` | S2 grows (script); CSS `resize: none`              | none                                                                          | always on, no prop                                                               | S13 |
| GOV.UK          | "Textarea" (separate)                                              | CSS `resize: vertical`, min 40px; `rows` 5         | none                                                                          | none                                                                             | S14 |
| Apple HIG       | "Text view" (separate)                                             | "any height", scrolls                              | not documented                                                                | not documented                                                                   | S15 |
| PatternFly      | `TextArea` (separate)                                              | handle on both axes                                | `resizeOrientation`: `horizontal`, `vertical`, `both`, `none`; default `both` | `autoResize` (script)                                                            | S16 |

### Table 2 — sizes, states, counter

"native" means the standard attribute, typed or passed through.

| System          | Size on the text area        | Invalid                                       | Disabled / read-only                 | Character counter                                          | Src |
| --------------- | ---------------------------- | --------------------------------------------- | ------------------------------------ | ---------------------------------------------------------- | --- |
| MUI             | `size`: small, medium        | `error`                                       | native / native                      | not documented                                             | S1  |
| Material (M3)   | not documented               | web `error` + `errorText`                     | native / native                      | web, in the control: shown when `maxlength` is set         | S2  |
| Ant Design      | `size`: large, medium, small | `status`: error, warning                      | native / native                      | in the control: `showCount`, `count`                       | S3  |
| Mantine         | `size`: xs to xl             | `error` (node)                                | native / native                      | generic slot: `bottomSection`                              | S4  |
| shadcn/ui       | none                         | native `aria-invalid`                         | native / native                      | not documented                                             | S5  |
| Radix Themes    | `size`: 1 to 3               | none                                          | native / native, same style for both | not documented                                             | S6  |
| Chakra UI       | `size`: xs to xl             | on the field (`Field`), styled `_invalid`     | native / native                      | not documented                                             | S7  |
| Fluent UI v9    | `size`: small, medium, large | on the field: `validationState`               | native / native                      | left out "until further discussion"                        | S8  |
| Atlassian       | none (`isCompact` boolean)   | `isInvalid`                                   | `isDisabled` / `isReadOnly`          | form layer: `CharacterCounterField`, `CharacterCounter`    | S9  |
| Shopify Polaris | none                         | `error` (message)                             | native / native                      | not documented                                             | S10 |
| GitHub Primer   | none                         | `validationStatus`: error, success            | native / native                      | in the control: `characterLimit`                           | S11 |
| IBM Carbon      | none ("variable height")     | `invalid` + `invalidText`, `warn`             | native / native                      | in the control: `enableCounter`, `maxCount`, `counterMode` | S12 |
| Adobe Spectrum  | S2 `size`: S to XL           | `isInvalid`                                   | `isDisabled` / `isReadOnly`          | not documented                                             | S13 |
| GOV.UK          | none                         | `errorMessage`                                | native / no parameter                | own component: "Character count"                           | S14 |
| Apple HIG       | not documented               | not documented                                | not documented                       | not documented                                             | S15 |
| PatternFly      | none                         | `validated`: success, warning, error, default | `isDisabled` / `readOnlyVariant`     | none in the source                                         | S16 |

## Patterns

16 systems. Every list of counts below sums to 16 unless it says otherwise.

- **Structure.** 12 ship a separate web component, 1 a sub-component (Ant), 2 a setting of the single-line field (MUI, Material); Apple's is a separate native view (1).
- **Spelling.** Nearly a tie. `TextArea` or two words: 7 (Ant, Radix, Atlassian, Polaris, Carbon, Spectrum, PatternFly). `Textarea`: 6 (Mantine, shadcn, Chakra, Fluent, Primer, GOV.UK). No component of that name: 3 (MUI, Material, Apple). The Component Gallery's 52 examples lean the other way: 37 "Textarea" and 1 "Textarea Wrapper", against 14 "Text area" (7), "Text Area" (4) and "TextArea" (3) (S17).
- **Default height.** Grows: 5 (MUI, Material Compose, shadcn, Atlassian, Spectrum S2). Vertical handle: 4 (Ant, Chakra, Carbon, GOV.UK). Fixed, no handle: 3 (Mantine, Radix, Fluent). Handle on both axes: 2 (Primer, PatternFly). Not documented: 2 (Polaris, Apple).
- **Handle option.** `resize`: 6 (Mantine, Radix, Chakra, Fluent, Atlassian, Primer). `resizeOrientation`: 1 (PatternFly). No prop, or not documented: 9.
- **Growing.** Available in 10: by default in the 5 above, as an option in 5 (`autoSize` Ant and Primer, `autosize` Mantine, `autoresize` Chakra, `autoResize` PatternFly). Not offered or not documented: 6 (Radix, Fluent, Polaris, Carbon, GOV.UK, Apple). Those 5 options are all off unless set.
- **How it grows** (of the 10). `field-sizing: content` in 2 shipped components (shadcn, Primer), and in Material's web docs. Script in the 4 others whose code was read (Mantine, Chakra, Spectrum, PatternFly). The code of MUI, Ant, Atlassian and Compose was not read for this.
- **Size.** Offered by 7 (MUI, Ant, Mantine, Radix, Chakra, Fluent, Spectrum S2), absent or not documented in 9.
- **Invalid.** `error`: 4 (MUI, Material, Mantine, Polaris). A status value: 3 (Ant, Primer, PatternFly). `isInvalid`: 2 (Atlassian, Spectrum). On the field: 2 (Chakra, Fluent). `invalid`: 1 (Carbon). `aria-invalid`: 1 (shadcn). `errorMessage`: 1 (GOV.UK). None or not documented: 2 (Radix, Apple).
- **Disabled.** Native: 12. `isDisabled`: 3 (Atlassian, Spectrum, PatternFly). Not documented: 1 (Apple). Primer and Carbon also remove the handle when disabled.
- **Read-only.** Native: 11. `isReadOnly`: 2 (Atlassian, Spectrum). `readOnlyVariant`: 1 (PatternFly). No parameter or not documented: 2 (GOV.UK, Apple).
- **Counter.** In the control: 4 (Material web, Ant, Primer, Carbon). Generic slot: 1 (Mantine). Form layer or own component: 2 (Atlassian, GOV.UK). Absent or not documented: 9.
- **A wrapper around the element gets in the way** in 3: Fluent tells callers to style height on its inner slot, Radix moves `resize` to the wrapper, Ant tracks a "resize dirty" state (S3, S6, S8).

## The platform: `field-sizing: content`

- **Support.** Chrome and Edge 123, Safari 26.2, Firefox 152. Baseline "newly available" since 2026-06-16, the Firefox 152 release date; not "widely available" (S18).
- **`rows` and `cols` stop working.** MDN states they have no effect; the spec says the default preferred size must be ignored (S18). Probe: an empty `rows={5}` box is 122px high fixed and 42px with `field-sizing: content`. `min-block-size: calc(5lh + padding + border)` restores 122px, and a matching `max-block-size` caps the growth. `1lh` is already used in Omnia's `Checkbox`, `Switch` and `NavBar`.
- **`maxlength`** stops the growth at the limit; a placeholder sets the empty size (S18).
- **Fallback.** Without support the declaration is ignored: the box keeps its `rows` height and its handle. No script is needed.
- **With a handle.** Probe: after one drag the browser writes an inline `height`, and the box stops following its content.

## Accessibility guidance

- **Label.** Primer: a permanently visible label above the field, hidden only if equivalent visible text exists. GOV.UK: "You must label textareas", label above. Atlassian: always an associated label. Spectrum v3: a visible label or an `aria-label`. Fluent: label, `aria-label` or `aria-labelledby`. PatternFly logs a console error with neither `id` nor `aria-label` (S8, S9, S11, S13, S14, S16).
- **Placeholder** is not a label: Primer, GOV.UK, Fluent. Atlassian: do not use one (S8, S9, S11, S14).
- **Zoom, reflow, target.** Of the pages opened, only Primer's state them: usable at 320 by 256 CSS px with no horizontal scrolling, text resizable, spacing adjustable, target at least 24 by 24 CSS px, border 3:1 (S11).
- **Height.** GOV.UK and Polaris: make it proportional to the expected text, through `rows`. GOV.UK: do not disable paste (S10, S14).
- **Handle.** No opened page gives accessibility guidance on it. WCAG 2.5.8 and 2.5.7 exempt what the user agent determines and the author does not modify (S20); that this covers the native handle is our reading, neither page names it.
- **Counter.** GOV.UK: avoid it if you can; place it below, announce when typing stops, and let users exceed the limit. Atlassian: more accessible than native `maxLength`, linked with `aria-describedby`. Primer's source: limit in a hidden `aria-describedby` text, debounced live region, visible count `aria-hidden`, error style past the limit. Carbon disagrees on the limit: typing past it should be prevented. Polaris: `maxLength` does not reliably stop a paste (S9, S10, S11, S12, S14).

## Prop-name check

ADR 0015: a native name keeps its native type and reaches the element; a colliding variant axis becomes `variant<Axis>`. Checked with the gate's own `NativeName` type from `src/native-prop-names.check.ts`, run under TypeScript 6.0.3 against `@types/react` 19.3.0; line numbers are in `index.d.ts`.

| Prop                                                     | Native on an HTML element?                                                      | Consequence                                |
| -------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------ |
| `rows`, `cols`, `wrap`                                   | yes: `textarea` (3626, 3616, 3628)                                              | pass through, `number`, `number`, `string` |
| `maxLength`, `minLength`                                 | yes: `input` (3393, 3395), `textarea` (3620, 3621)                              | pass through                               |
| `disabled`, `readOnly`, `required`, `placeholder`        | yes: `textarea` (3618, 3624, 3625, 3623) and others                             | pass through                               |
| `size`                                                   | yes: `input` (3402), `select` (3574); not on `textarea`                         | not usable for a scale: `variantSize`      |
| `ref`                                                    | yes (React)                                                                     | `Ref<HTMLTextAreaElement>`, native type    |
| `variantSize`, `invalid`                                 | no                                                                              | allowed, same as `Input`                   |
| `autoSize`, `autoResize`, `autoresize`, `autoGrow`       | no                                                                              | allowed                                    |
| `autosize`                                               | not in the gate; `webview` has it (3993), a tag outside `HTMLElementTagNameMap` | avoid: the ADR text and the gate differ    |
| `resize`, `minRows`, `maxRows`, `minHeight`, `maxHeight` | no                                                                              | allowed, none proposed                     |
| `characterLimit`, `showCount`, `maxCount`, `count`       | no                                                                              | allowed, none proposed                     |

The gate's collision type returns none for options A, B and C below, and does flag `size?: 'sm' | 'md' | 'lg'`. The gate itself (`pnpm typecheck`) was not run on a component: there was no code at the time of this study.

## Options

### Name, for the owner

- **`Textarea`.** For: the HTML tag is one word, and ADR 0024 prefers the HTML-semantic name for a compound Root (applied here by analogy); React's type is `TextareaHTMLAttributes`; 38 of 52 in the Component Gallery; `input.md` already says it; Omnia spells `Checkbox` as one word. Against: 7 systems to 6 write two words; the DOM interface, which `FormField` uses, is `HTMLTextAreaElement`.
- **`TextArea`.** For: that edge in the survey, the DOM interface, and "text area" as two words in Atlassian and Carbon. Against: it departs from the tag name and from `input.md`.

### Height

Shared base: the native `<textarea>`, `variantSize` (`sm | md | lg`), boolean `invalid`, every other prop native, `ref` on the element. No adornments: nothing asked for them.

**A. `rows` plus a vertical handle, no height prop.**

```tsx
<Textarea rows={3} invalid={invalid} />
```

- Pro: no new prop. Short and long use is one native number. Same default as Ant, Chakra, Carbon and GOV.UK.
- Pro: no horizontal handle, so a user cannot drag the box wider than a 320px viewport.
- Con: no growth, which 10 of 16 offer. A consumer who adds `field-sizing` in CSS loses `rows` without a warning.

**B. A plus a boolean `autoSize`, off by default.**

```tsx
<Textarea rows={3} autoSize />
```

- Pro: CSS only, with `rows` kept as the floor; unsupported browsers get option A. `autoSize` is the name Ant and Primer share.
- Con: one more prop and a second mode to test in six theme×skin modes. `rows` must also reach CSS as a custom property. Without a cap a long text pushes the page down; the cap is a new prop or a fixed choice.
- Con: handle and growth conflict after a drag (probe), so the mode must drop the handle.

**C. Always grows, `rows` as the floor, no prop.**

- Pro: no new prop, and right for a comment box. Precedent: shadcn, Spectrum S2.
- Con: awkward for a long editable text, which needs a cap. Behaviour differs by browser version. A consumer who wants a fixed box must undo it.

## Recommendation

Opinion: **`Textarea`, option A.** Props: `variantSize`, `invalid`, and native ones. CSS `resize: vertical`, `none` when disabled. Render the `<textarea>` with no wrapper, so `className`, `style`, `ref` and the rest land on one element, unlike `Input`. Option B stays open as an additive, non-breaking step once a real page asks for growth. Leave the counter out: it needs the live length, translated text and a live region, and Omnia's atoms hold no state.

Devil's advocate on that pick:

- A joins the minority of 6 with no documented growth. If the first real use is a comment box, B will be asked for at once, and A will have cost a second review cycle.
- The escape hatch is a trap: consumer CSS with `field-sizing` silently drops `rows`. Hiding that is the best reason for a prop.
- The handle may be useless on touch: Ant switches it off on coarse pointers. There, A is `rows` and inner scrolling. It was tested with a mouse only, so touch and keyboard use are unverified.
- `variantSize` is kept for parity with `Input`, not on survey evidence: 9 of 16 have no size or document none, and adding it later would not break. A strict reading of the simplicity ladder would drop it.
- No wrapper means a different contract from `Input`, whose `className` lands on a wrapper. It would also have to be reversed if adornments or an inner counter come.
- The survey does not choose the spelling. The argument for `Textarea` is the tag name and the earlier decision; an owner who reads Omnia as two-word PascalCase (`FormField`, `NavBar`) can fairly pick `TextArea`.

## Not decided here

- Character counter, its owner (field or own component), and whether a limit blocks typing.

## Decision

Option A, chosen by the owner on 2026-11-25: the name is `Textarea`; the height is the native `rows`
plus a handle, with no growth and no height prop. `variantSize` (`sm | md | lg`, default `md`) is
kept, as on every input (`Input`, `Checkbox`, `Switch`).

Amended by the owner the same day, after an in-browser check: the handle works on both axes, bounded
by the parent (`resize: both`, `max-inline-size: 100%`, `max-block-size: 100%`), because a one-axis
handle and its vertical cursor look like a bug to users. It stays `none` when disabled.

## Sources

All accessed 2026-11-25.

- S1 MUI: https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/components/text-fields/text-fields.md , https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/components/textarea-autosize/textarea-autosize.md , https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-material/src/TextField/TextField.d.ts , https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-material/src/InputBase/InputBase.d.ts , https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-material/src/InputBase/InputBase.js , https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-material/src/TextareaAutosize/TextareaAutosize.types.ts
- S2 Material: https://developer.android.com/develop/ui/compose/text/user-input , https://raw.githubusercontent.com/material-components/material-web/main/docs/components/text-field.md
- S3 Ant Design: https://raw.githubusercontent.com/ant-design/ant-design/master/components/input/index.en-US.md , https://raw.githubusercontent.com/ant-design/ant-design/master/components/input/TextArea.tsx , https://raw.githubusercontent.com/ant-design/ant-design/master/components/input/style/textarea.ts
- S4 Mantine: https://raw.githubusercontent.com/mantinedev/mantine/master/apps/mantine.dev/src/pages/core/textarea.mdx , https://raw.githubusercontent.com/mantinedev/mantine/master/packages/@mantine/core/src/components/Textarea/Textarea.tsx , https://raw.githubusercontent.com/mantinedev/mantine/master/packages/@mantine/core/src/components/Textarea/Autosize.tsx , https://raw.githubusercontent.com/mantinedev/mantine/master/packages/@mantine/core/src/components/Input/Input.tsx , https://raw.githubusercontent.com/mantinedev/mantine/master/packages/@mantine/core/src/components/Input/Input.module.css , https://raw.githubusercontent.com/mantinedev/mantine/master/packages/@mantine/core/src/core/MantineProvider/theme.types.ts
- S5 shadcn/ui: https://ui.shadcn.com/docs/components/textarea , https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/textarea.tsx
- S6 Radix Themes: https://www.radix-ui.com/themes/docs/components/text-area , https://raw.githubusercontent.com/radix-ui/themes/main/packages/radix-ui-themes/src/components/text-area.tsx , https://raw.githubusercontent.com/radix-ui/themes/main/packages/radix-ui-themes/src/components/text-area.props.tsx , https://raw.githubusercontent.com/radix-ui/themes/main/packages/radix-ui-themes/src/components/text-area.css
- S7 Chakra UI: https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/apps/www/content/docs/components/textarea.mdx , https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/packages/react/src/components/textarea/textarea.tsx , https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/packages/react/src/theme/recipes/textarea.ts , https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/packages/react/src/styled-system/preflight.ts , https://raw.githubusercontent.com/chakra-ui/ark/main/packages/react/src/components/field/field-textarea.tsx , https://raw.githubusercontent.com/chakra-ui/zag/main/packages/utilities/auto-resize/src/autoresize-textarea.ts
- S8 Fluent UI v9: https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-textarea/library/docs/Spec.md , https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-textarea/library/src/components/Textarea/Textarea.types.ts , https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-textarea/library/src/components/Textarea/useTextareaStyles.styles.ts , https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-textarea/stories/src/Textarea/TextareaBestPractices.md , https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-field/library/src/components/Field/Field.types.ts
- S9 Atlassian: https://atlassian.design/components/textarea/usage , https://atlassian.design/components/textarea/code , https://atlassian.design/components/textarea/examples , https://atlassian.design/components/form/examples , https://unpkg.com/@atlaskit/textarea/dist/types/types.d.ts (11.0.0)
- S10 Shopify Polaris: https://shopify.dev/docs/api/app-home/polaris-web-components/forms/textarea
- S11 GitHub Primer: https://primer.style/product/components/textarea/ , https://primer.style/product/components/textarea/guidelines/ , https://primer.style/product/components/textarea/accessibility/ , https://raw.githubusercontent.com/primer/react/main/packages/react/src/Textarea/Textarea.tsx , https://raw.githubusercontent.com/primer/react/main/packages/react/src/Textarea/TextArea.module.css
- S12 IBM Carbon: https://carbondesignsystem.com/components/text-input/usage/ , https://carbondesignsystem.com/components/text-input/accessibility/ , https://raw.githubusercontent.com/carbon-design-system/carbon/main/packages/react/src/components/TextArea/TextArea.tsx , https://raw.githubusercontent.com/carbon-design-system/carbon/main/packages/styles/scss/components/text-area/_text-area.scss
- S13 Adobe Spectrum: https://react-spectrum.adobe.com/TextArea , https://react-spectrum.adobe.com/v3/TextArea.html , https://react-aria.adobe.com/TextField , https://raw.githubusercontent.com/adobe/react-spectrum/main/packages/@react-spectrum/s2/src/TextField.tsx , https://raw.githubusercontent.com/adobe/react-spectrum/main/packages/react-aria-components/src/TextArea.tsx
- S14 GOV.UK: https://design-system.service.gov.uk/components/textarea/ , https://design-system.service.gov.uk/components/character-count/ , https://raw.githubusercontent.com/alphagov/govuk-design-system/main/src/components/textarea/index.md , https://raw.githubusercontent.com/alphagov/govuk-design-system/main/src/components/character-count/index.md , https://raw.githubusercontent.com/alphagov/govuk-frontend/main/packages/govuk-frontend/src/govuk/components/textarea/textarea.yaml , https://raw.githubusercontent.com/alphagov/govuk-frontend/main/packages/govuk-frontend/src/govuk/components/textarea/_mixin.scss
- S15 Apple HIG (page data): https://developer.apple.com/tutorials/data/design/human-interface-guidelines/text-views.json , https://developer.apple.com/tutorials/data/design/human-interface-guidelines/text-fields.json
- S16 PatternFly: https://raw.githubusercontent.com/patternfly/patternfly-react/main/packages/react-core/src/components/TextArea/TextArea.tsx
- S17 Component Gallery: https://component.gallery/components/textarea/
- S18 `field-sizing` and `<textarea>`: https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/css/reference/properties/field-sizing/index.md , https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/field-sizing.json , https://raw.githubusercontent.com/mdn/browser-compat-data/main/browsers/firefox.json , https://raw.githubusercontent.com/web-platform-dx/web-features/main/features/field-sizing.yml.dist , https://raw.githubusercontent.com/w3c/csswg-drafts/main/css-forms-1/Overview.bs , https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/html/reference/elements/textarea/index.md
- S19 Probe: a static page with plain `<textarea>` elements (border-box, 20px line height, 8px padding, 3px border, 320px viewport), not an Omnia component and not kept in the repo. Firefox and Safari were not run.
- S20 WCAG 2.2 Understanding: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html , https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html

Could not open: Carbon text-area usage page (404; the text-input page covers it), Spectrum guideline page `spectrum.adobe.com/page/text-area/` (404). Not opened: m3.material.io, Chakra `Field` page.
