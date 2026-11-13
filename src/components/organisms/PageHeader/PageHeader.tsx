import {
  Children,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import type { HeadingProps } from '../../atoms/Heading';
import { SectionHeading } from '../../molecules/SectionHeading';
import { PageHeaderBreadcrumb } from './Breadcrumb';
import { PageHeaderTitle } from './Title';
import styles from './PageHeader.module.css';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface PageHeaderBreadcrumbProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface PageHeaderTitleProps extends Omit<HeadingProps, 'level'> {
  /** The document level of the title; a page title is an `<h1>` unless you say otherwise. */
  level?: HeadingProps['level'];
}

const isBreadcrumb = (child: ReactNode) =>
  isValidElement(child) && child.type === PageHeaderBreadcrumb;

function PageHeaderRoot({ className, children, ref, ...rest }: PageHeaderProps) {
  const parts = Children.toArray(children);
  return (
    <div
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-scope="page-header"
      data-part="root"
      {...rest}
    >
      {parts.filter(isBreadcrumb)}
      <SectionHeading>{parts.filter((child) => !isBreadcrumb(child))}</SectionHeading>
    </div>
  );
}

/**
 * Title block at the top of a page's content, placed once inside `PageTemplate.Main`. Renders no
 * landmark. `PageHeader.Breadcrumb` (a direct child, any node) sits above a `SectionHeading` that
 * holds `PageHeader.Title` (an `<h1>` by default), `PageHeader.Description` and `PageHeader.Actions`.
 */
export const PageHeader = Object.assign(PageHeaderRoot, {
  Breadcrumb: PageHeaderBreadcrumb,
  Title: PageHeaderTitle,
  Description: SectionHeading.Description,
  Actions: SectionHeading.Actions,
});
