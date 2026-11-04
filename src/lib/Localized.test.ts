import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Localized, useGlobal, useLocale } from './Localized';

type Listener = (payload: unknown) => void;

const store = globalThis as { __STORYBOOK_PREVIEW__?: unknown };

function fakePreview(get: () => Record<string, unknown>) {
  const listeners = new Set<Listener>();
  store.__STORYBOOK_PREVIEW__ = {
    channel: {
      on: (_event: string, cb: Listener) => listeners.add(cb),
      off: (_event: string, cb: Listener) => listeners.delete(cb),
    },
    storyStore: { userGlobals: { get } },
  };
  return listeners;
}

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
  delete store.__STORYBOOK_PREVIEW__;
});

async function mount(ui: Parameters<Root['render']>[0]) {
  await act(async () => {
    root.render(ui);
  });
}

const Probe = ({ name }: { name: string }) =>
  createElement('output', null, String(useGlobal(name)));
const LocaleProbe = () => createElement('output', null, useLocale());

describe('useGlobal', () => {
  test('is undefined without a Storybook preview', async () => {
    await mount(createElement(Probe, { name: 'theme' }));
    expect(container.textContent).toBe('undefined');
  });

  test('is undefined when the preview has no channel and no store', async () => {
    store.__STORYBOOK_PREVIEW__ = {};
    await mount(createElement(Probe, { name: 'theme' }));
    expect(container.textContent).toBe('undefined');
  });

  test('is undefined when reading the globals throws', async () => {
    fakePreview(() => {
      throw new Error('store not ready');
    });
    await mount(createElement(Probe, { name: 'theme' }));
    expect(container.textContent).toBe('undefined');
  });

  test('re-reads on globalsUpdated and unsubscribes on unmount', async () => {
    let globals: Record<string, unknown> = { theme: 'light' };
    const listeners = fakePreview(() => globals);
    await mount(createElement(Probe, { name: 'theme' }));
    expect(container.textContent).toBe('light');
    expect(listeners.size).toBe(1);

    globals = { theme: 'dark' };
    await act(async () => listeners.forEach((cb) => cb(undefined)));
    expect(container.textContent).toBe('dark');

    await act(async () => root.unmount());
    expect(listeners.size).toBe(0);
    root = createRoot(container);
  });
});

describe('useLocale', () => {
  test('falls back to en without a preview', async () => {
    await mount(createElement(LocaleProbe));
    expect(container.textContent).toBe('en');
  });

  test('falls back to en for a value that is not a locale', async () => {
    fakePreview(() => ({ locale: 'de' }));
    await mount(createElement(LocaleProbe));
    expect(container.textContent).toBe('en');
  });

  test('returns a known locale', async () => {
    fakePreview(() => ({ locale: 'fr' }));
    await mount(createElement(LocaleProbe));
    expect(container.textContent).toBe('fr');
  });
});

describe('Localized', () => {
  const ui = () => createElement(Localized, { fr: 'Bonjour', en: 'Hello' });

  test.each([
    ['fr', 'Bonjour'],
    ['en', 'Hello'],
  ])('renders only the %s node', async (locale, expected) => {
    fakePreview(() => ({ locale }));
    await mount(ui());
    expect(container.textContent).toBe(expected);
  });

  test('renders the en node when no locale is set', async () => {
    await mount(ui());
    expect(container.textContent).toBe('Hello');
  });
});
