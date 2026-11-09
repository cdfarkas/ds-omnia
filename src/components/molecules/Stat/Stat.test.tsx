import type { ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { composeStories } from '@storybook/react-vite';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { expect } from 'storybook/test';
import { Stat } from './Stat';
import * as stories from './Stat.stories';
import '../../../styles/tokens.css';

const { Playground, WithoutHint, Several, Vertical } = composeStories(stories);

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
  ...container.querySelectorAll<HTMLElement>(`[data-scope="stat"][data-part="${name}"]`),
];

const columnCount = (el: HTMLElement) =>
  getComputedStyle(el).gridTemplateColumns.split(' ').length;

describe('Stat edge cases', () => {
  test('the root is the only <dl> and each item is a <div> of <dt>/<dd>', async () => {
    await mount(<Several />);
    expect(parts('root').map((el) => el.tagName)).toEqual(['DL']);
    expect(container.querySelectorAll('dl')).toHaveLength(1);
    const items = parts('item');
    expect(items).toHaveLength(4);
    for (const el of items) {
      expect(el.tagName).toBe('DIV');
      expect(el.parentElement).toBe(parts('root')[0]);
      expect(new Set([...el.children].map((child) => child.tagName))).toEqual(
        new Set(['DT', 'DD']),
      );
    }
  });

  test('DOM order is label, value, hint while the value is drawn above the label', async () => {
    await mount(<Playground />);
    const [item] = parts('item');
    expect([...item.children].map((el) => el.getAttribute('data-part'))).toEqual([
      'label',
      'value',
      'hint',
    ]);
    const valueTop = parts('value')[0].getBoundingClientRect().top;
    const labelTop = parts('label')[0].getBoundingClientRect().top;
    expect(valueTop).toBeLessThan(labelTop);
  });

  test('the hint is optional', async () => {
    await mount(<WithoutHint />);
    expect(container.querySelectorAll('dd')).toHaveLength(1);
    expect(parts('hint')).toHaveLength(0);
  });

  test('horizontal wraps into several columns when wide, vertical keeps one', async () => {
    container.style.inlineSize = '40rem';
    await mount(<Several />);
    expect(parts('root')[0].getAttribute('data-orientation')).toBe('horizontal');
    expect(columnCount(parts('root')[0])).toBeGreaterThan(1);

    await mount(<Vertical />);
    expect(parts('root')[0].getAttribute('data-orientation')).toBe('vertical');
    expect(columnCount(parts('root')[0])).toBe(1);
  });

  test('ref forwards on every part', async () => {
    const refs = {
      root: createRef<HTMLDListElement>(),
      item: createRef<HTMLDivElement>(),
      label: createRef<HTMLElement>(),
      value: createRef<HTMLElement>(),
      hint: createRef<HTMLElement>(),
    };
    await mount(
      <Stat ref={refs.root}>
        <Stat.Item ref={refs.item}>
          <Stat.Label ref={refs.label}>components</Stat.Label>
          <Stat.Value ref={refs.value}>30+</Stat.Value>
          <Stat.Hint ref={refs.hint}>in the library</Stat.Hint>
        </Stat.Item>
      </Stat>,
    );
    for (const [name, ref] of Object.entries(refs)) {
      expect(ref.current).toBe(parts(name)[0]);
    }
  });

  test('rest props reach each element and className merges with the module classes', async () => {
    await mount(
      <Stat id="root-id" className="custom-root">
        <Stat.Item id="item-id" className="custom-item">
          <Stat.Label id="label-id" className="custom-label">
            components
          </Stat.Label>
          <Stat.Value id="value-id" className="custom-value">
            30+
          </Stat.Value>
          <Stat.Hint id="hint-id" className="custom-hint">
            in the library
          </Stat.Hint>
        </Stat.Item>
      </Stat>,
    );
    for (const name of ['root', 'item', 'label', 'value', 'hint']) {
      const el = parts(name)[0];
      expect(el.id).toBe(`${name}-id`);
      expect(el.classList.contains(`custom-${name}`)).toBe(true);
      expect(el.classList.length).toBeGreaterThan(1);
    }
  });
});
