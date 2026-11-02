import type { AriaAttributes, SVGAttributes } from 'react';
import { glyphs, type IconGlyph } from './glyphs';
import styles from './Icon.module.css';

export type { IconGlyph };
export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps
  extends
    AriaAttributes,
    Pick<SVGAttributes<SVGSVGElement>, 'className' | 'style' | 'id' | 'role'> {
  /** Which glyph to draw, from the v1 set. */
  glyph: IconGlyph;
  /** `sm`/`md`/`lg` (1/1.5/2rem); unset follows the text size. `size` is native (ADR 0015). */
  variantSize?: IconSize;
}

const sizeClass: Record<IconSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/**
 * Inline SVG glyph from the v1 set, drawn with `currentColor` so it follows the text colour.
 * Decorative by default (`aria-hidden`); passing `aria-label` or `aria-labelledby` makes it a
 * named `role="img"`. Consumes semantic tokens only; `--omnia-icon-color` overrides the colour.
 */
export function Icon({
  glyph,
  variantSize,
  className,
  style,
  id,
  role,
  ...aria
}: IconProps) {
  const labelled = aria['aria-label'] != null || aria['aria-labelledby'] != null;
  const classes = [styles.root, variantSize && sizeClass[variantSize], className]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={classes}
      style={style}
      id={id}
      role={role ?? (labelled ? 'img' : undefined)}
      aria-hidden={labelled ? undefined : true}
      data-scope="icon"
      data-part="root"
      data-variant-size={variantSize}
      {...aria}
    >
      {glyphs[glyph]}
    </svg>
  );
}
