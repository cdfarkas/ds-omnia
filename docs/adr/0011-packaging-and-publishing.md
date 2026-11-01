# ADR 0011 — Packaging and publishing

## Status

Proposed — the "Release CI" clause is amended by ADR 0018 (release.yml now runs on push to main so
the Version PR opens while private; npm publish stays gated by `"private": true`).

## Context

Omnia has so far only existed inside Storybook: there was no build, no `exports` map, and `react` /
`react-dom` sat in `dependencies`, so a consumer could not install it as a package. The package name
`@cdfarkas/omnia` is reserved in `package.json`, which stays `"private": true`.

Facts that shape the choice:

- The toolchain already ships **Vite 8** (Rolldown-based) and **TypeScript 6**. Storybook's
  `react-vite` builder auto-loads a root `vite.config.ts`, so a library config must use another name.
- Styling is CSS Modules inside native cascade layers (ADR 0002). The layer order is declared once in
  `src/styles/layers.css` and must reach the browser before any layer body. Hashed module class names
  are private; `data-*` and `--omnia-*` are the public override contract (ADR 0010).
- Button's loading label goes through `t()`, which reads a module-level locale, so a consumer needs
  `setLocale` to localise it. `Localized` / `ThemeSync` (`src/lib/Localized.tsx`,
  `src/lib/DocsTheme.tsx`) read Storybook preview globals: they are docs helpers, not public API.
- Fonts (Fraunces, Space Grotesk) are loaded by `.storybook/preview.tsx` from `@fontsource-variable/*`
  dev dependencies. The pixel skin's `ds-pixel` face resolves `local()` fonts only.
- TypeScript 6 turns `noUncheckedSideEffectImports` on by default: a `.d.ts` that keeps an
  `import './x.css'` fails to typecheck in a consumer without `skipLibCheck` (verified: TS2882).

Alternatives considered:

- **tsup / tsdown / plain Rollup as a second bundler.** Rejected: Vite 8 library mode already builds
  CSS Modules, the React transform and the externals with the config the repo uses everywhere else.
  A second bundler is a second config to keep in sync for no output we lack.
- **`vite-plugin-dts`** for declarations. Rejected in favour of the already-installed `tsc` with a
  `tsconfig.lib.json` (`emitDeclarationOnly`): it emits only files reachable from the public entry,
  which is all we need. The 5.x plugin pulls API Extractor and Volar to offer declaration rollup,
  which one flat entry does not need.
- **`preserveModules` (one output file per source file).** Not needed with one component: a single
  bundle is 1.9 kB and tree-shakes fine. Revisit when the component set grows and per-component
  imports start to matter.
- **Dual ESM + CJS output.** Rejected — see Decision.

## Decision

We publish Omnia as an **ESM-only library built by Vite 8 library mode, with declarations emitted by
`tsc`**, versioned with **Changesets** and released by a **manual, gated GitHub workflow**.

**Build.** `pnpm build` runs `vite build -c vite.lib.config.ts && tsc -p tsconfig.lib.json`.

- The Vite entry is `src/bundle.ts`: it imports the global stylesheets first, in cascade order
  (`layers.css`, `reset.css`, `tokens.css`, `skins.css`), then re-exports `src/index.ts`.
- `src/index.ts` is the public API and the declaration root. It holds no CSS imports, so
  `dist/index.d.ts` carries none (the TS2882 trap above).
- `react`, `react-dom` and every `react/*` / `react-dom/*` subpath (including `react/jsx-runtime`) are
  externalised. `publicDir` is off, so no static asset lands in `dist/`.
- CSS minification is off (`build.cssMinify: false`): Vite 8's default minifier (Lightning CSS) folds
  the leading `@layer reset, tokens, base, components, utilities, overrides;` statement into the
  layer blocks. The result is equivalent inside one file, but the documented single order statement
  is the contract of ADR 0002, and the consumer's bundler minifies anyway.

**Exports.** One ESM root entry and one stylesheet subpath:

```json
".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
"./styles.css": "./dist/styles.css",
"./package.json": "./package.json"
```

The public surface is `Button` (+ `ButtonProps`, `ButtonIntent`, `ButtonSize`), `Badge` (+
`BadgeProps`, `BadgeIntent`), `Input` (+ `InputProps`, `InputSize`, `InputType`), `Checkbox` (+ `CheckboxProps`, `CheckboxSize`), `Switch` (+ `SwitchProps`, `SwitchSize`), `locales`, `setLocale`, `getLocale` and the `Locale` type. `t`,
`TranslationKey` and the Storybook docs helpers stay internal. ESM-only is a choice, not a
constraint we hit: every React 19 toolchain (Vite, Next, Remix, modern webpack, Node 22's
`require(esm)`) consumes ESM, and a CJS build would double the output and the test surface for
consumers we do not expect. `"sideEffects": ["*.css"]` lets bundlers tree-shake the JS while keeping
the stylesheet.

