import type { HTMLAttributes, ReactNode, Ref } from 'react';
import styles from './DescriptionList.module.css';

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  children: ReactNode;
  ref?: Ref<HTMLDListElement>;
}

export interface DescriptionListItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface DescriptionListTermProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}

export interface DescriptionListDetailProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}

const join = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

/**
 * Term–detail pairs on a native `<dl>`. Each `DescriptionList.Item` is a `<div>` group holding one
 * `DescriptionList.Term` (`<dt>`) and its `DescriptionList.Detail` (`<dd>`). Terms and details stack
 * when the list is narrow and sit side by side once it is wide enough (a container query on the
 * list's own width). Consumes semantic tokens only; themes/skins reskin it.
 */
function DescriptionListRoot({
  className,
  children,
  ref,
  ...rest
}: DescriptionListProps) {
  return (
    <dl
      ref={ref}
      className={join(styles.root, className)}
      data-scope="description-list"
      data-part="root"
      {...rest}
    >
      {children}
    </dl>
  );
}

function Item({ className, children, ref, ...rest }: DescriptionListItemProps) {
  return (
    <div
      ref={ref}
      className={join(styles.item, className)}
      data-scope="description-list"
      data-part="item"
      {...rest}
    >
      {children}
    </div>
  );
}

function Term({ className, children, ref, ...rest }: DescriptionListTermProps) {
  return (
    <dt
      ref={ref}
      className={join(styles.term, className)}
      data-scope="description-list"
      data-part="term"
      {...rest}
    >
      {children}
    </dt>
  );
}

function Detail({ className, children, ref, ...rest }: DescriptionListDetailProps) {
  return (
    <dd
      ref={ref}
      className={join(styles.detail, className)}
      data-scope="description-list"
      data-part="detail"
      {...rest}
    >
      {children}
    </dd>
  );
}

DescriptionListRoot.displayName = 'DescriptionList';
Item.displayName = 'DescriptionList.Item';
Term.displayName = 'DescriptionList.Term';
Detail.displayName = 'DescriptionList.Detail';

export const DescriptionList = Object.assign(DescriptionListRoot, { Item, Term, Detail });
