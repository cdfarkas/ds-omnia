<p align="center">
  <img src="https://raw.githubusercontent.com/cdfarkas/ds-omnia/main/src/assets/brand/logo-readme.svg" alt="Omnia" width="380" />
</p>

<h1 align="center">Omnia</h1>

<p align="center">
  A themeable, bilingual React 19 design system — light &amp; dark, neutral &amp; pixel-art.
</p>

<p align="center">
  <a href="https://codecov.io/gh/cdfarkas/ds-omnia"><img src="https://codecov.io/gh/cdfarkas/ds-omnia/branch/main/graph/badge.svg" alt="Coverage" /></a>
</p>

A portfolio-grade design system built on **Storybook 10** and strict **Atomic Design**. The name is
Latin *omnia* ("all things", the neuter plural of *omnis*) — one token contract spanning the whole gamut: light and dark, neutral and pixel.

## What

- React 19 + TypeScript + Vite components, organised as atoms → molecules → organisms → templates.
- Compound components (e.g. `Card.Header`, `Dialog`), documented in Storybook.
- Two-axis theming: **light/dark** × **neutral/pixel-art**, from one two-tier token file.
- Bilingual FR/EN labels, ARIA and MDX prose.
- A full test pyramid — unit, interaction and accessibility — run from a single Storybook runner.

## Why

A greenfield reference that demonstrates state-of-the-art design-system engineering: an *enforced*
token contract (no raw colours in component CSS), real dark mode and a reskin that proves the tokens
work, accessibility gated at WCAG 2.2 AA, a level above the EU legal floor (2.1 AA), and tests that
live next to the stories they cover.

## Install

```sh
pnpm add @cfarkas/omnia
```

React 19 (`react` and `react-dom`) is a peer dependency. Import the stylesheet once, then wrap the
app in `OmniaThemeProvider`:

```tsx
import '@cfarkas/omnia/styles.css';
import { OmniaThemeProvider, Button } from '@cfarkas/omnia';

export const App = () => (
  <OmniaThemeProvider>
    <Button>Hello</Button>
  </OmniaThemeProvider>
);
```

Fonts are not bundled. Install and import `@fontsource-variable/fraunces` and
`@fontsource-variable/space-grotesk` yourself; without them the stacks fall back to system fonts.

## How to run

```sh
pnpm install            # Node 22, pnpm
pnpm storybook          # run Storybook locally
pnpm test               # unit + interaction + a11y (one runner)
pnpm build-storybook    # static build
pnpm build              # library build (dist/: ESM + types + styles.css)
pnpm lint               # ESLint + Prettier + stylelint (incl. no-raw-color)
```

## Documentation

- [`CLAUDE.md`](https://github.com/cdfarkas/ds-omnia/blob/main/CLAUDE.md) — the contract every contributor and agent reads first.
- [`docs/ARCHITECTURE.md`](https://github.com/cdfarkas/ds-omnia/blob/main/docs/ARCHITECTURE.md) — structure, tokens, theming, tooling.
- [`docs/testing.md`](https://github.com/cdfarkas/ds-omnia/blob/main/docs/testing.md) — the testing contract and a11y gate.
- [`docs/governance.md`](https://github.com/cdfarkas/ds-omnia/blob/main/docs/governance.md) — how decisions change.
- [`docs/adr/`](https://github.com/cdfarkas/ds-omnia/tree/main/docs/adr) — the recorded architecture decisions.
