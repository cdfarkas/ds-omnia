import type { PageHeaderBreadcrumbProps } from '../PageHeader';

export function PageHeaderBreadcrumb({ ref, ...rest }: PageHeaderBreadcrumbProps) {
  return <div ref={ref} data-scope="page-header" data-part="breadcrumb" {...rest} />;
}
