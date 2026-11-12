# ADR 0035 — Template-tier components carry a `Template` suffix

## Status

Accepted <!-- extends ADR 0024 (component naming); supersedes the app-shell naming study -->

## Context

ADR 0024 fixed the component naming convention — singular PascalCase roots, dot-notation parts — but
it was written when only atoms and molecules existed. ADR 0033 then introduced the template tier:
page-level layout components that carry no real content, the first being the page scaffold shipped as
`AppShell` (ADR 0033, ADR 0034, naming study `docs/naming/page-template.md`).

Two things were left unsettled. First, a template reads like any other component at the call site:
`<AppShell>` gives no signal that this is a whole-page scaffold rather than a widget to drop inside
one. Second, the scaffold's own name, `AppShell`, borrowed Mantine's vocabulary; the owner wanted the
tier, not one vendor's label, to drive the name. `ARCHITECTURE.md` already sketched the tier with a
`DashboardTemplate` example, so the suffix shape was implied but never recorded.

## Decision

**A template-tier component's name ends in `Template`.** The name is `<Base>Template`, where `<Base>`
describes what the template frames — `PageTemplate`, a future `DashboardTemplate`. Atoms, molecules
and organisms keep their plain singular PascalCase names (ADR 0024); only the template tier takes the
suffix. The suffix makes the page-scaffold nature explicit at the consumer call site, where
`<PageTemplate>` reads unmistakably as a whole-page frame.

**The existing scaffold is renamed `AppShell` → `PageTemplate`.** Its base name is `Page`, so the
name is `PageTemplate`, not `AppShellTemplate` — "app shell" and "template" would name the same thing
twice. The rename is a pure rename: no behaviour, layout, CSS or visual output changes. It reaches
every surface the component owns — the folder and parent files (`PageTemplate.*`), the root export
and its compound slots (`PageTemplate.Header` … `.Footer`, unchanged slot names), the prop and region
types (`PageTemplateProps`, `PageTemplateRegionProps`), the `data-scope="page-template"` value, the
`--omnia-page-template-*` override tokens, the `pageTemplate.*` typed i18n keys, the stories title
`Templates/PageTemplate`, and the generated component manifest.

This supersedes the container-name conclusion of the 2026-11-10 app-shell naming study; its survey
and region-name findings stand (`docs/naming/page-template.md`).

## Consequences

- A consumer reading a call site can tell a page scaffold from an in-page component by the name
  alone, and the template tier is self-describing in `src/components/templates/`.
- The `--omnia-page-template-*` override tokens and the `page-template` `data-scope` are a renamed
  public surface. Omnia is unpublished, so no released consumer is affected; the override contract is
  re-pointed in one step rather than aliased.
- ADR 0033 and ADR 0034 refer to the scaffold by its original name, `AppShell`, as the historical
  record of their date; they are not rewritten. This ADR is the pointer from that name to
  `PageTemplate`.
- The suffix is a convention review owns, like the rest of ADR 0024 — no gate enforces it. The
  per-component naming study (`CLAUDE.md`) records each template's name against it before the owner
  picks it.

## Decision record

Human decision by the owner (cdfarkas) on 2026-11-12.
