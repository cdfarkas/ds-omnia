import type { Ref, TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variantSize?: TextareaSize;
  /** Sets `aria-invalid="true"` and the danger border. */
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

const sizeClass: Record<TextareaSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/**
 * Bare multi-line text control; label, hint and error belong to a wrapping field. Renders the
 * native `<textarea>` with no wrapper: every prop, `className`, `style` and `ref` included, lands
 * on it. Users resize it on both axes, within its parent.
 */
export function Textarea({
  variantSize = 'md',
  invalid = false,
  disabled = false,
  readOnly = false,
  className,
  ...rest
}: TextareaProps) {
  const classes = [styles.root, sizeClass[variantSize], className]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      className={classes}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={invalid || undefined}
      data-scope="textarea"
      data-part="root"
      data-size={variantSize}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      {...rest}
    />
  );
}
