# Naming study — avatar (identity image with fallback)

Date: 2026-11-02. Method: official docs and, where a docs page was silent, the system's own source file, opened during this study. "None documented" means the pages opened do not mention it, not that the system lacks it. "Not verified" means no usable page was opened. Pages were read through a fetch tool that summarises each page, so cell values are as reported by that summary. Prop names for Omnia were checked in `node_modules/@types/react/index.d.ts` (`@types/react` 19.3.0), against ADR 0015. Finalized 2026-11-05 with the owner's decision.

## Question

Omnia needs an identity-image atom: a person, bot or organisation shown as a picture, with initials when there is no picture. Four sub-questions:

1. What is it called, and what are its sub-parts called (group, status badge)?
2. Single component or compound (`Avatar.Image` / `Avatar.Fallback`)?
3. Which props recur (size, shape, fallback, status, grouping), and which first-version scope is honest?
4. Which prop names collide with native HTML names under ADR 0015, and what are the compliant names?

## Survey

11 rows. 9 gave a usable answer. Carbon and the Stonal LDSR design system returned nothing usable (see notes). Each row's source tag points to the Sources list; a second tag in a cell means that cell comes from another page.

| System | (1) Component | (2) Size | (3) Shape | (4) Fallback (no image) | (5) Status / presence | (6) Grouping | Src |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MUI | `Avatar` | none; set `width`/`height` through `sx` | `variant`: circular (default), rounded, square | `children` (letters or icon), then first letter of `alt`, then a generic icon | wrap in `Badge` (separate component) | `AvatarGroup`: `max`, `total`, `renderSurplus`, `spacing` (`"medium"`, `"small"`, number) | S1 |
| Chakra UI | `Avatar.Root` / `.Image` / `.Fallback` | `size`: `full`, `2xs` to `2xl` (default `md`) | `shape`: `square`, `rounded`, `full` (default) | `name` derives initials; without it a generic icon; `Avatar.Icon` composable | no prop; example composes `Float` + `Circle` | `AvatarGroup` with `stacking`; no `max` prop; overflow composed with `Menu` | S2 |
| Radix Primitives | `Avatar.Root` / `.Image` / `.Fallback` | not covered | not covered | `Fallback` renders while the image has not loaded; `delayMs` | not covered | not covered | S3 |
| shadcn/ui | `Avatar`, `AvatarImage`, `AvatarFallback` | `size`: `"default"`, `"sm"`, `"lg"`, written to `data-size` (source) | not covered; styled by class | `AvatarFallback`, shown with initials such as "CN" | `AvatarBadge` (corner `span`, bottom-right) | `AvatarGroup` (overlap) + `AvatarGroupCount` | S4 |
| Ant Design | `Avatar` | `size`: number, `large`, `medium` (default), `small`, or a responsive object | `shape`: `circle` (default), `square` | `src`, else `icon`, else `children`; `icon` wins over `children`; `gap` for letters; `onError` can return `false` to stop the default | none on Avatar; combine with `Badge` | `Avatar.Group`: `max` (object), `size`, `shape`; `maxCount` deprecated | S5 |
| Atlassian | `Avatar` (`@atlaskit/avatar`) | `size`: `xxsmall` to `xxlarge` (6 values, default `medium`) | `appearance`: `circle`, `square`, `hexagon` | a default image; initials not mentioned (S6b) | `presence` (online, busy, focus, offline) and `status` (approved, declined, locked, warning); status wins over presence (S6b) | `AvatarGroup`: `appearance` (`stack`, `grid`), `maxCount`, `size`, `data`, `moreIndicatorLabel` (S7) | S6 |
| Shopify Polaris | `s-avatar` (web component) | `size`: `small-200` to `large-200`, 7 values (default `base`) | not covered | `initials` shown when `src` is missing or fails | not covered | not covered | S8 |
| GitHub Primer | `Avatar` | `size`: number or `{narrow, regular, wide}` (default `20`) | `square`: boolean; circle for people, square for bots, teams, organisations | none: the source renders one `<img>` with no `onError` | not covered | `AvatarStack` (2 to 4 avatars; `alignRight`, `disableExpand`); `AvatarPair` named by the Component Gallery (S13) | S9 |
| Adobe Spectrum | `Avatar` | `size`: `avatar-size-50` to `avatar-size-700` or a number (S2 page: default `24`) | not covered | not covered | not covered | not covered | S10 |
| IBM Carbon | not found | not found | not found | not found | not found | not found | S11 |
| Stonal LDSR | not found | not found | not found | not found | not found | not found | S12 |

Notes on cells:

