# Naming study — spinner (loading indicator)

Date: 2026-10-31. Method: official docs and, where a docs page was silent, the system's own source file, opened during this study. "None documented" means the pages opened do not mention it, not that the system lacks it. "Not verified" means no usable page was opened. Pages were read through a fetch tool that summarises each page, so quotes are short and cell values are as reported by that summary. Where a source file was read, the cell says so. Prop names for Omnia were checked in `node_modules/@types/react/index.d.ts` (`@types/react` 19.3.0), against ADR 0015.

## Question

Omnia needs a loading-indicator atom. `Button` already draws a private spinner (`pending`, `aria-busy`, a visually hidden `t('button.loading')` string). Five sub-questions:

1. What is it called: `Spinner`, `Loader`, `Loading`, `ProgressCircle`, `CircularProgress`?
2. Is it split from a determinate progress bar, and how?
3. Which props recur (size, indeterminate/determinate, accessible label, colour, inline versus centred/overlay)?
4. What ARIA does an indeterminate spinner need (`role="status"`, `role="progressbar"`, `aria-label`, `aria-live`), given the WCAG 2.1 AA gate (ADR 0006)?
5. Which prop names collide with native HTML names under ADR 0015, and what are the compliant names?

## Survey

15 rows. GOV.UK, Material (M3) and Apple HIG were not opened. Radix Primitives has no spinner.

### Table 1 — names and the progress split

| System           | (1) Name                                                                   | (2) Split from a determinate bar                                                                                          | (3) Element and role                                                                                      | Src |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --- |
| MUI              | `CircularProgress` (and `LinearProgress`)                                  | One component, `variant`: `indeterminate` (default) or `determinate` with `value` (also `query`, `buffer` on Linear)       | `<span role="progressbar">`; `aria-valuenow/min/max` only when determinate (source)                       | S1  |
| Material (M3)    | Not verified                                                               | Not verified                                                                                                              | Not verified                                                                                              | —   |
| Ant Design       | `Spin`                                                                     | `Progress` is a separate Feedback component, but `Spin` has `percent` (a number, or `'auto'` for indeterminate)           | root `<div aria-live="polite" aria-busy>`; no `role`, no default `aria-label` (source)                    | S2  |
| Mantine          | `Loader`                                                                   | Not covered on the page; `Progress` / `RingProgress` not mentioned                                                        | SVG loader component; no role or `aria-*` set in the file (source)                                        | S3  |
| shadcn/ui        | `Spinner` (an icon: `Loader2Icon` from lucide-react)                       | None documented                                                                                                           | SVG with `role="status"` and `aria-label="Loading"`, both overridable (source)                            | S4  |
| Radix Primitives | none; only `Progress` (`Progress.Root`, `Progress.Indicator`)              | n/a: `Progress` accepts `value: number \| null`; `data-state` is `indeterminate`, `loading` or `complete`                | `Progress` follows the `progressbar` role; the rendered role is not stated on the page                    | S5  |
| Radix Themes     | `Spinner` (based on `span`)                                                | None documented                                                                                                           | eight empty `span` leaves; no role, no text; `aria-hidden` only on the wrapped children (source)          | S6  |
| Chakra UI        | `Spinner`; also `ProgressCircle` (`value={null}` = indeterminate)          | Yes, two components. The page does not say how they differ                                                                | `<span>`; no role or label set in the file (source)                                                       | S7  |
| Adobe Spectrum / React Aria | `ProgressCircle` (RAC: `ProgressBar`, circular is a styled variant) | One component for both: `isIndeterminate` versus `value`. `ProgressBar` is a separate sibling component                  | `aria-label` required by the page; the rendered role is not stated                                        | S8  |
| IBM Carbon       | `Loading`; `InlineLoading` is a second component                           | `ProgressIndicator` is a different thing (steps) and is not compared on the page                                          | `<svg role="img">` with a `<title>`; container `aria-live` (source)                                       | S9  |
| Shopify Polaris  | `s-spinner` (docs title "Spinner")                                         | None documented                                                                                                           | not stated; `accessibilityLabel` is the label                                                             | S10 |
| Atlassian        | `Spinner`                                                                  | Page does not compare with progress bar or skeleton                                                                       | not stated; `label` prop                                                                                  | S11 |
| Fluent UI v9     | `Spinner`                                                                  | `ProgressBar` is separate (`value` undefined = indeterminate). The Spinner spec calls itself "typically an indeterminate ProgressIndicator" | `role="progressbar"` on the animated element; label is a sibling `span` (spec)                            | S12 |
| GitHub Primer    | `Spinner`                                                                  | `ProgressBar` is separate; no indeterminate state on it in the page read                                                  | `<svg aria-hidden>` plus `aria-labelledby` to a visually hidden `srText`; no role, no live region (source) | S13 |
| GOV.UK           | Not verified                                                               | Not verified                                                                                                              | Not verified                                                                                              | —   |

