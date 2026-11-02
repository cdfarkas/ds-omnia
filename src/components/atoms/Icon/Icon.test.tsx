import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Icon } from './Icon';
import { glyphs } from './glyphs';
import * as stories from './Icon.stories';

const { Playground, AllGlyphs } = composeStories(stories);

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

const rootSvg = () =>
  container.querySelector('[data-scope="icon"][data-part="root"]') as SVGSVGElement;

describe('Icon edge cases', () => {
  test('decorative by default: aria-hidden, no role, not in the accessibility tree', async () => {
    await mount(<Icon glyph="sun" />);
    const svg = rootSvg();
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBeNull();
    expect(within(container).queryByRole('img')).toBeNull();
  });

  test('aria-label makes it a named img and drops aria-hidden', async () => {
    await mount(<Icon glyph="github" aria-label="GitHub" />);
    const img = within(container).getByRole('img', { name: 'GitHub' });
    expect(img).toBe(rootSvg());
    expect(img.getAttribute('aria-hidden')).toBeNull();
  });

  test('aria-labelledby also makes it a meaningful img', async () => {
    await mount(
      <>
        <span id="lbl">Moon</span>
        <Icon glyph="moon" aria-labelledby="lbl" />
      </>,
    );
    const img = within(container).getByRole('img', { name: 'Moon' });
    expect(img.getAttribute('aria-hidden')).toBeNull();
  });

  test('a caller role wins over the default (defaults precede the spread)', async () => {
    await mount(<Icon glyph="sun" role="presentation" />);
    expect(rootSvg().getAttribute('role')).toBe('presentation');
  });

  test('variantSize reflects data-variant-size; unset follows the text (no attribute)', async () => {
    await mount(<AllGlyphs variantSize="md" />);
    const sizes = [...container.querySelectorAll('[data-part="root"]')].map((el) =>
      el.getAttribute('data-variant-size'),
    );
    expect(new Set(sizes)).toEqual(new Set(['md']));

    await mount(<Icon glyph="sun" />);
    expect(rootSvg().getAttribute('data-variant-size')).toBeNull();
  });

  test('every v1 glyph renders svg content', async () => {
    for (const glyph of Object.keys(glyphs) as (keyof typeof glyphs)[]) {
      await mount(<Icon glyph={glyph} aria-label={glyph} />);
      expect(rootSvg().childElementCount).toBeGreaterThan(0);
    }
  });

  test('id and className merge with the module classes on the svg', async () => {
    await mount(<Icon glyph="bluesky" id="brand" className="custom" />);
    const svg = rootSvg();
    expect(svg.id).toBe('brand');
    expect(svg.classList.contains('custom')).toBe(true);
    const moduleClasses = [...svg.classList].filter((c) => c !== 'custom');
    expect(moduleClasses.length).toBeGreaterThan(0);
  });

  test('the Playground story is a named img', async () => {
    await mount(<Playground />);
    expect(within(container).getByRole('img', { name: 'GitHub' })).toBeTruthy();
  });
});
