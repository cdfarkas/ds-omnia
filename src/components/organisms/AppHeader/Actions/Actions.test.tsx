import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'vitest';
import { expect } from 'storybook/test';
import { AppHeaderActions } from './Actions';

test('renders a div, merges className and forwards ref', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<HTMLDivElement>();
  await act(async () => {
    root.render(<AppHeaderActions ref={ref} className="custom" data-testid="p" />);
  });
  const el = container.querySelector(
    '[data-scope="app-header"][data-part="actions"]',
  ) as HTMLDivElement;
  expect(el.tagName).toBe('DIV');
  expect(el).toBe(ref.current);
  expect(el.classList.contains('custom')).toBe(true);
  expect([...el.classList].some((c) => c !== 'custom')).toBe(true);
  expect(el.getAttribute('data-testid')).toBe('p');
  await act(async () => root.unmount());
  container.remove();
});
