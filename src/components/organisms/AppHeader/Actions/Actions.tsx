import { join } from '../internal';
import type { AppHeaderActionsProps } from '../AppHeader';
import styles from './Actions.module.css';

export function AppHeaderActions({ className, ref, ...rest }: AppHeaderActionsProps) {
  return (
    <div
      ref={ref}
      className={join(styles.actions, className)}
      data-scope="app-header"
      data-part="actions"
      {...rest}
    />
  );
}
