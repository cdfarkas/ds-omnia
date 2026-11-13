import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Checkbox } from './Checkbox';
import * as stories from './Checkbox.stories';

const { Playground, Indeterminate, Invalid, Disabled } = composeStories(stories);

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
  container.querySelector(`[data-scope="checkbox"][data-part="${name}"]`);
const box = () => part('input') as HTMLInputElement;

describe('Checkbox edge cases', () => {
  test('renders the data contract on a label root wrapping the input and the label', async () => {
    await mount(<Playground />);
    const rootEl = part('root');
    expect(rootEl?.tagName).toBe('LABEL');
    expect(rootEl?.getAttribute('data-size')).toBe('md');
    expect(box().type).toBe('checkbox');
    expect(rootEl?.contains(box())).toBe(true);
    expect(part('label')?.textContent).toBe('Accept the terms');
    expect(rootEl?.hasAttribute('data-invalid')).toBe(false);
    expect(rootEl?.hasAttribute('data-disabled')).toBe(false);
    expect(rootEl?.hasAttribute('data-indeterminate')).toBe(false);
  });

  test('without children there is no label part', async () => {
    await mount(<Checkbox aria-label="Select row 1" />);
    expect(part('label')).toBeNull();
    expect(box().getAttribute('aria-label')).toBe('Select row 1');
  });

  test('className and style land on the root, every other prop on the input', async () => {
    await mount(
      <Checkbox
        className="custom"
        style={{ marginBlock: '1rem' }}
        id="terms"
        name="terms"
      >
        Terms
      </Checkbox>,
    );
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.classList.contains('custom')).toBe(true);
    expect(rootEl.style.marginBlock).toBe('1rem');
    expect(box().classList.contains('custom')).toBe(false);
    expect(box().getAttribute('style')).toBeNull();
    expect(box().id).toBe('terms');
    expect(box().name).toBe('terms');
  });

  test('a callback ref receives the native input, with indeterminate applied', async () => {
    const ref = fn();
    await mount(<Checkbox aria-label="All" indeterminate ref={ref} />);
    expect(ref).toHaveBeenCalledWith(box());
    expect(box().indeterminate).toBe(true);
  });

  test('indeterminate stays applied after a click while the prop stays true', async () => {
    await mount(<Indeterminate />);
    expect(box()).toBePartiallyChecked();
    expect(part('root')?.hasAttribute('data-indeterminate')).toBe(true);
    await userEvent.click(box());
    expect(box()).toBePartiallyChecked();
    expect(box()).toBeChecked();
  });

  test('indeterminate follows the prop when it turns false', async () => {
    await mount(<Checkbox aria-label="All" indeterminate />);
    expect(box()).toBePartiallyChecked();
    await mount(<Checkbox aria-label="All" indeterminate={false} />);
    expect(box()).not.toBePartiallyChecked();
    expect(part('root')?.hasAttribute('data-indeterminate')).toBe(false);
  });

  test('invalid sets aria-invalid on the input and data-invalid on the root', async () => {
    await mount(<Invalid />);
    expect(box().getAttribute('aria-invalid')).toBe('true');
    expect(part('root')?.hasAttribute('data-invalid')).toBe(true);
  });

  test('clicking the label text toggles an uncontrolled defaultChecked box', async () => {
    await mount(<Checkbox defaultChecked>Remember me</Checkbox>);
    expect(box()).toBeChecked();
    await userEvent.click(part('label') as HTMLElement);
    expect(box()).not.toBeChecked();
  });

  test('a controlled box reports the change and keeps its checked prop', async () => {
    const onChange = fn();
    await mount(
      <Checkbox checked={false} onChange={onChange}>
        Controlled
      </Checkbox>,
    );
    await userEvent.click(box());
    expect(onChange).toHaveBeenCalledOnce();
    expect(box()).not.toBeChecked();
  });

  test('native name and value reach FormData only when checked', async () => {
    await mount(
      <form>
        <Checkbox name="terms" value="yes">
          Terms
        </Checkbox>
      </form>,
    );
    const form = container.querySelector('form') as HTMLFormElement;
    expect(new FormData(form).get('terms')).toBeNull();
    await userEvent.click(box());
    expect(new FormData(form).get('terms')).toBe('yes');
  });

  test('a disabled box does not toggle', async () => {
    await mount(<Disabled />);
    const [unchecked, checked] = [
      ...container.querySelectorAll<HTMLInputElement>('[data-part="input"]'),
    ];
    await userEvent.click(unchecked);
    await userEvent.click(checked);
    expect(unchecked).not.toBeChecked();
    expect(checked).toBeChecked();
    expect(part('root')?.hasAttribute('data-disabled')).toBe(true);
  });

  test.each(['sm', 'md', 'lg'] as const)(
    'a bare %s box has a 24px hit area around an unchanged 1.25em visible box',
    async (size) => {
      await mount(<Checkbox variantSize={size} aria-label="Select row 1" />);
      const { width, height } = box().getBoundingClientRect();
      expect(width).toBeGreaterThanOrEqual(24);
      expect(height).toBeGreaterThanOrEqual(24);
      const fontSize = parseFloat(getComputedStyle(box()).fontSize);
      expect(getComputedStyle(box(), '::after').inlineSize).toBe(`${1.25 * fontSize}px`);
    },
  );
});
