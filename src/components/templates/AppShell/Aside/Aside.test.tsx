import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'vitest';
import { expect } from 'storybook/test';
import { AppShellAside } from './Aside';

test('renders an <aside> landmark, merges className and forwards ref', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<HTMLElement>();
  await act(async () => {
    root.render(<AppShellAside ref={ref} className="custom" data-testid="a" />);
  });
  const el = container.querySelector(
    '[data-scope="appshell"][data-part="aside"]',
  ) as HTMLElement;
  expect(el.tagName).toBe('ASIDE');
  expect(el).toBe(ref.current);
  expect(el.classList.contains('custom')).toBe(true);
  expect([...el.classList].some((c) => c !== 'custom')).toBe(true);
  expect(el.getAttribute('data-testid')).toBe('a');
  await act(async () => root.unmount());
  container.remove();
});
