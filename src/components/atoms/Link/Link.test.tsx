import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { Link } from './Link';
import * as stories from './Link.stories';

const { Playground, External } = composeStories(stories);

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

describe('Link edge cases', () => {
  test('defaults to the standalone variant and renders an anchor', async () => {
    await mount(<Link href="/docs">Docs</Link>);
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('data-variant')).toBe('standalone');
    expect(anchor?.getAttribute('href')).toBe('/docs');
  });

  test('inline variant reflects data-variant and drops the standalone weight', async () => {
    await mount(
      <Link href="/docs" variant="inline">
        Docs
      </Link>,
    );
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('data-variant')).toBe('inline');
    expect(getComputedStyle(anchor!).fontWeight).not.toBe('600');
  });

  test('external adds target, rel, a hidden label and a decorative icon', async () => {
    await mount(
      <Link href="https://example.com" external>
        Example
      </Link>,
    );
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(anchor?.textContent).toContain('opens in new window');
    const icon = container.querySelector('svg[aria-hidden="true"]');
    expect(icon).not.toBeNull();
  });

  test('non-external link has no target, rel, icon or hidden label', async () => {
    await mount(<Link href="/docs">Docs</Link>);
    const anchor = container.querySelector('a');
    expect(anchor?.hasAttribute('target')).toBe(false);
    expect(anchor?.hasAttribute('rel')).toBe(false);
    expect(container.querySelector('svg')).toBeNull();
    expect(anchor?.textContent).toBe('Docs');
  });

  test('a caller target overrides the external default (native prop stays passable)', async () => {
    await mount(
      <Link href="https://example.com" external target="_self">
        Example
      </Link>,
    );
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('target')).toBe('_self');
  });

  test('rest props reach the anchor and className merges', async () => {
    await mount(<Playground id="home" title="Home" className="custom" />);
    const anchor = container.querySelector('a');
    expect(anchor?.id).toBe('home');
    expect(anchor?.getAttribute('title')).toBe('Home');
    expect(anchor?.classList.contains('custom')).toBe(true);
    const moduleClasses = [...(anchor?.classList ?? [])].filter((c) => c !== 'custom');
    expect(moduleClasses.length).toBeGreaterThan(0);
  });
});

describe('Link override contract', () => {
  test('exposes data-scope/data-part on the anchor and the external icon', async () => {
    await mount(<External />);
    const anchor = container.querySelector('[data-scope="link"][data-part="link"]');
    const icon = container.querySelector('[data-scope="link"][data-part="icon"]');
    expect(anchor?.tagName).toBe('A');
    expect(anchor?.getAttribute('data-external')).toBe('true');
    expect(icon?.tagName.toLowerCase()).toBe('svg');
  });
});