- Chakra: `onStatusChange` reports image loading status, not user presence (S2).
- shadcn: built on the Radix Avatar primitive; `AvatarBadge` and `AvatarGroup` are plain elements (source, S4).
- Ant: the page documents no badge or status props on Avatar itself (S5).
- Atlassian: the code page does not document `fallback`; the examples page says a missing image shows "a default image". The page also says the label/name distinction is unclear (S6b).
- Primer: the Avatar page lists `src`, `alt` (default `''`), `size`, `square`; the AvatarStack page's fuller props table was truncated in the fetch (S9).
- Spectrum: two pages read (classic and S2) disagree on the size scale and default; neither documents shape, fallback, group or status (S10).
- Carbon: `carbondesignsystem.com/components/avatar/usage/` returned 404, and a web search found no Avatar page. That is "not found", not proof of absence.
- Stonal LDSR: a web search returned no public documentation, and the local vault mentions "LDSR" only in unrelated notes. Not verified.
- The Component Gallery lists 38 avatar examples across about 35 systems and, in the entries read, uses only "Avatar" plus the group names AvatarGroup (Gestalt), Avatar pair and Avatar stack (Primer). It describes the component as "A graphical representation of a user: usually a photo, illustration, or initial" (S13).

## Patterns observed

**Name.** All 9 systems with a usable page call the component `Avatar` (`s-avatar` in Polaris). No `Persona`, `Profile picture` or `Userpic` appears in the Component Gallery entries read (S13). The name is not in question.

**Size.** 8 of 9 have a size axis, and each has its own scale: 3 steps (shadcn), 3 plus numbers (Ant, Spectrum), 6 (Atlassian), 8 (Chakra), 7 (Polaris), number-only (Primer). MUI sets it through `sx`. The prop is `size` in 7 systems.

**Shape.** 5 systems expose it, under 4 different names: `variant` (MUI), `shape` (Chakra, Ant), `appearance` (Atlassian), `square` boolean (Primer). Values: circle and square in all five; Chakra adds `rounded`, MUI adds `rounded`, Atlassian adds `hexagon`. Primer gives the semantic reason: circle for people, square for bots, teams and organisations.

**Fallback.** Image, then initials, then a generic icon is the common order (MUI, Chakra, Ant, Polaris). Three shapes of API:

- Derived: MUI takes the first letter of `alt`, Chakra derives initials from `name`.
- Explicit: Polaris `initials`, Ant `children` and `icon`.
- Composed: Radix, shadcn and Chakra use a `Fallback` part. Radix adds `delayMs` so the fallback does not flash on fast loads.

Primer renders only an `<img>` and has no fallback (S9).

**Status.** 3 systems document a status inside the avatar (Atlassian `presence` and `status`, shadcn `AvatarBadge`, Chakra by composition). MUI and Ant use their separate `Badge`. Same split as the Badge study: an overlay is its own component or a slot.

**Grouping.** 6 of 9 have a group component: `AvatarGroup` (MUI, Chakra, shadcn, Atlassian), `Avatar.Group` (Ant), `AvatarStack` (Primer). The overflow prop is `max` (MUI, Ant) or `maxCount` (Atlassian); Chakra and Primer have none documented (Chakra composes a menu; Primer caps at 4).

**Compound or flat.** Image and fallback share state (loaded, failed), so the compound form needs a context. It is the Radix, Chakra and shadcn shape (3 systems). The flat form, with `src` and a fallback prop on one component, is MUI, Ant, Atlassian, Polaris and Primer (5 systems).

## Accessibility notes

