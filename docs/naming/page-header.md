# Naming study — page-content header (PageHeader)

Date: 2026-11-13. Method: official docs, or the system's own source file, opened during this study
through a fetch tool that summarises each page. "Not documented" means the pages opened do not
mention it, not that the system lacks it. "Not confirmed" means no usable page was opened.

## Question

Omnia needs the title block at the top of a page's content: a breadcrumb slot (any node, since no
`Breadcrumb` component exists and none is planned now), a title (an `<h1>` by default), a short
description and page-level actions. It sits inside `PageTemplate.Main` and renders **no landmark**:
`PageTemplate.Header` is the `<banner>`, and this block is only content.

The owner has picked the name **`PageHeader`**. This study records the evidence for it, names the
subparts and props, and answers one honest question: `SectionHeading` already has `Title`,
`Description` and `Actions`, so is this block a duplicate?

Scope split: a sibling organism `AppHeader` (the global app header, the thing that fills
`PageTemplate.Header`) is studied separately in its own file. `PageHeader` never renders a landmark
and never holds app-level navigation.

## Survey

| System            | Block name                    | Parts / props (verbatim)                                                                                             | Heading level                       | Src |
| ----------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --- |
| Ant Design (v3 docs) | `PageHeader`               | props `title`, `subTitle`, `breadcrumb`, `extra`, `tags`, `avatar`, `backIcon`, `onBack`, `footer`, `ghost`           | not documented                      | S1  |
| Atlassian         | `PageHeader` (`@atlaskit/page-header`) | props `breadcrumbs`, `actions`, `bottomBar`, `children` (the title), `disableTitleStyles`, `innerRef`        | not described on the pages opened   | S2  |
| Shopify Polaris   | `Page` (title bar built in); web components: `s-page` | React: `title`, `subtitle`, `backAction`, `primaryAction`, `secondaryActions`, `actionGroups`. Web component: `heading`, slots `breadcrumb-actions`, `primary-action`, `secondary-actions` | not documented | S3, S4 |
| IBM Carbon (IBM Products) | `PageHeader`          | props `breadcrumbs`, `title`, `subtitle`, `pageActions`, `actionBarItems`, `navigation` (Tabs), `tags`, `withoutBackground`, `collapseHeader` | not documented               | S5  |
| GitHub Primer     | `PageHeader`                  | parts `PageHeader.TitleArea`, `.Title`, `.Description`, `.Breadcrumbs`, `.Actions`, `.Navigation`, `.ContextArea`, `.ContextBar`, `.ParentLink`, `.LeadingVisual`, `.TrailingVisual`, `.LeadingAction`, `.TrailingAction`, `.ContextAreaActions` | `Title` renders `h2` by default, `as` to change | S6 |
| PatternFly        | page header section of `Page` (a `PageSection`) | parts named in the guidelines: breadcrumb (topmost), page title, optional description; actions not mentioned       | not documented                      | S7  |
| Salesforce Lightning | page header blueprint      | CSS parts `slds-page-header__name`, `__title`, `__name-meta`, `__meta-text`, `__controls`, `__col-actions`, `__detail-*`; variants `object-home`, `record-home`, `vertical`, `related-list` | not documented | S8 |
| Grommet           | `PageHeader`                  | props `title`, `subtitle`, `parent`, `actions`, `level`; theme `pageHeader.pad`                                       | string `title` renders `<h1>`; `level` 1 to 6 | S9 |
| Nuxt UI           | `PageHeader`                  | props `headline`, `title`, `description`, `links`, `as`, `ui`; matching slots                                         | `h1` by default; `as` object to change | S10 |
| MUI Toolpad       | `PageHeader`                  | props `title`, `breadcrumbs`; slot `toolbar` (`PageHeaderToolbar`)                                                    | not documented                      | S11 |
| Supabase          | `PageHeader`                  | `PageHeaderMeta`, `PageHeaderIcon`, `PageHeaderSummary`, `PageHeaderTitle`, `PageHeaderDescription`, `PageHeaderAside`; prop `size` | `PageHeaderTitle` is an `h1` | S12 |
| Cloudscape        | `Header` (generic section/page header) | page did not load the props; only "Summarizes the content that's displayed under it and provides a space for optional action buttons" | not confirmed | S13 |
| GOV.UK            | no block                      | heading classes `govuk-heading-xl` to `-s`; captions `govuk-caption-xl`, `-l`, `-m` placed above or inside the `<h1>`  | plain `<h1>` markup                 | S14 |
| Adobe Spectrum    | no page header component found | the only match is `Header`, a header inside a container such as a Dialog (props: `children`)                         | n/a                                 | S15 |
| Fluent UI v9      | no page header package        | no package directory in `packages/react-components` contains "page", "header" or "title"                              | n/a                                 | S16 |

