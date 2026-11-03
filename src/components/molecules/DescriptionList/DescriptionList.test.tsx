import type { ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { composeStories } from '@storybook/react-vite';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { expect } from 'storybook/test';
import { DescriptionList } from './DescriptionList';
import * as stories from './DescriptionList.stories';
import '../../../styles/tokens.css';

const { Playground } = composeStories(stories);

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

const parts = (name: string) => [
  ...container.querySelectorAll<HTMLElement>(
    `[data-scope="description-list"][data-part="${name}"]`,
  ),
];

const columnCount = (el: HTMLElement) =>
  getComputedStyle(el).gridTemplateColumns.split(' ').length;

describe('DescriptionList edge cases', () => {
  test('renders real <dl>, <div>, <dt> and <dd> elements', async () => {
    await mount(<Playground />);
    expect(parts('root').map((el) => el.tagName)).toEqual(['DL']);
    expect(parts('item').every((el) => el.tagName === 'DIV')).toBe(true);
    expect(parts('term').every((el) => el.tagName === 'DT')).toBe(true);
    expect(parts('detail').every((el) => el.tagName === 'DD')).toBe(true);
  });

  test('an item can hold several details for one term', async () => {
    await mount(
      <DescriptionList>
        <DescriptionList.Item>
          <DescriptionList.Term>Authors</DescriptionList.Term>
          <DescriptionList.Detail>Ada</DescriptionList.Detail>
          <DescriptionList.Detail>Grace</DescriptionList.Detail>
        </DescriptionList.Item>
      </DescriptionList>,
    );
    const [item] = parts('item');
    expect([...item.children].map((el) => el.tagName)).toEqual(['DT', 'DD', 'DD']);
  });

  test('stacks term and detail when narrow, places them side by side when wide', async () => {
    container.style.inlineSize = '18rem';
    await mount(<Playground />);
    expect(columnCount(parts('item')[0])).toBe(1);

    container.style.inlineSize = '40rem';
    await new Promise(requestAnimationFrame);
    expect(columnCount(parts('item')[0])).toBe(2);
  });

  test('ref forwards on every part', async () => {
    const refs = {
      root: createRef<HTMLDListElement>(),
      item: createRef<HTMLDivElement>(),
      term: createRef<HTMLElement>(),
      detail: createRef<HTMLElement>(),
    };
    await mount(
      <DescriptionList ref={refs.root}>
        <DescriptionList.Item ref={refs.item}>
          <DescriptionList.Term ref={refs.term}>Name</DescriptionList.Term>
          <DescriptionList.Detail ref={refs.detail}>Omnia</DescriptionList.Detail>
        </DescriptionList.Item>
      </DescriptionList>,
    );
    for (const [name, ref] of Object.entries(refs)) {
      expect(ref.current).toBe(parts(name)[0]);
    }
  });

  test('rest props reach each element and className merges with the module classes', async () => {
    await mount(
      <DescriptionList id="specs" className="custom-root">
        <DescriptionList.Item className="custom-item">
          <DescriptionList.Term className="custom-term">Name</DescriptionList.Term>
          <DescriptionList.Detail className="custom-detail">Omnia</DescriptionList.Detail>
        </DescriptionList.Item>
      </DescriptionList>,
    );
    expect(parts('root')[0].id).toBe('specs');
    for (const name of ['root', 'item', 'term', 'detail']) {
      const el = parts(name)[0];
      expect(el.classList.contains(`custom-${name}`)).toBe(true);
      expect(el.classList.length).toBeGreaterThan(1);
    }
  });
});
