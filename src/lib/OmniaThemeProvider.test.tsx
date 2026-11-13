import type { ReactElement } from 'react';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { fn } from 'storybook/test';
import { getLocale, t } from './i18n';
import {
  OmniaThemeProvider,
  useTheme,
  type ThemeContextValue,
} from './OmniaThemeProvider';

let container: HTMLDivElement;
let root: Root;
let api: ThemeContextValue;

function Capture(): null {
  const value = useTheme();
  useEffect(() => {
    api = value;
  });
  return null;
}

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-skin');
  document.documentElement.removeAttribute('lang');
});

async function mount(ui: ReactElement) {
  await act(async () => {
    root.render(ui);
  });
}

describe('OmniaThemeProvider — uncontrolled', () => {
  test('setTheme flips data-theme and persists it', async () => {
    await mount(
      <OmniaThemeProvider>
        <Capture />
      </OmniaThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    await act(async () => api.setTheme('dark'));
    expect(api.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(JSON.parse(localStorage.getItem('omnia-theme') ?? '{}').theme).toBe('dark');
  });

  test('toggleTheme alternates light and dark', async () => {
    await mount(
      <OmniaThemeProvider defaultTheme="light">
        <Capture />
      </OmniaThemeProvider>,
    );
    await act(async () => api.toggleTheme());
    expect(api.theme).toBe('dark');
    await act(async () => api.toggleTheme());
    expect(api.theme).toBe('light');
  });

  test('reads the persisted choice on init', async () => {
    localStorage.setItem('omnia-theme', JSON.stringify({ theme: 'dark', skin: 'pixel' }));
    await mount(
      <OmniaThemeProvider>
        <Capture />
      </OmniaThemeProvider>,
    );
    expect(api.theme).toBe('dark');
    expect(api.skin).toBe('pixel');
  });
});

describe('OmniaThemeProvider — controlled', () => {
  test('props win, the setter fires the callback and nothing persists', async () => {
    const onThemeChange = fn();
    await mount(
      <OmniaThemeProvider
        theme="light"
        skin="default"
        locale="en"
        onThemeChange={onThemeChange}
      >
        <Capture />
      </OmniaThemeProvider>,
    );
    await act(async () => api.setTheme('dark'));
    expect(onThemeChange).toHaveBeenCalledWith('dark');
    expect(api.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('omnia-theme')).toBeNull();
  });
});

describe('OmniaThemeProvider — locale', () => {
  test('setLocale is reactive and syncs the i18n module for t()', async () => {
    await mount(
      <OmniaThemeProvider defaultLocale="en">
        <Capture />
      </OmniaThemeProvider>,
    );
    expect(api.locale).toBe('en');
    expect(t('button.loading')).toBe('Loading');

    await act(async () => api.setLocale('fr'));
    expect(api.locale).toBe('fr');
    expect(getLocale()).toBe('fr');
    expect(t('button.loading')).toBe('Chargement');
  });

  test('sets the document lang to "fr" for the French locale', async () => {
    await mount(<OmniaThemeProvider locale="fr" />);
    expect(document.documentElement.lang).toBe('fr');
  });

  test('sets the document lang to "en" for the English locale', async () => {
    await mount(<OmniaThemeProvider locale="en" />);
    expect(document.documentElement.lang).toBe('en');
  });

  test('switching locale updates the document lang', async () => {
    await mount(
      <OmniaThemeProvider defaultLocale="en">
        <Capture />
      </OmniaThemeProvider>,
    );
    expect(document.documentElement.lang).toBe('en');

    await act(async () => api.setLocale('fr'));
    expect(document.documentElement.lang).toBe('fr');
  });
});
