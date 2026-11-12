import { t } from '../../../../lib/i18n';
import { join, type AppShellRegionProps } from '../internal';
import styles from './Navbar.module.css';

/** The shell's primary navigation — renders a `<nav>` with a default accessible label. */
export function AppShellNavbar({ className, ref, ...rest }: AppShellRegionProps) {
  return (
    <nav
      ref={ref}
      aria-label={t('appShell.navbarLabel')}
      className={join(styles.navbar, className)}
      data-scope="appshell"
      data-part="navbar"
      {...rest}
    />
  );
}
