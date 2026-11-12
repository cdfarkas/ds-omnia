import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'vitest';
import { expect } from 'storybook/test';
import { CardFooter } from './Footer';

test('renders a div, merges className and forwards ref', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<HTMLDivElement>();
  await act(async () => {
    root.render(<CardFooter ref={ref} className="custom" data-testid="f" />);
  });
  const el = container.querySelector(
    '[data-scope="card"][data-part="footer"]',
  ) as HTMLDivElement;
  expect(el.tagName).toBe('DIV');
  expect(el).toBe(ref.current);
  expect(el.classList.contains('custom')).toBe(true);
  expect([...el.classList].some((c) => c !== 'custom')).toBe(true);
  expect(el.getAttribute('data-testid')).toBe('f');
  await act(async () => root.unmount());
  container.remove();
});