Notes on cells:

- **Ant Design**: the page opened is the v3 documentation and does not mark `PageHeader` deprecated.
  Memory says v5 moved it out of core, but no page opened this session confirms that, so it is left
  as not confirmed.
- **Atlassian**: the guidance says to use "one page header per page", at the start of any page, and
  never inside a popup, dialog or drawer. Breadcrumbs are "optional", "above the header". Actions are
  "right-aligned next to the title". `headingLevel` was not described on the pages opened.
- **Polaris**: `Page` is a page scaffold with the title bar built in. The old `polaris.shopify.com`
  and `polaris-react.shopify.com` pages redirect to `shopify.dev/docs/api/polaris`, which did not
  document `Page`. The React props come from the source of `Page.tsx` (`Page` reads `title`,
  `subtitle`, `primaryAction`, `secondaryActions`, `actionGroups`, `backAction` from its header
  props); the breadcrumb is built from `backAction`, a single back link, not a trail. The
  web-component page documents `heading` plus slots, and points to an App Bridge title bar for the
  native Shopify admin one.
- **Carbon**: the typings (`@carbon/ibm-products` 2.94.0) are the evidence; no Carbon-site page for
  it was reached. Its prop list is large because the block also handles collapse, overflow and tags.
- **Primer**: the page calls the rendered block a landmark and its examples set `role="banner"`. No
  default role is stated. The block is `div` by default, with `as` and `role` as props.
- **PatternFly**: the React part names were not reached (the component page did not load). Only the
  design-guidelines page was read.
- **Salesforce**: the v1 SLDS blueprint page lists CSS parts, not a component API. It does not
  mention breadcrumbs or heading markup.
- **Grommet** and **Nuxt UI** pass the title as a prop (`title`), Supabase and Primer as a child part.

## Patterns observed

Of the 16 rows, 12 document a real page-header block (Ant, Atlassian, Polaris, Carbon, Primer,
PatternFly, Lightning, Grommet, Nuxt UI, Toolpad, Supabase, Cloudscape in a looser sense).
GOV.UK, Spectrum and Fluent have none and leave it to plain headings.

1. **Block name.** `PageHeader` is the name in 8 of 12 (Ant, Atlassian, Carbon, Primer, Grommet,
   Nuxt UI, Toolpad, Supabase). Polaris folds it into `Page`; Lightning says "page header";
   Cloudscape says `Header`; PatternFly has no component of that name in the pages opened.
2. **Parts always present.** Every block with parts has a title, an actions area, and an optional
   breadcrumb. Description appears as `subtitle` (Ant, Carbon, Polaris, Grommet) or `description`
   (Primer, Nuxt UI, Supabase, PatternFly). Both words exist, `description` leads among the
   compound systems.
3. **Actions name.** `Actions` (Primer, Polaris slots, Atlassian, Grommet), `extra` (Ant),
   `pageActions` (Carbon), `links` (Nuxt), `Aside` (Supabase), `toolbar` (Toolpad). `Actions` is the
   plain word and the most common.
4. **Breadcrumb name.** `breadcrumb` (Ant), `breadcrumbs` (Atlassian, Carbon, Toolpad, Primer's
   `Breadcrumbs`), `parent` (Grommet), `backAction` (Polaris). Compound systems use the plural
   because the thing is a trail; Omnia's slot takes any node, so the singular matches `Title`,
   `Description` and `Actions`.
5. **Heading level.** Where the docs say, the title is an `h1` (Grommet, Nuxt UI, Supabase) with an
   escape to change it. Primer is the outlier: `h2` by default, because the header often sits under
   an app banner.
6. **No landmark.** Only Primer discusses a landmark role, and it is opt-in. No other system opened
   documents one for the block, which fits Omnia's rule.
