import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Switch } from './Switch';
import * as stories from './Switch.stories';

const { Playground, Checked, Invalid, Disabled } = composeStories(stories);

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
  container.querySelector(`[data-scope="switch"][data-part="${name}"]`);
const track = () => part('track') as HTMLInputElement;
const control = () => within(container).getByRole<HTMLInputElement>('switch');

describe('Switch edge cases', () => {
  test('exposes a native checkbox input with the switch role, reflecting checked', async () => {
    await mount(<Checked />);
    expect(control()).toBe(track());
    expect(control().type).toBe('checkbox');
    expect(control()).toBeChecked();
  });

  test('renders the data contract on a label root wrapping the track and the label', async () => {
    await mount(<Playground />);
    const rootEl = part('root');
    expect(rootEl?.tagName).toBe('LABEL');
    expect(rootEl?.getAttribute('data-size')).toBe('md');
    expect(rootEl?.contains(track())).toBe(true);
    expect(part('label')?.textContent).toBe('Email notifications');
    expect(track().nextElementSibling).toBe(part('label'));
    expect(rootEl?.hasAttribute('data-invalid')).toBe(false);
    expect(rootEl?.hasAttribute('data-disabled')).toBe(false);
  });

  test('without children there is no label part', async () => {
    await mount(<Switch aria-label="Dark mode" />);
    expect(part('label')).toBeNull();
    expect(control().getAttribute('aria-label')).toBe('Dark mode');
  });

  test('className and style land on the root, every other prop on the input', async () => {
    await mount(
      <Switch className="custom" style={{ marginBlock: '1rem' }} id="sync" name="sync">
        Sync
      </Switch>,
    );
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.classList.contains('custom')).toBe(true);
    expect(rootEl.style.marginBlock).toBe('1rem');
    expect(track().classList.contains('custom')).toBe(false);
    expect(track().getAttribute('style')).toBeNull();
    expect(track().id).toBe('sync');
    expect(track().name).toBe('sync');
  });

  test('a callback ref receives the native input', async () => {
    const ref = fn();
    await mount(<Switch aria-label="Dark mode" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(control());
  });

  test('invalid sets aria-invalid on the input and data-invalid on the root', async () => {
    await mount(<Invalid />);
    expect(control().getAttribute('aria-invalid')).toBe('true');
    expect(part('root')?.hasAttribute('data-invalid')).toBe(true);
  });

  test('clicking the label text toggles an uncontrolled defaultChecked switch', async () => {
    await mount(<Switch defaultChecked>Wi-Fi</Switch>);
    expect(control()).toBeChecked();
    await userEvent.click(part('label') as HTMLElement);
    expect(control()).not.toBeChecked();
  });

  test('a controlled switch reports the change and keeps its checked prop', async () => {
    const onChange = fn();
    await mount(
      <Switch checked={false} onChange={onChange}>
        Controlled
      </Switch>,
    );
    await userEvent.click(control());
    expect(onChange).toHaveBeenCalledOnce();
    expect(control()).not.toBeChecked();
  });

  test('native name and value reach FormData only when on', async () => {
    await mount(
      <form>
        <Switch name="sync" value="on">
          Sync
        </Switch>
      </form>,
    );
    const form = container.querySelector('form') as HTMLFormElement;
    expect(new FormData(form).get('sync')).toBeNull();
    await userEvent.click(control());
    expect(new FormData(form).get('sync')).toBe('on');
  });

  test('a disabled switch does not toggle', async () => {
    await mount(<Disabled />);
    const [off, on] = [
      ...container.querySelectorAll<HTMLInputElement>('[role="switch"]'),
    ];
    await userEvent.click(off);
    await userEvent.click(on);
    expect(off).not.toBeChecked();
    expect(on).toBeChecked();
    expect(part('root')?.hasAttribute('data-disabled')).toBe(true);
  });

  test('never renders aria-checked, in either state', async () => {
    await mount(<Playground />);
    expect(control().hasAttribute('aria-checked')).toBe(false);
    await userEvent.click(control());
    expect(control()).toBeChecked();
    expect(control().hasAttribute('aria-checked')).toBe(false);
  });

  test.each(['sm', 'md', 'lg'] as const)(
    'a bare %s switch has a hit area at least 24px tall around an unchanged 1.375em track',
    async (size) => {
      await mount(<Switch variantSize={size} aria-label="Notifications" />);
      const { width, height } = track().getBoundingClientRect();
      expect(width).toBeGreaterThanOrEqual(24);
      expect(height).toBeGreaterThanOrEqual(24);
      const fontSize = parseFloat(getComputedStyle(track()).fontSize);
      expect(getComputedStyle(track(), '::after').blockSize).toBe(
        `${1.375 * fontSize}px`,
      );
    },
  );
});
