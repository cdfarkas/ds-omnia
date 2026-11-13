# Naming study — global app header (Header)

Date: 2026-11-13. Method: official docs and system source files opened during this study. "Not
confirmed" means the page did not load or did not say, not that the system lacks it.

## Question

Omnia needs an organism for the global app header: brand, primary navigation and actions (theme and
language switchers, buttons). It furnishes the `PageTemplate.Header` slot (ADR 0033, ADR 0035). The
owner has picked the name **`Header`**. This study records the prior art, the subpart names, the
props, and the risks of that pick, so the owner can confirm or change it before any code.

**Hard a11y constraint.** `PageTemplate.Header` already renders `<header>`
(`src/components/templates/PageTemplate/Header/Header.tsx`). A top-level `<header>` is the `banner`
landmark, and a page should have one. So this organism must NOT render `<header>` or `role="banner"`;
it is the _content_ of that landmark. MDN: a `<header>` has the banner role only when it is not
inside article/aside/main/nav/section (S12). A second top-level `<header>` would add a second banner
landmark and make the landmark list ambiguous (my reading, not an MDN quote).

**Scope split.** `Header` (this study) is the global bar inside the page's banner. `PageHeader`
(the title block of the page content: title, description, breadcrumbs, page actions) is studied
separately. The two must not share parts or names; see Risks.

## Survey

| System          | Component (verbatim)                         | Parts / variants (verbatim)                                                    | Renders `<header>`?                       | Src |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- | --- |
| Material 3      | Top app bar (`TopAppBar`, Compose)           | `title`, `navigationIcon`, `actions`; small, center aligned, medium, large     | n/a (native, not web); m3.material.io page was title only | S1  |
| MUI             | `AppBar` + `Toolbar`                         | `Toolbar` (`variant="dense"`)                                                  | **Yes**: `AppBar` default `component="header"`; `Toolbar` is a `div` | S2, S3, S4 |
| Carbon          | UI shell header (`Header`)                   | header name, header links, sub-menu, header utilities, switcher; base / with navigation / with actions / with sidenav | **Yes**: `<header {...rest}>`; no `role` set; `aria-label` passes through | S5, S6 |
| Mantine         | `AppShell.Header`                            | compound region of `AppShell`; `Burger` + logo in the examples                 | **Yes** (semantic elements table)         | S7  |
| Ant Design      | `Layout.Header`                              | slot in `Layout`                                                               | **Yes**: `tagName: 'header'`; caller `tagName` can override | S8, S9 |
| GOV.UK          | `govuk-header` (header)                      | logo; default header only (service name and navigation moved to Service navigation) | **No since v6.0.0**: the root is a `<div>`; it was a `<header>` before | S10, S11 |
| Primer          | `Header` (legacy global bar); `PageHeader`   | `PageHeader`: Title, Actions, ContextArea, Breadcrumbs, Navigation, …          | `Header`: **yes** (`as` default `'header'`). `PageHeader`: a `div`, `role` settable (examples use `role="banner"`) | S13, S14 |
| PatternFly      | `Masthead`                                   | `MastheadMain`, `MastheadToggle`, `MastheadBrand`, `MastheadLogo`, `MastheadContent` | Not confirmed (page names no element or role) | S15 |
| Polaris (React) | `TopBar`                                     | `showNavigationToggle`, `contextControl`, `logoSuffix`, `searchField`, `secondaryMenu`, `userMenu`; `TopBar.Menu/.SearchField/.UserMenu` | **No**: root is a `<div>`, no role        | S16 |
| Atlassian       | `TopNavigation` (page-layout, deprecated)    | slot of `PageLayout`                                                           | Not confirmed (new top-nav pages 404)     | S17 |
| Fluent UI v9    | none                                         | `react-nav` exports `Hamburger`, `NavDrawerHeader`, no top bar                 | n/a                                       | S18 |
| Chakra UI       | none                                         | layout and navigation component lists have no header or app bar                | n/a                                       | S19 |
| Spectrum        | not confirmed                                | landmarks page 404                                                             | Not confirmed                             | S20 |

Notes on cells:

