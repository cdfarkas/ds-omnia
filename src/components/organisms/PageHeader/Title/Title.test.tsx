import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'vitest';
import { expect } from 'storybook/test';
import { PageHeaderTitle } from './Title';

test('defaults to an h1, accepts a level and keeps the Heading contract', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<PageHeaderTitle className="custom">Page</PageHeaderTitle>);
  });
  const h1 = container.querySelector('h1') as HTMLHeadingElement;
  expect(h1.getAttribute('data-scope')).toBe('heading');
  expect(h1.classList.contains('custom')).toBe(true);
  await act(async () => {
    root.render(<PageHeaderTitle level={3}>Page</PageHeaderTitle>);
  });
  expect(container.querySelector('h1')).toBeNull();
  expect(container.querySelector('h3')).not.toBeNull();
  await act(async () => root.unmount());
  container.remove();
});
