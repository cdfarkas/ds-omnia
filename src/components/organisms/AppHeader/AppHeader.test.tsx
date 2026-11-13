import { createRef, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { AppHeader } from './AppHeader';
import * as stories from './AppHeader.stories';

const { BrandOnly, InPageTemplate, Narrow } = composeStories(stories);

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function mount(ui: ReactElement) {
  await act(async () => {
    root.render(ui);
  });
}

const parts = () =>
  [...container.querySelectorAll('[data-scope="app-header"]')].map((el) =>
    el.getAttribute('data-part'),
  );

describe('AppHeader edge cases', () => {
  test('the namespace exposes every part', () => {
    for (const name of ['Brand', 'Nav', 'Actions'] as const)
      expect(typeof AppHeader[name]).toBe('function');
  });

  test('alone it renders no <header> and no banner; every part is a div', async () => {
    await mount(<Narrow />);
    expect(container.querySelector('header, [role="banner"]')).toBeNull();
    expect(within(container).queryAllByRole('banner')).toHaveLength(0);
    expect(parts()).toEqual(['root', 'brand', 'nav', 'actions']);
    for (const el of container.querySelectorAll('[data-scope="app-header"]'))
      expect(el.tagName).toBe('DIV');
  });

  test('inside PageTemplate.Header the page has one banner and one navigation', async () => {
    await mount(<InPageTemplate />);
    const view = within(container);
    expect(view.getAllByRole('banner')).toHaveLength(1);
    expect(view.getAllByRole('navigation')).toHaveLength(1);
    expect(view.getByRole('banner')).toContainElement(
      container.querySelector(
        '[data-scope="app-header"][data-part="root"]',
      ) as HTMLElement,
    );
  });

  test('a brand-only header renders only the root and the brand', async () => {
    await mount(<BrandOnly />);
    expect(parts()).toEqual(['root', 'brand']);
  });

  test('the root forwards ref and native props and merges className', async () => {
    const ref = createRef<HTMLDivElement>();
    await mount(<AppHeader ref={ref} id="top" className="custom" title="Site" />);
    const el = container.querySelector('[data-part="root"]') as HTMLDivElement;
    expect(el).toBe(ref.current);
    expect(el.id).toBe('top');
    expect(el.title).toBe('Site');
    expect(el.classList.contains('custom')).toBe(true);
    expect([...el.classList].filter((c) => c !== 'custom').length).toBeGreaterThan(0);
  });
});
