import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { expect, fn, userEvent, within } from 'storybook/test';
import { OmniaThemeProvider } from '../../../lib/OmniaThemeProvider';
import { ThemeSwitcher } from './ThemeSwitcher';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  globalThis.localStorage?.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-skin');
});

async function mount(ui: ReactElement) {
  await act(async () => {
    root.render(ui);
  });
}

const part = (name: string) =>
  container.querySelector(`[data-scope="theme-switcher"][data-part="${name}"]`);
const group = () => within(container).getByRole('group');
const option = (name: string) =>
  within(container).getByRole<HTMLButtonElement>('button', { name });

describe('ThemeSwitcher edge cases', () => {
  test('is a group whose accessible name follows the active locale', async () => {
    await mount(
      <OmniaThemeProvider locale="en">
        <ThemeSwitcher />
      </OmniaThemeProvider>,
    );
    expect(group().getAttribute('aria-label')).toBe('Theme');

    await mount(
      <OmniaThemeProvider locale="fr">
        <ThemeSwitcher />
      </OmniaThemeProvider>,
    );
    expect(group().getAttribute('aria-label')).toBe('Thème');
  });

  test('renders one button per theme, each named in the active locale', async () => {
    await mount(
      <OmniaThemeProvider locale="en">
        <ThemeSwitcher />
      </OmniaThemeProvider>,
    );
    expect(option('Light').type).toBe('button');
    expect(option('Dark').type).toBe('button');

    await mount(
      <OmniaThemeProvider locale="fr">
        <ThemeSwitcher />
      </OmniaThemeProvider>,
    );
    expect(option('Clair').type).toBe('button');
    expect(option('Sombre').type).toBe('button');
  });

  test('the icons are decorative', async () => {
    await mount(
      <OmniaThemeProvider locale="en">
        <ThemeSwitcher />
      </OmniaThemeProvider>,
    );
    const icons = container.querySelectorAll('[data-scope="icon"][data-part="root"]');
    expect(icons).toHaveLength(2);
    for (const icon of icons) expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(option('Light').querySelector('[data-glyph="sun"]')).not.toBeNull();
    expect(option('Dark').querySelector('[data-glyph="moon"]')).not.toBeNull();
  });

  test('presses the active theme and marks it with data-active', async () => {
    await mount(
      <OmniaThemeProvider locale="en" theme="dark">
        <ThemeSwitcher />
      </OmniaThemeProvider>,
    );
    expect(option('Dark').getAttribute('aria-pressed')).toBe('true');
    expect(option('Light').getAttribute('aria-pressed')).toBe('false');
    expect(option('Dark').hasAttribute('data-active')).toBe(true);
    expect(option('Light').hasAttribute('data-active')).toBe(false);
  });

  test('className, style and ref land on the group root; extra attributes spread onto it', async () => {
    const ref = fn();
    await mount(
      <OmniaThemeProvider locale="en">
        <ThemeSwitcher
          className="custom"
          style={{ marginBlock: '1rem' }}
          id="picker"
          ref={ref}
        />
      </OmniaThemeProvider>,
    );
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.classList.contains('custom')).toBe(true);
    expect(rootEl.style.marginBlock).toBe('1rem');
    expect(rootEl.id).toBe('picker');
    expect(ref).toHaveBeenCalledWith(rootEl);
  });

  test('a passed aria-label overrides the localized default', async () => {
    await mount(
      <OmniaThemeProvider locale="en">
        <ThemeSwitcher aria-label="Choose a theme" />
      </OmniaThemeProvider>,
    );
    expect(group().getAttribute('aria-label')).toBe('Choose a theme');
  });

  test('selecting a theme flips the pressed button in an uncontrolled provider', async () => {
    await mount(
      <OmniaThemeProvider locale="en" defaultTheme="light">
        <ThemeSwitcher />
      </OmniaThemeProvider>,
    );
    await userEvent.click(option('Dark'));
    expect(option('Dark').getAttribute('aria-pressed')).toBe('true');
    expect(option('Light').getAttribute('aria-pressed')).toBe('false');
  });

  test('a controlled provider reports the change but keeps its theme', async () => {
    const onThemeChange = fn();
    await mount(
      <OmniaThemeProvider locale="en" theme="light" onThemeChange={onThemeChange}>
        <ThemeSwitcher />
      </OmniaThemeProvider>,
    );
    await userEvent.click(option('Dark'));
    expect(onThemeChange).toHaveBeenCalledWith('dark');
    expect(option('Light').getAttribute('aria-pressed')).toBe('true');
  });
});
