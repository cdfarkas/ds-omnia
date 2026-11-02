import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Spinner } from './Spinner';
import * as stories from './Spinner.stories';

const { Playground, Sizes } = composeStories(stories);

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

const part = (name: string) =>
  container.querySelector(`[data-scope="spinner"][data-part="${name}"]`);

describe('Spinner edge cases', () => {
  test('defaults to a md status named by the default loading label', async () => {
    await mount(<Playground />);
    const status = within(container).getByRole('status');
    expect(status).toBe(part('root'));
    expect(status.getAttribute('data-variant-size')).toBe('md');
    expect(status).toHaveAccessibleName(/loading/i);
  });

  test('variantSize reflects data-variant-size', async () => {
    await mount(<Sizes />);
    const sizes = [...container.querySelectorAll('[data-part="root"]')].map((el) =>
      el.getAttribute('data-variant-size'),
    );
    expect(sizes).toEqual(['sm', 'md', 'lg']);
  });

  test('aria-label overrides the accessible name', async () => {
    await mount(<Spinner aria-label="Loading products" />);
    const status = within(container).getByRole('status');
    expect(status).toHaveAccessibleName('Loading products');
  });

  test('the ring is decorative (aria-hidden), not in the accessibility tree', async () => {
    await mount(<Spinner />);
    const ring = part('ring');
    expect(ring?.getAttribute('aria-hidden')).toBe('true');
    expect(within(container).queryAllByRole('img')).toHaveLength(0);
  });

  test('a caller role wins over the default status (defaults precede the spread)', async () => {
    await mount(<Spinner role="presentation" aria-label="x" />);
    expect(part('root')?.getAttribute('role')).toBe('presentation');
  });

  test('aria-hidden makes the whole spinner decorative', async () => {
    await mount(<Spinner aria-hidden="true" />);
    expect(within(container).queryByRole('status')).toBeNull();
  });

  test('rest props reach the span and className merges with the module classes', async () => {
    await mount(<Spinner id="busy" className="custom" />);
    const status = part('root') as HTMLElement;
    expect(status.id).toBe('busy');
    expect(status.classList.contains('custom')).toBe(true);
    const moduleClasses = [...status.classList].filter((c) => c !== 'custom');
    expect(moduleClasses.length).toBeGreaterThan(0);
  });
});
