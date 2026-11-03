import type { ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Indicator } from './Indicator';
import * as stories from './Indicator.stories';
import '../../../styles/tokens.css';

const { Sizes } = composeStories(stories);

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
  container.querySelector(`[data-scope="indicator"][data-part="${name}"]`);

describe('Indicator edge cases', () => {
  test('renders an img named by the required aria-label with data-intent', async () => {
    await mount(<Indicator intent="success" aria-label="Available" />);
    const img = within(container).getByRole('img');
    expect(img).toBe(part('root'));
    expect(img).toHaveAccessibleName('Available');
    expect(img.getAttribute('data-intent')).toBe('success');
  });

  test('intent drives the dot colour via the inherited intent token', async () => {
    await mount(
      <>
        <Indicator intent="success" aria-label="ok" />
        <Indicator intent="danger" aria-label="down" />
      </>,
    );
    const [ok, down] = [
      ...container.querySelectorAll('[data-part="dot"]'),
    ] as HTMLElement[];
    expect(getComputedStyle(ok).backgroundColor).not.toBe(
      getComputedStyle(down).backgroundColor,
    );
  });

  test('variantSize reflects data-variant-size', async () => {
    await mount(<Sizes />);
    const sizes = [...container.querySelectorAll('[data-part="root"]')].map((el) =>
      el.getAttribute('data-variant-size'),
    );
    expect(sizes).toEqual(['sm', 'md']);
  });

  test('pulse toggles the halo class and data-pulse', async () => {
    await mount(<Indicator aria-label="Live" pulse />);
    const onClasses = (part('dot') as HTMLElement).classList.length;
    expect(part('root')?.getAttribute('data-pulse')).toBe('true');
    await mount(<Indicator aria-label="Idle" />);
    expect((part('dot') as HTMLElement).classList.length).toBeLessThan(onClasses);
    expect(part('root')?.getAttribute('data-pulse')).toBeNull();
  });

  test('aria-hidden makes the whole indicator decorative', async () => {
    await mount(<Indicator aria-label="Available" aria-hidden="true" />);
    expect(within(container).queryByRole('img')).toBeNull();
  });

  test('ref forwards to the root span', async () => {
    const ref = createRef<HTMLSpanElement>();
    await mount(<Indicator aria-label="Available" ref={ref} />);
    expect(ref.current).toBe(part('root'));
  });

  test('rest props reach the span and className merges with the module classes', async () => {
    await mount(<Indicator aria-label="Available" id="live" className="custom" />);
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.id).toBe('live');
    expect(rootEl.classList.contains('custom')).toBe(true);
    const moduleClasses = [...rootEl.classList].filter((c) => c !== 'custom');
    expect(moduleClasses.length).toBeGreaterThan(0);
  });
});
