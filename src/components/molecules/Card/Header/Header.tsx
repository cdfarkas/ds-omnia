import { join } from '../internal';
import type { CardHeaderProps } from '../Card';
import styles from '../Card.module.css';

export function CardHeader({ className, ref, ...rest }: CardHeaderProps) {
  return (
    <div
      ref={ref}
      className={join(styles.part, className)}
      data-scope="card"
      data-part="header"
      {...rest}
    />
  );
}
