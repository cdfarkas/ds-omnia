import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Heading, type HeadingProps } from '../../atoms/Heading';
import { Text, type TextProps } from '../../atoms/Text';
import styles from './SectionHeading.module.css';

export interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface SectionHeadingActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

const merge = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

function SectionHeadingRoot({ className, children, ref, ...rest }: SectionHeadingProps) {
  return (
    <div
      ref={ref}
      className={merge(styles.root, className)}
      data-scope="section-heading"
      data-part="root"
      {...rest}
    >
      {children}
    </div>
  );
}

function Title({ className, ...rest }: HeadingProps) {
  return <Heading className={merge(styles.title, className)} {...rest} />;
}

function Description({ tone = 'muted', className, ...rest }: TextProps) {
  return <Text tone={tone} className={merge(styles.description, className)} {...rest} />;
}

function Actions({ className, children, ref, ...rest }: SectionHeadingActionsProps) {
  return (
    <div
      ref={ref}
      className={merge(styles.actions, className)}
      data-scope="section-heading"
      data-part="actions"
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Title row of a page section or panel. `Title` renders a `Heading` (its `level` stays yours),
 * `Description` a muted `Text`, and `Actions` sits opposite the title once the component itself is
 * wide enough, dropping under the text when narrow.
 */
export const SectionHeading = Object.assign(SectionHeadingRoot, {
  Title,
  Description,
  Actions,
});
