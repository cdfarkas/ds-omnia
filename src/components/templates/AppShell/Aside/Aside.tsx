import { join, type AppShellRegionProps } from '../internal';
import styles from './Aside.module.css';

/** The shell's complementary region — renders an `<aside>`. */
export function AppShellAside({ className, ref, ...rest }: AppShellRegionProps) {
  return (
    <aside
      ref={ref}
      className={join(styles.aside, className)}
      data-scope="appshell"
      data-part="aside"
      {...rest}
    />
  );
}
