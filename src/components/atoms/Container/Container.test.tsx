import type { ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { expect, within } from 'storybook/test';
import { composeStories } from '@storybook/react-vite';
import { Container, type ContainerSize } from './Container';
import * as stories from './Container.stories';

const { Scale } = composeStories(stories);

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

const rootPart = () =>
  container.querySelector('[data-scope="container"][data-part="root"]') as HTMLElement;

describe('Container edge cases', () => {
  test('defaults to md and reflects it on data-variant-size', async () => {
    await mount(<Container>content</Container>);
    expect(rootPart().getAttribute('data-variant-size')).toBe('md');
  });

  test('each variantSize sets data-variant-size and adds one size class', async () => {
    const sizes: ContainerSize[] = ['sm', 'md', 'lg', 'xl', 'full'];
    for (const size of sizes) {
      await mount(<Container variantSize={size}>content</Container>);
      const el = rootPart();
      expect(el.getAttribute('data-variant-size')).toBe(size);
      expect(el.classList.length).toBe(2);
    }
  });

  test('renders its children', async () => {
    await mount(
      <Container>
        <span data-testid="child">hello</span>
      </Container>,
    );
    expect(within(container).getByTestId('child')).toHaveTextContent('hello');
  });

  test('className, ref, id and rest props reach the root div', async () => {
    const ref = createRef<HTMLDivElement>();
    await mount(
      <Container className="custom" id="main" aria-label="Page" ref={ref}>
        x
      </Container>,
    );
    const el = rootPart();
    expect(ref.current).toBe(el);
    expect(el.tagName).toBe('DIV');
    expect(el.id).toBe('main');
    expect(el.getAttribute('aria-label')).toBe('Page');
    expect(el.classList.contains('custom')).toBe(true);
    expect([...el.classList].filter((c) => c !== 'custom').length).toBe(2);
  });

  test('the scale story renders the five sizes in order', async () => {
    await mount(<Scale />);
    const sizes = [...container.querySelectorAll('[data-part="root"]')].map((el) =>
      el.getAttribute('data-variant-size'),
    );
    expect(sizes).toEqual(['sm', 'md', 'lg', 'xl', 'full']);
  });
});
