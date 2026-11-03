# ADR 0021 — Code coverage measured in the test gate, regression-gated by Codecov

## Status

Accepted

## Context

The test pyramid (ADR 0005) runs every test through `@storybook/addon-vitest` in Vitest browser
mode on Playwright's Chromium. There was no coverage number and nothing stopping a change from
shipping untested code. We want a coverage signal and a gate that new code is tested and that the
total does not quietly erode — without adding a second test toolchain or a local run whose result
depends on the developer's machine.

Two provider questions had to be settled first.

- **Which provider works in browser mode.** Historically the `v8` provider was Node-only and browser
  mode needed `istanbul`. Vitest 4's own coverage docs (v4.1.12, the exact version this repo pins)
  state the `v8` provider collects coverage "by instructing V8 using `node:inspector` and Chrome
  DevTools Protocol in browsers" and works on any Chromium-based browser. Since Vitest 3.2.0 the
  `v8` provider uses AST-aware remapping, which the docs say produces reports identical to
  `istanbul`. Chromium under Playwright is exactly that runtime, so `v8` is supported here and no
  longer trades accuracy for speed.

- **Where the number is authoritative.** Local runs happen on Windows; CI runs on Linux. A gate that
  compares a Windows-measured number against a Linux baseline would be noise. The gate must be
  computed from a single environment.

## Decision

Coverage is measured by the existing browser-mode test gate, with the **`v8` provider**
(`@vitest/coverage-v8`, pinned to the Vitest major at `4.1.12`). It is configured once at the root
of `vitest.config.ts` so it aggregates across both test projects. Scope is `src/**/*.{ts,tsx}`,
excluding stories, tests, MDX, `index.ts` barrels, the library bundle entry, `*.check.ts` build
scripts and type declarations — the code a consumer runs, not the harness around it. Reporters are
`text-summary` (console), `json-summary` (machine-readable total) and `lcov` (for Codecov). It is
exposed as `pnpm coverage`.

The regression gate is **Codecov**, computed on Linux CI only. The CI test job runs `pnpm coverage`
and uploads `coverage/lcov.info`; `codecov.yml` defines two blocking statuses:

- `project` → `target: auto` with a `1%` threshold: the total ratio may not drop against the base,
  and the small threshold keeps measurement noise from failing a PR.
- `patch` → `target: 80%`: the lines a PR adds or changes must be 80% covered.

Upload authenticates via **OIDC** (`use_oidc: true`, with `id-token: write` on the job), so no
token secret is stored. The Codecov org is tokenless, but uploads targeting a protected branch
(the PR base) still require auth, which OIDC provides. A coverage badge is in `README.md`.

## Consequences

- New code must come with its tests (the `patch` status), and the total cannot silently erode (the
  `project` status). Both are real, blocking PR checks — unlike the non-blocking Chromatic visual
  check.
- The number is deterministic: it is always the Linux CI measurement, never a local Windows run.
  `pnpm coverage` stays available locally for authoring, but its exact percentage is not the gate.
- **A global ratchet alone is gameable** and it penalises deleting covered code (removing a tested
  file drops the ratio). That is why `patch` is the real guard: it judges only the diff, so it is not
  distorted by deletions and cannot be gamed by padding unrelated files. `project: auto` is the
  backstop, not the primary signal.
- In a design system, "coverage" largely reflects **which component variants the stories render**,
  not how rigorously logic is asserted. A high number here means the catalogue exercises the
  components broadly; it is not a proof of correctness. Read it as a breadth signal.
- Codecov is a third-party dependency in the PR path. The upload step is `fail_ci_if_error: false`,
  so an upload hiccup does not red the test job — the Codecov project/patch status checks remain the
  real coverage gate.
