import type { ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { expect } from 'storybook/test';
import { Text } from './Text';
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
  container.querySelector(`[data-scope="text"][data-part="${name}"]`);

describe('Text edge cases', () => {
  test('defaults to a <p>', async () => {
    await mount(<Text>Body</Text>);
    expect((part('root') as HTMLElement).tagName).toBe('P');
  });

  test('as="span" renders a <span>', async () => {
    await mount(<Text as="span">Inline</Text>);
    expect((part('root') as HTMLElement).tagName).toBe('SPAN');
  });

  test('variantSize reflects data-variant-size', async () => {
    await mount(<Text variantSize="lg">Body</Text>);
    expect(part('root')?.getAttribute('data-variant-size')).toBe('lg');
  });

  test('tone reflects data-tone', async () => {
    await mount(<Text>Body</Text>);
    expect(part('root')?.getAttribute('data-tone')).toBe('default');
    await mount(<Text tone="muted">Body</Text>);
    expect(part('root')?.getAttribute('data-tone')).toBe('muted');
  });

  test('ref forwards to the element', async () => {
    const ref = createRef<HTMLParagraphElement>();
    await mount(<Text ref={ref}>Body</Text>);
    expect(ref.current).toBe(part('root'));
  });

  test('rest props reach the element and className merges with the module classes', async () => {
    await mount(
      <Text id="lede" className="custom">
        Body
      </Text>,
    );
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.id).toBe('lede');
    expect(rootEl.classList.contains('custom')).toBe(true);
    const moduleClasses = [...rootEl.classList].filter((c) => c !== 'custom');
    expect(moduleClasses.length).toBeGreaterThan(0);
  });
});
