import { join, type PageTemplateRegionProps } from '../internal';
import styles from './Footer.module.css';

/** The shell's contentinfo region — renders a `<footer>`. */
export function PageTemplateFooter({ className, ref, ...rest }: PageTemplateRegionProps) {
  return (
    <footer
      ref={ref}
      className={join(styles.footer, className)}
      data-scope="page-template"
      data-part="footer"
      {...rest}
    />
  );
}