7. **Extras that Omnia should not copy now.** Back icon and `onBack` (Ant), tags and avatar (Ant),
   collapse and overflow logic (Carbon), tabs and bottom bars (Atlassian, Carbon `navigation`),
   metadata rows (Polaris, Lightning). Each is a feature with its own design, not a naming question.

## Subpart names

Recommended compound parts (ADR 0024 dot-notation, ADR 0034 per-part subfolders):

| Part                     | Renders                              | Why this word                                                                      |
| ------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------- |
| `PageHeader.Breadcrumb`  | a `div` slot for any node            | Slot only: it carries no trail logic. Singular, like the other parts. Plural is the majority spelling in systems that own a trail component; Omnia has none. |
| `PageHeader.Title`       | `Heading`, `level` defaulting to `1` | Matches Primer, Supabase and the existing `SectionHeading.Title`.                   |
| `PageHeader.Description` | muted `Text`                         | Matches Primer, Nuxt, Supabase and `SectionHeading.Description`.                    |
| `PageHeader.Actions`     | a `div` holding buttons              | Matches Primer, Atlassian and `SectionHeading.Actions`. Not `Extra`, `Aside`, `Toolbar`. |

Variants exposed elsewhere: Primer `TitleArea variant` (`subtitle`, `medium`, `large`), Supabase
`size` (width of the meta container), Carbon `withoutBackground`, Lightning's four page types. None
is needed on day one. The title already has `Heading`'s `variantSize`, which stays available through
`PageHeader.Title`.

## Relation to SectionHeading

What `SectionHeading` is today (read in `src/components/molecules/SectionHeading/`): a `div` root with
three parts. `Title` is a `Heading` whose `level` is **required** and chosen by the caller.
`Description` is a `Text` with `tone="muted"`. `Actions` is a flex `div`. The root is a CSS grid and a
container-query container: actions sit opposite the text once the component is 30rem wide, and drop
below it when narrower.

Side by side:

| Aspect                | `SectionHeading`                         | `PageHeader` (proposed)                                  |
| --------------------- | ---------------------------------------- | -------------------------------------------------------- |
| Tier                  | molecule                                 | organism                                                 |
| Title / Description / Actions | yes                              | yes, same behaviour                                      |
| Breadcrumb slot       | no                                       | yes                                                      |
| `Title` level         | required, caller's choice                | defaults to `1`                                          |
| Placement contract    | any section or panel                     | once per page, first child of `PageTemplate.Main`        |
| Landmark              | none                                     | none                                                     |

**Verdict: near-redundant.** Three of the four parts are behaviourally identical, and the grid that
places the actions is the only non-trivial code. What `PageHeader` adds is small: the breadcrumb slot,
an `h1` default and a page-level contract. A reader could build the same thing today with a node above
a `SectionHeading` and `level={1}`.

Reasons to build it anyway, and their weight:

- **Discoverability**: eight of the systems opened expose a `PageHeader`; a consumer looking for "the
  page title block" will not find `SectionHeading`. Real but cheap to fix with a docs note.
- **The `h1` default**: removes a required prop that is easy to get wrong. Small.
- **One accessible, once-per-page block** that the template docs can point at. Small.
- **The breadcrumb row**: the only structural addition, and it cannot be dropped into
  `SectionHeading` as is. Its grid puts `Actions` on an explicit `grid-row: 1`, so a breadcrumb child
  would be placed on the row below the title. The breadcrumb has to sit outside that grid, or the
  grid needs a row for it.

Options for the owner:

- **R1 (recommended): build `PageHeader` as a thin organism over `SectionHeading`.** The root is a
  `div` holding the breadcrumb slot and an inner `SectionHeading`. `Title`, `Description` and
  `Actions` are small wrappers that reuse `SectionHeading`'s parts (`Title` only adds `level`
  defaulting to `1`). No second copy of the grid. Con: the root must place children into two
  places (breadcrumb outside, the rest inside), which in a compound API means the root reads its
  children or the parts use a context; settle that in the plan, not here.
- **R2: build `PageHeader` standalone**, sharing only the `Heading` and `Text` atoms, with its own
  copy of the grid CSS and a breadcrumb row. Simple parts, about 20 lines of duplicated CSS and two
  places to fix a layout bug. This is the duplication the owner's question is about.
