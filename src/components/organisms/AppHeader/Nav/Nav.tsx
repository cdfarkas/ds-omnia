import { join } from '../internal';
import type { AppHeaderNavProps } from '../AppHeader';
import styles from './Nav.module.css';

export function AppHeaderNav({ className, ref, ...rest }: AppHeaderNavProps) {
  return (
    <div
      ref={ref}
      className={join(styles.nav, className)}
      data-scope="app-header"
      data-part="nav"
      {...rest}
    />
  );
}
