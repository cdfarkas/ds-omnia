import type { HTMLAttributes } from 'react';
import { t } from '../../../lib/i18n';
import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  variantSize?: SpinnerSize;
}

const sizeClass: Record<SpinnerSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/**
 * Indeterminate loading indicator. `role="status"` exposes a polite live region named by a
 * visually hidden `t('spinner.loading')`; a caller's `aria-label` overrides that name and
 * `aria-hidden` makes it decorative. Consumes semantic tokens only; the ring uses `currentColor`.
 */
export function Spinner({ variantSize = 'md', className, ...rest }: SpinnerProps) {
  const classes = [styles.root, sizeClass[variantSize], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      role="status"
      aria-label={t('spinner.loading')}
      className={classes}
      data-scope="spinner"
      data-part="root"
      data-variant-size={variantSize}
      {...rest}
    >
      <span
        className={styles.ring}
        aria-hidden="true"
        data-scope="spinner"
        data-part="ring"
      />
      <span className={styles.srOnly}>{t('spinner.loading')}</span>
    </span>
  );
}
