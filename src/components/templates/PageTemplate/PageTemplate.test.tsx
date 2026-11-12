import { createRef, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { PageTemplate } from './PageTemplate';
import { t } from '../../../lib/i18n';
import * as stories from './PageTemplate.stories';

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
  container.querySelector(
    `[data-scope="page-template"][data-part="${name}"]`,
  ) as HTMLElement;

const parts = () =>
  [...container.querySelectorAll('[data-scope="page-template"]')].map((el) =>
    el.getAttribute('data-part'),
  );

const skipLink = () =>
  container.querySelector('[data-part="skip-link"]') as HTMLAnchorElement;

describe('PageTemplate composition', () => {
  test('the namespace exposes every region', () => {
    for (const name of ['Header', 'Navbar', 'Main', 'Aside', 'Footer'] as const)
      expect(typeof PageTemplate[name]).toBe('function');
  });

  test('a minimal shell renders only header and main regions', async () => {
    await mount(<MinimalShell />);
    expect(parts()).toEqual(['root', 'header', 'main']);
  });

  test('a main-only shell still renders, with the skip link targeting it', async () => {
    await mount(
      <PageTemplate>
        <PageTemplate.Main>content</PageTemplate.Main>
      </PageTemplate>,
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

  test('the root wires the skip link to the generated main id', async () => {
    await mount(<WithAside />);
    expect(part('main').getAttribute('tabindex')).toBe('-1');
    expect(part('main').id).toBeTruthy();
    expect(skipLink().getAttribute('href')).toBe(`#${part('main').id}`);
    expect(skipLink().textContent).toBe(t('pageTemplate.skipToContent'));
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
      <PageTemplate ref={refs.root}>
        <PageTemplate.Header ref={refs.header} />
        <PageTemplate.Navbar ref={refs.navbar} />
        <PageTemplate.Main ref={refs.main} />
        <PageTemplate.Aside ref={refs.aside} />
        <PageTemplate.Footer ref={refs.footer} />
      </PageTemplate>,
    );
    for (const [name, ref] of Object.entries(refs)) expect(ref.current).toBe(part(name));
  });

  test('native props pass through and className merges with the module class', async () => {
    await mount(
      <PageTemplate id="shell" className="custom" data-testid="s">
        <PageTemplate.Header className="custom" id="head" />
        <PageTemplate.Main className="custom" id="body" aria-label="Page" />
        <PageTemplate.Footer className="custom" id="foot" />
      </PageTemplate>,
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
