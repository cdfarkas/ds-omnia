import type { HTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Text.module.css';

export type TextElement = 'p' | 'span';
export type TextSize = 'sm' | 'md' | 'lg';
export type TextTone = 'default' | 'muted';

export interface TextProps extends HTMLAttributes<
  HTMLParagraphElement | HTMLSpanElement
> {
  as?: TextElement;
  variantSize?: TextSize;
  tone?: TextTone;
  children: ReactNode;
  ref?: Ref<HTMLParagraphElement | HTMLSpanElement>;
}

const sizeClass: Record<TextSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/**
 * Body and inline text. `as` picks the element (`<p>` block or `<span>` inline). `tone` maps to
 * `--omnia-color-text-primary` or `--omnia-color-text-muted`; the muted tone still meets WCAG
 * contrast. Type is token-driven and reskins across the theme and skin axes, staying sans in both
 * skins.
 */
export function Text({
  as = 'p',
  variantSize = 'md',
  tone = 'default',
  className,
  children,
  ref,
  ...rest
}: TextProps) {
  const Tag = as;
  const classes = [styles.text, sizeClass[variantSize], className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      ref={ref as Ref<HTMLParagraphElement>}
      className={classes}
      data-scope="text"
      data-part="root"
      data-variant-size={variantSize}
      data-tone={tone}
      {...rest}
    >
      {children}
    </Tag>
  );
}