- **Material 3.** Only the Android Compose page was readable. It calls the whole thing "app bars",
  with "top app bars" and "bottom app bars"; the slots are `title`, `navigationIcon`, `actions`
  (props, not compound parts). The m3.material.io overview returned only a title.
- **MUI.** `AppBar` defaults to `<header>`; `Toolbar` is just the flex row inside it. The `component`
  prop can change the element (the `AppBar` source line is `component="header"`; the override is
  inferred from the standard MUI `component` prop, not read on the page).
- **Carbon.** The docs page names the parts in prose ("header name", "header utilities"); the source
  exports the `Header` component and does not set `role`, so the banner role is the implicit one.
- **GOV.UK** is the only surveyed system that moved _away_ from `<header>` for the component. The
  v6.0.0 release notes say they "separate the header element (`<header>`) from the GOV.UK header
  component", which "lets you include other components, such as the Service navigation" in the
  `<header>`. The release note does not mention banner or landmarks; the motive (one banner holding
  several components) is the note's own stated one, no more.
- **Polaris** `TopBar` takes the logo from a frame context, not a prop, and has no `<header>`; the
  surrounding `Frame` was not checked, so whether Polaris renders a banner elsewhere is not confirmed.
- **Primer** has two things: the legacy global `Header` (a `<header>`) and `PageHeader`, a page title
  block (`div`, `h2` title). Its docs use `role="banner"` on `PageHeader` in examples: the title-block
  name and the banner landmark are already tangled there, which is the exact risk Omnia's split avoids.
- **PatternFly** calls the global bar `Masthead`. Omnia's ADR 0033 already reserves `Masthead` for the
  generic _hero_ organism: same word, different meaning, so `Masthead` is unavailable here.
- **Fluent, Chakra:** no global-header component found in the pages and exports opened. Spectrum: the
  one page tried 404'd, nothing was gathered.

## Patterns observed

- **Name.** Of 9 systems with a component: "Header" (Carbon, Mantine, Ant, Primer legacy, GOV.UK),
  "AppBar / Top app bar" (MUI, Material), "TopBar" (Polaris), "TopNavigation" (Atlassian),
  "Masthead" (PatternFly). `Header` is the most common single word, and the region name Mantine and
  Ant use for the slot `PageTemplate.Header` copies.
- **Landmark.** Of the 7 where the element is known: 5 render `<header>` by default (MUI, Carbon,
  Mantine, Ant, Primer `Header`); 2 render a `<div>` (Polaris, GOV.UK since v6). Only MUI, Ant and
  Primer let the caller change the element (`component` / `tagName` / `as`). None documents a
  separate "content of the banner" component, except GOV.UK, which splits the two on purpose.
  Omnia's constraint (the template owns `<header>`) matches GOV.UK's v6 shape, not the majority.
- **Parts.** Two styles. Compound or sub-components: Carbon (name, links, utilities), PatternFly
  (`Main`, `Brand`, `Content`), MUI (`Toolbar`). Slot props: Material (`title`, `navigationIcon`,
  `actions`), Polaris (`logoSuffix`, `searchField`, `secondaryMenu`, `userMenu`). The recurring
  roles are always the same three: brand (start), navigation (middle), actions/utilities (end).
- **Brand vocabulary** varies: "name" (Carbon), "Brand" + "Logo" (PatternFly), "logo" (Polaris,
  GOV.UK, Mantine example).

## Proposed name and parts

