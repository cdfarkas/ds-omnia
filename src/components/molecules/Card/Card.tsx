import type { HTMLAttributes, Ref } from 'react';
import { join } from './internal';
import { CardHeader } from './Header';
import { CardBody } from './Body';
import { CardFooter } from './Footer';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Surface grouping related content, with optional `Card.Header`, `Card.Body` and `Card.Footer`
 * parts composed in source order. Every part is a plain `<div>` with no role of its own: wrap the
 * card in an `<article>` or a list item when its content stands alone. Consumes semantic tokens
 * only, reskins across the theme and skin axes, and steps its padding up with its own width; footer
 * actions wrap on a narrow card.
 */
function CardRoot({ className, ref, ...rest }: CardProps) {
  return (
    <div
      ref={ref}
      className={join(styles.root, className)}
      data-scope="card"
      data-part="root"
      {...rest}
    />
  );
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
