import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'vitest';
import { expect } from 'storybook/test';
import { AppShellMain } from './Main';

test('renders a <main> that defaults to a -1 skip target and yields to caller id/tabIndex', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const main = () => container.querySelector('[data-part="main"]') as HTMLElement;
  await act(async () => {
    root.render(<AppShellMain />);
  });
  expect(main().tagName).toBe('MAIN');
  expect(main().getAttribute('tabindex')).toBe('-1');
  await act(async () => {
    root.render(<AppShellMain id="content" tabIndex={0} />);
  });
  expect(main().id).toBe('content');
  expect(main().getAttribute('tabindex')).toBe('0');
  await act(async () => root.unmount());
  container.remove();
});
