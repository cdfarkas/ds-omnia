# ADR 0028 — Every story tested in every theme×skin mode

## Status

Accepted — complements ADR 0026, amends the test contract of ADR 0005.

## Context

ADR 0026 and `CLAUDE.md` say the a11y gate runs "across every theme and skin". It did not. The
single `storybook` Vitest project ran each story once, in its own globals: light/neutral unless the
story set `globals`. Other modes were reached only through hand-written mode-copy stories
(`DarkNeutral`, `PixelLight`, `PixelDark`: 54 stories over 18 components), one per component's
showcase story.

Two bugs slipped through that gap: the `Overridden` demos of Link and NavBar used
`--omnia-color-accent-active` as text colour, which is 1.64:1 on dark/neutral and 1.25:1 on
dark/pixel against a 4.5:1 floor. Neither demo had a dark copy, so axe never saw it dark.

`@storybook/addon-vitest` 10.6.5 documents a per-project option for this:
`storybookTest({ initialGlobals })`, "define one Vitest project per theme". The value becomes the
story's initial globals; a story's own `globals` are applied on top of it.

Alternatives considered:

- **A `*.test.tsx` that globs every story, composes it and re-renders it per mode.** It would
  duplicate the a11y addon's axe run, the incomplete-result handling in `.storybook/vitest.setup.ts`
  and every per-story `a11y` parameter, and drift from them.
- **Hand-written mode-copy stories for every story.** Does not scale (×3 stories), and forgetting one
  is exactly how the two bugs got through.
- **Storybook test tags.** Tags filter which stories run; they cannot change a story's globals.

## Decision

`vitest.config.ts` defines **four Storybook Vitest projects**, one per theme×skin mode, generated
from one modes array: `storybook:light-neutral`, `storybook:dark-neutral`, `storybook:light-pixel`,
`storybook:dark-pixel`. Each passes `storybookTest({ configDir, initialGlobals: { theme, skin } })`
and pins both axes, because the preview's default theme follows `prefers-color-scheme`.

Every story test — render, `play`, axe and the incomplete check — therefore runs in all four modes.
The rest of ADR 0005 (one runner, two layers) and ADR 0026 (WCAG 2.2 AA, `a11y.test: 'error'`,
incomplete fails) stands unchanged.

Evidence, `pnpm test` on Windows local, warm run:

| | Files | Tests | Duration | Wall |
| --- | --- | --- | --- | --- |
| Before (one `storybook` project) | 44 | 357 (159 story) | 12.5 s | 15.7 s |
| After (four mode projects) | 101 | 834 (636 story) | 29.1 s | 36.7 s |

The four projects found **4 new failures, all `color-contrast`, in 2 stories**: Link and NavBar
`Overridden` in `storybook:dark-neutral` (1.64:1) and `storybook:dark-pixel` (1.25:1) — the two bugs
above. No other story fails in any mode. Both were fixed (PRs #64 and #65) before this ADR was
accepted; all 636 story tests pass.

## Consequences

- Story tests grow ~4× (159 → 636) and `pnpm test` takes ~2.3× as long; still well under a minute.
- A `play` function must pass in every mode, not only light/neutral.
- A failure names its mode in the project label (`|storybook:dark-pixel (chromium)|`), and one mode
  runs alone with `pnpm vitest run --project storybook:dark-pixel`.
- The mode-copy stories set `globals` that override the project's, so they only re-test modes the
  four projects already cover. They are redundant for the gate but are kept as visible catalogue
  examples (owner decision, 2026-11-05).
- `Foundations/Theme provider > Stateful` is `selfThemed` and uncontrolled, so it renders the same
  in all four projects; the provider's theme switching is covered by
  `src/lib/OmniaThemeProvider.test.tsx`, not by these projects.
- Adding a theme or skin means adding one entry to the modes array in `vitest.config.ts` (and to
  `scripts/visual-check.mjs`).
