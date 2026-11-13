import { join } from '../internal';
import type { AppHeaderBrandProps } from '../AppHeader';
import styles from './Brand.module.css';

export function AppHeaderBrand({ className, ref, ...rest }: AppHeaderBrandProps) {
  return (
    <div
      ref={ref}
      className={join(styles.brand, className)}
      data-scope="app-header"
      data-part="brand"
      {...rest}
    />
  );
}
