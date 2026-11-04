import type { LiHTMLAttributes, OlHTMLAttributes, ReactNode, Ref } from 'react';
import styles from './List.module.css';

export type ListElement = 'ul' | 'ol';

export interface ListProps extends OlHTMLAttributes<HTMLUListElement | HTMLOListElement> {
  as?: ListElement;
  children: ReactNode;
  ref?: Ref<HTMLUListElement | HTMLOListElement>;
}

export interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  children: ReactNode;
  ref?: Ref<HTMLLIElement>;
}

/**
 * Semantic list of short related items. `as` picks `<ul>` (bullets) or `<ol>` (numbers); compose it
 * with `List.Item` children, which may nest another List. Token-driven, so it reskins across the
 * theme and skin axes.
 */
function ListRoot({ as = 'ul', className, children, ref, ...rest }: ListProps) {
  const Tag = as;
  const classes = [styles.list, className].filter(Boolean).join(' ');

  return (
    <Tag
      ref={ref as Ref<HTMLOListElement>}
      className={classes}
      data-scope="list"
      data-part="root"
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** One item of a List, rendering a native `<li>` that holds any content. */
function ListItem({ className, children, ...rest }: ListItemProps) {
  const classes = [styles.item, className].filter(Boolean).join(' ');

  return (
    <li className={classes} data-scope="list" data-part="item" {...rest}>
      {children}
    </li>
  );
}

export const List = Object.assign(ListRoot, { Item: ListItem });
