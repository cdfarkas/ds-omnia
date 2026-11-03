# Agent visual validation

A hard gate that runs **before** human review. Automated tests (unit, interaction,
a11y) prove behaviour and catch contrast from CSS, but they do not prove the design
*looks* right — colours per theme, the pixel aesthetic, legibility, focus visibility.
axe in particular does not test WCAG 2.4.7 (focus visible), so a clipped focus ring
passes the a11y gate while being invisible on screen. The agent closes that gap by
screenshotting every state in every mode and inspecting the images itself.

## The rule

**Agent visual validation passes before any human review.** If the agent's per-mode
verdict is CONCERNS or FAIL, the issue is fixed (or explicitly flagged for human
decision) before the PR is handed over. The gate never loosens a WCAG threshold to
pass — a real contrast failure is flagged, not hidden.

## How an agent runs the gate

1. `pnpm build-storybook` — produce `storybook-static/`.
2. `pnpm visual-check` — `scripts/visual-check.mjs` serves the static build and drives
   Playwright (the Chromium already installed for the test runner). For every story in
   its `stories` list it screenshots the four theme×skin modes at 440 CSS px, full page so
   a tall story is not cut at the viewport; on Button it also captures hover/press, the
   keyboard-focus state, and both locales on one representative story; on Input it
   captures the keyboard-focus state of `WithAdornments` in all four modes
   (`input-with-adornments__focus-<mode>.png`); on Checkbox it captures the keyboard-focus
   state of `Checked` in all four modes (`checkbox-checked__focus-<mode>.png`); on Switch it captures the keyboard-focus
   state of `Checked` in all four modes (`switch-checked__focus-<mode>.png`). A narrow pass then shoots every story again in all four modes
   at 320 × 568 CSS px, the WCAG 1.4.10 reflow width (ADR 0014), as
   `<story>__<mode>__w320.png`. An optional argument filters by story id
   (`pnpm visual-check badge`); the Button-only shots run when it is absent or contains
   `button`, the Input focus shots when it is absent or contains `input`, the Checkbox focus shots when
   it is absent or contains `checkbox`, the Switch focus shots when it is absent or contains
   `switch`. Output and a `manifest.json`
   (recording per shot the `data-theme` / `data-skin` actually applied, the viewport and the
   page `scrollWidth`) land in
   `visual-report/` (a local/CI artifact, gitignored and never committed).
3. The agent **reads** each PNG (the Read tool renders images) and judges it against
   the checklist below, writing a reasoned PASS / CONCERNS verdict per mode.

Modes are driven through the Storybook iframe globals query parameter, e.g.
`iframe.html?id=atoms-button--primary&viewMode=story&globals=theme:dark;skin:pixel;locale:fr`.

## Checklist (per mode)

- Colours are correct for the theme (not the wrong theme's palette).
- The pixel skin actually looks pixel: hard edges, zero border-radius, the pixel/mono
  font, hard offset shadow, notched corners.
- Dark mode is legible.
- Text contrast reads as AA (the automated a11y gate is the hard proof; this is the
  eyes-on cross-check).
- No overflow or clipping of text or the control.
- At 320 px (`__w320` shots): no horizontal scroll (`scrollWidth` in the manifest is at
  most 320), nothing cut at the right edge, and no clipped offset shadow.
- The focus ring is visible on keyboard focus — in **every** skin, including pixel
  where a clip-path would otherwise clip an outer outline.

## No pixel-diff service

There is no hosted visual-regression tool (no Chromatic). This agent gate is the only
visual check: it blocks a bad PR before review, but it does not keep a pixel-diff baseline
over time — the honest trade-off recorded in ADR 0022. For human eyes-on, the Storybook is
published to GitHub Pages (ADR 0018); the a11y addon (ADR 0006) is the hard proof on
contrast and WCAG rules.
