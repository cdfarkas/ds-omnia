# ADR 0024 — Component naming convention

## Status

Accepted

## Context

The atoms were each a single component, so naming never forced a choice. Molecules change that: a
list, a description list, a navigation bar and a card are each a parent that owns a few named parts.
Writing them surfaced inconsistencies — `ListItem` as a flat sibling versus `DescriptionList` as a
container, and the pull to pluralize a container that holds many things (`Lists`, `Items`). Left
unsettled, every new compound would invent its own shape. The design system needs one convention so a
reader can predict a component's name and its parts' names before opening the file.

The names in the survey behind this (Radix, Chakra, Ant, MUI and general design-system naming
guidance) converge on a singular root with dot-notation parts; the survey itself is recorded in the
private vault, not here.

## Decision

- **Every component name is singular PascalCase.** `List`, not `Lists`; `Card`, not `Cards`. A
  component is a type of thing, named in the singular, however many it renders.
- **A compound component is a singular Root plus dot-notation parts.** The Root holds the shared
  context and renders the container; its parts are named by generic role — `Item`, `Header`,
  `Footer`, `Trigger`, `Content`, `Term`, `Detail` — and attached as a namespace with
  `Object.assign(Root, { Item, … })`. Parts are reached through the Root (`List.Item`) and are **not
  re-prefixed**: it is `List.Item`, never `ListListItem` or a standalone `ListItem`.
- **A Root takes an HTML-semantic name where one exists.** `DescriptionList` for `<dl>`, `NavBar`
  (or `Nav`) for `<nav>`. The name follows the element the Root renders, not an invented label.
- **A flat array-of-objects data prop (`items[]`) is reserved for genuinely data-dense components** —
  a future `DataTable` driven by rows and columns — **not for compound lists.** Composition expresses
  a list; data drives a table.
- **Prop names still obey ADR 0015.** A part or Root prop whose name is native keeps the native
  type, or is renamed per that rule; the dot-notation namespace does not exempt any prop from it.

### Examples

```tsx
// A list: singular Root, role-named part, namespace export.
<List>
  <List.Item>First</List.Item>
  <List.Item>Second</List.Item>
</List>

// A description list: HTML-semantic Root (<dl>), role-named parts.
<DescriptionList>
  <DescriptionList.Item>
    <DescriptionList.Term>Name</DescriptionList.Term>
    <DescriptionList.Detail>Omnia</DescriptionList.Detail>
  </DescriptionList.Item>
</DescriptionList>
```

```tsx
export const List = Object.assign(ListRoot, { Item: ListItem });
```

### Alternatives considered

A plural container name (`Lists`, with `Lists.Item`, or a flat `ListItem` sibling) was rejected. The
plural misreads as "multiple lists" rather than one list of items, and the flat sibling loses the
parent–child relationship that the compound expresses. The affordance a plural seems to offer — that
the thing holds many — comes instead from the dot-notation namespace: typing `List.` autocompletes
its parts, which a plural name does not.

## Consequences

Every future component name and every compound part now has one rule to follow, and a reader can
predict `List.Item`, `DescriptionList.Term` and `NavBar` shapes without opening the source. The
naming study for each new component (`CLAUDE.md`) records its Root and part names against this
convention before the owner picks them.

The convention is prose, not a gate: nothing mechanical rejects a plural or a re-prefixed part, so
review owns it. The semantic token and prop-name rules stay enforced by their own gates (stylelint,
`native-prop-names.check.ts`); this ADR adds no code and changes no component, so it touches none of
the acceptance gates.
