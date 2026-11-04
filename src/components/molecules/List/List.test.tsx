import type { ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { expect } from 'storybook/test';
import { List } from './List';
import '../../../styles/tokens.css';

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
  container.querySelector(`[data-scope="list"][data-part="${name}"]`);

describe('List edge cases', () => {
  test('defaults to a <ul>', async () => {
    await mount(
      <List>
        <List.Item>One</List.Item>
      </List>,
    );
    expect((part('root') as HTMLElement).tagName).toBe('UL');
  });

  test('as="ol" renders an <ol>', async () => {
    await mount(
      <List as="ol">
        <List.Item>One</List.Item>
      </List>,
    );
    expect((part('root') as HTMLElement).tagName).toBe('OL');
  });

  test('List.Item renders an <li> inside the root', async () => {
    await mount(
      <List>
        <List.Item>One</List.Item>
      </List>,
    );
    const item = part('item') as HTMLElement;
    expect(item.tagName).toBe('LI');
    expect(item.parentElement).toBe(part('root'));
  });

  test('refs forward on the root and the item', async () => {
    const listRef = createRef<HTMLUListElement | HTMLOListElement>();
    const itemRef = createRef<HTMLLIElement>();
    await mount(
      <List ref={listRef}>
        <List.Item ref={itemRef}>One</List.Item>
      </List>,
    );
    expect(listRef.current).toBe(part('root'));
    expect(itemRef.current).toBe(part('item'));
  });

  test('rest props reach the elements and className merges with the module classes', async () => {
    await mount(
      <List id="features" className="custom">
        <List.Item id="first" className="custom-item">
          One
        </List.Item>
      </List>,
    );
    for (const [el, id, cls] of [
      [part('root'), 'features', 'custom'],
      [part('item'), 'first', 'custom-item'],
    ] as const) {
      expect(el?.id).toBe(id);
      expect(el?.classList.contains(cls)).toBe(true);
      expect([...(el?.classList ?? [])].filter((c) => c !== cls).length).toBeGreaterThan(
        0,
      );
    }
  });

  test('native <ol> attributes pass through untouched', async () => {
    await mount(
      <List as="ol" start={3}>
        <List.Item value={7}>Seven</List.Item>
      </List>,
    );
    expect((part('root') as HTMLOListElement).start).toBe(3);
    expect((part('item') as HTMLLIElement).value).toBe(7);
  });

  test('a nested List renders a <ul> inside an <li>', async () => {
    await mount(
      <List>
        <List.Item>
          Parent
          <List>
            <List.Item>Child</List.Item>
          </List>
        </List.Item>
      </List>,
    );
    const nested = container.querySelector('li > ul[data-part="root"]');
    expect(nested).not.toBeNull();
    expect(nested?.parentElement?.parentElement).toBe(part('root'));
  });
});
