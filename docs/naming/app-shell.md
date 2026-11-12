# Naming study — page scaffold / app shell

Date: 2026-11-10. Method: official docs fetched during this study. "Not confirmed" means the page
did not load or did not mention it, not that the system lacks it.

## Question

Omnia needs a generic, slot-based page scaffold (template tier, ADR 0033): opt-in regions for a
header, a primary nav, the main content, a complementary aside, and a footer, each rendering the
matching landmark element. What should the container and its regions be called, and should the API
be compound (`Shell.Header`) or prop-driven (`header={…}`)?

## Survey

| System          | Container    | Region names (verbatim)                                                  | API style            | Src |
| --------------- | ------------ | ------------------------------------------------------------------------ | -------------------- | --- |
| Mantine         | `AppShell`   | `AppShell.Header` `AppShell.Navbar` `AppShell.Main` `AppShell.Aside` `AppShell.Footer` (+ `AppShell.Section`) | compound + root props | S1  |
| Ant Design      | `Layout`     | `Header` `Sider` `Content` `Footer` (right panel = second `Sider`)       | compound (nested)    | S2  |
| PatternFly      | `Page`       | `masthead` / `PageHeader`, `PageSidebar` + `PageSidebarBody`, `PageSection`, `PageFooter` | hybrid: slot props + `Page*` parts | S3  |
| GitHub Primer   | `PageLayout` | `PageLayout.Header` `PageLayout.Content` `PageLayout.Pane` `PageLayout.Footer` `PageLayout.Sidebar` | compound + props      | S4  |
| Atlassian       | `PageLayout` | `Banner` `TopNavigation` `LeftPanel` `Content` `LeftSidebar` `Main` `RightSidebar` `RightPanel` | separate named slots  | S5  |
| Oxygen UI (WSO2)| `Layout` (?) | not confirmed                                                            | not confirmed        | S6  |
| Chakra UI       | not confirmed| not confirmed                                                           | not confirmed        | S7  |

Notes on cells:

- **Mantine** is the closest match to what Omnia needs: the container is `AppShell`, and its regions
  are `AppShell.Header` (`<header>`), `AppShell.Navbar` (`<nav>`), `AppShell.Main` (`<main>`),
  `AppShell.Aside` (`<aside>`) and `AppShell.Footer` (`<footer>`) — the exact semantic mapping and
  the exact five region names. Mantine also requires a matching root prop (`header={{ height }}`,
  `navbar={{ width, breakpoint }}`) to activate most regions; only `AppShell.Main` needs no prop.
- **Ant Design** names the content region `Content` and the side region `Sider` (a right panel is a
  second `Sider`); it has no `Aside` or `Navbar`. Slots are opt-in by rendering the child; the only
  container prop is `hasSider` (an SSR hint).
- **PatternFly** passes the header, sidebar and footer as `Page` props (`masthead`, `sidebar`,
  `footer`) whose values are `Page*` sub-components; the main content is `PageSection` children. Its
  masthead internals (`MastheadMain`, `MastheadLogo`, `MastheadContent`) are a separate study for
  Omnia's own Masthead organism.
- **Primer** names the content region `Content` (not `Main`), and splits the side region into `Pane`
  (beside the content only) and `Sidebar` (full height). A sibling `SplitPageLayout` exists.
- **Atlassian** `@atlaskit/page-layout` is **deprecated** in favour of a new navigation system; it
  uses separate named slot imports (`TopNavigation`, `Main`, `LeftSidebar`, `RightSidebar`, …) rather
  than dot-notation, and ships a `useCustomSkipLink` hook.
- **Oxygen UI**: the Storybook host did not resolve (DNS), and the GitHub READMEs confirm only a
  `Layout` export with no documented region names. An `AppShell` component could not be confirmed.
- **Chakra UI**: the overview URL returned 404; no page evidence was gathered, so it is left blank
  rather than guessed.

## Patterns observed

- **Container name.** Of the systems confirmed, the names are `AppShell` (Mantine), `Layout` (Ant,
  Oxygen), `Page` (PatternFly) and `PageLayout` (Primer, Atlassian). `AppShell` is the most specific
  and least collision-prone: `Layout` is a generic word (and risks colliding with a consumer's own
  layout), and `Page` / `PageLayout` read as a single document page rather than an application frame.