### Table 2 — props

| System           | Size                                                              | Indeterminate / determinate                                  | Accessible label                                                                                        | Colour / intent                                                | Inline vs centred / overlay                                                                                | Delay                                         | Src |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --- |
| MUI              | `size` (number or CSS string, default `40`), `thickness`          | `variant`, `value`, `min`, `max`                             | `aria-label` or `aria-labelledby`; `aria-valuetext` for non-percent values (page)                       | `color`: `primary` (default), `secondary`, `success`, `inherit` | none: a plain element                                                                                      | none                                          | S1  |
| Ant Design       | `size`: `small`, `medium` (default), `large`                      | `percent` (number or `'auto'`)                               | none documented; `description` is visible text (`tip` deprecated)                                       | none                                                           | embedded (wraps children), standalone, `fullscreen` (dimmed overlay)                                       | `delay` (ms)                                  | S2  |
| Mantine          | `size` (number or CSS value; default `md` per comment)            | n/a                                                          | none documented                                                                                         | `color`                                                        | `children` replace the loader (used by Button, LoadingOverlay); `type`: `oval`, `bars`, `dots`            | none                                          | S3  |
| shadcn/ui        | `className` (`size-4` default); no `size` prop                    | n/a                                                          | `aria-label="Loading"` default                                                                          | inherits `currentColor` via class                              | `data-icon="inline-start"` / `"inline-end"` inside Button or Badge                                         | none                                          | S4  |
| Radix Themes     | `size`: `"1"`, `"2"`, `"3"` (default `"2"`)                       | n/a                                                          | none documented                                                                                         | `color` not documented                                         | `loading` (boolean, default `true`) shows the spinner in place of `children`, children keep their size and are disabled | none                          | S6  |
| Chakra UI        | `size`: `inherit`, `xs` to `xl` (default `md`)                    | `ProgressCircle`: `value={null}`                             | none documented; a "Label" example composes visible text                                                | `colorPalette`, `color`, `borderWidth`, `animationDuration`    | none                                                                                                       | none                                          | S7  |
| Adobe Spectrum   | `size`: `S`, `M` (default), `L`                                   | `isIndeterminate`, `value`, `minValue`, `maxValue`           | `aria-label` required; `aria-labelledby` if another element labels it (page)                            | `staticColor`: `white` or `black`                              | none                                                                                                       | none                                          | S8  |
| IBM Carbon       | `small` (boolean; default large)                                  | n/a                                                          | `description`, default `'loading'`, used as SVG `<title>` and dialog `aria-label` (source)              | none                                                           | `withOverlay` (default `true`), `active`; large = full screen or section, small = inline, no overlay (page) | none; page: use only when the wait exceeds 3 s | S9  |
| Carbon InlineLoading | none                                                          | `status`: `inactive`, `active`, `finished`, `error`          | `description` (visible text), `iconDescription` (source)                                                | none                                                           | inline by design                                                                                           | `successDelay` (ms, on finish)                | S9  |
| Shopify Polaris  | `size`: `base` (default), `large`, `large-100`                    | n/a                                                          | `accessibilityLabel`; the page says always set it and be specific ("Loading products")                  | none                                                           | `base` inline or standard, `large` prominent, `large-100` full page                                        | none                                          | S10 |
| Atlassian        | `size`: number or `xsmall`, `small`, `medium` (recommended), `large`, `xlarge` | n/a                                             | `label`: "describes the spinner's activity", e.g. loading, submitting, processing                       | `appearance`: `inherit` or `invert`                            | one spinner per page; page says use `LoadingButton` for buttons                                            | `delay` (ms, intro animation); page: show only for waits over 1 s | S11 |
| Fluent UI v9     | `size`: `extra-tiny` to `huge` (8 values; default `medium`)       | n/a                                                          | `label` slot; `labelPosition`: `above`, `below`, `before`, `after` (default `after`)                    | `appearance`: `primary` (default), `inverted`                  | none                                                                                                       | `delay` (ms)                                  | S12 |
| GitHub Primer    | `size`: `small` (16 px), `medium` (32 px, default), `large` (64 px) | n/a                                                        | `srText` (default "Loading"; `null` = loading text lives elsewhere); `aria-label` deprecated            | none                                                           | none                                                                                                       | `delay`: `true`, `'short'` (300 ms), `'long'` (1000 ms), or ms | S13 |

