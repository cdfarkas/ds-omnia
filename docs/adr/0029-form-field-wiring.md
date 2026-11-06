# ADR 0029 — FormField wiring: atoms stay context-unaware

## Status

Accepted (2026-11-06). Supersedes the `Input` line "Add when `FormField` lands: read the field
context…" in the Consequences of ADR 0016, and settles its open `role="alert"` point.

## Context

`FormField` links a label, a hint and an error to one control: the control needs an `id`,
`aria-describedby`, `aria-invalid` and `required`. ADR 0016 planned for `Input` to read those from a
`FormField` context, with explicit props winning.

The owner rejects that: `Input`, `Checkbox` and `Switch` stay pure, prop-driven rendering
components, and field wiring is a separate functional layer. The facts that shape the layer, checked
in the code:

- Everything the control needs is a native attribute that the atoms already pass to their
  `<input>`, except the danger border, which comes only from the atoms' `invalid` prop. So the wiring
  must hand over the attributes and the state separately.
- axe reports an `aria-describedby` that points at a missing element as *incomplete*, which fails
  Omnia's gate. The field may only reference a description or an error while it is rendered.
- The prop-name gate (`src/native-prop-names.check.ts`) rejects a function `children`, since
  `children` is native. A render prop must take another name; `render` is not an HTML attribute.

The survey of how other systems deliver field wiring (hooks, render props, slot cloning, connected
wrappers) is recorded in the private vault, not here.

## Decision

- **Atoms do not know `FormField`.** Nothing under `atoms/` imports it; a test in
  `FormField.test.tsx` checks that.
- **The functional layer is the public `useFormField()` hook.** Inside a field it returns
  `{ controlProps, invalid, required }`. `controlProps` holds native attributes only: `id`,
  `aria-describedby` (the description id, then the error id, each only while that part is rendered),
  `aria-invalid` and `required`. Outside a field it throws.
- **Delivery is `FormField.Control` with a `render(props, state)` prop.** It renders no element of
  its own. The consumer spreads `props` and passes `state.invalid` to an Omnia atom. Explicit props
  written after the spread win, by replacement.
- **Parts**: `FormField.Label` (a `<label>` pointing at the control), `FormField.Description` and
  `FormField.Error`. Description and error register themselves with the root while mounted. The error
  renders only when the field is `invalid` and it has content.
- **Required indicator**: with `required`, the label appends an `aria-hidden` `*`; the control gets
  native `required`, which is what assistive technology announces.
- **No live region on the error by default.** `FormField.Error` has no `role` or `aria-live`; it
  forwards HTML attributes, so a consumer can add `role="alert"`, or show an error summary after
  submit.
- **Display only**, as ADR 0016 decided: no validation and no generated message text.
- Checkbox and Switch render their own `<label>`: they take no `FormField.Label`, and their label
  text goes in the atom's children.

```tsx
<FormField invalid={Boolean(error)} required>
  <FormField.Label>Email</FormField.Label>
  <FormField.Control
    render={(props, { invalid }) => <Input {...props} type="email" invalid={invalid} />}
  />
  <FormField.Description>We send the receipt to this address.</FormField.Description>
  <FormField.Error>{error}</FormField.Error>
</FormField>
```

```tsx
function CountrySelect() {
  const { controlProps } = useFormField();
  return <select {...controlProps}>…</select>;
}
```

## Consequences

**Easier**

- Atoms keep a test matrix of rendering, attribute pass-through and `ref` only, and work the same
  inside and outside a field.
- Any control takes the wiring: Omnia atoms, native elements and third-party components, with no
  clone, slot helper or new dependency.
- The prop-name gate passes, and the hook's return keys carry native types.

**Harder**

- Wiring is opt-in. A consumer who forgets `FormField.Control` or the spread gets a label pointing at
  nothing. The only guard is a development-only `console.error` from `FormField.Label` when its target
  id is missing from the document. It sits behind `import.meta.env.DEV`, which the library build
  replaces with `false`, so it reaches Omnia's own Storybook and tests, not a consumer's app.
- `invalid` is passed twice at each call site: to the field and to the atom.
- An explicit `aria-describedby` after the spread replaces the field's ids instead of adding to them.
- Description and error registration costs one extra render when they mount.
