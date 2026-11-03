import type { HTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Heading.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** The semantic document level, rendered as the matching `<h1>`–`<h6>`. */
  level: HeadingLevel;
  /** The visual size, decoupled from `level`; defaults to the level's own step. */
  variantSize?: HeadingSize;
  children: ReactNode;
  ref?: Ref<HTMLHeadingElement>;
}

const defaultSizeForLevel: Record<HeadingLevel, HeadingSize> = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'md',
  5: 'sm',
  6: 'xs',
};

const sizeClass: Record<HeadingSize, string> = {
  xs: styles.xs,
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
  '2xl': styles.xxl,
};

/**
 * Section heading. `level` picks the real `<h1>`–`<h6>` for the document outline; `variantSize`
 * sets the visual size independently, so semantic level and appearance are decoupled. Type is
 * token-driven and reskins across the theme and skin axes (the display serif in neutral, the pixel
 * font in the pixel skin).
 */
export function Heading({
  level,
  variantSize,
  className,
  children,
  ref,
  ...rest
}: HeadingProps) {
  const size = variantSize ?? defaultSizeForLevel[level];
  const Tag = `h${level}` as const;
  const classes = [styles.heading, sizeClass[size], className].filter(Boolean).join(' ');

  return (
    <Tag
      ref={ref}
      className={classes}
      data-scope="heading"
      data-part="root"
      data-level={level}
      data-variant-size={size}
      {...rest}
    >
      {children}
    </Tag>
  );
}
