import type { HTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Stat.module.css';

export interface StatProps extends HTMLAttributes<HTMLDListElement> {
  children: ReactNode;
  /** `horizontal` lays items in a row that wraps; `vertical` keeps them in one column. */
  orientation?: 'horizontal' | 'vertical';
  ref?: Ref<HTMLDListElement>;
}

export interface StatItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface StatLabelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}

export interface StatValueProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}

export interface StatHintProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}

const join = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

/**
 * Headline figures on a native `<dl>` of one or more `Stat.Item` figures. In each item the
 * `Stat.Label` (`<dt>`) is written first and the `Stat.Value` (`<dd>`) is drawn above it.
 * `orientation` lays items in a wrapping row or one column. Consumes semantic tokens only.
 */
function StatRoot({
  orientation = 'horizontal',
  className,
  children,
  ref,
  ...rest
}: StatProps) {
  return (
    <dl
      ref={ref}
      className={join(styles.root, className)}
      data-scope="stat"
      data-part="root"
      data-orientation={orientation}
      {...rest}
    >
      {children}
    </dl>
  );
}

function Item({ className, children, ref, ...rest }: StatItemProps) {
  return (
    <div
      ref={ref}
      className={join(styles.item, className)}
      data-scope="stat"
      data-part="item"
      {...rest}
    >
      {children}
    </div>
  );
}

function Label({ className, children, ref, ...rest }: StatLabelProps) {
  return (
    <dt
      ref={ref}
      className={join(styles.label, className)}
      data-scope="stat"
      data-part="label"
      {...rest}
    >
      {children}
    </dt>
  );
}

function Value({ className, children, ref, ...rest }: StatValueProps) {
  return (
    <dd
      ref={ref}
      className={join(styles.value, className)}
      data-scope="stat"
      data-part="value"
      {...rest}
    >
      {children}
    </dd>
  );
}

function Hint({ className, children, ref, ...rest }: StatHintProps) {
  return (
    <dd
      ref={ref}
      className={join(styles.hint, className)}
      data-scope="stat"
      data-part="hint"
      {...rest}
    >
      {children}
    </dd>
  );
}

StatRoot.displayName = 'Stat';
Item.displayName = 'Stat.Item';
Label.displayName = 'Stat.Label';
Value.displayName = 'Stat.Value';
Hint.displayName = 'Stat.Hint';

export const Stat = Object.assign(StatRoot, { Item, Label, Value, Hint });
