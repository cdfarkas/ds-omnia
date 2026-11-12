import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'vitest';
import { expect } from 'storybook/test';
import { AppShellNavbar } from './Navbar';
import { t } from '../../../../lib/i18n';

test('renders a <nav> with a default accessible label a caller can override', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const nav = () => container.querySelector('[data-part="navbar"]') as HTMLElement;
  await act(async () => {
    root.render(<AppShellNavbar />);
  });
  expect(nav().tagName).toBe('NAV');
  expect(nav().getAttribute('aria-label')).toBe(t('appShell.navbarLabel'));
  await act(async () => {
    root.render(<AppShellNavbar aria-label="Sections" />);
  });
  expect(nav().getAttribute('aria-label')).toBe('Sections');
  await act(async () => root.unmount());
  container.remove();
});
