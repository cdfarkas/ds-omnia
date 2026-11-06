# ADR 0016 — Form components and validation: who owns it?

## Status

Accepted (2026-10-31). Partly superseded by ADR 0029: atoms do not read a `FormField` context.

## Context

Omnia has one form control today (`Input`) and two coming (`Checkbox`, `Switch`), with a `FormField`
molecule (label + hint + error, wired by React Context) already planned in `docs/ARCHITECTURE.md`.
The owner's question: are these **pure rendering components**, or do they **carry validation
logic**? This has to be settled before more form components are built, because it fixes the props
every one of them exposes.

**What `Input` does today** (read from `src/components/atoms/Input/Input.tsx`):

- It holds no state and runs no validation. `invalid` is a boolean that sets `aria-invalid="true"`
  on the `<input>` and `data-invalid` on the root, which the CSS turns into the danger border.
- `className` and `style` go to the root wrapper. Every other prop goes to the native `<input>`:
  `required`, `pattern`, `name`, `value`, `defaultValue`, `onChange`, `onBlur`, and `ref`
  (React 19 `ref` as a prop). Because `{...rest}` is spread after `aria-invalid`, a caller's own
  `aria-invalid` overrides the one derived from `invalid`.
- The invalid look comes only from the `invalid` prop. Nothing styles the native `:invalid` state,
  so a field the browser considers invalid looks normal unless the caller sets `invalid`.
- It has no label, hint or error text: its doc comment says those belong to a wrapping field.

**Constraints already fixed elsewhere:**

- Atoms stay native HTML; React Aria is only considered at the first complex widget
  (owner constraint; memory note `omnia-react-aria-at-first-widget`).
- No runtime dependency is added lightly.
- ADR 0007: no i18n library. Strings go through `t()` over a typed `Record<Locale, …>`. `t()` reads a
  module-level locale set from the toolbar global, so Omnia can translate its own strings but knows
  nothing about an application's message catalogue.
- ADR 0006: WCAG 2.1 AA is the floor, enforced by axe (violations and incomplete results) in every
  theme and skin.
- The package is unpublished, so a breaking change to `Input` costs nothing outside this repo today.

**Compatibility that must hold whichever option is chosen:**

- **React Hook Form**: `register` returns `ref`, `name`, `onChange`, `onBlur` and reads the value
  through the DOM `ref`. A component that does not forward `ref` to the real input loses its value
  and cannot be focused on error (S28).
- **Formik / TanStack Form**: controlled use. Formik's `Field` injects `value`, `name`, `onChange`,
  `onBlur` (S31). TanStack Form hands you `field.state.value`, `handleChange`, `handleBlur` and you
  write the markup (S30).
- **React 19 `<form action>` / `useActionState`**: the action receives `FormData`, collected by each
  control's `name`. Uncontrolled fields are reset after a successful action (S29). So atoms must work
  uncontrolled, with native `name`/`value`/`checked`.
- **Server-side errors**: arrive after submit, keyed by field `name` or returned from the action. The
  atom must be able to show an error it did not detect itself.

## Survey

Sources are official docs, opened for this ADR. **"None documented"** means the pages opened do not
mention it. **"Not verified"** means no usable page was opened. Quotes are kept under 15 words.

