import { join, type PageTemplateRegionProps } from '../internal';
import styles from './Header.module.css';

/** The shell's banner region — renders a `<header>`. */
export function PageTemplateHeader({ className, ref, ...rest }: PageTemplateRegionProps) {
  return (
    <header
      ref={ref}
      className={join(styles.header, className)}
      data-scope="page-template"
      data-part="header"
      {...rest}
    />
  );
}
