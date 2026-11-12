import { join, type AppShellRegionProps } from '../internal';
import styles from './Header.module.css';

/** The shell's banner region — renders a `<header>`. */
export function AppShellHeader({ className, ref, ...rest }: AppShellRegionProps) {
  return (
    <header
      ref={ref}
      className={join(styles.header, className)}
      data-scope="appshell"
      data-part="header"
      {...rest}
    />
  );
}