Notes on cells:

- MUI: `CircularProgress` and `LinearProgress` are one family; the page does not mention `role` or `aria-valuenow`. They come from the source, where a consumer-supplied `role` overrides the default because `...other` is spread after it (S1).
- Ant: `aria-live="polite"` is always set on the root and `aria-busy` follows `spinning`. The page documents no accessibility guidance. Source shows no `role` (S2).
- Mantine: no accessibility guidance on the page. The note on CPU cost says all loaders are CSS-animated and SVG loaders can delay the animation until JavaScript loads (S3).
- shadcn: the Base UI, React Aria and Radix variants are linked, not opened. The default is a lucide icon with `animate-spin` (S4).
- Radix Themes: Button has its own `loading` prop (S6).
- Chakra: the Spinner page lists the root props `size`, `as`, `asChild`. `colorPalette`, `color`, `borderWidth` and `animationDuration` come from examples. The `ProgressCircle` page does not compare itself with Spinner (S7).
- Spectrum: the React Spectrum S2 page returned only a site header and was not read. The RAC `ProgressBar` page lists `aria-label` as optional and styles indeterminate on the absence of `aria-valuenow` (S8).
- Carbon: `Loading` renders `aria-live="assertive"` when active and `"off"` when inactive, `aria-atomic="true"`, and an inner `role="dialog"` only when `withOverlay` is on and active (source). The Accessibility tab of the docs was not in the fetched text (S9).
- Polaris: the 2025-10 release-candidate docs list other size values (`small`, `large`, `base`, `small-100`, `large-100`) per a web-search summary; the version matters (S10).
- Atlassian: the code page is the source of the props table. The usage page says a spinner is an exception to reduced motion because a frozen spinner can suggest the process has stopped (S11).
- Fluent: the Spinner spec says `aria-valuemin/max/now` are not mentioned and the label association is not described. With reduced motion the spinner turns once and then stops (S12).
- Primer: markup per source: a `span` wrapper, an `svg` with `aria-hidden`, `aria-labelledby` to a `VisuallyHidden` element holding `srText`. There is no `role` and no `aria-live`. With `srText={null}` the spinner has no accessible text at all (S13).

## Patterns observed

**Name.** Of the 13 rows with a documented name:

- `Spinner`: Chakra, Radix Themes, shadcn, Primer, Atlassian, Fluent, Polaris (7).
- `Loader`: Mantine (1). `Loading`: Carbon (1). `Spin`: Ant (1).
- Named for the progress family: MUI `CircularProgress`, Spectrum `ProgressCircle` (2). Chakra also ships `ProgressCircle` next to `Spinner`.
- Radix Primitives has only `Progress` (no spinner).
- Component Gallery (S14), a hand tally of its rows: about 33 systems call it `Spinner`, about 11 `Loader`, a handful `Loading` or `Loading indicator`, and four use a circular-progress name (Spectrum, Chakra, HeroUI, Quasar). Treat these as approximate.

