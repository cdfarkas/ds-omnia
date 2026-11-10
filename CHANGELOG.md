# @cdfarkas/omnia

## 0.2.1

### Patch Changes

- 15e2215: Declare `color-scheme` per theme (`light` on `:root`, `dark` on `:root[data-theme='dark']`) so
  scrollbars, native form controls and autofill follow the active Omnia theme instead of the OS.

## 0.2.0

### Minor Changes

- 1744218: Package Omnia as an ESM library: `dist/index.js` with TypeScript declarations, a single
  `@cdfarkas/omnia/styles.css` stylesheet (layer order, reset, tokens, skins and component styles), and
  `react` / `react-dom` ^19 as peer dependencies.
