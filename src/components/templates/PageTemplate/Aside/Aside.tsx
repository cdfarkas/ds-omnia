import { join, type PageTemplateRegionProps } from '../internal';
import styles from './Aside.module.css';

/** The shell's complementary region — renders an `<aside>`. */
export function PageTemplateAside({ className, ref, ...rest }: PageTemplateRegionProps) {
  return (
    <aside
      ref={ref}
      className={join(styles.aside, className)}
      data-scope="page-template"
      data-part="aside"
      {...rest}
    />
  );
}
