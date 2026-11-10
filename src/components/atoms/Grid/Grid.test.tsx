import type { ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { expect, within } from 'storybook/test';
import { composeStories } from '@storybook/react-vite';
import { Grid, type GridGap } from './Grid';
import * as stories from './Grid.stories';

const { Columns } = composeStories(stories);

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
  container.querySelector('[data-scope="grid"][data-part="root"]') as HTMLElement;

describe('Grid edge cases', () => {
  test('defaults to 3 columns, md gap, and reflects both on data attributes', async () => {
    await mount(<Grid>content</Grid>);
    const el = rootPart();
    expect(el.getAttribute('data-columns')).toBe('3');
    expect(el.getAttribute('data-gap')).toBe('md');
    expect(el.style.getPropertyValue('--omnia-grid-columns')).toBe('3');
  });

  test('columns drives data-columns and the --omnia-grid-columns custom property', async () => {
    await mount(<Grid columns={5}>content</Grid>);
    const el = rootPart();
    expect(el.getAttribute('data-columns')).toBe('5');
    expect(el.style.getPropertyValue('--omnia-grid-columns')).toBe('5');
  });

  test('columns is clamped to a whole number of at least one', async () => {
    await mount(<Grid columns={0}>content</Grid>);
    expect(rootPart().getAttribute('data-columns')).toBe('1');
    await mount(<Grid columns={2.7}>content</Grid>);
    expect(rootPart().getAttribute('data-columns')).toBe('2');
  });

  test('each gap sets data-gap and adds one gap class', async () => {
    const gaps: GridGap[] = ['none', 'sm', 'md', 'lg'];
    for (const gap of gaps) {
      await mount(<Grid gap={gap}>content</Grid>);
      const el = rootPart();
      expect(el.getAttribute('data-gap')).toBe(gap);
      expect(el.classList.length).toBe(2);
    }
  });

  test('renders its children', async () => {
    await mount(
      <Grid>
        <span data-testid="child">hello</span>
      </Grid>,
    );
    expect(within(container).getByTestId('child')).toHaveTextContent('hello');
  });

  test('className, ref, id, style and rest props reach the root div', async () => {
    const ref = createRef<HTMLDivElement>();
    await mount(
      <Grid
        className="custom"
        id="gallery"
        role="list"
        style={{ background: 'red' }}
        ref={ref}
      >
        x
      </Grid>,
    );
    const el = rootPart();
    expect(ref.current).toBe(el);
    expect(el.tagName).toBe('DIV');
    expect(el.id).toBe('gallery');
    expect(el.getAttribute('role')).toBe('list');
    expect(el.style.background).toBe('red');
    expect(el.style.getPropertyValue('--omnia-grid-columns')).toBe('3');
    expect(el.classList.contains('custom')).toBe(true);
    expect([...el.classList].filter((c) => c !== 'custom').length).toBe(2);
  });

  test('the columns story renders grids of 2, 3 and 4 columns in order', async () => {
    await mount(<Columns />);
    const counts = [...container.querySelectorAll('[data-part="root"]')].map((el) =>
      el.getAttribute('data-columns'),
    );
    expect(counts).toEqual(['2', '3', '4']);
  });
});