- **Region names.** `Header`, `Main` and `Footer` are near-universal. The two that vary are the
  primary nav (`Navbar` in Mantine, `Sider` in Ant, `Sidebar`/`Pane` in Primer, `TopNavigation` in
  Atlassian) and the complementary side region (`Aside` in Mantine, `RightSidebar` in Atlassian,
  `Pane` in Primer). Only Mantine uses the semantic pair `Navbar` → `<nav>` and `Aside` → `<aside>`,
  which maps one-to-one onto the HTML landmark elements Omnia wants.
- **API style.** Compound (dot-notation) regions dominate (Mantine, Ant, Primer); PatternFly is a
  hybrid; Atlassian uses separate named imports. Every system makes regions opt-in — a region exists
  only when its child (or its prop) is supplied.

## Prop / sub-component names vs the prop naming rule (ADR 0015)

The chosen surface adds **no custom props** — every region passes native HTML attributes straight
through to its element, and no component declares a variant axis. The sub-component (region) names
are `Header`, `Navbar`, `Main`, `Aside`, `Footer`. None of these is a native HTML attribute name on
any element, so they pass ADR 0015 as-is; `native-prop-names.check.ts` sees no collisions because
there are no renamed-with-custom-type props to flag.

## Options for Omnia

**A. `AppShell` with compound regions `AppShell.Header / .Navbar / .Main / .Aside / .Footer`.**

- Pro: matches Mantine one-to-one — the one surveyed system whose region names map directly onto the
  `<header> <nav> <main> <aside> <footer>` landmarks Omnia renders.
- Pro: `AppShell` is the most specific container name and least likely to collide with a consumer's
  own `Layout` / `Page`.
- Pro: a pure compound API matches the existing Omnia compound (`Card.Header/.Body/.Footer`); regions
  are opt-in by rendering them, with no parallel config-prop surface to keep in sync.
- Con: `Navbar` and `Aside` are Mantine-specific names; a user from Ant or Primer will look for
  `Sider` / `Content` / `Pane`.

**B. `Layout` with `Header / Sider / Content / Footer` (Ant-style).**

- Con: `Layout` is a generic, collision-prone name; `Sider` / `Content` do not map to the `<nav>` /
  `<main>` landmarks as cleanly as `Navbar` / `Main`.

**C. `PageLayout` with `Header / Content / Pane / Sidebar / Footer` (Primer-style).**

- Con: `Page` framing reads as a document page; `Content` vs `Main`, and the `Pane` / `Sidebar`
  split, add surface Omnia's generic shell does not need.

## Recommendation

Opinion, built on the facts above: take option A. `AppShell` is specific and non-colliding, and its
five region names are the only surveyed set that maps one-to-one onto the HTML landmark elements the
scaffold renders. A pure compound API (no parallel config props) keeps the surface minimal and
consistent with `Card`.

Devil's advocate: `Navbar` and `Aside` carry Mantine's vocabulary, so users from Ant or Primer may
reach for `Sider` / `Content` / `Pane` first. That is a discoverability cost, not a correctness one —
the landmark mapping is the stronger signal, and the compound API makes the available regions visible
on the `AppShell` namespace.

## Decision

Option A, chosen by the owner for Omnia: container `AppShell` (template tier), with compound regions
`AppShell.Header` (`<header>`), `AppShell.Navbar` (`<nav>`), `AppShell.Main` (`<main>`),
`AppShell.Aside` (`<aside>`) and `AppShell.Footer` (`<footer>`). Regions are opt-in; only `Main` is
expected in every shell, and a skip link to `Main` is rendered first. No custom props are added, so
ADR 0015 is satisfied with no renames.

## Sources

All opened 2026-11-10.

- S1 Mantine: https://mantine.dev/core/app-shell/
- S2 Ant Design: https://ant.design/components/layout
- S3 PatternFly: https://www.patternfly.org/components/page/
- S4 GitHub Primer: https://primer.style/product/components/page-layout/
- S5 Atlassian: https://atlassian.design/components/page-layout/examples
- S6 Oxygen UI (WSO2): https://github.com/wso2/oxygen-ui , https://github.com/wso2/oxygen-ui/blob/main/packages/oxygen-ui/README.md (Storybook host https://oxygen-ui.com did not resolve)
- S7 Chakra UI: https://www.chakra-ui.com/docs/components/concept/overview (404)

Could not confirm: Oxygen UI AppShell (Storybook DNS failure; only a `Layout` export is visible in
the GitHub READMEs), Chakra UI page-shell (overview URL 404). PatternFly and Primer pages were
truncated in fetch; region names above were taken from the verbatim portion.
