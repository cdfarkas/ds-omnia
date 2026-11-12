import { join } from '../internal';
import type { CardFooterProps } from '../Card';
import shared from '../Card.module.css';
import styles from './Footer.module.css';

export function CardFooter({ className, ref, ...rest }: CardFooterProps) {
  return (
    <div
      ref={ref}
      className={join(shared.part, styles.footer, className)}
      data-scope="card"
      data-part="footer"
      {...rest}
    />
  );
}
