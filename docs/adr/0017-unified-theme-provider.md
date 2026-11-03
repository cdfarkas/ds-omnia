# ADR 0017 — Unified theming via OmniaThemeProvider (addon-themes removed)

## Status

Superseded by ADR 0025 <!-- supersedes ADR 0004 -->

ADR 0025 makes the provider stateful (controlled + uncontrolled); the controlled-only decision below
no longer holds. The document-root single-source-of-truth contract is unchanged and still in force.

## Context

ADR 0004 set up theming with two mechanisms on the preview root: `@storybook/addon-themes`
(`withThemeByDataAttribute`) for the `theme` axis and a bespoke `globalTypes` decorator for the
`skin` axis. That wiring lived only in `.storybook/preview.tsx`, and `src/lib/DocsTheme.tsx`
re-applied the same attributes by hand for story-less MDX pages.

Two gaps followed. The published package exported no provider, so a consumer of `@cdfarkas/omnia`
had to set `data-theme`/`data-skin` by hand to theme their app. And the `theme` axis depended on a
Storybook-only addon, so the catalogue and a real consumer themed through different code.

## Decision

A single exported component, **`OmniaThemeProvider`**, is Omnia's only theming mechanism.

- It takes `theme` (`'light' | 'dark'`) and `skin` (`'default' | 'pixel'`) and sets `data-theme` and
  `data-skin` on the **document root**, where the semantic token layer resolves.
- It exposes the active pair through a `useTheme()` hook.
- Storybook drives it from one decorator that reads the `theme` and `skin` toolbar globals; the
  `theme` global defaults to the viewer's `prefers-color-scheme`. `DocsTheme.tsx` renders the same
  provider from those globals for story-less MDX.
- `@storybook/addon-themes` is removed from the config and the dependencies; the `theme` axis is now
  a plain `globalTypes` global, a mirror of the existing `skin` global.

The provider writes to the document root, not a scoped wrapper. The token contract keys every
theme/skin rule off `:root[data-theme]` / `:root[data-skin]`, and the `body` surface colour reads
from the root, so a wrapper-scoped subtree would resolve nothing without de-rooting those selectors.
One active theme per document; scoped subtrees would be their own ADR.

## Consequences

- The library, Storybook and the docs pages share one theming mechanism. A consumer wraps their app
  in `<OmniaThemeProvider theme skin>` and reads the active pair with `useTheme()`.
- No `@storybook/addon-themes` dependency to track or upgrade.
- Theming is document-wide; nested, differently-themed subtrees are not supported — a known, accepted
  limit, reversible later via a superseding ADR if a real need appears.
- The four theme×skin combinations stay reachable and testable exactly as before: `chromatic.modes`
  and `scripts/visual-check.mjs` still drive the `theme`/`skin` globals, and
  `src/styles/contrast.test.ts` still sets the root dataset directly.
- Evidence: the five acceptance gates pass on this change — `pnpm lint`, `pnpm typecheck`,
  `pnpm test` (unit + interaction + a11y `error` across the four modes), `pnpm build-storybook`, and
  `pnpm visual-check` (four modes). Per governance, this PR supersedes ADR 0004.
