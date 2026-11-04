import type { HTMLAttributes, ReactNode } from 'react';
import { t } from '../../../lib/i18n';
import { Link, type LinkProps } from '../../atoms/Link';
import styles from './NavBar.module.css';

export interface NavBarProps extends HTMLAttributes<HTMLElement> {
  /** `NavBar.Link` parts; each renders as an item of the bar's list. */
  children: ReactNode;
}

export interface NavBarLinkProps extends Omit<LinkProps, 'variant'> {
  /** Marks the link to the page being shown (`aria-current="page"`); a caller `aria-current` wins. */
  current?: boolean;
}

function NavBarRoot({ children, ...rest }: NavBarProps) {
  return (
    <nav aria-label={t('navBar.label')} data-scope="navbar" data-part="root" {...rest}>
      <ul className={styles.list} data-scope="navbar" data-part="list">
        {children}
      </ul>
    </nav>
  );
}

function NavBarLink({ current = false, ...rest }: NavBarLinkProps) {
  return (
    <li className={styles.item} data-scope="navbar" data-part="item">
      <Link aria-current={current ? 'page' : undefined} {...rest} />
    </li>
  );
}

/**
 * Navigation bar: a labelled `<nav>` holding a list of `NavBar.Link` parts, each a standalone
 * `Link`. Links wrap onto new lines on narrow screens; the current page's link is marked.
 */
export const NavBar = Object.assign(NavBarRoot, { Link: NavBarLink });
