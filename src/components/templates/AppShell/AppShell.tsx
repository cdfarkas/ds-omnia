import { createContext, useContext, useId, type HTMLAttributes, type Ref } from 'react';
import { t } from '../../../lib/i18n';
import styles from './AppShell.module.css';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface AppShellRegionProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
}

const join = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

const MainIdContext = createContext<string | undefined>(undefined);

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

function AppShellHeader({ className, ref, ...rest }: AppShellRegionProps) {
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

function AppShellNavbar({ className, ref, ...rest }: AppShellRegionProps) {
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

function AppShellMain({ className, id, tabIndex, ref, ...rest }: AppShellRegionProps) {
  const mainId = useContext(MainIdContext);
  return (
    <main
      ref={ref}
      id={id ?? mainId}
      tabIndex={tabIndex ?? -1}
      className={join(styles.main, className)}
      data-scope="appshell"
      data-part="main"
      {...rest}
    />
  );
}

function AppShellAside({ className, ref, ...rest }: AppShellRegionProps) {
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

function AppShellFooter({ className, ref, ...rest }: AppShellRegionProps) {
  return (
    <footer
      ref={ref}
      className={join(styles.footer, className)}
      data-scope="appshell"
      data-part="footer"
      {...rest}
    />
  );
}

export const AppShell = Object.assign(AppShellRoot, {
  Header: AppShellHeader,
  Navbar: AppShellNavbar,
  Main: AppShellMain,
  Aside: AppShellAside,
  Footer: AppShellFooter,
});
