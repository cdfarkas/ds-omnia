import type { ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { expect } from 'storybook/test';
import { Heading } from './Heading';
import '../../../styles/tokens.css';

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
  container.querySelector(`[data-scope="heading"][data-part="${name}"]`);

describe('Heading edge cases', () => {
  test('level renders the matching heading tag and reflects data-level', async () => {
    await mount(<Heading level={3}>Title</Heading>);
    const root = part('root') as HTMLElement;
    expect(root.tagName).toBe('H3');
    expect(root.getAttribute('data-level')).toBe('3');
  });

  test('default variantSize follows the level', async () => {
    await mount(<Heading level={1}>Title</Heading>);
    expect(part('root')?.getAttribute('data-variant-size')).toBe('2xl');
  });

  test('explicit variantSize overrides the level default', async () => {
    await mount(
      <Heading level={1} variantSize="sm">
        Title
      </Heading>,
    );
    expect(part('root')?.getAttribute('data-variant-size')).toBe('sm');
  });

  test('ref forwards to the heading element', async () => {
    const ref = createRef<HTMLHeadingElement>();
    await mount(
      <Heading level={2} ref={ref}>
        Title
      </Heading>,
    );
    expect(ref.current).toBe(part('root'));
  });

  test('rest props reach the element and className merges with the module classes', async () => {
    await mount(
      <Heading level={2} id="hero" className="custom">
        Title
      </Heading>,
    );
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.id).toBe('hero');
    expect(rootEl.classList.contains('custom')).toBe(true);
    const moduleClasses = [...rootEl.classList].filter((c) => c !== 'custom');
    expect(moduleClasses.length).toBeGreaterThan(0);
  });
});