**Split from the determinate bar.**

- One component with a switch: MUI `variant`, Spectrum `isIndeterminate`, Ant `percent`, Chakra `ProgressCircle` `value={null}` (4).
- Two components, indeterminate only on the spinner: Chakra `Spinner`, Fluent `Spinner` plus `ProgressBar`, Primer `Spinner` plus `ProgressBar`, Radix Themes, shadcn, Mantine, Atlassian, Polaris (about 6 documented as spinner-only).
- Fluent's own spec says a spinner is "typically an indeterminate ProgressIndicator", which explains why Fluent's spinner carries `role="progressbar"` (S12).
- The split follows the name. A system that names it `Spinner` mostly treats it as indeterminate-only; a system that names it `*Progress*` merges both modes.

**Recurring props.**

- Size: 12 of 13 rows have a size axis, each with its own scale (`sm/md/lg` as Primer; 3, 5 or 8 steps elsewhere; numeric or CSS value in MUI and Mantine). shadcn uses a class.
- Accessible label: 9 systems document a label (MUI `aria-label`, Spectrum required `aria-label`, Carbon `description`, Polaris `accessibilityLabel`, Atlassian `label`, Fluent `label` slot, Primer `srText`, shadcn default `aria-label`, Ant visible `description`). The prop name is different in every one. None share a word.
- Colour: `color` (MUI, Mantine, Chakra), `appearance` (Atlassian, Fluent), `staticColor` (Spectrum), none or `currentColor` (shadcn, Carbon, Polaris, Primer, Radix Themes). Where a spinner inherits colour (`currentColor`), no prop is needed.
- Inline versus centred versus overlay: Carbon (`small` / `withOverlay`), Ant (`fullscreen`, embedded), Polaris (`large-100`), Radix Themes (`loading` wraps children). Mantine's overlay is a separate component (`LoadingOverlay`, named on the Loader page).
- Delay: Ant, Atlassian, Fluent, Primer (4). Atlassian advises waits over 1 s; Carbon over 3 s.
- Determinate: only the progress-named family (S1, S8, S7).

**Overlay and wrap-children are different components or patterns.** Radix Themes folds it in (`loading` + `children`), Carbon via a flag, Ant via nesting. No system makes the bare indicator and the overlay the same thing without a flag or a wrapper.

## Accessibility notes

What each system renders, from its source or page:

- **MUI**: `role="progressbar"`, name by `aria-label`/`aria-labelledby`, `aria-valuetext` for non-percent values (S1).
- **Fluent**: `role="progressbar"` on the animated element, label as a sibling `span` (S12).
- **Spectrum**: `aria-label` required, `aria-labelledby` as the alternative; localize the string (S8).
- **shadcn**: `role="status"` plus `aria-label="Loading"` on the SVG (S4).
- **Carbon**: SVG `role="img"` with a `<title>`; a live container (`assertive` when active); `aria-busy` not rendered (S9).
- **Primer**: `aria-hidden` SVG plus `aria-labelledby` to hidden text; no role; no live region. `srText={null}` leaves no accessible text and the page says to put the message elsewhere (S13).
- **Ant**: wrapper `aria-live="polite"` and `aria-busy`; no role; no label by default (S2).
- **Polaris**: "always set `accessibilityLabel`", name the operation, add visible text where it helps, and announce the outcome afterwards (S10).
- **Atlassian**: always give a label describing the process; do not freeze the animation for reduced motion (S11).
- **Radix Themes, Chakra, Mantine**: no role, no label, no live region in the files read. Accessibility is left to the caller (S6, S7, S3).

Standards:

- **MDN `progressbar` role** (S15): "An accessible name is required" (`aria-labelledby` or `aria-label`). For an indeterminate state, do not include `aria-valuenow`. `aria-valuetext` is for values the percentage would misdescribe. For a region that is loading, set `aria-busy="true"` on the region and point `aria-describedby` at the bar. MDN recommends the native `<progress>` or `<input type="range">` over the role.
- **MDN `<progress>`** (S16): no `value` attribute means indeterminate (`:indeterminate` matches). Implicit role `progressbar`; no `role` permitted. An accessible label is needed (text between the tags is only a fallback). `max` defaults to 1.
- **MDN `status` role** (S17): implicit `aria-live="polite"` and `aria-atomic="true"`; naming is optional; do not move focus. Whether a live region must already be in the DOM before its content appears is not stated on that page. That insertion timing is therefore **not verified** here.
- **WCAG 4.1.3 Status Messages (AA)** (S18): a waiting state is a status message; it must be determinable by role or properties without taking focus. Its Understanding page names `role="status"` for state messages, `role="log"` or a live region for progress. It flags `role="alert"` or `aria-live="assertive"` on unimportant content as a failure.
- **WCAG 2.2.2 Pause, Stop, Hide (A)** (S19): the Understanding page says a preload animation can be "essential" when interaction cannot occur for all users during the phase, and that omitting it could make users think content is frozen. A progress animation shown beside usable content is not automatically essential. Omnia's `Button.module.css` already states this choice in a comment ("Loading is essential feedback, so the spinner keeps turning even under reduced motion"). Atlassian does the same (S11); Fluent stops after one turn (S12).

Common denominator (S1, S4, S8, S12, S13, S10): a spinner needs a text name that says what is loading; the decorative ring is hidden from assistive technology or is the carrier of the name. Three roles are in use (`progressbar`, `status`, none), so no single answer is standard.

## Options for Omnia

Two rules constrain every option:

- **ADR 0015**: a prop named like an attribute of any HTML element keeps its native type and reaches the native element. A colliding variant axis becomes `variant<Axis>`; a colliding non-variant prop gets a non-native name. `src/native-prop-names.check.ts` fails `pnpm typecheck` otherwise.
- **ADR 0006**: WCAG 2.1 AA, axe in all four theme and skin modes.

Names checked in `node_modules/@types/react/index.d.ts` (19.3.0):

- **Native** (so they keep the native type and meaning): `size` (`number`, on `input`, `select`, and `AllHTMLAttributes`), `label` (`string`, on `option`, `optgroup`, `track`), `loading` (`"eager" | "lazy"`, on `img`, `iframe`), `color` (`string`, on `HTMLAttributes`), `value`, `max`, `min`, `title`, `hidden`, `width`, `height`, `shape`.
- **Not native** (no attribute of that name in the types): `intent`, `variantSize`, `pending`, `delay`, `srText`, `description`, `tone`, `active`, `thickness`, `inline`, `overlay`.
- `aria-*` and `role` are native by definition and pass through.

### Shared base for A, B and C

A `<span>` root, an `aria-hidden` ring drawn in CSS from `currentcolor`, and an accessible name.

| Prop                       | Type                                    | Native name?                                                                                                      | Where it lands                                                                                           |
| -------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `variantSize`              | `'sm' \| 'md' \| 'lg'` (`SpinnerSize`)  | **Collision**: `size` is native (`number`). Renamed, as `Button`, `Input`, `Switch` are. Compliant name: `variantSize` | root `data-size`                                                                                         |
| `aria-label`               | `string`                                | native ARIA name, passes through                                                                                  | the root; overrides the default `t('spinner.loading')` text                                              |
| `className`, `style`, `ref` | native                                 | native names; root target                                                                                         | the root `<span>`                                                                                        |
| `role`                     | native `string`, left in the type       | native name, same meaning                                                                                         | set by the atom before the spread, so a caller's `role` wins (as MUI S1, shadcn S4)                      |
| `color`                    | not offered                             | **Collision**: `color` is native (`string`, on `HTMLAttributes`); a colour axis is `intent` (not native)           | none: the ring uses `currentcolor`, so it inherits the parent's colour (in a Button, on any surface)     |
| `label`                    | not offered                             | **Collision risk**: native `string` on `option`, `optgroup`, `track`. A `string` would pass the gate, but it would not reach a native element on a `<span>`, which breaks rule 1 of ADR 0015. Use native `aria-label`, or a non-native name if visible text is wanted (`description`) | none |
| `title`, `hidden`, `loading`, `value`, `max`, `width`, `height` | not offered        | native names                                                                                                      | none                                                                                                     |
| `children`                 | not offered                             | n/a                                                                                                               | no visible label in v1; a caller composes text beside the spinner                                        |

