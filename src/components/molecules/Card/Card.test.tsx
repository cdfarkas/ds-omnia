import { createRef, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Card } from './Card';
import * as stories from './Card.stories';

const { BodyOnly, WithHeader } = composeStories(stories);

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
  container.querySelector(`[data-scope="card"][data-part="${name}"]`) as HTMLDivElement;

const parts = () =>
  [...container.querySelectorAll('[data-scope="card"]')].map((el) =>
    el.getAttribute('data-part'),
  );

describe('Card edge cases', () => {
  test('the namespace exposes Header, Body and Footer', () => {
    expect(typeof Card.Header).toBe('function');
    expect(typeof Card.Body).toBe('function');
    expect(typeof Card.Footer).toBe('function');
  });

  test('a body-only card renders no header or footer', async () => {
    await mount(<BodyOnly />);
    expect(parts()).toEqual(['root', 'body']);
  });

  test('a header and body card renders no footer', async () => {
    await mount(<WithHeader />);
    expect(parts()).toEqual(['root', 'header', 'body']);
  });

  test('every part is a div', async () => {
    await mount(
      <Card>
        <Card.Header />
        <Card.Body />
        <Card.Footer />
      </Card>,
    );
    for (const name of ['root', 'header', 'body', 'footer'])
      expect(part(name).tagName).toBe('DIV');
  });

  test('ref reaches each div', async () => {
    const refs = {
      root: createRef<HTMLDivElement>(),
      header: createRef<HTMLDivElement>(),
      body: createRef<HTMLDivElement>(),
      footer: createRef<HTMLDivElement>(),
    };
    await mount(
      <Card ref={refs.root}>
        <Card.Header ref={refs.header} />
        <Card.Body ref={refs.body} />
        <Card.Footer ref={refs.footer} />
      </Card>,
    );
    for (const [name, ref] of Object.entries(refs)) expect(ref.current).toBe(part(name));
  });

  test('native props pass through and className merges with the module class', async () => {
    await mount(
      <Card id="card" className="custom" aria-label="Summary" data-testid="c">
        <Card.Header className="custom" id="head" aria-hidden="true" data-x="h" />
        <Card.Body className="custom" id="main" data-x="b" />
        <Card.Footer className="custom" id="foot" data-x="f" />
      </Card>,
    );
    expect(part('root').id).toBe('card');
    expect(part('root').getAttribute('aria-label')).toBe('Summary');
    expect(part('root').getAttribute('data-testid')).toBe('c');
    expect(part('header').id).toBe('head');
    expect(part('header').getAttribute('aria-hidden')).toBe('true');
    expect(part('body').getAttribute('data-x')).toBe('b');
    expect(part('footer').id).toBe('foot');
    for (const name of ['root', 'header', 'body', 'footer']) {
      const el = part(name);
      expect(el.classList.contains('custom')).toBe(true);
      expect([...el.classList].filter((c) => c !== 'custom').length).toBeGreaterThan(0);
    }
  });
});
