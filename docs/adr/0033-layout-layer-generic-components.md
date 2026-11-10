# ADR 0033 — Layout layer: generic, reusable components, not fixed site templates

## Status

Accepted <!-- extends ADR 0001 (atomic design); references ADR 0032 -->

## Context

After the brutalist skin (ADR 0032), the next step toward the l4ir.fr portfolio is a layout
layer. Omnia so far has only atoms and molecules; a portfolio page needs page structure, a
hero, project cards and a call to action.

One option was to add l4ir-shaped pieces to Omnia — a PageShell baking in l4ir's NavBar,
theme toggle and footer, plus Hero, ProjectSection, ContactCTA and ProjectCard carrying
portfolio content. That is fast for one site and dead for every other: a fixed template and
deep-dependency organisms do not travel.

Omnia is meant to be reused across projects. So the layer must be generic, adaptable (slot-
and prop-driven) and shallow in dependency depth, and anything specific to one site must live
in that site's own app.

## Decision

The layout layer is a small set of **generic, adaptable, low-dependency** components.
Consumer-specific page assembly lives in the consuming app — l4ir.fr composes these pieces,
never Omnia — consistent with ADR 0032, which already puts the site's theme-skin coupling in
the consuming app.

Fixed set:

- Layout primitives — **atoms**, pure CSS, zero component dependencies: `Container` (max width
  + responsive gutters), `Grid` (responsive columns), `Stack` (flow spacing).
- Page scaffold — **template**: `AppShell`, slot regions (header / main / footer) with no wired
  content.
- Content blocks — **organisms**, slot/prop-driven, shallow dependencies: `CallToAction` (title
  + pitch + actions), `Masthead` (eyebrow + title + lede + optional media/actions — the generic
  hero).

`MediaCard` (a generic media/title/tags card) is built only if the existing `Card` compound
API does not already cover it; otherwise it stays a `Card` usage, not a new component.

These are working names. Each component still passes an online naming study
(`docs/naming/<name>.md`) with the owner's pick before any code, and the five acceptance gates
before merge — the existing rules are unchanged. Introduced tiers: **templates** (`AppShell`)
and **organisms** (`CallToAction`, `Masthead`); the primitives land as atoms.

Explicitly out of Omnia: a fixed `PageShell`, and `Hero` / `ProjectSection` / `ContactCTA` /
`ProjectCard` — those are l4ir-app compositions. `StackStrip` is deferred until a `List` of
`Badge` proves insufficient.

## Consequences

- The catalogue grows by the fixed set; the a11y, contrast and visual gates cover each new
  component across all six theme-skin modes.
- l4ir.fr becomes its own app that composes Omnia atoms, molecules and this layer, and owns the
  theme-skin toggle coupling (ADR 0032).
- A component added later must justify its dependency depth against this ADR; a deep or
  site-specific composition does not belong in Omnia.
- Reversible: dropping or renaming a block touches only Omnia and its consumers, never the token
  or theming contracts.