**`Header`** (owner's pick), an organism (`src/components/organisms/Header/`, ADR 0034 layout), a
compound whose root and parts all render a `<div>` or other non-landmark element:

| Part             | Element              | Role                                                                    |
| ---------------- | -------------------- | ----------------------------------------------------------------------- |
| `Header`         | `<div>`              | Flex row: brand at the start, nav in the middle, actions at the end; wraps/stacks on a narrow viewport (mobile-first, `48em`). Never `<header>`, never `role="banner"` |
| `Header.Brand`   | `<div>`              | Start slot for the logo/name. The consumer puts a `Link` (or `a`) with the homepage `href` inside; no brand markup of its own |
| `Header.Nav`     | `<div>`              | Middle slot that takes the existing `NavBar` molecule. A `<nav>` is NOT rendered here, because `NavBar` already renders a labelled `<nav>`; nesting a second one would create two landmarks for one list |
| `Header.Actions` | `<div>`              | End slot for `ThemeSwitcher`, `LanguageSwitcher`, `Button`s; flex row with a gap |

Why `Nav` and `Actions` stay parts and not props: matches Carbon/PatternFly, keeps the surface at
zero custom props, and the existing compound idiom in Omnia (`Card.Header/.Body/.Footer`,
`NavBar.Link`). Why `Brand` and not `Logo` or `Name`: it is the role (what the thing is), works for a
text-only wordmark, and PatternFly uses it as `MastheadBrand`. The three parts are opt-in; an empty
slot renders nothing the layout depends on.

Layering (ADR 0001, ADR 0033): an organism may import atoms and molecules (`NavBar`, `Button`,
`ThemeSwitcher`, `LanguageSwitcher`, `Link`). `Header` only provides the slots and the layout; it does
not import them itself, so its dependency depth stays shallow (ADR 0033 forbids site-specific
organisms). The consumer composes:

```tsx
<PageTemplate.Header>
  <Header>
    <Header.Brand>…</Header.Brand>
    <Header.Nav><NavBar>…</NavBar></Header.Nav>
    <Header.Actions><ThemeSwitcher /><LanguageSwitcher /></Header.Actions>
  </Header>
</PageTemplate.Header>
```

Deferred, not in this study: a collapsing mobile menu (a disclosure button + the nav in a panel). It
is the biggest unknown; a later `open` prop would be native-typed (`boolean`, as on `<details>`), but
that is for its own plan.

## Props vs the prop naming rule (ADR 0015)

Checked against the rule and the gate in `src/native-prop-names.check.ts`: it inspects every exported
PascalCase component and its dot-notation parts for props whose name is native on any HTML element
and whose type is not assignable to the native type.

| Where          | Prop                                      | Native name?                  | Verdict                                                  |
| -------------- | ----------------------------------------- | ----------------------------- | -------------------------------------------------------- |
| every part     | native attributes, `className`, `ref`, `children` | yes, native type and meaning | Pass through via `...rest` / `ref` unchanged             |
| `Header` root  | none custom                               | n/a                           | No variant axis, no custom prop: nothing to rename       |
| `Header.Brand` | none custom (a consumer's `Link` owns `href`) | n/a                       | Pass                                                     |
| `Header.Nav`   | none custom                               | n/a                           | Pass                                                     |
| `Header.Actions` | none custom                             | n/a                           | Pass                                                     |

The part names (`Brand`, `Nav`, `Actions`) are not props, so the gate does not see them. If the owner
later wants slot props or a sticky mode, the names to avoid are native: `title`, `label`, `hidden`,
`role`, `action` (native on `<form>`). `actions` and `sticky` are not native. A visual axis would be `variant<Axis>` (e.g. `variantDensity`). The gate has not been run: no
code exists yet, so this table is a reading of the rule, not a typecheck result.

## Options for the name

**A. `Header` (owner's pick).**

- Pro: the most common word (Carbon, Mantine, Ant, Primer) and the one that matches the
  `PageTemplate.Header` slot it furnishes.
- Con: a component named `Header` that does not render `<header>` can mislead (see Risks).

**B. `SiteHeader`.**

- Pro: "site" reads as "the whole site's header", distinct from a section or page header.
- Con: wrong for an app (not a site); not found in the surveyed systems; still implies `<header>`.

**C. `AppHeader`.**

- Pro: already named as the organism example in `docs/ARCHITECTURE.md` (line 18); contrasts with
  `PageHeader`.
- Con: still implies the `<header>` element; "App" is vague next to `AppShell`, the retired name of
  `PageTemplate`.

**D. `AppBar` (MUI, Material).**

- Pro: does not claim the element name, so no landmark false friend; MUI users know it.
- Con: MUI's `AppBar` is a `<header>`, so it carries the same expectation; "bar" clashes in spirit with
  `NavBar`, a different thing (a nav list).

**E. `TopBar` (Polaris).**

- Pro: Polaris's `TopBar` is a `<div>` with no landmark, the same shape as this organism.
- Con: one system only; "top" ties the name to placement.

`Masthead` (PatternFly) is excluded: ADR 0033 reserves it for the hero.

## Risks

- **False friend with the element.** Five of seven surveyed systems render `<header>` for their
  `Header`. A consumer who sees `<Header>` will assume it is the banner and may wrap it in nothing
  (no banner on the page), or render it standalone inside `<main>`, where a `<div>` is harmless but
  the landmark is missing. Mitigation: a TSDoc/MDX line "renders a `div`; mount it inside
  `PageTemplate.Header`, which provides the `<header>`", and a story showing exactly that. GOV.UK
  shipped the same split in v6, with a migration note.
- **Name collision with the slot.** `PageTemplate.Header` and a top-level `Header` export sit side by
  side. `<PageTemplate.Header><Header>` reads as a header inside a header. The dot-notation makes them
  distinct in code, but search results, imports and conversation ("the Header") will be ambiguous.
  Options B, C and D remove this at no real cost; the owner's pick keeps it.
- **Same word, third meaning.** `Card.Header` already exists (a card's title row), so "Header" would
  mean three unrelated things in Omnia (banner slot, global bar, card part), on top of `PageHeader`.
- **Primer shows the tangle.** Its `PageHeader` docs use `role="banner"` on a title block. A future
  `PageHeader` study should state outright that it never takes the banner role either.
- **Not found in the pages read:** Atlassian's current top-nav landmark, PatternFly's element,
  Spectrum and Fluent (no component). The majority claim above rests on 7 systems.
- **Opinion, to attack:** if the name is free to change, `AppHeader` costs nothing and removes two of
  the four risks (slot collision, `Card.Header` pun), while keeping the Header vocabulary. The owner
  picked `Header`; the rest of this study assumes it stands unless changed.

## Decision

AppHeader — chosen by the owner on 2026-11-13.

## Sources

All opened 2026-11-13.

- S1 Material 3: https://developer.android.com/develop/ui/compose/components/app-bars , https://m3.material.io/components/top-app-bar/overview (title only)
- S2 MUI: https://mui.com/material-ui/react-app-bar/
- S3 MUI source: https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-material/src/AppBar/AppBar.js
- S4 MUI source: https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-material/src/Toolbar/Toolbar.js
- S5 Carbon: https://carbondesignsystem.com/components/UI-shell-header/usage/
- S6 Carbon source: https://raw.githubusercontent.com/carbon-design-system/carbon/main/packages/react/src/components/UIShell/Header.tsx
- S7 Mantine: https://mantine.dev/core/app-shell/
- S8 Ant Design: https://ant.design/components/layout (does not state the element)
- S9 Ant Design source: https://raw.githubusercontent.com/ant-design/ant-design/master/components/layout/layout.tsx
- S10 GOV.UK: https://design-system.service.gov.uk/components/header/
- S11 GOV.UK release: https://github.com/alphagov/govuk-frontend/releases/tag/v6.0.0
- S12 MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header
- S13 Primer source: https://raw.githubusercontent.com/primer/react/main/packages/react/src/Header/Header.tsx
- S14 Primer: https://primer.style/product/components/page-header/
- S15 PatternFly: https://www.patternfly.org/components/masthead
- S16 Polaris source: https://raw.githubusercontent.com/Shopify/polaris/main/polaris-react/src/components/TopBar/TopBar.tsx
- S17 Atlassian: name from `docs/naming/page-template.md` S5 (https://atlassian.design/components/page-layout/examples, opened 2026-11-10); the new top-nav pages (`/components/navigation-system/top-nav*`) returned 404
- S18 Fluent source: https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-nav/library/src/index.ts
- S19 Chakra: https://www.chakra-ui.com/docs/components/concepts/overview

Could not open (404 or redirect not followed): Atlassian top-nav pages, React Aria landmarks
(https://react-aria.adobe.com/Landmarks), Polaris `Frame` docs (301 to a page naming no components),
Spectrum header. S20 (Spectrum) therefore has no source.