Data attributes follow the other atoms: `data-scope="spinner"`, `data-part="root"`, `data-size`. New string for `src/translations/en.ts` and `fr.ts`: `spinner.loading` (`button.loading` exists with values `Loading` and `Chargement`).

### A. `Spinner`, indeterminate only, `role="status"`

```tsx
<Spinner />
<Spinner variantSize="lg" aria-label="Loading products" />
```

The shared base. The root is `<span role="status">` holding the `aria-hidden` ring and a visually hidden `t('spinner.loading')` text (the `Button` pattern), or `aria-label` when the caller supplies one.

- Pro: the same shape as the private spinner `Button` already ships, and `Button` could consume it. One word, `Spinner`, the most common name in the sample (7 of 13 rows).
- Pro: `role="status"` is what shadcn ships (S4) and what WCAG 4.1.3 names for a waiting state (S18). It maps to a polite live region, which does not interrupt. No `aria-valuenow` question arises for an indeterminate state.
- Con: `role="status"` makes every spinner a live region. Two spinners on a page, or a spinner inside a Button that already has `aria-busy`, can announce twice. Primer avoids it with no role and `srText={null}` (S13).
- Con: whether a live region inserted together with its text is announced is **not verified**. A region present before the text appears is the safer pattern, which an atom that mounts with its content cannot guarantee.

### B. `Spinner`, indeterminate only, `role="progressbar"`

The same atom, but `<span role="progressbar" aria-label="…">` with no `aria-valuenow`, as MUI and Fluent do. Pro: MDN-explicit for an unknown value; shared with a future determinate bar. Con: not announced when it appears (found only on navigation); MDN prefers native `<progress>`; invites `value`/`max` (native names).

### C. `Spinner`, decorative ring with no role (Primer)

`aria-hidden` ring plus a visually hidden text; no role, no live region, caller announces elsewhere. Pro: no double announcements, simplest markup. Con: WCAG 4.1.3 asks a status to be programmatically determinable; a bare atom leaves the waiting state un-announced by default.

### D. Different name, same surface

- **`Loader`** (Mantine; ~11 systems): shorter, generic. Con: weaker a11y precedent, clashes with router "data loaders".
- **`ProgressCircle`** (Spectrum, Chakra, HeroUI, Quasar): honest if a `value` arrives later. Con: discards the majority `Spinner` vocabulary, ties the atom to a determinate API not needed now.
- **`Loading`** (Carbon, Elastic): reads as a state. Con: clashes with `Button.pending` and native `loading` on `img`.

## Recommendation

- **Name**: `Spinner`. Most common name (7 of 13 documented, ~33 gallery systems), matches the neighbours (Atlassian, Primer, Fluent, Chakra), promises no determinate mode.
- **Alternatives**: `Loader` (shorter, weaker a11y precedent) and `ProgressCircle` (only if one component should cover indeterminate + determinate).
- **Shape**: option A, `<span role="status">`. Props: `variantSize` plus native pass-through, `aria-label` as the accessible-name override, default `t('spinner.loading')`. No `color`, `label`, `value`, `delay`, `children`.

Answers per sub-question:

1. **Name.** `Spinner`, with `Loader`/`ProgressCircle` as alternatives.
2. **Split.** Indeterminate-only. A determinate `Progress` (circular or linear) is a separate future component; native `<progress>` with no `value` is its candidate element.
3. **Props.** `variantSize` is the one recurring axis worth shipping. Colour via `currentcolor`. Label via `aria-label` (native). Overlay, delay, visible text are compositions or later additions.
4. **ARIA.** `role="status"` with a localized name, ring `aria-hidden`. A caller passing `aria-hidden="true"` (spread after the defaults) makes it decorative (e.g. inside a button whose own label says what is happening).
5. **Collisions.** `size`→`variantSize`; `color` replaced by inheritance (`intent` is available, non-native, if ever needed); `label` avoided; `loading`→`pending` per ADR 0015.