| System                  | Who owns validation                                                                           | How the error state and message are passed                                                  | Native constraint validation (`required`, `:invalid`, `setCustomValidity`)               | Form library recommended or shipped                                | Src         |
| ----------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------- |
| MUI `TextField`         | Consumer (display only)                                                                       | `error` toggles the state; `helperText` carries the message                                 | None documented; `useFormControl` example uses `noValidate`                              | Lists third-party react-hook-form-mui, formik-material-ui, mui-rff | S1          |
| Mantine (+ form)        | Split: `TextInput` displays; `@mantine/form` validates                                        | `error` prop (boolean or node); `getInputProps` feeds it                                    | None documented                                                                          | Ships `@mantine/form` (`useForm`, `validate` per field)            | S2, S3      |
| Chakra UI `Field`       | Consumer (display only)                                                                       | `invalid` on `Field.Root`; message in `Field.ErrorText`                                     | None documented                                                                          | None documented                                                    | S4          |
| Ant Design              | `Form.Item` (`rules`, `validateTrigger`)                                                      | `validateStatus` is generated from the rules, or set by hand; `help` overrides the message  | None documented                                                                          | Its own `Form`; `Form.Item.useStatus()` for custom controls        | S5          |
| React Spectrum / Aria   | Component: native constraints, then `validate` prop                                           | `isInvalid` + `errorMessage` for realtime; `Form validationErrors` for server errors by `name` | Yes: `validationBehavior="native"` is the default; `"aria"` flags AT-only and does not block submit | Names React Hook Form as the case for `validationBehavior="aria"`  | S6          |
| Radix Form              | Component: native API first, `match` rules on top                                             | `Form.Message match="valueMissing"` etc.; `serverInvalid`, `forceMatch` for server errors    | Yes: "Built on top of the native browser constraint validation API"                      | None documented                                                    | S7          |
| Base UI `Field`/`Form`  | Component, opt-in: `validate` on `Field.Root`; `validationMode` onSubmit / onBlur / onChange  | Field-level `invalid` (controlled); `Form errors` by `name` for server errors               | Yes: native attributes work with `Field.Error match="valueMissing"`; `Field.Validity`    | Controlled `invalid` / `dirty` / `touched` for external state; none named | S8, S9      |
| shadcn/ui               | Form library (React Hook Form) with a Zod schema                                              | `data-invalid` on `Field`, `aria-invalid` on the control, then `FieldError`                 | Page disables browser validation in the demo; advises basic browser validation in production | React Hook Form + Zod (`zodResolver`)                              | S10         |
| IBM Carbon              | Consumer: the component only renders `invalid` (source); realtime or on submit is a design choice | `invalid` + `invalidText`; `data-invalid` on the wrapper                                    | None documented                                                                          | None documented                                                    | S11, S12    |
| GitHub Primer           | Not addressed on the page opened                                                              | `FormControl.Validation` with `variant` error or success; ids shared by React Context       | None documented                                                                          | None documented                                                    | S13         |
| Fluent UI v9 `Field`    | Consumer: `Field` only renders from `validationState`                                        | `validationState` + `validationMessage`; the message gets `role="alert"` in error or warning | None documented                                                                          | None documented                                                    | S14, S15    |
| Shopify Polaris         | Consumer: `required` "will not cause an error to appear automatically"                        | `error` message string; `details` for format help                                            | None documented                                                                          | None documented                                                    | S16 (a)     |
| GOV.UK                  | Server, by default; JS only moves focus                                                       | Error message per field plus a mandatory error summary that links to each field             | Examples use `novalidate`, reason not given                                              | None documented                                                    | S17         |

(a) The Polaris row comes from the Shopify.dev Polaris web-component page for `text-field` (POS UI
extensions). The `polaris-react` page failed to load, so the React `TextField` is **not verified**.

**Reading the table:**

- **Display only** (the consumer or a form library supplies the verdict): MUI, Chakra, Carbon,
  Fluent, Polaris, GOV.UK, shadcn (React Hook Form). Mantine's `TextInput` displays and its separate
  `@mantine/form` package validates.
- **Validation lives in the component layer**: Ant (`Form.Item`), React Aria, Radix Form, Base UI.
  Even these keep an escape hatch for an external library: Aria's `validationBehavior="aria"`, Base UI's
  controlled `invalid`, Radix's `serverInvalid`.
- **Where it sits**: in all five systems that validate, the logic is at a form or field layer, or
  opt-in per field. None of the systems that validate does it in a bare atom with no wrapper, except
  React Aria's `TextField`, which is itself a wrapper component around `Input`.
- **Native constraint validation** is a first-class input only for Aria, Radix and Base UI. For the
  rest it is not mentioned on the pages opened.
- **Timing** is configurable where the system validates (Ant `validateTrigger`, Base UI
  `validationMode`, Aria "on blur or submit"). Carbon leaves it to design: realtime, or on submit.
  GOV.UK validates on submit and shows a summary.

**Not verified:** Fluent's wiring of `aria-invalid` and `aria-describedby` onto the control (the
source I opened sets only the message `role`; `docs/naming/input.md` S8 reports the wiring from the
docs); Carbon's exact `aria-invalid` output (a helper function was not in the file opened); Primer's
accessibility subpage; Material 3 and Atlassian (not re-opened for this ADR); `aria-errormessage`
support tables (the a11ysupport.io page returned only a heading).

### Accessibility criteria at stake (WCAG 2.1, all opened)

