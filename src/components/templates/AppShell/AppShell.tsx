import { useId, type HTMLAttributes, type Ref } from 'react';
import { t } from '../../../lib/i18n';
import { join, MainIdContext } from './internal';
import { AppShellHeader } from './Header';
import { AppShellNavbar } from './Navbar';
import { AppShellMain } from './Main';
import { AppShellAside } from './Aside';
import { AppShellFooter } from './Footer';
import styles from './AppShell.module.css';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Generic slot-based page scaffold: a CSS-grid frame whose regions — `AppShell.Header`,
 * `AppShell.Navbar`, `AppShell.Main`, `AppShell.Aside`, `AppShell.Footer` — render the matching
 * landmark element and are all opt-in except `Main`. Regions stack on a narrow viewport and lay
 * `Navbar | Main | Aside` side by side from `48em`. Carries no content of its own; a skip link to
 * `Main` is rendered first. Consumes semantic tokens only and reskins across the theme and skin axes.
 */
function AppShellRoot({ className, children, ref, ...rest }: AppShellProps) {
  const mainId = useId();
  return (
    <MainIdContext.Provider value={mainId}>
      <div
        ref={ref}
        className={join(styles.root, className)}
        data-scope="appshell"
        data-part="root"
        {...rest}
      >
        <a className={styles.skipLink} href={`#${mainId}`} data-part="skip-link">
          {t('appShell.skipToContent')}
        </a>
        {children}
      </div>
    </MainIdContext.Provider>
  );
}

export const AppShell = Object.assign(AppShellRoot, {
  Header: AppShellHeader,
  Navbar: AppShellNavbar,
  Main: AppShellMain,
  Aside: AppShellAside,
  Footer: AppShellFooter,
});
