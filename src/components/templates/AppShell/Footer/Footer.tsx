import { join, type AppShellRegionProps } from '../internal';
import styles from './Footer.module.css';

/** The shell's contentinfo region — renders a `<footer>`. */
export function AppShellFooter({ className, ref, ...rest }: AppShellRegionProps) {
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