- **3.3.1 Error Identification (A)**: the field in error is identified and the error is described in
  text; colour alone is not enough (S18). `aria-invalid` is one listed technique, and S23 says not to
  set it before validation has run.
- **3.3.2 Labels or Instructions (A)**: required whenever content accepts input, optional fields
  included (S19). This is the `FormField` label and hint job.
- **3.3.3 Error Suggestion (AA)**: when the system detects an error and knows the fix, it says so (S20).
  Whoever owns the message text owns this criterion. A generic native message may not satisfy it.
- **4.1.3 Status Messages (AA)**: a message that appears without taking focus must be exposed by role or
  property (S21). The page's own example is an error count after a failed submit, and it names
  `role="alert"` for errors where focus does not move.
- **1.3.1 Info and Relationships (A)**: label and control programmatically linked (S22). A group of
  checkboxes needs `fieldset` + `legend`.

**Linking the error to the control.** Two mechanisms exist:

- `aria-describedby` points at the error text. Roselli's tests find it the most consistently exposed
  when moving through fields, and he advises against switching to `aria-errormessage` for better
  exposure (S27, narrow test set, his own caveat).
- `aria-errormessage` is meant only for use with `aria-invalid="true"` (S26). The MDN page has no
  support table. Roselli found it generally not exposed when tabbing through fields (S27).

So `aria-describedby` is the safer link; support evidence for `aria-errormessage` is thin and
one-sided. Fluent's `role="alert"` on the message is the only live-region behaviour found in a
system's own code (S15); the Roselli tests show assertive regions can clip the next field's name.

## Options

**A. Pure presentational atoms.** State in, events out, native attributes passed through. `Input`,
`Checkbox` and `Switch` take `invalid` and render it. Validation (rules, timing, message text) belongs
to the consumer's form layer. `FormField` wires `id`, label, hint, error and `aria-describedby` /
`aria-invalid`, and renders whatever error content it is given.

- Cost: lowest. `Input` needs no change except to read `FormField` context once that exists.
- A11y: Omnia guarantees the plumbing (3.3.2, 1.3.1, the link to the error). The text of the error and
  its timing (3.3.1, 3.3.3, 4.1.3) are the consumer's, so Omnia cannot fail or pass them alone.
- Bilingual: no messages ship, so there is nothing to translate. The consumer's messages follow the
  consumer's own i18n.
- Dependency: none.
- Fits every compatibility case above, since atoms hold no state.
- Matches how MUI, Chakra, Carbon, Fluent, Primer, shadcn and Mantine's inputs behave.

**B. A, plus opt-in native constraint validation surfaced by `FormField`.** `FormField` listens to the
control, reads `validity`, and shows the browser's message (or one keyed by `ValidityState`).
Atoms are unchanged. Consumers who use a form library ignore it.

- Cost: medium. Needs event wiring (`invalid`, `input`, `blur`), a rule for when to show, and group
  handling for checkboxes. The platform does the checking, so no rule engine.
- A11y: Better default: required and format errors get text and `aria-invalid` without app code.
  The browser's own text may fail 3.3.3 (no suggestion) and is not under Omnia's control.
- Bilingual: the weak point. Native `validationMessage` text comes from the browser; whether it
  follows the Omnia `locale` toolbar global is **not verified** (the MDN page opened does not say), and
  I would not assume it does. Omnia would need its own `Record<Locale, …>` keyed by `ValidityState`, which
  is a fixed set (`valueMissing`, `typeMismatch`, `patternMismatch`, `tooShort`, …, S24) and so fits the
  `t()` pattern.
- Dependency: none.
- Precedent: React Aria, Radix Form and Base UI.
- Collides with the common case of React Hook Form (it must pass `noValidate` or `validationBehavior`
  equivalent, or two systems both show errors).
- Changes for `Input`: nothing in the atom, plus CSS for `:user-invalid` (S25, Baseline widely
  available) if the native-invalid look should match the `invalid` look.

**C. Built-in validation API in Omnia.** A `validate` prop or rules, and Omnia's own form state
(touched, dirty, errors).

- Cost: highest. This is a form library: async validation, cross-field rules, submit handling,
  server errors, array fields, a test matrix, ongoing maintenance.
- A11y: Omnia can own the whole 3.3.x chain, which is the strongest guarantee, and the largest
  surface to get wrong.
