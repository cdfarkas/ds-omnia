# ADR 0007 — Bilingual via typed strings + `t()`, and locale-switched MDX prose

## Status

Proposed — supersedes the original "stacked FR+EN MDX prose" decision recorded in this ADR.

Extended by ADR 0027 (i18n export contract).

## Context

The system must be bilingual FR/EN for component labels and ARIA strings, and for authored docs
prose. Nothing is published and there is no backend, so a full i18n framework (i18next and its
runtime, plugins and config) would be ceremony disproportionate to the need.

But the choice should not paint us into a corner if real i18n is needed later.

The first iteration authored each `.mdx` as two stacked blocks — a full English section followed by
a full French section — so the reader always saw both languages at once and the two blocks drifted
out of sync. A `locale` toolbar global already exists and already drives component labels through
`t()`; docs prose should obey it too, showing one language at a time.

## Decision

Use a tiny **`t(key)` indirection** over a **typed `Record<Locale, …>`**, driven by a `locale`
toolbar global. **No i18n library.** Component labels and ARIA strings go through `t()`.

Authored MDX prose is written **once per component** and wrapped in a `<Localized fr={…} en={…}/>`
component (`src/lib/Localized.tsx`), which renders only the active locale's node and switches live
with the `locale` toolbar global. No more stacked FR+EN blocks.

`<Localized>` reads the live locale through the Docs channel, not through `useGlobals`: preview hooks
are unavailable in page-level MDX, so the helper consumes the `DocsContext` React context (provided
by Storybook's `DocsContainer` around every docs page), seeds the initial locale from the story
context, and subscribes to the `GLOBALS_UPDATED` channel event to re-render on toolbar changes.

Autodocs auto-generated blocks (JSDoc descriptions, arg tables) stay single-language, as authored —
they are **not** switched by the `locale` global. This is a deliberate, accepted limit.

## Consequences

- Minimal code, typed keys, full FR/EN coverage of interactive strings without a framework.
- Docs prose shows one language at a time and cannot drift between stacked copies: there is one
  copy per language, side by side in the same `<Localized>` call.
- **Two-way door**: because call sites use `t()`, swapping the map for i18next later is
  `i18next.init({ resources })` with the same string objects — call sites stay unchanged.
- Auto-generated doc blocks remain single-language regardless of the toolbar locale; this is the one
  accepted gap in the "one language at a time" promise.
