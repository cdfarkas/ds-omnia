import type { HTMLAttributes, Ref } from 'react';
import styles from './Container.module.css';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  variantSize?: ContainerSize;
  ref?: Ref<HTMLDivElement>;
}

const sizeClass: Record<ContainerSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
  full: styles.full,
};

/**
 * Generic page-width wrapper: caps its content at a `variantSize` max-width, centers it and adds
 * horizontal gutters that widen on larger viewports. Layout only — no colour, no vertical spacing.
 * `variantSize="full"` removes the cap. Renders a `<div>`; pass element semantics (`role`, `aria-*`)
 * through props.
 */
export function Container({
  variantSize = 'md',
  className,
  children,
  ref,
  ...rest
}: ContainerProps) {
  const classes = [styles.root, sizeClass[variantSize], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      data-scope="container"
      data-part="root"
      data-variant-size={variantSize}
      {...rest}
    >
      {children}
    </div>
  );
}