- Bilingual: Omnia would ship message catalogues in FR and EN for each rule, or take a message per
  rule from the consumer.
- Dependency: either none (hand-rolled) or a schema library.
- Duplicates React Hook Form, Formik, TanStack Form, `@mantine/form`, Ant `Form`, none of which a
  design system should compete with. shadcn and MUI explicitly point users to external libraries (S1, S10).
- Changes for `Input`: new props and state, and `Input` stops being a bare control. Every
  compatibility case above needs re-checking, since Omnia would be holding the value.

**D. Delegate to a headless library inside the atoms** (React Aria or Base UI `Field`). This is what
the survey shows the "validating" systems do. It is **excluded by the owner's constraints** (atoms
stay native, no React Aria for atoms, no dependency added lightly). Listed so the record is complete.

## Recommendation

**Adopt A for the atoms and for v1 of `FormField`. Keep B as an additive follow-up, decided by evidence,
not now. Reject C.**

Reasons:

- The package is unpublished, so the cost of changing later is a repo-local diff. That argues for the
  smallest option that works today.
- Every compatibility case works with stateless atoms (RHF `ref`, Formik and TanStack handlers,
  `FormData` by `name`, server errors via `invalid`). No case needs Omnia to hold the value.
- The survey does not support C: of thirteen systems, the ones that validate do it in a form or
  field layer, and each of them keeps an escape hatch to an external library.
- B can be added later without touching an atom: it lives in `FormField`, so it is not a breaking
  change.

**Devil's advocate against this recommendation:**

- **"A pushes the hard part onto every consumer."** True. Timing (blur, change, submit), the
  message wording and the error summary all become the consumer's job, and a design system exists to
  make those consistent. Rebuttal: the form library already owns timing (RHF `mode`, Formik
  `validateOnBlur`, TanStack `validators`), and there are no consumers yet to be inconsistent.
- **"The platform already validates, and the ladder says use the platform first."** A passes `required` and
  `pattern` through, but the browser's native bubble is unstyled and outside the design system, and
  `Input` does not react to `:invalid`. A consumer who writes `<Input required />` gets a half-native,
  half-Omnia experience. This is a real gap in A as written. It needs either a documented `noValidate`
  rule, or the `:user-invalid` CSS from B. I do not have evidence on which the owner prefers.
