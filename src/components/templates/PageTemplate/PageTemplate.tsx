import { useId, type HTMLAttributes, type Ref } from 'react';
import { t } from '../../../lib/i18n';
import { join, MainIdContext } from './internal';
import { PageTemplateHeader } from './Header';
import { PageTemplateNavbar } from './Navbar';
import { PageTemplateMain } from './Main';
import { PageTemplateAside } from './Aside';
import { PageTemplateFooter } from './Footer';
import styles from './PageTemplate.module.css';

export interface PageTemplateProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Generic slot-based page scaffold: a CSS-grid frame whose regions — `PageTemplate.Header`,
 * `PageTemplate.Navbar`, `PageTemplate.Main`, `PageTemplate.Aside`, `PageTemplate.Footer` — render the matching
 * landmark element and are all opt-in except `Main`. Regions stack on a narrow viewport and lay
 * `Navbar | Main | Aside` side by side from `48em`. Carries no content of its own; a skip link to
 * `Main` is rendered first. Consumes semantic tokens only and reskins across the theme and skin axes.
 */
function PageTemplateRoot({ className, children, ref, ...rest }: PageTemplateProps) {
  const mainId = useId();
  return (
    <MainIdContext.Provider value={mainId}>
      <div
        ref={ref}
        className={join(styles.root, className)}
        data-scope="page-template"
        data-part="root"
        {...rest}
      >
        <a className={styles.skipLink} href={`#${mainId}`} data-part="skip-link">
          {t('pageTemplate.skipToContent')}
        </a>
        {children}
      </div>
    </MainIdContext.Provider>
  );
}

export const PageTemplate = Object.assign(PageTemplateRoot, {
  Header: PageTemplateHeader,
  Navbar: PageTemplateNavbar,
  Main: PageTemplateMain,
  Aside: PageTemplateAside,
  Footer: PageTemplateFooter,
});