- **Atlassian** (S6b): an avatar with no `name`, `presence` or `status` is hidden from assistive technology as it conveys nothing. A decorative image has `name` removed or set to `''`. Tooltips should repeat the label.
- **Primer**: `alt` defaults to `''`; give alt text when the avatar appears without the person's name next to it (S9).
- **Polaris**: `alt` is documented as the accessibility description (S8).
- **Ant, MUI**: `alt` is the image text; MUI also uses its first letter as the fallback (S1, S5).
- **WCAG 1.1.1** (level A, so inside Omnia's WCAG 2.2 AA floor): non-text content needs a text alternative that serves the equivalent purpose, and purely decorative content is marked so assistive technology can skip it (S14).

Common denominator: the name appears next to the avatar in most uses, so the image is decorative (`alt=""`); when it stands alone, `alt` carries the person's name. An initials fallback is text, but "JD" alone is a poor name, so the accessible name needs to be the full name, not the initials. This is the point where the derived-initials designs (MUI, Chakra) and the explicit-initials design (Polaris) differ most.

## Options for Omnia

Two rules constrain every option:

- **ADR 0015**: a prop named like an attribute of any HTML element keeps its native type and reaches the native element. A colliding variant axis becomes `variant<Axis>`; a colliding non-variant prop gets a non-native name. `src/native-prop-names.check.ts` fails `pnpm typecheck` on a type mismatch only.
- **CLAUDE.md token contract**: semantic `var(--omnia-...)` only, no raw colour in `*.module.css`.

Names checked in `@types/react` 19.3.0:

- **Native**: `size` (`number`, on `input`, `select`, `AllHTMLAttributes`), `shape` (`string`, on `area`, `AllHTMLAttributes`), `src` (`string`, on `img`, `iframe`, `video`, `input`, others), `alt` (`string`, on `img`, `area`, `input`), `name` (`string`, on `button`, `input`, `form`, others), `label` (`string`, on `option`, `optgroup`, `track`), `max` (`number | string`, on `input`, `meter`, `progress`), `loading` (`"eager" | "lazy"`, on `img`, `iframe`), `color` (`string`, on `HTMLAttributes`), `width`, `height`, `title`, `hidden`.
- **Not native** (no HTML attribute of that name in the types): `initials`, `presence`, `status`, `fallback`, `maxCount`, `intent`, `variantSize`, `variantShape`, `limit`. `status` appears in the types only on a Promise helper type, not on any element.

### Shared base for the single-component options

| Prop | Type | Native name? | Where it lands |
| --- | --- | --- | --- |
| `src` | `string` | Native, same meaning (image URL). Keeps type | the inner `<img>` |
| `alt` | `string` | Native on `img`, same meaning. Also the accessible name of the initials fallback | the inner `<img>`; `aria-label` on the fallback |
| `initials` | `string` | Not native | fallback text, aria-hidden when `alt` names the avatar |
| `variantSize` | `'sm' \| 'md' \| 'lg'` | **Collision**: `size` is native (`number`). Compliant name: `variantSize`, as `Button`, `Input`, `Spinner` | root `data-variant-size` |
| `variantShape` | `'circle' \| 'square'` | **Collision**: `shape` is native (`string`, on `area`). The gate would **not** fail a `'circle' \| 'square'` union, because it is a subset of `string`; the repo rule for a visual axis with a native name is still `variantShape`. Compliant name: `variantShape` | root `data-variant-shape` |
| `presence` | not offered in v1 | Not native | none; a status is composed with `Indicator` |
| `name` | not offered | **Collision risk**: native `string` on `button`, `input`, `form` (a form field name). A `string` would pass the gate, but it would not reach a native element on a `<span>` or `<img>`. Use `alt` (name) and `initials` | none |
| `children` | not offered | n/a | initials come from `initials`, not from children |
| `color` | not offered | **Collision**: native `string`. A tint axis would be `intent` (not native, exists in `src/lib/intents.ts`) | none: v1 is neutral |
| `loading`, `width`, `height`, `title`, `label`, `max` | not offered | native names | none; no image-attribute pass-through in v1 |
| `className`, `style`, `ref` | native | native names; root target | the root element |

Data attributes follow the other atoms: `data-scope="avatar"`, `data-part="root"`, `data-variant-size`, `data-variant-shape`. New strings, if the fallback gets a default accessible name: `avatar.fallback` in `src/translations/en.ts` and `fr.ts`.

Token implications: surface `--omnia-color-bg-subtle`, initials `--omnia-color-text-primary`, ring `--omnia-color-border-strong` (already asserted at 3:1 on `bg-surface` in all four modes by `src/styles/contrast.test.ts`). A circle needs no new token: the radius tokens are `sm`, `md`, `lg` (0.375 to 0.875 rem), none "full", and a literal `border-radius: 50%` is the repo precedent (`Indicator`, `Spinner`, `Switch`). Each of those squares the corners in a `[data-skin='pixel']` rule, so the skins are not bypassed and no `--omnia-radius-full` is needed.

### A. One flat `Avatar` (`src`, `alt`, `initials`)

```tsx
<Avatar src="/jane.jpg" alt="Jane Doe" initials="JD" />
<Avatar alt="Acme" variantShape="square" initials="A" variantSize="lg" />
```

The root draws the image and swaps to initials on error, internally.

- Pro: smallest surface; no context; matches MUI, Ant, Atlassian, Polaris, Primer (5 of 8 that have a structure).
- Pro: initials are explicit, so no locale-fragile derivation (given names, CJK, particles).
- Con: an atom that owns an image-load state machine; Radix's `delayMs` has no place to live.

### B. Compound `Avatar.Root` / `Avatar.Image` / `Avatar.Fallback` (Radix, Chakra, shadcn)

- Pro: the consumer controls the fallback content (icon, initials, anything) and the delay.
- Pro: `Image` and `Fallback` share load state, so under the ARCHITECTURE decision tree this one needs a context.
- Con: heavier for the 90% case (an `<img>` plus initials); 3 parts for one picture.
- Con: the repo asks for compounds by default but also for "no abstraction for later".

### C. Flat `Avatar` plus a later `AvatarGroup`

A is v1; `AvatarGroup` ships as a molecule when needed. No shared state between the group and its children, so dot-notation (`Avatar.Group`) would also fit; a separate export matches 4 of 6 group systems.

### D. Another name

None needed: the Component Gallery entries read use only "Avatar" (S13). `Persona` (Fluent) was not opened here and is not evidence.

## Recommendation

Opinion, built on the facts above.

- **Component: `Avatar`.** 9 of 9 documented systems, no competing name in the sample.
- **Shape: option A, flat**, with `src`, `alt`, `initials`, `variantSize`, `variantShape`. Image load failure is handled inside, falling back to `initials`, then to a generic icon.
- **Group: `AvatarGroup`**, a later molecule, not in v1. 4 of 6 group systems use this name; Primer's `AvatarStack` is the one alternative. The overflow prop is `maxCount` (Atlassian precedent), not `max`: `max` is native (`number | string` on `input`, `meter`, `progress`) and means a maximum value there.
- **Status: not part of v1.** Compose with the `Indicator` atom (`src/components/atoms/Indicator/`), which came out of the Badge study (`docs/naming/badge.md`, option A). If it is added, prop name `presence`, not `status`, because ADR 0012 already uses "status" for the colour family (success, warning, danger) and `status` would read as a colour there.
- **Accessible name:** `alt` is the name. `alt=""` makes the avatar decorative, as Atlassian and Primer do.

## Scope

Built in v1: `Avatar` with `src`, `alt`, `initials`, `variantSize`, the image-error fallback to `initials`, and the user-icon placeholder. Out of scope: `AvatarGroup`, presence/status dot, shape, colour or intent tint, derived initials, responsive size, image pass-through attributes.

## Decision

Chosen by the owner on 2026-11-05: option A, one flat component, circle only. The recommendation's `variantShape` was dropped, and `variantSize` has five steps rather than three.

- **Name `Avatar`**, a single flat component: no compound parts, no context, and no shape prop (circle only, squared by the pixel skin).
- **Props**: `src` (native `string`, on the inner `<img>`); `alt` (native `string`, on the inner `<img>`, **required** in the type so every caller decides, `alt=""` = decorative); `initials` (non-native `string`, explicit, never derived from `alt`); `variantSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` (default `md`); plus `HTMLAttributes<HTMLSpanElement>`, `className` and `ref` on the root `<span>`, as `Badge` and `Indicator`.
- **Rendering order**: the image when `src` is set and has not failed to load, else the `initials` text, else a neutral placeholder: the `Icon` atom's `user` glyph, decorative.
- **Image error**: handled internally by remembering the failed `src`; a new `src` retries. No consumer `onError` pass-through.
- **One accessible name across states**: in image mode the `<img alt>` carries it. In fallback mode the root gets `role="img"` and `aria-label={alt}` when `alt` is non-empty, with the initials or icon `aria-hidden`; when `alt` is `""` the whole fallback is hidden from assistive technology (`aria-hidden="true"` on the root).
- **No component-supplied text**, so no new translation keys.
- **Out of scope**: status/presence dot, `AvatarGroup`, shape, colour or intent tint, derived initials, responsive size, image attribute pass-through beyond `src`/`alt`.

## Sources

All opened 2026-11-02.

- S1 MUI: https://mui.com/material-ui/react-avatar/
- S2 Chakra UI: https://chakra-ui.com/docs/components/avatar
- S3 Radix Primitives: https://www.radix-ui.com/primitives/docs/components/avatar
- S4 shadcn/ui: https://ui.shadcn.com/docs/components/avatar , https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/avatar.tsx
- S5 Ant Design: https://ant.design/components/avatar
- S6 Atlassian: https://atlassian.design/components/avatar/code ; S6b https://atlassian.design/components/avatar/examples
- S7 Atlassian AvatarGroup: https://atlassian.design/components/avatar-group/code
- S8 Shopify Polaris: https://shopify.dev/docs/api/app-home/polaris-web-components/media-and-visuals/avatar
- S9 GitHub Primer: https://primer.style/product/components/avatar/ , https://primer.style/product/components/avatar-stack/ , https://raw.githubusercontent.com/primer/react/main/packages/react/src/Avatar/Avatar.tsx
- S10 Adobe Spectrum: https://react-spectrum.adobe.com/react-spectrum/Avatar.html , https://react-spectrum.adobe.com/Avatar
- S11 IBM Carbon: https://carbondesignsystem.com/components/avatar/usage/ (404)
- S12 Stonal LDSR: no public page found (web search "Stonal LDSR design system avatar component")
- S13 Component Gallery: https://component.gallery/components/avatar/
- S14 WCAG 2.1 Understanding 1.1.1: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html

Could not open or not found: Carbon avatar page (404), Stonal LDSR (no public docs), Material (M3), Apple HIG, GOV.UK, Fluent (`Persona`), and the full AvatarStack props table on Primer (truncated).
