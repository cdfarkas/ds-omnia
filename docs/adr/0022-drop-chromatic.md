# ADR 0022 — Drop Chromatic; visual regression is the agent visual-check

## Status

Accepted

<!-- Supersedes no standalone ADR: Chromatic was documented in docs/visual-validation.md,
     not its own ADR. Incidental mentions remain in ADR 0008, 0017 and 0021 as historical record. -->

## Context

Visual coverage was carried by two mechanisms. The agent `visual-check` (`scripts/visual-check.mjs`,
ADR context in `docs/visual-validation.md`) screenshots every state in all four theme×skin modes and
is read and judged by the agent as a hard gate before human review. Chromatic was wired alongside it
(`.github/workflows/chromatic.yml`, the `chromatic` + `@chromatic-com/storybook` dev dependencies, and
a `chromatic.modes` parameter on each atom's story meta) as a hosted pixel-diff history.

The two overlapped: both declared the same four modes and both existed to catch visual drift. Chromatic
added weight the project did not need — a free-tier snapshot budget, a second PR comment on every push,
and an addon plus CLI to keep current — while its job was already gated on a `CHROMATIC_PROJECT_TOKEN`
secret that was never set, so it never actually ran. GitHub Pages (ADR 0018) already publishes the
Storybook for humans to eyeball, and accessibility is proven by the axe gate (ADR 0006).

## Decision

We drop Chromatic. Visual regression is the agent `visual-check` per `docs/visual-validation.md`;
hosting for human review is GitHub Pages (ADR 0018); accessibility is the axe a11y gate (ADR 0006).

The workflow, both Chromatic dependencies (and their lockfile and `pnpm-workspace.yaml` entries), the
`@chromatic-com/storybook` addon, and the now-inert `chromatic.modes` story parameters are removed.

## Consequences

- There is no automated pixel-diff baseline on PRs any more. The agent gate catches a regression it is
  shown, but it does not compare against a stored history — the honest trade-off we are accepting.
- The dependency tree, CI surface and PR noise shrink; there is no account, token or snapshot budget to
  manage.
- The owner must also, outside this repo: uninstall the Chromatic GitHub App, delete the
  `CHROMATIC_PROJECT_TOKEN` repository secret, and remove any required status check named
  `Chromatic` / "UI Tests" from branch protection, or PRs will stay blocked on a check that no longer runs.
