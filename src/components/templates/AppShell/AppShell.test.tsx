import { createRef, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AppShell } from './AppShell';
import { t } from '../../../lib/i18n';
import * as stories from './AppShell.stories';

const { MinimalShell, WithAside } = composeStories(stories);

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
  container.querySelector(`[data-scope="appshell"][data-part="${name}"]`) as HTMLElement;

const parts = () =>
  [...container.querySelectorAll('[data-scope="appshell"]')].map((el) =>
    el.getAttribute('data-part'),
  );

const skipLink = () =>
  container.querySelector('[data-part="skip-link"]') as HTMLAnchorElement;

describe('AppShell edge cases', () => {
  test('the namespace exposes every region', () => {
    for (const name of ['Header', 'Navbar', 'Main', 'Aside', 'Footer'] as const)
      expect(typeof AppShell[name]).toBe('function');
  });

  test('a minimal shell renders only header and main regions', async () => {
    await mount(<MinimalShell />);
    expect(parts()).toEqual(['root', 'header', 'main']);
  });

  test('a main-only shell still renders, with the skip link targeting it', async () => {
    await mount(
      <AppShell>
        <AppShell.Main>content</AppShell.Main>
      </AppShell>,
    );
    expect(parts()).toEqual(['root', 'main']);
    expect(skipLink().getAttribute('href')).toBe(`#${part('main').id}`);
  });

  test('every region renders its matching landmark element', async () => {
    await mount(<WithAside />);
    const tags: Record<string, string> = {
      root: 'DIV',
      header: 'HEADER',
      navbar: 'NAV',
      main: 'MAIN',
      aside: 'ASIDE',
      footer: 'FOOTER',
    };
    for (const [name, tag] of Object.entries(tags)) expect(part(name).tagName).toBe(tag);
  });

  test('main is a focusable skip target and the skip link points at it', async () => {
    await mount(<WithAside />);
    expect(part('main').getAttribute('tabindex')).toBe('-1');
    expect(part('main').id).toBeTruthy();
    expect(skipLink().getAttribute('href')).toBe(`#${part('main').id}`);
    expect(skipLink().textContent).toBe(t('appShell.skipToContent'));
  });

  test('navbar gets a default accessible label', async () => {
    await mount(
      <AppShell>
        <AppShell.Navbar />
        <AppShell.Main />
      </AppShell>,
    );
    expect(part('navbar').getAttribute('aria-label')).toBe(t('appShell.navbarLabel'));
  });

  test('a caller aria-label overrides the navbar default', async () => {
    await mount(
      <AppShell>
        <AppShell.Navbar aria-label="Sections" />
        <AppShell.Main />
      </AppShell>,
    );
    expect(part('navbar').getAttribute('aria-label')).toBe('Sections');
  });

  test('a caller id and tabIndex override the skip-target defaults on main', async () => {
    await mount(
      <AppShell>
        <AppShell.Main id="content" tabIndex={0} />
      </AppShell>,
    );
    expect(part('main').id).toBe('content');
    expect(part('main').getAttribute('tabindex')).toBe('0');
  });

  test('ref reaches each region element', async () => {
    const refs = {
      root: createRef<HTMLDivElement>(),
      header: createRef<HTMLElement>(),
      navbar: createRef<HTMLElement>(),
      main: createRef<HTMLElement>(),
      aside: createRef<HTMLElement>(),
      footer: createRef<HTMLElement>(),
    };
    await mount(
      <AppShell ref={refs.root}>
        <AppShell.Header ref={refs.header} />
        <AppShell.Navbar ref={refs.navbar} />
        <AppShell.Main ref={refs.main} />
        <AppShell.Aside ref={refs.aside} />
        <AppShell.Footer ref={refs.footer} />
      </AppShell>,
    );
    for (const [name, ref] of Object.entries(refs)) expect(ref.current).toBe(part(name));
  });

  test('native props pass through and className merges with the module class', async () => {
    await mount(
      <AppShell id="shell" className="custom" data-testid="s">
        <AppShell.Header className="custom" id="head" />
        <AppShell.Main className="custom" id="body" aria-label="Page" />
        <AppShell.Footer className="custom" id="foot" />
      </AppShell>,
    );
    expect(part('root').id).toBe('shell');
    expect(part('root').getAttribute('data-testid')).toBe('s');
    expect(part('header').id).toBe('head');
    expect(part('main').getAttribute('aria-label')).toBe('Page');
    expect(part('footer').id).toBe('foot');
    for (const name of ['root', 'header', 'main', 'footer']) {
      const el = part(name);
      expect(el.classList.contains('custom')).toBe(true);
      expect([...el.classList].filter((c) => c !== 'custom').length).toBeGreaterThan(0);
    }
  });
});
