# ADR 0023 — Generated agent component manifest + CI staleness gate

## Status

Accepted

## Context

An agent working on Omnia needs the components' current API — props, defaults, variant axes, story
ids — to work cheaply, without reading every component's source and its co-located `.mdx` prose.

A hand-written index would be redundant with that prose and would rot: nothing forces it to track a
component whose props change. The useful shape is the opposite — an index derived from the source,
and a check that fails when it drifts.

Storybook's `build-storybook` output (`storybook-static/index.json`) lists stories but not component
props; extracting props from it would still mean standing up react-docgen behind a browser build.
TypeScript itself is already a dependency, and each atom follows one convention: an exported
`<Name>Props` interface and a `<Name>` function with destructuring defaults. That is enough to read
the public API straight from the TypeScript AST.

## Decision

We ship a generated machine manifest, a thin agent entry doc, and a CI staleness gate.

- `scripts/generate-component-manifest.mjs` (run via `pnpm docs:manifest`) reads each component
  exported from `src/index.ts` through the TypeScript compiler API and Storybook's own CSF id
  helpers, and writes `docs/components.json` (the machine index) plus `docs/components.md` (a
  human-readable mirror). Only each interface's own declared props are recorded — inherited native
  HTML attributes are left out — with name, type, default, required flag, enumerable options, and
  the authored JSDoc as the a11y/contract note. Output key order is stable so a diff is meaningful.
- `docs/for-agents.md` orients an agent to the manifest, `CLAUDE.md`, the ADRs and the conventions,
  and points to nothing it duplicates.
- A PR-only `manifest` job in CI runs `pnpm docs:manifest` and then
  `git diff --exit-code -- docs/components.json docs/components.md`, failing the PR when a component
  changed without the manifest being regenerated. It reuses the composite setup action and needs no
  Storybook build.

The manifest is generated because a hand-written one rots; the guard is CI-only — not a pre-commit
hook — because the gate belongs where it blocks the merge, not in every local commit.

## Consequences

Agents and tools get a cheap, always-current API index that cannot silently fall behind the code.

Every PR that changes a component's props, variants, stories or its export in `src/index.ts` now
carries a regenerate step (`pnpm docs:manifest`), and the manifest shows in the diff. This is the
accepted cost of "always up to date". The gate should be added to branch protection as a required
check so a PR cannot merge around it.

The generator relies on the one-interface-per-component convention (`<Name>Props` + a `<Name>`
function). A component that breaks that shape would extract empty or partial — the generator test
(`scripts/generate-component-manifest.test.ts`) asserts every component resolves to a non-empty,
well-formed entry and that re-running is deterministic, so such a regression fails `pnpm test`.
