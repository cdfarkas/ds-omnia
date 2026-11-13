import { t } from '../../../../lib/i18n';
import { join, type PageTemplateRegionProps } from '../internal';
import styles from './Navbar.module.css';

/** The shell's primary navigation — renders a `<nav>` with a default accessible label. */
export function PageTemplateNavbar({ className, ref, ...rest }: PageTemplateRegionProps) {
  return (
    <nav
      ref={ref}
      aria-label={t('pageTemplate.navbarLabel')}
      className={join(styles.navbar, className)}
      data-scope="page-template"
      data-part="navbar"
      {...rest}
    />
  );
}
