# Overriding components

How consumers restyle Omnia components — and their internal sub-parts — safely. This is the
convention every component follows (ADR 0010). It is built on two platform features already in the
system: native cascade layers (ADR 0002) and the semantic token contract (ADR 0003), plus a stable
data-attribute contract on each component (the Radix/Ark pattern).

## English

Omnia styles live in `@layer components`. The last cascade layer, `@layer overrides`, is reserved
for you: a rule there wins over the design system **without `!important`** and without fighting
specificity. You target components through a **stable, public `data-*` contract** — never the hashed
CSS-Module class names, which change on every build and are private implementation detail.

Reach for the least powerful tier that solves your problem, in this order.

## Français

Les styles d'Omnia vivent dans `@layer components`. La dernière couche de cascade,
`@layer overrides`, vous est réservée : une règle qui s'y trouve l'emporte sur le design system
**sans `!important`** et sans lutte de spécificité. Vous ciblez les composants via un **contrat
public et stable de `data-*`** — jamais les noms de classes CSS-Module hachés, qui changent à chaque
build et relèvent du détail d'implémentation privé.

Utilisez le niveau le moins puissant qui résout votre problème, dans cet ordre.

## The four tiers

| # | Tier | What you change | Scope |
|---|------|-----------------|-------|
| 1 | **Semantic tokens** | `--omnia-color-*`, `--omnia-radius-*`, `--omnia-shadow-*`, … | Global reskin across every component, theme and skin |
| 2 | **Component variables** | `--omnia-<name>-*` (e.g. `--omnia-button-bg`) | One component type, the props it marks overridable |
| 3 | **`data-*` contract + `@layer overrides`** | Any CSS property on a part you select by `[data-scope][data-part]` (or your own `className`) | Precise, targeted — including internal sub-parts |
| 4 | **`style` prop (escape hatch)** | Inline styles on the root `<button>` | One instance, last resort |

### 1. Semantic tokens — the default

Re-point the semantic token on a scope (`:root`, a theme/skin selector, or any container). Every
component that reads it updates together, in both themes and both skins. This is how you rebrand.

```css
:root { --omnia-color-accent: #0a7; }
```

Intent colours come from the intent map in `tokens.css` (ADR 0012): `--omnia-intent-bg`,
`--omnia-intent-bg-hover`, `--omnia-intent-bg-active` and `--omnia-intent-fg`, keyed on
`data-intent`. Re-point them per intent to restyle every intent-coloured component, hover and press
included — this lifts the ADR 0010 caveat that hover colours only follow the semantic tokens.

```css
@layer overrides {
  [data-intent='success'] {
    --omnia-intent-bg: #0a7;
    --omnia-intent-bg-hover: #096;
  }
}
```

### 2. Component variables — one component, documented props

Each component exposes a small, namespaced set of `--omnia-<name>-*` variables for the props it
considers overridable. Each reads **with a fallback** to the semantic token, so the token contract
holds when you set nothing:

```css
background: var(--omnia-button-bg, var(--omnia-color-accent));
```

Set them on the element or any ancestor (custom properties inherit):

```css
.cta { --omnia-button-radius: 999px; }
```

### 3. The `data-*` contract — target a part, including a sub-part

Every component renders a stable attribute contract:

- `data-scope="<name>"` on **every** part, so a compound selector can match one part precisely.
- `data-part="…"` naming each part.
- State/variant hooks reflecting props (`data-intent`, `data-size`, `data-loading`, …). Their names
  are stable and need not match the prop: `variantSize` reflects as `data-size`, `pending` as
  `data-loading` (ADR 0015).

Put your rule in `@layer overrides` and it wins over `@layer components` with no `!important`. You
may also pass a `className` — it merges onto the component's main element — and style that class in
`@layer overrides`.

```css
@layer overrides {
  [data-scope='button'][data-part='button'][data-intent='primary'] {
    border-radius: 999px;
  }
}
```

### 4. `style` prop — the escape hatch

`style` passes through to the component's root element. Use it for a genuine one-off; it cannot
reach sub-parts and does not scale. Prefer a tier above it whenever the override is reusable.

```tsx
<Button style={{ letterSpacing: '0.1em' }}>Ship</Button>
```

## Guardrails

- **Never target hashed CSS-Module class names** (`.button_a1b2c`). They are private and change every
  build. Use tokens, `--omnia-*` variables, or the `data-*` contract.
- **No `!important`.** `@layer overrides` already wins; reaching for `!important` means you are
  fighting the wrong layer or targeting the wrong selector.
- **Do not break the DOM or ARIA structure.** Restyle parts; never rely on removing them, reordering
  them, or stripping `aria-*` / roles. Accessibility (WCAG 2.2 AA, ADR 0026) is a floor your override
  must keep — check contrast after a colour change.
- **Prefer the lowest tier.** A token beats a component variable beats a `data-*` rule beats `style`.

## Worked example — overriding a sub-part

Make the loading spinner larger and the corners round, for one call-to-action, without touching any
private class name:

```css
/* consumer stylesheet */
@layer overrides {
  .cta {
    --omnia-button-radius: 999px;
  }

  .cta [data-scope='button'][data-part='spinner'] {
    inline-size: 1.5em;
    block-size: 1.5em;
  }
}
```

```tsx
<Button className="cta" pending>Checkout</Button>
```

The `.cta` class merges onto the button, so `--omnia-button-radius` is read by the button's own
`border-radius`, and `[data-part='spinner']` selects the internal spinner. Both rules sit in
`@layer overrides` and win over `@layer components` with no `!important`. This is demonstrated in the
Button `Overridden` story.

## Per-component contract format

Every component documents its override contract in its `.mdx`, in this shape:

- **Component variables** — the `--omnia-<name>-*` custom properties, each with its fallback token.
- **`data-scope`** — the scope value carried by every part.
- **`data-part`** — the parts you may target.
- **State attributes** — the prop-reflecting hooks and when each is present.

Example (Button):

- **Variables**: `--omnia-button-bg`, `--omnia-button-fg`, `--omnia-button-radius`,
  `--omnia-button-border-color`, `--omnia-button-shadow`, `--omnia-button-padding-x`,
  `--omnia-button-padding-y`.
- **`data-scope`**: `button`.
- **`data-part`**: `root` (wrapper), `button` (the control + consumer `className`), `spinner`, `label`.
- **State attributes** (on `data-part="button"`): `data-intent`, `data-size` (from `variantSize`),
  `data-loading` (present when `pending`), `data-disabled` (present when disabled or pending).
