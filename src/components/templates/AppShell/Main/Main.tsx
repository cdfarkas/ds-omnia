import { useContext } from 'react';
import { join, MainIdContext, type AppShellRegionProps } from '../internal';
import styles from './Main.module.css';

/** The shell's main content and skip-link target — renders a `<main>`. */
export function AppShellMain({
  className,
  id,
  tabIndex,
  ref,
  ...rest
}: AppShellRegionProps) {
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
