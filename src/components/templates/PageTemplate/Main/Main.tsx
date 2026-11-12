import { useContext } from 'react';
import { join, MainIdContext, type PageTemplateRegionProps } from '../internal';
import styles from './Main.module.css';

/** The shell's main content and skip-link target — renders a `<main>`. */
export function PageTemplateMain({
  className,
  id,
  tabIndex,
  ref,
  ...rest
}: PageTemplateRegionProps) {
  const mainId = useContext(MainIdContext);
  return (
    <main
      ref={ref}
      id={id ?? mainId}
      tabIndex={tabIndex ?? -1}
      className={join(styles.main, className)}
      data-scope="page-template"
      data-part="main"
      {...rest}
    />
  );
}
