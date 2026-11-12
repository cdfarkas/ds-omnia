import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'vitest';
import { expect } from 'storybook/test';
import { AppShellFooter } from './Footer';

test('renders a <footer> landmark, merges className and forwards ref', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<HTMLElement>();
  await act(async () => {
    root.render(<AppShellFooter ref={ref} className="custom" data-testid="f" />);
  });
  const el = container.querySelector(
    '[data-scope="appshell"][data-part="footer"]',
  ) as HTMLElement;
  expect(el.tagName).toBe('FOOTER');
  expect(el).toBe(ref.current);
  expect(el.classList.contains('custom')).toBe(true);
  expect([...el.classList].some((c) => c !== 'custom')).toBe(true);
  expect(el.getAttribute('data-testid')).toBe('f');
  await act(async () => root.unmount());
  container.remove();
});