**CSS and tokens.** `dist/styles.css` is one file: the layer-order statement, the reset, the tokens,
the skins and every component's module CSS. A consumer imports it once, before any of its own
`@layer overrides` rules (layer order is set by first appearance). The reset ships inside
`@layer reset`, the lowest layer, so any consumer style wins over it; it stays in the bundle because
components rely on it (Button inherits its font and cursor from the `button` reset rules). Hashed
module class names remain private (ADR 0010). Fonts are **not** bundled: a consumer who wants the
maximalist base typography installs and imports `@fontsource-variable/fraunces` and
`@fontsource-variable/space-grotesk` itself; without them, the `--font-*` stacks fall back to system
fonts (Georgia, `system-ui`).

**Peer dependencies.** `react` and `react-dom` are peers at `^19.0.0`, never bundled. The repo keeps
its exact `19.3.1` pins as dev dependencies for Storybook and tests.

**Versioning.** Changesets (`@changesets/cli` 3.x). `.changeset/config.json` sets `access: public`,
`baseBranch: main`, `commit: false` and `privatePackages: { version: true, tag: false }`, so
`changeset version` still bumps the private package while `changeset publish` skips it: while
`"private": true` holds, nothing can publish, even by hand. That is the double safety. The scripts are
`changeset`, `version-packages` and `release` (`pnpm build && changeset publish`). The version script
is named `version-packages`, not `version`: `version` is an npm lifecycle hook that `npm version`
would run as a side effect.

**Release CI.** `.github/workflows/release.yml` runs on `workflow_dispatch` only — nothing fires on a
push. A gate step reads `package.json` and checks that the `NPM_TOKEN` secret is non-empty (passed via
`env`, never echoed); every later step runs only when `private` is false **and** the token is set,
otherwise the run ends green with a `::notice::`. Past the gate, `changesets/action@v2` opens or
updates a "Version Packages" PR while changesets are pending; once that PR is merged, the next manual
run publishes. `ci.yml` runs `pnpm build` after lint so the library build cannot rot.

## Consequences

- A consumer installs `@cdfarkas/omnia`, imports `@cdfarkas/omnia/styles.css` once and uses `Button`
  with full types. React is never duplicated in their bundle.
- The export map is now a public contract alongside the tokens, `--omnia-*` variables and `data-*`
  attributes: removing an export or renaming the stylesheet path is a breaking change.
- Shipping the reset in the library stylesheet means Omnia resets the consumer's page. This is
  acceptable because of `@layer reset`, but a consumer with its own reset now has two.
- Fonts are the consumer's job and must be documented in the consumer-facing install guide when it
  exists. The pixel skin still depends on `local()` fonts only.
- Long-lived npm tokens are the weak point of this design. npm now favours **trusted publishing
  (OIDC)** from GitHub Actions over stored tokens, and granular write tokens expire. Switching the
  workflow to trusted publishing (`id-token: write`, no `NPM_TOKEN`) is a follow-up worth doing at the
  first release; the gate would then check only `private`.
- What flips at release time: set `"private": false`, add the `NPM_TOKEN` secret (or configure
  trusted publishing), then run the Release workflow. The MIT `LICENSE` file and `license` field are
  already in place.

## Publish prerequisites

**(a) LICENSE — decided: MIT.** A public npm publish needs a `LICENSE` file and a `license` field;
both are in place (`LICENSE`, `"license": "MIT"`). The options weighed were:

- **MIT** — shortest, best understood, maximal reuse; no patent grant.
- **Apache-2.0** — explicit patent grant and patent-retaliation clause; heavier obligations
  (a `NOTICE` file to carry, changes to state) for little gain on a CSS-and-React library.
- **Proprietary / `UNLICENSED`** — keeps all rights, but defeats the point of a public portfolio
  package: nobody can legally use what they can install.

Chosen: **MIT**, the norm for portfolio and open design systems (owner's decision).

**(b) Timing — still open, blocks the first publish.** Publish now (one component, `0.x`) or after Phase 2 lands a real component set.

- For publishing now: it claims the name, and it exercises the whole pipeline (build, version PR,
  publish, install) while it is small and cheap to fix.
- Against: a one-component package invites nobody, and every published version fixes names —
  `--omnia-*` variables, `data-*` values, the export surface — that Phase 2 may still want to move.
  `0.x` semver softens this (minor bumps may break), but published versions stay public.

Recommendation: land this infrastructure now, keep `"private": true`, and cut the first real version
once Phase 2 has a component set worth installing.

## Evidence

`pnpm pack` on this branch (local tarball, no registry access), `cdfarkas-omnia-0.1.0.tgz`,
6,867 bytes packed, 21,463 bytes unpacked:

```
package/dist/styles.css
package/dist/index.js
package/package.json
package/README.md
package/dist/components/atoms/Button/Button.d.ts
package/dist/translations/en.d.ts
package/dist/translations/fr.d.ts
package/dist/lib/i18n.d.ts
package/dist/components/atoms/Button/index.d.ts
package/dist/index.d.ts
```

No `src/`, story, test, MDX or `Button.overrides.css` file is in the tarball. `dist/index.js` imports
`react/jsx-runtime` and bundles no React source. A scratch consumer with `skipLibCheck: false`
typechecks against `dist/index.d.ts` with zero errors.
