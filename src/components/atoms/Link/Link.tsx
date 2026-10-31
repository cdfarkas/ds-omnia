import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { t } from '../../../lib/i18n';
import styles from './Link.module.css';

export type LinkVariant = 'inline' | 'standalone';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: LinkVariant;
  /**
   * Opens the link in a new window: sets `target`/`rel` defaults, a hidden "opens in
   * new window" label and a decorative trailing icon. A new DS prop, not native `target`.
   */
  external?: boolean;
  children: ReactNode;
}

const variantClass: Record<LinkVariant, string> = {
  inline: styles.inline,
  standalone: styles.standalone,
};

/** External-link glyph: decorative, inherits the link colour via currentColor. */
const ExternalIcon = () => (
  <svg
    className={styles.icon}
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    data-scope="link"
    data-part="icon"
  >
    <path d="M6 3H3v10h10v-3" />
    <path d="M9 3h4v4" />
    <path d="m13 3-6 6" />
  </svg>
);

/** Text link rendering a native `<a>`. Consumes semantic tokens only; themes/skins reskin it. */
export function Link({
  href,
  variant = 'standalone',
  external = false,
  className,
  children,
  ...rest
}: LinkProps) {
  const classes = [styles.link, variantClass[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href={href}
      className={classes}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      data-scope="link"
      data-part="link"
      data-variant={variant}
      data-external={external || undefined}
      {...rest}
    >
      {children}
      {external ? (
        <>
          <span className={styles.srOnly}>{t('link.external')}</span>
          <ExternalIcon />
        </>
      ) : null}
    </a>
  );
}
