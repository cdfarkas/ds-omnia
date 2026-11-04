import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { expect, fn, userEvent, within } from 'storybook/test';
import { OmniaThemeProvider } from '../../../lib/OmniaThemeProvider';
import { LanguageSwitcher } from './LanguageSwitcher';

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
});

async function mount(ui: ReactElement) {
  await act(async () => {
    root.render(ui);
  });
}

const part = (name: string) =>
  container.querySelector(`[data-scope="language-switcher"][data-part="${name}"]`);
const group = () => within(container).getByRole('group');
const option = (name: string) =>
  within(container).getByRole<HTMLButtonElement>('button', { name });

describe('LanguageSwitcher edge cases', () => {
  test('is a group whose accessible name follows the active locale', async () => {
    await mount(
      <OmniaThemeProvider locale="en">
        <LanguageSwitcher />
      </OmniaThemeProvider>,
    );
    expect(group().getAttribute('aria-label')).toBe('Language');

    await mount(
      <OmniaThemeProvider locale="fr">
        <LanguageSwitcher />
      </OmniaThemeProvider>,
    );
    expect(group().getAttribute('aria-label')).toBe('Langue');
  });

  test('renders one button per locale, each labelled with its own endonym and lang', async () => {
    await mount(
      <OmniaThemeProvider locale="en">
        <LanguageSwitcher />
      </OmniaThemeProvider>,
    );
    const en = option('English');
    const fr = option('Français');
    expect(en.lang).toBe('en');
    expect(fr.lang).toBe('fr');
    expect(en.type).toBe('button');
  });

  test('presses the active locale and marks it with data-active', async () => {
    await mount(
      <OmniaThemeProvider locale="fr">
        <LanguageSwitcher />
      </OmniaThemeProvider>,
    );
    expect(option('Français').getAttribute('aria-pressed')).toBe('true');
    expect(option('English').getAttribute('aria-pressed')).toBe('false');
    expect(option('Français').hasAttribute('data-active')).toBe(true);
    expect(option('English').hasAttribute('data-active')).toBe(false);
  });

  test('className, style and ref land on the group root; extra attributes spread onto it', async () => {
    const ref = fn();
    await mount(
      <OmniaThemeProvider locale="en">
        <LanguageSwitcher
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
        <LanguageSwitcher aria-label="Choose a language" />
      </OmniaThemeProvider>,
    );
    expect(group().getAttribute('aria-label')).toBe('Choose a language');
  });

  test('selecting a locale flips the pressed button in an uncontrolled provider', async () => {
    await mount(
      <OmniaThemeProvider defaultLocale="en">
        <LanguageSwitcher />
      </OmniaThemeProvider>,
    );
    await userEvent.click(option('Français'));
    expect(option('Français').getAttribute('aria-pressed')).toBe('true');
    expect(option('English').getAttribute('aria-pressed')).toBe('false');
  });

  test('a controlled provider reports the change but keeps its locale', async () => {
    const onLocaleChange = fn();
    await mount(
      <OmniaThemeProvider locale="en" onLocaleChange={onLocaleChange}>
        <LanguageSwitcher />
      </OmniaThemeProvider>,
    );
    await userEvent.click(option('Français'));
    expect(onLocaleChange).toHaveBeenCalledWith('fr');
    expect(option('English').getAttribute('aria-pressed')).toBe('true');
  });
});
