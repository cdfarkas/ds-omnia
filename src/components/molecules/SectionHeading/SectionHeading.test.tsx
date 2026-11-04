import { createRef, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { SectionHeading } from './SectionHeading';
import * as stories from './SectionHeading.stories';

const { Playground, TitleOnly } = composeStories(stories);

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
  container.querySelector(`[data-scope="section-heading"][data-part="${name}"]`);

describe('SectionHeading edge cases', () => {
  test('exposes Title, Description and Actions as namespaced parts', () => {
    expect(typeof SectionHeading.Title).toBe('function');
    expect(typeof SectionHeading.Description).toBe('function');
    expect(typeof SectionHeading.Actions).toBe('function');
  });

  test('root renders a div carrying the section-heading contract', async () => {
    await mount(<TitleOnly />);
    expect(part('root')?.tagName).toBe('DIV');
  });

  test('Title renders the given level and keeps the Heading contract', async () => {
    await mount(
      <SectionHeading>
        <SectionHeading.Title level={3} className="custom">
          Title
        </SectionHeading.Title>
      </SectionHeading>,
    );
    const heading = container.querySelector('h3');
    expect(heading?.getAttribute('data-scope')).toBe('heading');
    expect(heading?.getAttribute('data-part')).toBe('root');
    expect(heading?.classList.contains('custom')).toBe(true);
  });

  test('Description defaults to the muted tone', async () => {
    await mount(<Playground />);
    expect(
      container.querySelector('[data-scope="text"]')?.getAttribute('data-tone'),
    ).toBe('muted');
  });

  test('Description accepts tone="default"', async () => {
    await mount(
      <SectionHeading>
        <SectionHeading.Title level={2}>Title</SectionHeading.Title>
        <SectionHeading.Description tone="default">Body</SectionHeading.Description>
      </SectionHeading>,
    );
    expect(
      container.querySelector('[data-scope="text"]')?.getAttribute('data-tone'),
    ).toBe('default');
  });

  test('Actions renders the actions part', async () => {
    await mount(<Playground />);
    const actions = part('actions');
    expect(actions?.tagName).toBe('DIV');
    expect(actions?.querySelectorAll('button')).toHaveLength(2);
  });

  test('refs forward to the root and actions elements', async () => {
    const rootRef = createRef<HTMLDivElement>();
    const actionsRef = createRef<HTMLDivElement>();
    await mount(
      <SectionHeading ref={rootRef}>
        <SectionHeading.Title level={2}>Title</SectionHeading.Title>
        <SectionHeading.Actions ref={actionsRef}>
          <span>Action</span>
        </SectionHeading.Actions>
      </SectionHeading>,
    );
    expect(rootRef.current).toBe(part('root'));
    expect(actionsRef.current).toBe(part('actions'));
  });

  test('rest props reach the root and className merges with the module class', async () => {
    await mount(
      <SectionHeading id="projects" className="custom">
        <SectionHeading.Title level={2}>Title</SectionHeading.Title>
      </SectionHeading>,
    );
    const rootEl = part('root') as HTMLElement;
    expect(rootEl.id).toBe('projects');
    expect(rootEl.classList.contains('custom')).toBe(true);
    const moduleClasses = [...rootEl.classList].filter((c) => c !== 'custom');
    expect(moduleClasses.length).toBeGreaterThan(0);
  });
});
