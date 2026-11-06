# ADR 0031 — Coverage floor in the test job, stricter Codecov statuses

## Status

Accepted (2026-11-06). Supersedes in part ADR 0021: the `project` threshold, the `patch` target, and
the consequence that both Codecov statuses are real blocking checks.

## Context

The owner asked that CI fail when code coverage decreases. ADR 0021 relied on two Codecov statuses
for that, but in practice neither blocked anything:

- Codecov has never posted `codecov/project` on this repo. PRs 69 to 72 and main at `737f410` carry
  only `codecov/patch`, although Codecov holds both reports (PR 71: base 97.36%, head 97.20%, from
  `https://api.codecov.io/api/v2/github/cdfarkas/repos/ds-omnia/pulls/71/`).
- Codecov's worker skips every non-patch status when the owner's plan tier is TEAM
  ([`notification/__init__.py`](https://github.com/codecov/umbrella/blob/main/apps/worker/services/notification/__init__.py),
  lines 77-81 and 97-101), and an open bug reports the free developer plan stored as the TEAM tier
  ([codecov/feedback#830](https://github.com/codecov/feedback/issues/830)). That this account is on
  that plan is **not verified** (it needs a Codecov login).
- Branch protection on `main` requires `lint`, `typecheck`, `build`, `test` and `build-storybook`.
  No Codecov status was ever required, so a red `codecov/patch` never blocked a merge.
- `pnpm test`, the local gate, does not collect coverage. Only `pnpm coverage`, run by the CI `test`
  job on Linux, does; a local Windows run can report slightly different numbers (ADR 0021).

## Decision

1. **Total-coverage floor in the `test` job.** `vitest.config.ts` sets `coverage.thresholds` to
   main's Linux CI numbers at `737f410`: statements 98.62, branches 96.19, functions 95.09,
   lines 99.23 (raw 287/291, 202/210, 97/102, 258/260). `pnpm coverage` fails below any of them, so
   the already-required `test` check fails. The floor is raised by hand in a PR when coverage
   rises; there is no `autoUpdate`, because a local Windows run would write non-Linux numbers.
2. **Codecov `project`**: `target: auto`, `threshold: 0%`. Any drop against the base fails.
3. **Codecov `patch`**: `target: auto` instead of `80%`. Changed lines must be at least as covered
   as the base commit's total.
4. **`codecov/patch` is a required status check** in `main`'s branch protection.

## Consequences

- A PR that lowers total coverage below the floor cannot merge, whatever Codecov does. The gate no
  longer depends on a third-party status that never posted.
- The floor only ratchets by hand: when coverage rises, a PR raises the numbers. Until then a drop
  that stays above the floor passes the `test` job.
- Deleting tested code can push the total below the floor even though nothing got worse. The PR
  unblocks itself by lowering the floor, with the reason in its description.
- The floor bites in CI only. `pnpm test` does not run coverage, and a local `pnpm coverage` on
  Windows may pass or fail by a hair where Linux does the opposite; the Linux run is the gate.
- `patch: auto` targets the base total (about 97% today), much stricter than 80%: nearly every
  changed line needs a test.
- `codecov/patch` being required makes Codecov an availability dependency: if it does not post, the
  PR waits. The upload stays `fail_ci_if_error: false`.
- The `project` status stays configured with a 0% threshold. If Codecov fixes the plan tier it will
  start posting and also fail on any drop, including measurement noise; it is not required, so it
  informs until branch protection adds it.