- **R3: do not build it**, document the composition (`Breadcrumb` node, then `SectionHeading` with
  `level={1}`) in `PageTemplate`'s docs and in the `SectionHeading` MDX. Zero new surface. Con: the
  owner already chose the name, and a documented recipe is still not a component a consumer can find
  or a story that locks the placement.

Devil's advocate on R1: an organism that wraps a molecule to change one default and add one slot is
the kind of layer ADR 0033 warns about ("a deep or site-specific composition does not belong in
Omnia"). If no second consumer ever needs the `h1` default or the breadcrumb, R3 was enough. The
other cost: `SectionHeading`'s `level` is required on purpose ("its `level` stays yours"), and
`PageHeader.Title` quietly choosing `1` is a different contract for the same word. A page with two
`PageHeader`s, or one inside a dialog, produces two `h1`s; Atlassian forbids both in its guidance.

`Masthead`, the generic hero once listed in ADR 0033, is dropped by that ADR's 2026-11-13 update,
so it no longer overlaps this block; the global header is named `AppHeader`.

## Prop names vs the prop naming rule (ADR 0015)

The gate (`src/native-prop-names.check.ts`) fails any prop of an exported component or dot-notation
part whose name is native on some HTML element and whose type differs from the native one. Native
names were checked against `@types/react` in this worktree after `pnpm install --frozen-lockfile`
(see the check at the foot of this file).

The proposed surface adds **one prop**. Everything else is `HTMLAttributes` passed to the element.

| Component / part         | Prop                                | Native on any element?                                  | Verdict |
| ------------------------ | ----------------------------------- | ------------------------------------------------------- | ------- |
| `PageHeader`             | none custom; `HTMLAttributes<HTMLDivElement>`, `ref` | n/a                                    | Passes. |
| `PageHeader.Breadcrumb`  | none custom; `HTMLAttributes<HTMLDivElement>`, `ref` | n/a                                    | Passes. |
| `PageHeader.Title`       | `level?: HeadingLevel` (default `1`)  | not native (`Heading.level` already passes the gate)    | Passes. Optional where `Heading.level` is required: narrowing a requirement is allowed, it is not a native name. |
| `PageHeader.Title`       | `variantSize` (inherited from `Heading`) | `size` is native, so the variant axis is `variantSize` | Passes, unchanged. |
| `PageHeader.Description` | `tone` (inherited from `Text`)        | not native                                              | Passes, unchanged. |
| `PageHeader.Actions`     | none custom; `HTMLAttributes<HTMLDivElement>`, `ref` | n/a                                    | Passes. |

Names deliberately **not** used, and why:

- **`title` as a prop** (Ant, Carbon, Grommet, Nuxt, Toolpad, Polaris): `title` is the native global
  tooltip attribute (`string`). A `ReactNode` `title` is a collision and breaks the rule's first
  clause. A compound `PageHeader.Title` child avoids the word.
- **`as`** (Primer, Nuxt): `as` is native on `<link>` in React's types, typed as a string. A
  polymorphic `as` taking a component would collide. The root stays a `div`; there is no landmark to
  switch to.
- **`description`, `breadcrumb`, `actions`, `subtitle`, `headline`**: not React HTML attribute names,
  so they would pass, but compound parts make them unnecessary.
- **`size`** (Supabase): native on `<input>` and `<select>`. If a size axis is ever needed it is
  `variantSize`, the same as `Heading` and `Input`.
- **`hidden`, `role`, `aria-label`**: native; they pass straight through. `role` stays free for a
  consumer who wants `role="region"`, no default is set.

`data-*` hooks follow ADR 0010: `data-scope="page-header"` with `data-part="root"`, `"breadcrumb"`,
`"title"`, `"description"`, `"actions"`.

## Options for the name

The owner has picked **A**. The rest are recorded so the choice can be confirmed or reversed cheaply
before any code exists.

**A. `PageHeader` (picked).**

- Pro: the majority name (Ant, Atlassian, Carbon, Primer, Grommet, Nuxt UI, Toolpad, Supabase).
- Pro: reads correctly next to `PageTemplate` (ADR 0035): the page frame and the page's title block.
- Con: three things now contain "header": `PageTemplate.Header` (the banner), the global `AppHeader`
  organism (studied separately) and `PageHeader`. A newcomer will confuse them. The first two live in
  the template or app chrome; this one is content. The docs for all three should say so in one line.
- Con: Primer's `PageHeader` can itself carry `role="banner"`; the same word means "landmark" there
  and "no landmark" here.

**B. `PageTitle`.** Closer to what it holds, no clash with `Header`. Con: it also holds breadcrumbs
and actions, and no surveyed system uses it for the block.

**C. `PageHeading`.** Echoes `SectionHeading` and `Heading`, so the pair reads as one family. Con: it
makes the near-redundancy with `SectionHeading` more visible, and no surveyed system uses it.

**D. `TitleBar`.** Polaris's term and the Shopify admin's. Con: "bar" implies a strip of chrome, and
Primer and Atlassian use `PageHeader`.

**E. `ContentHeader`.** Removes the `Header` ambiguity by saying "header of the content". Con: vague,
and a name nobody searches for.

## Recommendation

Opinion, built on the facts above:

- Keep **`PageHeader`** with compound parts `Breadcrumb`, `Title`, `Description`, `Actions`.
- Take **R1** for the relation to `SectionHeading`, and treat R3 as the honest fallback if the owner
  prefers no new surface.
- Props: none custom on the root or on `Breadcrumb`, `Description` and `Actions`; `Title.level`
  optional, default `1`. Use no `title`, `as` or `size` prop.
- Open points for the plan, not for this study: how the root separates the breadcrumb from the rest
  (R1), whether `Title` should warn on a second `h1` in dev, and the narrow-screen order of
  breadcrumb, title, actions.

## Decision

PageHeader, built as a thin wrapper over SectionHeading (R1) — chosen by the owner on 2026-11-13.

## Sources

All opened 2026-11-13.

- S1 Ant Design (v3 docs): https://3x.ant.design/components/page-header/
- S2 Atlassian: https://atlassian.design/components/page-header/examples , https://atlassian.design/components/page-header/usage (the base `https://atlassian.design/components/page-header` returned no content)
- S3 Shopify Polaris React source: https://raw.githubusercontent.com/Shopify/polaris/main/polaris-react/src/components/Page/Page.tsx , https://raw.githubusercontent.com/Shopify/polaris/main/polaris-react/src/components/Page/components/Header/Header.tsx (docs URLs https://polaris-react.shopify.com/components/layout-and-structure/page and https://polaris.shopify.com/components/structure/page redirect to https://shopify.dev/docs/api/polaris)
- S4 Shopify Polaris web components: https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page
- S5 IBM Products (Carbon) typings: https://app.unpkg.com/@carbon/ibm-products@2.94.0/files/es/components/PageHeader/PageHeader.d.ts (found through a web search)
- S6 GitHub Primer: https://primer.style/product/components/page-header/
- S7 PatternFly: https://www.patternfly.org/components/page/design-guidelines (https://patternfly.org/component-groups/content-containers/page-header redirected, then returned 404)
- S8 Salesforce Lightning (v1): http://v1.lightningdesignsystem.com/components/page-headers/
- S9 Grommet: https://v2.grommet.io/pageheader
- S10 Nuxt UI: https://ui.nuxt.com/components/page-header
- S11 MUI Toolpad: https://mui.com/toolpad/core/api/page-header/
- S12 Supabase design system: https://supabase.com/design-system/docs/fragments/page-header
- S13 Cloudscape: https://cloudscape.design/components/header/ (intro only)
- S14 GOV.UK: https://design-system.service.gov.uk/styles/headings/
- S15 Adobe Spectrum: no page header found; the web search listed https://react-spectrum.adobe.com/react-spectrum/Header.html (not opened, so the `children`-only note is a search summary)
- S16 Fluent UI v9: https://github.com/microsoft/fluentui/tree/master/packages/react-components (package listing)

Could not confirm: Ant Design v5 status of `PageHeader`, Atlassian `headingLevel` default, heading
level for Ant, Carbon, Polaris and Lightning, PatternFly React part names, Cloudscape props,
Spectrum (search summary only), Apple HIG and Material (no page-header block searched).

## Native-name check

Run 2026-11-13 against `@types/react` 19.3.0 in this worktree (`index.d.ts`, member lines): `title`
(2 matches), `as` (2, both `as?: string`, on `<link>`) and `size` (3) are native. `level`,
`description`, `actions`, `breadcrumb`, `headline`, `subtitle` and `variant` have no match. The gate
itself (`pnpm typecheck`) was not run: there is no component code yet.
