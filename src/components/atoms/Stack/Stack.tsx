import type { CSSProperties, HTMLAttributes, Ref } from 'react';
import styles from './Stack.module.css';

export type StackDirection = 'row' | 'column';
export type StackGap = 'none' | 'sm' | 'md' | 'lg';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: StackDirection;
  gap?: StackGap;
  alignItems?: StackAlign;
  justify?: StackJustify;
  ref?: Ref<HTMLDivElement>;
}

const directionClass: Record<StackDirection, string> = {
  row: styles.row,
  column: styles.column,
};

const gapClass: Record<StackGap, string> = {
  none: styles.gapNone,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
};

const justifyValue: Record<StackJustify, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  between: 'space-between',
};

/**
 * Generic one-direction stack: lays children in a `row` or `column` with a consistent `gap`, and
 * optionally aligns them along each axis (`alignItems` cross-axis, `justify` main-axis). Layout
 * only — no colour, no spacing above or below. Renders a `<div>`; pass element semantics through.
 */
export function Stack({
  direction = 'column',
  gap = 'md',
  alignItems,
  justify,
  className,
  style,
  children,
  ref,
  ...rest
}: StackProps) {
  const classes = [styles.root, directionClass[direction], gapClass[gap], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={
        {
          ...(alignItems ? { '--omnia-stack-align': alignItems } : null),
          ...(justify ? { '--omnia-stack-justify': justifyValue[justify] } : null),
          ...style,
        } as CSSProperties
      }
      data-scope="stack"
      data-part="root"
      data-direction={direction}
      data-gap={gap}
      data-align={alignItems}
      data-justify={justify}
      {...rest}
    >
      {children}
    </div>
  );
}
