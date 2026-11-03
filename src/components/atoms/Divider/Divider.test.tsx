import { createRef, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Divider } from './Divider';
import * as stories from './Divider.stories';

const { PlainRule, Decorative } = composeStories(stories);

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

const rule = () =>
  container.querySelector('[data-scope="divider"][data-part="root"]') as HTMLHRElement;

describe('Divider edge cases', () => {
  test('defaults to a semantic separator (native <hr>)', async () => {
    await mount(<PlainRule />);
    const separator = within(container).getByRole('separator');
    expect(separator).toBe(rule());
    expect(separator.tagName).toBe('HR');
  });

  test('role="none" drops it from the accessibility tree', async () => {
    await mount(<Decorative />);
    expect(within(container).queryByRole('separator')).toBeNull();
    expect(rule().getAttribute('role')).toBe('none');
  });

  test('vertical renders a div separator with aria-orientation', async () => {
    await mount(<Divider orientation="vertical" />);
    const el = rule();
    expect(el.tagName).toBe('DIV');
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
  });

  test('vertical role="none" is decorative with no aria-orientation', async () => {
    await mount(<Divider orientation="vertical" role="none" />);
    const el = rule();
    expect(el.getAttribute('role')).toBe('none');
    expect(el.getAttribute('aria-orientation')).toBeNull();
    expect(within(container).queryByRole('separator')).toBeNull();
  });

  test('forwards the ref to the underlying <hr>', async () => {
    const ref = createRef<HTMLHRElement>();
    await mount(<Divider ref={ref} />);
    expect(ref.current).toBe(rule());
  });

  test('rest props reach the hr and className merges with the module class', async () => {
    await mount(<Divider id="sep" className="custom" />);
    const el = rule();
    expect(el.id).toBe('sep');
    expect(el.classList.contains('custom')).toBe(true);
    const moduleClasses = [...el.classList].filter((c) => c !== 'custom');
    expect(moduleClasses.length).toBeGreaterThan(0);
  });
});
