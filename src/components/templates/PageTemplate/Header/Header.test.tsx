import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'vitest';
import { expect } from 'storybook/test';
import { PageTemplateHeader } from './Header';

test('renders a <header> landmark, merges className and forwards ref', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<HTMLElement>();
  await act(async () => {
    root.render(<PageTemplateHeader ref={ref} className="custom" data-testid="h" />);
  });
  const el = container.querySelector(
    '[data-scope="page-template"][data-part="header"]',
  ) as HTMLElement;
  expect(el.tagName).toBe('HEADER');
  expect(el).toBe(ref.current);
  expect(el.classList.contains('custom')).toBe(true);
  expect([...el.classList].some((c) => c !== 'custom')).toBe(true);
  expect(el.getAttribute('data-testid')).toBe('h');
  await act(async () => root.unmount());
  container.remove();
});
