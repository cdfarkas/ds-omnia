# ADR 0034 — Compound subcomponents live in per-child subfolders

## Status

Accepted <!-- extends ADR 0024 (component naming); applies to ADR 0033 layout components -->

## Context

Omnia's co-location rule (`docs/ARCHITECTURE.md`) puts a whole component in one folder with a
single `<Name>.tsx` and a single `<Name>.module.css`. For a compound component — a root plus
several sub-parts — that packs the root and every child into one file and one stylesheet, as
`Card` does and as `AppShell` did when first built.

As a compound grows parts, each with its own markup, styles and edge cases, the single file stops
scaling: a reader cannot open one part on its own, every part's rules share one stylesheet, and the
part's tests sit far from the part. The owner decided compounds should be organised by part.

## Decision

A compound component places **each subcomponent in its own subfolder** under the parent, co-locating
everything that part owns:

- `<Name>/<Part>/<Part>.tsx` — the child component.
- `<Name>/<Part>/<Part>.module.css` — only that child's style rules.
- `<Name>/<Part>/<Part>.test.tsx` — that child's unit tests.
- `<Name>/<Part>/index.ts` — the child's surface, imported by the root.

The parent folder keeps what belongs to the whole compound:

- `<Name>.tsx` — the root, which still assembles the children via `Object.assign` (ADR 0024).
- `<Name>.module.css` — only the shared frame (e.g. the grid template), not per-child rules.
- `<Name>.overrides.css` and `index.ts` — the unchanged public surface.
- `<Name>.mdx` and `<Name>.stories.tsx` — one set of docs and stories for the whole compound.
- `<Name>.test.tsx` — composition tests over the assembled parts.
- Shared plumbing — a context, shared prop types, a class-join helper — in a small `internal.ts`.

The public API does not change: `AppShell`, `AppShell.Header`, … are exported exactly as before.

## Consequences

- `AppShell` adopts this layout now — the first compound to do so.
- Named CSS grid areas keep working across files: the root owns `grid-template-areas`, each child
  sets its own `grid-area`, and the area names are not module-scoped.
- `Card` predates the rule and will be refactored to match in a separate PR; until then it is the
  single-file exception.

## Decision record

Human decision by the owner (cdfarkas) on 2026-11-12.
