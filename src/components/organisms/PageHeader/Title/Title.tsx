import { SectionHeading } from '../../../molecules/SectionHeading';
import type { PageHeaderTitleProps } from '../PageHeader';

export function PageHeaderTitle({ level = 1, ...rest }: PageHeaderTitleProps) {
  return <SectionHeading.Title level={level} {...rest} />;
}
