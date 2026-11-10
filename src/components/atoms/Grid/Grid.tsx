import type { CSSProperties, HTMLAttributes, Ref } from 'react';
import styles from './Grid.module.css';

export type GridGap = 'none' | 'sm' | 'md' | 'lg';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
  gap?: GridGap;
  ref?: Ref<HTMLDivElement>;
}

const gapClass: Record<GridGap, string> = {
  none: styles.gapNone,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
};

/**
 * Generic responsive grid: lays children in up to `columns` equal columns with a `gap`, reflowing
 * to fewer columns (down to one) as its own width shrinks. Layout only — no colour, no spacing above
 * or below. Renders a `<div>`; pass element semantics (`role`, `aria-*`) through props.
 */
export function Grid({
  columns = 3,
  gap = 'md',
  className,
  style,
  children,
  ref,
  ...rest
}: GridProps) {
  const cols = Math.max(1, Math.floor(columns));
  const classes = [styles.root, gapClass[gap], className].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{ '--omnia-grid-columns': cols, ...style } as CSSProperties}
      data-scope="grid"
      data-part="root"
      data-columns={cols}
      data-gap={gap}
      {...rest}
    >
      {children}
    </div>
  );
}