- **"A is cheap now and a rewrite of `FormField` later."** If `FormField` ends up needing touched /
  dirty / validity state (Base UI's `Field` exposes `dirty`, `touched` and validity, S8), A's
  `FormField` API (a boolean `invalid`) must grow. Rebuttal: that growth is confined to a molecule that
  does not exist yet, but it is a real risk that `invalid: boolean` is too thin a contract.
- **"A makes Omnia look thin next to Base UI and React Aria."** True for a portfolio audience. It is
  a scope choice, not a quality one, and the cost of C is the opposite risk.
- **"Deciding now is wasted effort if the cost to change is near zero."** Partly. The part that is not
  cheap to change later is the `FormField` ↔ atom contract (which props the atoms read from context), and
  that is what this ADR actually locks.

**What would change the recommendation:** a first consumer that uses no form library and needs
error display on blur with localized text (that is the case for B); or a requirement for Omnia-owned
cross-field rules (that would need an ADR superseding this one, with a benchmark or failing test per
`docs/governance.md`).

## Decision

Option A: form atoms (`Input`, `Checkbox`, `Switch`, …) and `FormField` v1 are display only. They render a state (`invalid` → `aria-invalid` + the danger border), pass native attributes and `ref` through, and generate no error text. Validation, its timing and the message text belong to the consumer's form layer (form library, server, React 19 actions).

Option B (`FormField` surfacing native constraint validation) is deferred: it can be added later in `FormField` without touching an atom, and needs its own evidence.

Option C (Omnia-owned validation) is rejected.

Owner decision, 2026-10-31.

## Consequences

The owner accepted the recommendation (A, B deferred, C rejected):

**Easier**

- Atoms stay small and stateless. The test matrix for `Input`, `Checkbox` and `Switch` is rendering,
  attribute pass-through and `ref` forwarding.
- Works with RHF, Formik, TanStack Form and React 19 actions with no adapter.
- No message catalogue to maintain; ADR 0007 is untouched.

**Harder**

- Consumers own timing and wording. Docs and a story must show how to do it, or the gap is a
  trap (see the `noValidate` point above).
- WCAG 3.3.1 / 3.3.3 / 4.1.3 compliance of a real form depends on the consumer. Omnia's axe gate
  (ADR 0006) can only check what a story renders, so stories must include a worked error example.

**What each component must expose**

`Input` (already merged; changes are small):

- Keep as is: stateless, `invalid` → `aria-invalid` + `data-invalid`, native props and `ref` through to
  `<input>`, usable controlled and uncontrolled.
- ~~Add when `FormField` lands: read the field context for `id`, `aria-describedby` (hint and error ids),
  `aria-invalid` and `required`, with explicit props winning over context.~~ Superseded by ADR 0029:
  `Input` stays context-unaware and receives the wiring through `FormField.Control` or `useFormField()`.
- Open: whether the root also styles native `:user-invalid` (S25).

`Checkbox` / `Switch`:

- Native `<input type="checkbox">` with `name`, `value`, `checked` / `defaultChecked`, `onChange`,
  `onBlur`, `required`, `disabled`, and `ref` forwarded to the real input.
- If the atom needs its own ref (for `indeterminate`, which is a DOM property), it must merge refs so a
  form library's `ref` still lands on the input.
- `invalid` with the same meaning as `Input`.
- For a group, the error belongs on the group (`fieldset` + `legend`), as Primer and GOV.UK do (see
  `docs/naming/checkbox.md`).

`FormField` (molecule, Context):

- Provides a generated `id`, label `htmlFor`, and the ids of hint and error; sets `aria-describedby`
  (hint + error) and `aria-invalid` via context. Use `aria-describedby`, not `aria-errormessage` (S27).
- `FormField.Error` renders caller-supplied content (string or node) and appears only when the field is
  invalid. It does not generate message text.
- ~~Open: whether `FormField.Error` carries `role="alert"`.~~ Settled by ADR 0029: no `role` or
  `aria-live` by default; the consumer may add one, and the docs describe the summary-after-submit
  pattern (S17, S21).
- Reserve the option to add native validity reading (B) without a breaking change.

**Follow-ups this creates**

- Supersede nothing; add a short "Forms" section to `docs/ARCHITECTURE.md` and a
  `docs/naming/form-field.md` study before `FormField` is built (governance: naming study first).
- Record, in the `Input` story, a worked example for each of: React Hook Form (`register`), React 19
  `useActionState`, and a server error.

## Sources

All opened on 2026-10-31 unless noted.

- S1: https://mui.com/material-ui/react-text-field/
- S2: https://mantine.dev/form/use-form/
- S3: https://mantine.dev/core/text-input/
- S4: https://www.chakra-ui.com/docs/components/field
- S5: https://ant.design/components/form
- S6: https://react-aria.adobe.com/forms
- S7: https://www.radix-ui.com/primitives/docs/components/form
- S8: https://base-ui.com/react/components/field
- S9: https://base-ui.com/react/components/form
- S10: https://ui.shadcn.com/docs/forms/react-hook-form
- S11: https://carbondesignsystem.com/components/text-input/usage/
- S12: https://raw.githubusercontent.com/carbon-design-system/carbon/main/packages/react/src/components/TextInput/TextInput.tsx
- S13: https://primer.style/components/form-control
- S14: https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-field/library/src/components/Field/useField.tsx
- S15: https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-field/library/src/components/Field/useFieldBase.tsx
- S16: https://shopify.dev/docs/api/pos-ui-extensions/latest/web-components/forms/text-field.md
- S17: https://design-system.service.gov.uk/components/error-summary/
- S18: https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html
- S19: https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html
- S20: https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion.html
- S21: https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html
- S22: https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html
- S23: https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA21.html
- S24: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation
- S25: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:user-invalid
- S26: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage
- S27: https://adrianroselli.com/2023/04/exposing-field-errors.html
- S28: https://react-hook-form.com/docs/useform/register
- S29: https://react.dev/reference/react-dom/components/form
- S30: https://tanstack.com/form/latest/docs/framework/react/guides/basic-concepts
- S31: https://formik.org/docs/api/field

Internal: `src/components/atoms/Input/Input.tsx`, `docs/naming/input.md`, `docs/naming/checkbox.md`,
`docs/adr/0006-a11y-wcag-21-aa.md`, `docs/adr/0007-bilingual-typed-strings.md`,
`docs/governance.md`.
