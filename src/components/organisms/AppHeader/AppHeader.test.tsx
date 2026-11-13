import { createRef, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { AppHeader } from './AppHeader';
import * as stories from './AppHeader.stories';

const { BrandOnly, InPageTemplate, Narrow } = composeStories(stories);

const menu = () => within(container).getByRole('button', { name: 'Menu' });
const panel = () =>
  container.querySelector('[data-scope="app-header"][data-part="panel"]') as HTMLElement;

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
    expect(parts()).toEqual(['root', 'brand', 'panel', 'nav', 'actions']);
    for (const el of container.querySelectorAll('[data-scope="app-header"]'))
      expect(el.tagName).toBe('DIV');
  });

  test('inside PageTemplate.Header the page has one banner and one navigation, menu open', async () => {
    await mount(<InPageTemplate />);
    const view = within(container);
    await act(async () => menu().click());
    expect(view.getAllByRole('banner')).toHaveLength(1);
    expect(view.getAllByRole('navigation')).toHaveLength(1);
    expect(view.getByRole('banner')).toContainElement(
      container.querySelector(
        '[data-scope="app-header"][data-part="root"]',
      ) as HTMLElement,
    );
  });

  test('a brand-only header renders only the root and the brand, with no menu button', async () => {
    await mount(<BrandOnly />);
    expect(parts()).toEqual(['root', 'brand']);
    expect(container.querySelector('button')).toBeNull();
  });

  test('the menu button toggles aria-expanded and controls the panel', async () => {
    await mount(<Narrow />);
    expect(menu()).toHaveAttribute('aria-controls', panel().id);
    expect(menu()).toHaveAttribute('aria-expanded', 'false');
    expect(panel()).toHaveAttribute('data-state', 'closed');
    await act(async () => menu().click());
    expect(menu()).toHaveAttribute('aria-expanded', 'true');
    expect(panel()).toHaveAttribute('data-state', 'open');
    await act(async () => menu().click());
    expect(menu()).toHaveAttribute('aria-expanded', 'false');
  });

  test('activating a link closes the panel; clicking a switcher in it does not', async () => {
    await mount(<Narrow />);
    await act(async () => menu().click());
    await act(async () => within(panel()).getAllByRole('button')[0].click());
    expect(menu()).toHaveAttribute('aria-expanded', 'true');
    await act(async () => within(panel()).getByRole('link', { name: 'About' }).click());
    expect(menu()).toHaveAttribute('aria-expanded', 'false');
  });

  test('only Escape closes the panel, and Escape on a closed panel moves no focus', async () => {
    await mount(<Narrow />);
    const press = (target: HTMLElement, key: string) =>
      act(async () => {
        target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      });
    await act(async () => menu().click());
    const link = within(container).getByRole('link', { name: 'Work' });
    link.focus();
    await press(link, 'Enter');
    expect(menu()).toHaveAttribute('aria-expanded', 'true');
    await press(link, 'Escape');
    expect(menu()).toHaveAttribute('aria-expanded', 'false');
    expect(menu()).toHaveFocus();
    const brand = within(container).getByRole('link', { name: 'Omnia' });
    brand.focus();
    await press(menu(), 'Escape');
    expect(brand).toHaveFocus();
  });

  test('a pointerdown outside the header closes the panel without moving focus', async () => {
    await mount(<Narrow />);
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    await act(async () => menu().click());
    menu().focus();
    await act(async () => {
      panel().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    expect(menu()).toHaveAttribute('aria-expanded', 'true');
    await act(async () => {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    expect(menu()).toHaveAttribute('aria-expanded', 'false');
    expect(menu()).toHaveFocus();
    outside.remove();
  });

  test('focus leaving the header closes the panel; moving inside it does not', async () => {
    await mount(<Narrow />);
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    await act(async () => menu().click());
    await act(async () => within(container).getByRole('link', { name: 'Work' }).focus());
    await act(async () => within(panel()).getAllByRole('button')[0].focus());
    expect(menu()).toHaveAttribute('aria-expanded', 'true');
    await act(async () => outside.focus());
    expect(menu()).toHaveAttribute('aria-expanded', 'false');
    outside.remove();
  });

  test('in the open mobile panel the links stack full width with 44px tap targets', async () => {
    await mount(<Narrow />);
    await act(async () => menu().click());
    const links = within(panel()).getAllByRole('link');
    const boxes = links.map((link) => link.getBoundingClientRect());
    for (const box of boxes) expect(box.height).toBeGreaterThanOrEqual(44);
    for (let i = 1; i < boxes.length; i++)
      expect(boxes[i].top).toBeGreaterThanOrEqual(boxes[i - 1].bottom);
    expect(boxes[0].width).toBeCloseTo(panel().getBoundingClientRect().width, 0);
  });

  test('a brand wrapped in another element lands in the panel with the rest', async () => {
    await mount(
      <AppHeader>
        <div>
          <AppHeader.Brand>Omnia</AppHeader.Brand>
        </div>
        <AppHeader.Actions>x</AppHeader.Actions>
      </AppHeader>,
    );
    expect(panel()).toContainElement(container.querySelector('[data-part="brand"]'));
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
