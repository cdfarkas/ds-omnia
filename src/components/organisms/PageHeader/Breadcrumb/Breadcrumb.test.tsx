import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { test } from 'vitest';
import { expect } from 'storybook/test';
import { PageHeaderBreadcrumb } from './Breadcrumb';

test('renders a role-less div, forwards ref and passes native props', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<HTMLDivElement>();
  await act(async () => {
    root.render(
      <PageHeaderBreadcrumb ref={ref} className="custom" data-testid="b">
        trail
      </PageHeaderBreadcrumb>,
    );
  });
  const el = container.querySelector(
    '[data-scope="page-header"][data-part="breadcrumb"]',
  ) as HTMLDivElement;
  expect(el.tagName).toBe('DIV');
  expect(el.hasAttribute('role')).toBe(false);
  expect(el).toBe(ref.current);
  expect(el.classList.contains('custom')).toBe(true);
  expect(el.getAttribute('data-testid')).toBe('b');
  expect(el.textContent).toBe('trail');
  await act(async () => root.unmount());
  container.remove();
});
