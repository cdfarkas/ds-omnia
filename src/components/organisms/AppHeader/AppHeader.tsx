import type { HTMLAttributes, Ref } from 'react';
import { join } from './internal';
import { AppHeaderBrand } from './Brand';
import { AppHeaderNav } from './Nav';
import { AppHeaderActions } from './Actions';
import styles from './AppHeader.module.css';

export interface AppHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface AppHeaderBrandProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface AppHeaderNavProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface AppHeaderActionsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Global app header: `AppHeader.Brand` at the start, `AppHeader.Nav` (holding a `NavBar`) and
 * `AppHeader.Actions` (switchers, buttons) at the end, wrapping onto new lines when the row runs
 * out of width. Every part is a plain `<div>`: mount it inside `PageTemplate.Header`, which renders
 * the one `<header>` banner landmark. Consumes semantic tokens only.
 */
function AppHeaderRoot({ className, ref, ...rest }: AppHeaderProps) {
  return (
    <div
      ref={ref}
      className={join(styles.root, className)}
      data-scope="app-header"
      data-part="root"
      {...rest}
    />
  );
}

export const AppHeader = Object.assign(AppHeaderRoot, {
  Brand: AppHeaderBrand,
  Nav: AppHeaderNav,
  Actions: AppHeaderActions,
});
