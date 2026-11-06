import { useState, type HTMLAttributes, type Ref } from 'react';
import { Icon } from '../Icon';
import styles from './Avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt: string;
  initials?: string;
  variantSize?: AvatarSize;
  ref?: Ref<HTMLSpanElement>;
}

const sizeClass: Record<AvatarSize, string> = {
  xs: styles.xs,
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
};

/**
 * Circular identity picture: the `src` image, else `initials`, else a neutral user icon. `alt`
 * names it in every state; `alt=""` hides it from assistive technology as decorative.
 */
export function Avatar({
  src,
  alt,
  initials,
  variantSize = 'md',
  className,
  ref,
  ...rest
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = Boolean(src) && src !== failedSrc;
  const classes = [styles.root, sizeClass[variantSize], className]
    .filter(Boolean)
    .join(' ');
  const fallbackA11y = alt
    ? { role: 'img', 'aria-label': alt }
    : { 'aria-hidden': true as const };

  return (
    <span
      ref={ref}
      className={classes}
      data-scope="avatar"
      data-part="root"
      data-variant-size={variantSize}
      {...(showImage ? undefined : fallbackA11y)}
      {...rest}
    >
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt={alt}
          data-scope="avatar"
          data-part="image"
          onError={() => setFailedSrc(src)}
        />
      ) : initials ? (
        <span
          className={styles.initials}
          aria-hidden="true"
          data-scope="avatar"
          data-part="initials"
        >
          {initials}
        </span>
      ) : (
        <Icon
          glyph="user"
          className={styles.placeholder}
          data-scope="avatar"
          data-part="placeholder"
        />
      )}
    </span>
  );
}
