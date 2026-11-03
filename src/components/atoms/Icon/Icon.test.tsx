import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Icon } from './Icon';
import { IconCatalog } from './catalog';
import * as stories from './Icon.stories';

const { Playground, Decorative } = composeStories(stories);

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
  container.querySelector(`[data-scope="icon"][data-part="${name}"]`);

describe('Icon edge cases', () => {
  test('is decorative by default: aria-hidden, no role, absent from the a11y tree', async () => {
    await mount(<Icon glyph="home" />);
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.getAttribute('aria-hidden')).toBe('true');
    expect(rootEl.getAttribute('role')).toBeNull();
    expect(within(container).queryByRole('img')).toBeNull();
  });

  test('aria-label promotes the icon to a named role="img"', async () => {
    await mount(<Icon glyph="search" aria-label="Search" />);
    const img = within(container).getByRole('img');
    expect(img).toBe(part('root'));
    expect(img).toHaveAccessibleName('Search');
    expect(img.getAttribute('aria-hidden')).toBeNull();
  });

  test('aria-labelledby also promotes to role="img"', async () => {
    await mount(
      <>
        <span id="lbl">Settings</span>
        <Icon glyph="settings" aria-labelledby="lbl" />
      </>,
    );
    const img = within(container).getByRole('img');
    expect(img.getAttribute('aria-hidden')).toBeNull();
    expect(img).toHaveAccessibleName('Settings');
  });

  test('renders both skins and reflects glyph/style on the root', async () => {
    await mount(<Icon glyph="check" variantStyle="solid" />);
    expect(part('glyph-default')?.querySelector('svg')).not.toBeNull();
    expect(part('glyph-pixel')?.querySelector('svg')).not.toBeNull();
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.getAttribute('data-glyph')).toBe('check');
    expect(rootEl.getAttribute('data-variant-style')).toBe('solid');
  });

  test('defaults to variantStyle regular with no size attribute (1em)', async () => {
    await mount(<Icon glyph="home" />);
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.getAttribute('data-variant-style')).toBe('regular');
    expect(rootEl.hasAttribute('data-variant-size')).toBe(false);
  });

  test('variantSize reflects data-variant-size', async () => {
    await mount(<Icon glyph="home" variantSize="lg" />);
    expect(part('root')?.getAttribute('data-variant-size')).toBe('lg');
  });

  test('a caller role wins over the default (defaults precede the spread)', async () => {
    await mount(<Icon glyph="home" aria-label="x" role="presentation" />);
    expect(part('root')?.getAttribute('role')).toBe('presentation');
  });

  test('rest props reach the span and className merges with the module classes', async () => {
    await mount(<Icon glyph="home" id="h" className="custom" />);
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.id).toBe('h');
    expect(rootEl.classList.contains('custom')).toBe(true);
    const moduleClasses = [...rootEl.classList].filter((c) => c !== 'custom');
    expect(moduleClasses.length).toBeGreaterThan(0);
  });

  test('Catalog renders a labelled search and one cell per glyph', async () => {
    await mount(<IconCatalog />);
    const scope = within(container);
    expect(scope.getByRole('textbox', { name: /filter icons by name/i })).not.toBeNull();
    expect(scope.getAllByRole('listitem')).toHaveLength(33);
  });

  test('the Playground story is a named img and Decorative is hidden', async () => {
    await mount(<Playground />);
    expect(within(container).getByRole('img')).toHaveAccessibleName('Home');
    act(() => root.unmount());
    root = createRoot(container);
    await mount(<Decorative />);
    expect(within(container).queryByRole('img')).toBeNull();
  });
});
