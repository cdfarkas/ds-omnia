import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { setLocale } from '../../../lib/i18n';
import { NavBar } from './NavBar';
import * as stories from './NavBar.stories';

const { Playground, Narrow } = composeStories(stories);

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
  setLocale('en');
});

async function mount(ui: ReactElement) {
  await act(async () => {
    root.render(ui);
  });
}

describe('NavBar edge cases', () => {
  test('renders nav > ul > li > a, one item per link', async () => {
    await mount(<Playground />);
    const items = container.querySelectorAll('nav > ul > li');
    expect(items).toHaveLength(4);
    items.forEach((item) => expect(item.firstElementChild?.tagName).toBe('A'));
  });

  test('the default label follows the locale', async () => {
    setLocale('fr');
    await mount(
      <NavBar>
        <NavBar.Link href="#work">Work</NavBar.Link>
      </NavBar>,
    );
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Principale');
  });

  test('a caller aria-label replaces the default', async () => {
    await mount(<Playground aria-label="Footer" />);
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Footer');
  });

  test('a caller aria-current wins over the current default', async () => {
    await mount(
      <NavBar>
        <NavBar.Link href="#work" current aria-current="location">
          Work
        </NavBar.Link>
      </NavBar>,
    );
    expect(container.querySelector('a')?.getAttribute('aria-current')).toBe('location');
  });

  test('the current link gets the thick underline, the others do not', async () => {
    await mount(<Playground />);
    const [current, other] = container.querySelectorAll('a');
    expect(getComputedStyle(current!).textDecorationThickness).not.toBe(
      getComputedStyle(other!).textDecorationThickness,
    );
  });

  test('links wrap instead of overflowing at 320px', async () => {
    await mount(<Narrow />);
    const list = container.querySelector('ul')!;
    expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
    const tops = new Set(
      [...list.querySelectorAll('li')].map((li) => li.getBoundingClientRect().top),
    );
    expect(tops.size).toBeGreaterThan(1);
  });

  test('Link props pass through and className reaches the anchor', async () => {
    await mount(
      <NavBar className="bar">
        <NavBar.Link href="https://example.com" external className="custom" id="ext">
          Example
        </NavBar.Link>
      </NavBar>,
    );
    const anchor = container.querySelector('a')!;
    expect(container.querySelector('nav')?.classList.contains('bar')).toBe(true);
    expect(anchor.id).toBe('ext');
    expect(anchor.classList.contains('custom')).toBe(true);
    expect(anchor.getAttribute('target')).toBe('_blank');
  });
});

describe('NavBar override contract', () => {
  test('exposes data-scope/data-part on root, list and item', async () => {
    await mount(<Playground />);
    expect(
      container.querySelector('[data-scope="navbar"][data-part="root"]')?.tagName,
    ).toBe('NAV');
    expect(
      container.querySelector('[data-scope="navbar"][data-part="list"]')?.tagName,
    ).toBe('UL');
    expect(
      container.querySelectorAll('[data-scope="navbar"][data-part="item"]'),
    ).toHaveLength(4);
  });
});
