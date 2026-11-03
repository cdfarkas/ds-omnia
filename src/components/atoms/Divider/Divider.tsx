import type { HTMLAttributes, Ref } from 'react';
import styles from './Divider.module.css';

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical';
  ref?: Ref<HTMLElement>;
}

/**
 * Rule separating content. Horizontal (default) renders a native `<hr>`; vertical renders a
 * `<div role="separator" aria-orientation="vertical">`, since a native `<hr>` is semantically
 * horizontal-only. Either way it is a semantic separator by default; a caller wanting it purely
 * decorative passes `role="none"` or `aria-hidden` (which also drops `aria-orientation`). Consumes
 * semantic tokens only; the parent layout owns the surrounding spacing, and vertical needs a sized
 * container to fill.
 */
export function Divider({
  orientation = 'horizontal',
  className,
  ref,
  ...rest
}: DividerProps) {
  const classes = [styles.root, orientation === 'vertical' && styles.vertical, className]
    .filter(Boolean)
    .join(' ');

  if (orientation === 'horizontal') {
    return (
      <hr
        ref={ref as Ref<HTMLHRElement>}
        className={classes}
        data-scope="divider"
        data-part="root"
        data-orientation="horizontal"
        {...rest}
      />
    );
  }

  const role = rest.role ?? 'separator';
  return (
    <div
      ref={ref as Ref<HTMLDivElement>}
      className={classes}
      data-scope="divider"
      data-part="root"
      data-orientation="vertical"
      {...rest}
      role={role}
      aria-orientation={role === 'separator' ? 'vertical' : undefined}
    />
  );
}
