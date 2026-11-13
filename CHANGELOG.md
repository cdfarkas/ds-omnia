# @cdfarkas/omnia

## 0.3.0

### Minor Changes

- 27db342: Add the `AppHeader` organism: the global app header (`AppHeader.Brand`, `AppHeader.Nav`,
  `AppHeader.Actions`) that goes inside `PageTemplate.Header`. Every part renders a `<div>`, so the
  page keeps one banner landmark; the parts wrap instead of overflowing at 320 CSS px.
- 1f3e2bc: Add the `PageHeader` organism: the title block at the top of a page's content (breadcrumb slot, an
  `h1` title by default, description and actions), built on `SectionHeading` and rendering no landmark.

### Patch Changes

- 22fa00d: AppHeader: stretch the mobile panel links to the full panel width.
- 15e2215: Declare `color-scheme` per theme (`light` on `:root`, `dark` on `:root[data-theme='dark']`) so
  scrollbars, native form controls and autofill follow the active Omnia theme instead of the OS.
- 21196da: `OmniaThemeProvider` sets `lang` on the document root from the active locale, so screen readers
  read French text with French pronunciation (WCAG 3.1.1 Language of Page).
- 71f7470: Fix the 320 CSS px layout: `Stat` figures drop from 3rem to 2rem in a list narrower than 24rem;
  `Checkbox` and `Switch` inputs get a transparent hit area of at least 24×24 CSS px (WCAG 2.5.8)
  around an unchanged visible control; `NavBar` links are at least 24px tall and wrapped rows use a
  12px row gap (`--omnia-navbar-gap-y` default, was 8px).

## 0.2.0

### Minor Changes

- 1744218: Package Omnia as an ESM library: `dist/index.js` with TypeScript declarations, a single
  `@cdfarkas/omnia/styles.css` stylesheet (layer order, reset, tokens, skins and component styles), and
  `react` / `react-dom` ^19 as peer dependencies.
