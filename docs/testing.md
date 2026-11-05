# Testing

One runner, two layers, one accessibility gate. The goal is a full test pyramid — unit, interaction,
accessibility — without a second test toolchain to maintain.

## Single runner

All tests run through **`@storybook/addon-vitest`** in **browser mode**. Stories *are* the test
subjects: a story renders a component in a real browser, and the same story feeds the catalogue, the
interaction tests, and the a11y checks. There is no separate jsdom unit runner and no separate e2e
runner for component behaviour.

Browser mode runs on Playwright's Chromium via **`@vitest/browser-playwright@4`**, with
`playwright install chromium` providing the browser. The **Vitest major is pinned** (4) because the
browser provider and the Storybook addon track the Vitest major; an accidental bump breaks the
runner. Keep them aligned.

## Two layers

### Layer 1 — stories (`*.stories.tsx`)

A story is the primary artefact. Each story is:

- **catalogue** — the rendered example shown in Storybook,
- **interaction** — a `play` function for the **happy path**, written so it reads as documentation of
  how the component is used (catalogue-worthy, not an exhaustive edge-case dump),
- **a11y** — automatically checked by the a11y addon (see below),
- **visual** — a target for the agent visual-check gate (see `docs/visual-validation.md`).

**Show code must be the integration snippet, not the story's scaffolding.** A single-instance story
is written args-only (or `render: (args) => <Component {...args} />`) so Storybook serialises a clean
`<Component … />` a consumer can paste. A gallery or multi-instance story keeps its `render` for the
visual but sets `parameters.docs.source.code` to one concise, representative snippet (e.g.
`'<Spinner variantSize="lg" />'`) — never the whole wrapper `<div>` with every instance. When a
story wraps the component in a non-exported helper (such as `Input`'s labelled `Field`), the same
`parameters.docs.source.code` overrides the `<Helper … />` output with the real usage.

### Layer 2 — tests next to the story

- **`*.test.tsx` — edge cases on composed stories.** Import the stories with `composeStories` and
  assert the cases that would clutter a `play`: error states, boundary inputs, keyboard edge paths.
  These are **additive** to the `play`, never a re-run of it.
- **`*.test.ts` — pure logic.** Functions with no rendering (formatters, reducers, `t()` lookups)
  are tested directly. No DOM.

### Inheriting globals in composed stories

Composed stories must pick up the project's decorators — theme, skin and locale — or an edge-case
test would render in an unthemed, unskinned, locale-less context and assert the wrong thing. Call
`setProjectAnnotations([preview])` inside a `beforeAll` so every `composeStories` result inherits the
same `theme` / `skin` / `locale` setup the Storybook preview applies.

## Accessibility gate

- **Floor: WCAG 2.2 AA** — one level above the EU legal baseline (EN 301 549 v3.2.1 → WCAG 2.1 AA,
  European Accessibility Act).
- The a11y addon runs with **`a11y.test: 'error'`**: a 2.2 AA violation fails the run, with axe tags
  up to `wcag22aa`.
- An axe **incomplete** ("needs review") result fails the run too: `.storybook/vitest.setup.ts`
  reads the a11y report addon-vitest attaches to each story test and throws, naming the rule, the
  nodes and the theme/skin. Fix the markup or styles so axe can decide; never disable the rule.
- axe does not check **SC 1.4.11 non-text contrast**, so `src/styles/contrast.test.ts` resolves the
  semantic tokens (via `getComputedStyle`) in all four theme×skin modes and asserts boundaries and
  indicators (`border-strong`, `border-default`, `border-focus`, `danger-border`) reach 3:1 on
  `bg-surface`, `text-on-accent` (the Checkbox mark and the Switch thumb when on) reaches 3:1 on `accent` and `accent-hover`,
  and `text-muted` (placeholder) reaches 4.5:1 on `bg-surface`, `bg-subtle` and
  `bg-disabled`. It renders no component, but unlike other `*.test.ts` it reads the DOM's computed
  CSS. A component that draws a boundary or indicator with a new token adds its pair there.
- Enforced across **every theme and every skin — pixel included**. `vitest.config.ts` defines one
  Vitest project per theme×skin mode (`storybook:light-neutral`, `storybook:dark-neutral`,
  `storybook:light-pixel`, `storybook:dark-pixel`) through `storybookTest({ initialGlobals })`, so
  every story — render, `play`, axe and the incomplete check — runs in all four modes; a story's own
  `globals` still override the project's (ADR 0028). A `play` must therefore pass in every mode. Run
  one mode with `pnpm vitest run --project storybook:dark-pixel`. The pixel palette is chosen to
  meet the 4.5:1 contrast ratio so it passes the same gate as the neutral skin; it is not exempt.
- axe computes contrast **from the CSS**, so the result is deterministic across Windows local and
  Linux CI — the gate is not render-flaky.
- Of the WCAG 2.2 additions axe automates only SC 2.5.8 target size (`target-size`); the others
  (2.4.11, 2.5.7, 3.2.6, 3.3.7, 3.3.8) are reviewed by hand when a component could hit them.

## Agent visual validation

Automated tests prove behaviour and derive contrast from CSS, but they do not prove the
design *looks* right, and axe does not cover WCAG 2.4.7 (focus visible). So a fourth,
**agent-run** gate sits before human review: `pnpm build-storybook` then
`pnpm visual-check` screenshots every state in all four theme×skin modes, and the agent
reads the images and records a per-mode PASS / CONCERNS verdict. It never loosens a WCAG
threshold to pass. See `docs/visual-validation.md`.

## Acceptance

All four gates must be green, the last before the PR is handed to a human:

- `pnpm lint` (ESLint + Prettier + stylelint, including the no-raw-color rule)
- `pnpm test` (unit + interaction + a11y)
- `pnpm build-storybook`
- agent visual validation (`pnpm visual-check` + the agent's per-mode verdict)
