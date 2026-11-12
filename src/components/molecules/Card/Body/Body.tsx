import { join } from '../internal';
import type { CardBodyProps } from '../Card';
import styles from '../Card.module.css';

export function CardBody({ className, ref, ...rest }: CardBodyProps) {
  return (
    <div
      ref={ref}
      className={join(styles.part, className)}
      data-scope="card"
      data-part="body"
      {...rest}
    />
  );
}
