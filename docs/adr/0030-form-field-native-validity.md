# ADR 0030 — FormField native validity: opt-in, Omnia messages

## Status

Accepted (2026-11-06). Supersedes the sentence "Option B … is deferred" in the Decision of ADR 0016
(option B is adopted, in `FormField`, opt-in) and the "Display only" bullet in the Decision of
ADR 0029.

## Context

`FormField` v1 is display only: it shows the `invalid` state it is given. A consumer who writes
`<Input required />` in a plain `<form>` gets the browser's own bubble, unstyled and in the browser's
language. The facts that shape the change, checked in the platform docs and the react-dom 19 source:

- On submit, the browser fires a cancelable `invalid` event on each invalid control. A cancelled
  control is not reported, so cancelling also loses the browser's focus move. `checkValidity()`
  fires `invalid` too. With `noValidate` on the form, submit fires none.
- `ValidityState` has ten failing keys; no system or spec gives a priority between them.
- `validationMessage` follows the browser's locale, not Omnia's `locale` global. Only a
  `setCustomValidity` text is the consumer's own wording.
- Handlers placed in `controlProps` would be replaced by a consumer's own `onBlur` / `onChange`
  written after the spread (React Hook Form `register` returns both). React 19 runs synthetic
  listeners along the whole path for every event except `scroll` / `scrollend`, so `onInvalid`,
  `onBlur` and `onChange` on the field's root `div` see the control's events.
- React 19 form actions reset uncontrolled fields by calling the native `form.reset()`.
- A required unchecked checkbox has `valueMissing`; its toggles are read from `change`, not `input`.

The survey of how other systems trigger, word and override native validation is recorded in the
private vault, not here.

## Decision

`FormField` reads the browser's constraint validation of its control, opt-in. Atoms are unchanged:
they keep receiving `invalid` through `FormField.Control render(props, state)`.

- **`validateOn?: 'submit' | 'blur' | 'change' | 'touched'`** on the root. `submit` shows the message
  on the control's `invalid` event (a submit attempt, or `checkValidity()` / `reportValidity()`);
  `blur` also shows it on blur, `change` on every change, `touched` on the first blur then every
  change. Once shown, the message is re-checked on every change and clears as soon as the control
  is valid. Omitted, the field is exactly v1: no listener effect, no `preventDefault`.
- **Invalid event**: the field cancels it (no browser bubble beside Omnia's message) and focuses the
  control when it is the form's first invalid one (`form.elements` in order).
- **Messages**: one Omnia message per `ValidityState` key in FR and EN through `t()` (`formField.*`
  keys), the first failing key picked in IDL order (`valueMissing` … `customError`). The constraint
  value is interpolated (`{minLength}`, `{maxLength}`, `{min}`, `{max}`, `{step}`). `valueMissing`
  has checkbox and switch wordings, `typeMismatch` email and URL ones; `customError` shows the
  control's own `validationMessage`. The message is computed at render, so it follows the locale.
- **Overrides**: `validationMessages?: Partial<Record<FormFieldValidityKey, ReactNode>>` replaces a
  key's message; non-empty `FormField.Error` children win over both.
- **Priority**: the field is invalid when `invalid` is `true` or a native message is shown.
  `useFormField().invalid`, the render `state.invalid` and `aria-invalid` all follow that value;
  `aria-invalid` is never set before a message is shown.
- **Inert** when the control's form has `noValidate`: no message, no `preventDefault`.
- **Reset**: the native state clears on the form's `reset` event and when `validateOn` changes.
- Both prop names are non-native (ADR 0015); `FormFieldValidateOn` and `FormFieldValidityKey` are
  exported.

```tsx
<form onSubmit={save}>
  <FormField validateOn="submit" required>
    <FormField.Label>Email</FormField.Label>
    <FormField.Control
      render={(props, { invalid }) => <Input {...props} type="email" invalid={invalid} />}
    />
    <FormField.Error />
  </FormField>
</form>
```

## Consequences

**Easier**

- A plain form gets styled, bilingual required and format errors with `aria-invalid`, with no form
  library and no change to the atoms.
- React Hook Form and the v1 examples keep working: they set `noValidate`, which keeps the field
  inert, or omit `validateOn`.

**Harder**

- The messages are generic. They say what is wrong, but a `pattern` mismatch cannot know what the
  pattern means, so WCAG 3.3.3 (Error Suggestion) needs `validationMessages.patternMismatch` in
  practice. The docs say so.
- A consumer who uses a form library with `validateOn` and forgets `noValidate` gets two error
  systems on one form.
- Focus moves on every `invalid` event the field handles, including a programmatic
  `checkValidity()` on the form's first invalid control.
- An explicit `id` written after the spread breaks native validation: the field matches events on
  its own control id.
- The thirteen `formField.*` keys are public contract under ADR 0027: renaming one is breaking.
- Focusing the first invalid control is also a form-level job; the step-3 form organism will take
  it over from the field.
