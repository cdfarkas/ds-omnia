import { createRef, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { PageHeader } from './PageHeader';
import * as stories from './PageHeader.stories';

const { Default, TitleOnly, InPageTemplate } = composeStories(stories);

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

const headerRoot = () =>
  container.querySelector('[data-scope="page-header"][data-part="root"]') as HTMLElement;

describe('PageHeader edge cases', () => {
  test('the namespace exposes Breadcrumb, Title, Description and Actions', () => {
    for (const name of ['Breadcrumb', 'Title', 'Description', 'Actions'] as const)
      expect(typeof PageHeader[name]).toBe('function');
  });

  test('renders an h1 by default', async () => {
    await mount(<TitleOnly />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelector('h1')?.textContent).toBe('Settings');
  });

  test('Title level can be overridden', async () => {
    await mount(
      <PageHeader>
        <PageHeader.Title level={2}>Nested page</PageHeader.Title>
      </PageHeader>,
    );
    expect(container.querySelector('h1')).toBeNull();
    expect(container.querySelector('h2')?.textContent).toBe('Nested page');
  });

  test('renders no landmark of its own', async () => {
    await mount(
      <PageHeader>
        <PageHeader.Breadcrumb>
          <a href="#home">Home</a>
        </PageHeader.Breadcrumb>
        <PageHeader.Title>Page</PageHeader.Title>
        <PageHeader.Description>Text</PageHeader.Description>
        <PageHeader.Actions>
          <button type="button">Go</button>
        </PageHeader.Actions>
      </PageHeader>,
    );
    expect(
      container.querySelector('header, nav, main, aside, footer, section, [role]'),
    ).toBeNull();
  });

  test('inside PageTemplate.Main, the template header stays the only banner', async () => {
    await mount(<InPageTemplate />);
    expect(container.querySelectorAll('header')).toHaveLength(1);
    expect(headerRoot().closest('main')).not.toBeNull();
  });

  test('without optional parts it renders only the heading', async () => {
    await mount(<TitleOnly />);
    expect(container.querySelector('[data-part="breadcrumb"]')).toBeNull();
    expect(container.querySelector('[data-part="actions"]')).toBeNull();
    expect(container.querySelector('[data-scope="text"]')).toBeNull();
  });

  test('the breadcrumb sits above the section heading, outside its grid', async () => {
    await mount(<Default />);
    const [first, second] = [...headerRoot().children];
    expect(first.getAttribute('data-part')).toBe('breadcrumb');
    expect(second.getAttribute('data-scope')).toBe('section-heading');
    expect(second.querySelector('h1')).not.toBeNull();
    expect(second.querySelector('[data-part="actions"]')).not.toBeNull();
  });

  test('ref, native props and className reach the root', async () => {
    const ref = createRef<HTMLDivElement>();
    await mount(
      <PageHeader ref={ref} id="top" className="custom" data-testid="ph">
        <PageHeader.Title>Page</PageHeader.Title>
      </PageHeader>,
    );
    const el = headerRoot();
    expect(ref.current).toBe(el);
    expect(el.id).toBe('top');
    expect(el.getAttribute('data-testid')).toBe('ph');
    expect(el.classList.contains('custom')).toBe(true);
    expect([...el.classList].filter((c) => c !== 'custom').length).toBeGreaterThan(0);
  });
});
