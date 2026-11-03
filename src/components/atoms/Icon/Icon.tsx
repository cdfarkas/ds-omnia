import type { AriaAttributes, HTMLAttributes } from 'react';
import { glyphMap, type IconGlyph, type IconStyle } from './glyphMap';
import styles from './Icon.module.css';

export type { IconGlyph, IconStyle } from './glyphMap';
export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps
  extends
    AriaAttributes,
    Pick<HTMLAttributes<HTMLSpanElement>, 'className' | 'style' | 'id' | 'role'> {
  glyph: IconGlyph;
  variantStyle?: IconStyle;
  variantSize?: IconSize;
}

const sizeClass: Record<IconSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/**
 * Semantic glyph rendering the active skin's SVG via `currentColor`. Decorative by default
 * (`aria-hidden`); an `aria-label`/`aria-labelledby` makes it a labelled `role="img"`. Both
 * skins' SVGs ship and CSS shows the one matching the `[data-skin]` ancestor (ADR 0020).
 */
export function Icon({
  glyph,
  variantStyle = 'regular',
  variantSize,
  className,
  ...rest
}: IconProps) {
  const labelled = rest['aria-label'] != null || rest['aria-labelledby'] != null;
  const classes = [styles.root, variantSize && sizeClass[variantSize], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classes}
      data-scope="icon"
      data-part="root"
      data-glyph={glyph}
      data-variant-style={variantStyle}
      data-variant-size={variantSize}
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      {...rest}
    >
      <span
        className={styles.default}
        aria-hidden="true"
        data-scope="icon"
        data-part="glyph-default"
        dangerouslySetInnerHTML={{ __html: glyphMap.default[variantStyle][glyph] }}
      />
      <span
        className={styles.pixel}
        aria-hidden="true"
        data-scope="icon"
        data-part="glyph-pixel"
        dangerouslySetInnerHTML={{ __html: glyphMap.pixel[variantStyle][glyph] }}
      />
    </span>
  );
}
