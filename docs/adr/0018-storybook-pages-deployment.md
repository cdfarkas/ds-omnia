# ADR 0018 — Storybook on GitHub Pages, and a push-driven release

## Status

Accepted (2026-10-31) — amends the "Release CI" clause of ADR 0011.

## Context

Omnia's Storybook was the catalogue but nothing served it publicly: there was no deploy, so the
only way to see the design system was to build it locally. GitHub Pages hosts a static site for free
from the repo; `pnpm build-storybook` already emits a self-contained `storybook-static/`.

ADR 0011 made `release.yml` `workflow_dispatch`-only with a gate that aborts while
`"private": true`. That gate also blocked the **versioning**: with `private: true` held for the
foreseeable future (ADR 0011 "timing" is still open), the "Version Packages" PR never opens, so the
release process is effectively dead even though versioning is safe while private — `changeset
version` bumps a private package, only `changeset publish` is blocked.

The owner wants a simple release: changesets accumulate into a Version PR, and merging that PR is the
release. npm publish stays off; nothing publishes until `"private": false`.

## Decision

**Storybook → GitHub Pages (`.github/workflows/pages.yml`).** On push to `main` and on manual
dispatch, build Storybook and deploy it with the official Pages actions (`configure-pages`,
`upload-pages-artifact` with `path: storybook-static`, `deploy-pages`), a `pages` concurrency group
and the `github-pages` environment on the deploy job. Pages is enabled once by hand (Settings >
Pages > Source: GitHub Actions); the workflow does not enable it. The site is served at
`https://cdfarkas.github.io/ds-omnia/`. Storybook's static build references its own assets with
relative paths, so no Vite `base` is needed to serve it from that subpath.

**Push-driven versioning (`.github/workflows/release.yml`).** The `private`/`NPM_TOKEN` gate is
removed and the workflow now also triggers on push to `main`. `changesets/action@v2` opens or updates
the Version PR as changesets accumulate; merging it bumps the version and CHANGELOG on `main` — that
merge is the release. `on: release` is deliberately not used: a release created by `GITHUB_TOKEN`
does not retrigger workflows, so an `on: release` deploy would never fire.

**npm publish stays impossible, unchanged.** `publish-script` is still `pnpm release`, but
`"private": true` plus `privatePackages.tag: false` (ADR 0011) make `changeset publish` a no-op, so
no push to main, and no Version-PR merge, can reach npm. `NPM_TOKEN` / `NODE_AUTH_TOKEN` stay wired
but empty. The npm publishing policy of ADR 0011 is unchanged: flipping `"private": false` and adding
a credential is still the explicit, separate step that enables publishing.

## Consequences

- The design system has a public URL that refreshes on every push to `main`, with no manual step
  after the one-time Pages enablement.
- Pending changesets now surface as a Version PR without a manual dispatch; the release is a PR
  merge, no tag and no npm account required.
- Pages deploys build Storybook on every push to `main`, overlapping with `ci.yml`'s own
  `build-storybook`. Accepted: Pages needs the artifact, and the concurrency group collapses bursts.
- The favicon links in `.storybook/main.ts` use absolute `/brand/*` paths; served from the
  `/ds-omnia/` subpath they resolve to the domain root and 404. Cosmetic (favicons only); the
  catalogue itself loads. Left for a follow-up.