Devil's advocate on the pick:

- **`role="status"` is the weakest-evidenced choice.** One system ships it (shadcn). Three ship `progressbar` (MUI, Spectrum, Fluent). Three ship no role (Mantine, Radix Themes, Primer). Announcement timing of a region that mounts with its text was not tested. If announcements fail in practice, Primer's no-role + caller-owned region may be correct.
- **A default live region per spinner can double-announce** (several on a page, or inside a Button already `aria-busy`). The `aria-hidden` pass-through is the escape.
- **The default name is generic.** "Loading" says nothing about what loads; Polaris/Atlassian push specific labels. `aria-label` is optional, so the default will usually be generic.
- **Reduced motion.** `Button` keeps the spinner turning under `prefers-reduced-motion` (essential feedback); matches Atlassian and WCAG 2.2.2's "essential" note. A spinner beside usable content is not automatically essential — a choice, not a rule.
- **The existing private spinner is a consumer.** `Button` draws its own ring (`.spinner`, `ds-button-spin`); if `Spinner` ships, `Button` should reuse it later, or the two drift. A follow-up, not this task.

## Scope

Build now: an indeterminate `Spinner` atom with `variantSize` and an accessible name. Skip for now: determinate progress (a separate `Progress`/`ProgressCircle`, likely on native `<progress>`), overlay, delay, colour props, visible label.

## Decision

Name **`Spinner`**, ARIA **`role="status"`** (option A), chosen by the owner on 2026-11-01.

## Sources

All opened 2026-10-31.

- S1 MUI: https://mui.com/material-ui/react-progress/ , https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-material/src/CircularProgress/CircularProgress.js
- S2 Ant Design: https://ant.design/components/spin , https://raw.githubusercontent.com/ant-design/ant-design/master/components/spin/index.tsx
- S3 Mantine: https://mantine.dev/core/loader/ , https://raw.githubusercontent.com/mantinedev/mantine/master/packages/@mantine/core/src/components/Loader/Loader.tsx
- S4 shadcn/ui: https://ui.shadcn.com/docs/components/spinner , https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/spinner.tsx
- S5 Radix Primitives: https://www.radix-ui.com/primitives/docs/components/progress
- S6 Radix Themes: https://www.radix-ui.com/themes/docs/components/spinner , https://raw.githubusercontent.com/radix-ui/themes/main/packages/radix-ui-themes/src/components/spinner.tsx
- S7 Chakra: https://chakra-ui.com/docs/components/spinner , https://chakra-ui.com/docs/components/progress-circle , https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/packages/react/src/components/spinner/spinner.tsx
- S8 Spectrum / React Aria: https://react-spectrum.adobe.com/react-spectrum/ProgressCircle.html , https://react-aria.adobe.com/ProgressBar
- S9 Carbon: https://carbondesignsystem.com/components/loading/usage/ , https://raw.githubusercontent.com/carbon-design-system/carbon/main/packages/react/src/components/Loading/Loading.tsx , https://raw.githubusercontent.com/carbon-design-system/carbon/main/packages/react/src/components/InlineLoading/InlineLoading.tsx
- S10 Polaris: https://shopify.dev/docs/api/app-home/polaris-web-components/feedback-and-status-indicators/spinner
- S11 Atlassian: https://atlassian.design/components/spinner/usage , https://atlassian.design/components/spinner/code
- S12 Fluent UI v9: https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-spinner/library/docs/Spec.md , https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-spinner/library/src/components/Spinner/Spinner.types.ts
- S13 Primer: https://primer.style/product/components/spinner/ , https://raw.githubusercontent.com/primer/react/main/packages/react/src/Spinner/Spinner.tsx
- S14 Component Gallery: https://component.gallery/components/spinner/
- S15 MDN `progressbar` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role
- S16 MDN `<progress>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress
- S17 MDN `status` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role
- S18 WCAG 2.1 Understanding 4.1.3: https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html
- S19 WCAG 2.1 Understanding 2.2.2: https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html
