import { createContext, type HTMLAttributes, type Ref } from 'react';

/** Props shared by every opt-in region: native HTML attributes plus a forwarded `ref`. */
export interface PageTemplateRegionProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
}

/** Carries the root's generated `Main` id so the skip link and `PageTemplate.Main` agree on it. */
export const MainIdContext = createContext<string | undefined>(undefined);

export const join = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(' ');
