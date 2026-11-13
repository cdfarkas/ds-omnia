import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useState,
  type HTMLAttributes,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
} from 'react';
import { t } from '../../../lib/i18n';
import { useTheme } from '../../../lib/OmniaThemeProvider';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
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
 * `AppHeader.Actions` (switchers, buttons) at the end. Below `48em` the brand stays and a "Menu"
 * disclosure button shows or hides a panel holding every other part; Escape, a link, an outside
 * click or focus leaving the header closes it.
 * `AppHeader.Brand` must be a direct child to stay outside that panel. Every part is a plain
 * `<div>`: mount it inside `PageTemplate.Header`, which renders the one `<header>` banner landmark.
 */
function AppHeaderRoot({ className, children, ref, ...rest }: AppHeaderProps) {
  const { locale } = useTheme();
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonId = `${id}-menu`;
  const panelId = `${id}-panel`;
  const items = Children.toArray(children);
  const isBrand = (child: unknown) =>
    isValidElement(child) && child.type === AppHeaderBrand;
  const others = items.filter((child) => !isBrand(child));

  const root = () => document.getElementById(panelId)?.parentElement;

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!root()?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  });

  const closeOnFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && !root()?.contains(next)) setOpen(false);
  };
  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !open) return;
    setOpen(false);
    document.getElementById(buttonId)?.focus();
  };
  const closeOnLink = (event: MouseEvent) => {
    if ((event.target as Element).closest('a[href]')) setOpen(false);
  };

  return (
    <div
      ref={ref}
      className={join(styles.root, className)}
      data-scope="app-header"
      data-part="root"
      {...rest}
    >
      {items.filter(isBrand)}
      {others.length > 0 && (
        <>
          <div
            className={styles.toggle}
            onKeyDown={closeOnEscape}
            onBlur={closeOnFocusOut}
          >
            <Button
              id={buttonId}
              intent="neutral"
              variantSize="sm"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen(!open)}
            >
              <Icon glyph={open ? 'close' : 'menu'} variantSize="sm" />
              {t('appHeader.menu', locale)}
            </Button>
          </div>
          <div
            id={panelId}
            className={styles.panel}
            data-scope="app-header"
            data-part="panel"
            data-state={open ? 'open' : 'closed'}
            onKeyDown={closeOnEscape}
            onBlur={closeOnFocusOut}
            onClick={closeOnLink}
          >
            {others}
          </div>
        </>
      )}
    </div>
  );
}

export const AppHeader = Object.assign(AppHeaderRoot, {
  Brand: AppHeaderBrand,
  Nav: AppHeaderNav,
  Actions: AppHeaderActions,
});
