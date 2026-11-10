# ADR 0032 — Brutalist skin and the l4ir site's theme↔skin coupling

## Status

Accepted <!-- extends ADR 0025 (two independent axes) -->

## Context

The `skin` axis had two values: `default` (expressive serif, maximalist) and `pixel`
(retro sprite). A consuming site, l4ir.fr, wants two visual directions chosen by the
light/dark toggle: a neo-brutalist look in light mode (Archivo Black, zero radius, thick
ink borders, hard offset shadows, a lavender/violet palette) and the existing serif look
in dark mode.

Two ways to deliver this were on the table:

- Bake "brutalist in light, serif in dark" into one skin. That couples the two axes inside
  Omnia and breaks the ADR 0025 contract that `theme` and `skin` are independent — every
  skin must be reachable in both themes.
- Keep the axes independent: add a third skin and let the *site* couple its own toggle.

## Decision

Add a third skin, **`brutalist`**, as a peer of `default` and `pixel`. It reassigns only
the semantic token layer (ADR 0003): radius to zero, borders to ink, `--omnia-font-display`
to Archivo Black, and a full light and dark colour palette. It leaves the hard
offset-shadow shape tokens unchanged, since the house aesthetic is already shadow-based
(ADR 0009).

The serif direction needs no new skin: direction **B maps to the existing `default` skin**.

The light/dark coupling lives in the **consuming site, not Omnia**. l4ir couples its own
toggle — light → `brutalist`, dark → `default` — through `OmniaThemeProvider`'s controlled
props, so Omnia's two axes stay orthogonal.

Like every skin, `brutalist` is tested in **both** themes: `light-brutalist` and
`dark-brutalist` join the mode matrix in `vitest.config.ts`, `scripts/visual-check.mjs`
and `src/styles/contrast.test.ts`. Both modes pass the WCAG 2.1 AA contrast gate: text
stays ink-on-light / light-on-ink, and the violet accent carries white text at AA.

## Consequences

- The `theme` × `skin` matrix grows from four modes to six; the a11y and contrast gates
  run across all six.
- A site can pick any theme/skin pair, and the brutalist↔serif-by-theme behaviour is a
  site-level policy, reversible without touching Omnia.
- Archivo Black is a Storybook-only font import, like Press Start 2P; a consumer supplies
  the face itself.
- Evidence: the five acceptance gates pass — `pnpm lint`, `pnpm typecheck`, `pnpm test`
  (unit + interaction + a11y `error` across the six modes), `pnpm build-storybook`, and
  `pnpm visual-check` (six modes, agent-read).
