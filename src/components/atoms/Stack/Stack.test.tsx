import type { ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { expect, within } from 'storybook/test';
import { composeStories } from '@storybook/react-vite';
import { Stack, type StackDirection, type StackGap } from './Stack';
import * as stories from './Stack.stories';

const { Directions, Nested } = composeStories(stories);

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
  container.querySelector('[data-scope="stack"][data-part="root"]') as HTMLElement;

describe('Stack edge cases', () => {
  test('defaults to a column, md gap, and reflects both on data attributes', async () => {
    await mount(<Stack>content</Stack>);
    const el = rootPart();
    expect(el.getAttribute('data-direction')).toBe('column');
    expect(el.getAttribute('data-gap')).toBe('md');
  });

  test('each direction sets data-direction', async () => {
    const directions: StackDirection[] = ['row', 'column'];
    for (const direction of directions) {
      await mount(<Stack direction={direction}>content</Stack>);
      expect(rootPart().getAttribute('data-direction')).toBe(direction);
    }
  });

  test('each gap sets data-gap and the three base classes are present', async () => {
    const gaps: StackGap[] = ['none', 'sm', 'md', 'lg'];
    for (const gap of gaps) {
      await mount(<Stack gap={gap}>content</Stack>);
      const el = rootPart();
      expect(el.getAttribute('data-gap')).toBe(gap);
      expect(el.classList.length).toBe(3);
    }
  });

  test('alignItems sets data-align and the --omnia-stack-align property', async () => {
    await mount(<Stack alignItems="center">content</Stack>);
    const el = rootPart();
    expect(el.getAttribute('data-align')).toBe('center');
    expect(el.style.getPropertyValue('--omnia-stack-align')).toBe('center');
  });

  test('justify sets data-justify and maps between to space-between', async () => {
    await mount(<Stack justify="between">content</Stack>);
    const el = rootPart();
    expect(el.getAttribute('data-justify')).toBe('between');
    expect(el.style.getPropertyValue('--omnia-stack-justify')).toBe('space-between');
  });

  test('omits the align and justify attributes and properties when unset', async () => {
    await mount(<Stack>content</Stack>);
    const el = rootPart();
    expect(el.hasAttribute('data-align')).toBe(false);
    expect(el.hasAttribute('data-justify')).toBe(false);
    expect(el.style.getPropertyValue('--omnia-stack-align')).toBe('');
    expect(el.style.getPropertyValue('--omnia-stack-justify')).toBe('');
  });

  test('renders its children', async () => {
    await mount(
      <Stack>
        <span data-testid="child">hello</span>
      </Stack>,
    );
    expect(within(container).getByTestId('child')).toHaveTextContent('hello');
  });

  test('className, ref, id, role, style and rest props reach the root div', async () => {
    const ref = createRef<HTMLDivElement>();
    await mount(
      <Stack
        className="custom"
        id="toolbar"
        role="list"
        style={{ background: 'red' }}
        ref={ref}
      >
        x
      </Stack>,
    );
    const el = rootPart();
    expect(ref.current).toBe(el);
    expect(el.tagName).toBe('DIV');
    expect(el.id).toBe('toolbar');
    expect(el.getAttribute('role')).toBe('list');
    expect(el.style.background).toBe('red');
    expect(el.classList.contains('custom')).toBe(true);
    expect([...el.classList].filter((c) => c !== 'custom').length).toBe(3);
  });

  test('the directions story renders a column then a row', async () => {
    await mount(<Directions />);
    const dirs = [...container.querySelectorAll('[data-part="root"]')].map((el) =>
      el.getAttribute('data-direction'),
    );
    expect(dirs).toEqual(['column', 'row']);
  });

  test('the nested story composes three stacks with alignment on the header row', async () => {
    await mount(<Nested />);
    const roots = [...container.querySelectorAll('[data-part="root"]')];
    expect(roots).toHaveLength(3);
    const header = roots.find((el) => el.getAttribute('data-justify') === 'between');
    expect(header?.getAttribute('data-align')).toBe('center');
    expect(header?.getAttribute('data-direction')).toBe('row');
  });
});
