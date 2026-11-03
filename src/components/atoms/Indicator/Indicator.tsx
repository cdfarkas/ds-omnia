import type { HTMLAttributes, Ref } from 'react';
import type { Intent } from '../../../lib/intents';
import styles from './Indicator.module.css';

export type IndicatorSize = 'sm' | 'md';

export interface IndicatorProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'aria-label'
> {
  intent?: Intent;
  variantSize?: IndicatorSize;
  pulse?: boolean;
  'aria-label': string;
  ref?: Ref<HTMLSpanElement>;
}

const sizeClass: Record<IndicatorSize, string> = {
  sm: styles.sm,
  md: styles.md,
};

/**
 * Inline status dot. The root is a `<span role="img">` named by the required `aria-label` (the
 * state, e.g. "Available"), so the state is never colour-only (WCAG 1.4.1); `intent` only tints
 * the dot. A caller whose visible text already states the state passes `aria-hidden` to make it
 * decorative. `pulse` adds a live halo that stops under `prefers-reduced-motion`.
 */
export function Indicator({
  intent = 'neutral',
  variantSize = 'md',
  pulse = false,
  className,
  ref,
  'aria-label': ariaLabel,
  ...rest
}: IndicatorProps) {
  const classes = [styles.root, sizeClass[variantSize], className]
    .filter(Boolean)
    .join(' ');
  const dotClasses = [styles.dot, pulse && styles.pulse].filter(Boolean).join(' ');

  return (
    <span
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      className={classes}
      data-scope="indicator"
      data-part="root"
      data-intent={intent}
      data-variant-size={variantSize}
      data-pulse={pulse || undefined}
      {...rest}
    >
      <span
        className={dotClasses}
        aria-hidden="true"
        data-scope="indicator"
        data-part="dot"
      />
    </span>
  );
}
