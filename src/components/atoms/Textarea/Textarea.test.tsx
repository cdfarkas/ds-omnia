import type { CSSProperties, ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';
import { Textarea } from './Textarea';
import * as stories from './Textarea.stories';

const { Playground, Sizes, Invalid, Disabled, ReadOnly } = composeStories(stories);

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
  document.documentElement.removeAttribute('data-skin');
});

async function mount(ui: ReactElement) {
  await act(async () => {
    root.render(ui);
  });
}

const textarea = () => container.querySelector('textarea') as HTMLTextAreaElement;

const box = () => textarea().getBoundingClientRect();

/** Inline width and height are what the browser writes when the user drags the handle. */
async function mountDragged(size: CSSProperties, parent: CSSProperties = {}) {
  await mount(
    <div style={parent}>
      <Textarea aria-label="Message" style={size} />
    </div>,
  );
}

function oneLine() {
  const style = getComputedStyle(textarea());
  return [
    style.lineHeight,
    style.paddingTop,
    style.paddingBottom,
    style.borderTopWidth,
    style.borderBottomWidth,
  ].reduce((sum, value) => sum + parseFloat(value), 0);
}

describe('Textarea edge cases', () => {
  test('defaults to the md variantSize and sets no rows of its own', async () => {
    await mount(<Textarea aria-label="Message" />);
    expect(textarea().dataset.size).toBe('md');
    expect(textarea().hasAttribute('rows')).toBe(false);
  });

  test('renders the bare textarea: className, style and native props all land on it', async () => {
    await mount(
      <Textarea
        aria-label="Message"
        className="custom"
        style={{ maxInlineSize: '20rem' }}
        variantSize="lg"
        id="message"
        name="message"
        rows={5}
        maxLength={80}
        wrap="hard"
      />,
    );
    const el = textarea();
    expect(container.firstElementChild).toBe(el);
    expect(el.dataset.scope).toBe('textarea');
    expect(el.dataset.part).toBe('root');
    expect(el.dataset.size).toBe('lg');
    expect(el.classList.contains('custom')).toBe(true);
    expect([...el.classList].filter((c) => c !== 'custom').length).toBeGreaterThan(0);
    expect(el.style.maxInlineSize).toBe('20rem');
    expect(el.id).toBe('message');
    expect(el.name).toBe('message');
    expect(el.rows).toBe(5);
    expect(el.maxLength).toBe(80);
    expect(el.wrap).toBe('hard');
  });

  test('ref reaches the native textarea', async () => {
    const ref = createRef<HTMLTextAreaElement>();
    await mount(<Textarea aria-label="Message" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current).toBe(textarea());
  });

  test('invalid sets aria-invalid and data-invalid', async () => {
    await mount(<Invalid />);
    expect(textarea().getAttribute('aria-invalid')).toBe('true');
    expect(textarea().hasAttribute('data-invalid')).toBe(true);
  });

  test('the resting state carries no state attribute and a handle on both axes', async () => {
    await mount(<Playground />);
    for (const name of ['aria-invalid', 'data-invalid', 'data-disabled', 'data-readonly'])
      expect(textarea().hasAttribute(name), name).toBe(false);
    expect(getComputedStyle(textarea()).resize).toBe('both');
  });

  test('a disabled textarea does not receive typed text and loses its handle', async () => {
    await mount(<Disabled />);
    await userEvent.type(textarea(), 'xyz');
    expect(textarea().value).toBe('See you soon.');
    expect(textarea().disabled).toBe(true);
    expect(textarea().hasAttribute('data-disabled')).toBe(true);
    expect(getComputedStyle(textarea()).resize).toBe('none');
  });

  test('a disabled fieldset also removes the handle', async () => {
    await mount(
      <fieldset disabled>
        <Textarea aria-label="Message" />
      </fieldset>,
    );
    expect(getComputedStyle(textarea()).resize).toBe('none');
  });

  test('a read-only textarea keeps its value, focus and handle', async () => {
    await mount(<ReadOnly />);
    await userEvent.type(textarea(), 'xyz');
    expect(textarea().value).toBe('See you soon.');
    expect(document.activeElement).toBe(textarea());
    expect(textarea().hasAttribute('data-readonly')).toBe(true);
    expect(getComputedStyle(textarea()).resize).toBe('both');
  });

  test('a wide cols shrinks to the space left in a flex row', async () => {
    await mount(
      <div style={{ display: 'flex', inlineSize: '200px' }}>
        <Textarea aria-label="Message" cols={100} />
        <span style={{ flex: 'none', inlineSize: '100px' }} />
      </div>,
    );
    expect(textarea().getBoundingClientRect().width).toBe(100);
  });

  test('fills its parent until it is dragged', async () => {
    await mountDragged({}, { width: 260 });
    expect(box().width).toBe(260);
  });

  test('a drag narrower than the parent keeps its size on both axes', async () => {
    await mountDragged({ width: 180, height: 120 }, { width: 260, height: 160 });
    expect(box().width).toBe(180);
    expect(box().height).toBe(120);
  });

  test('a drag past the parent stops at its width', async () => {
    await mountDragged({ width: 900 }, { width: 260 });
    expect(box().width).toBe(260);
  });

  test('a drag past a parent with a definite height stops at that height', async () => {
    await mountDragged({ height: 900 }, { height: 160 });
    expect(box().height).toBe(160);
  });

  test('a drag past the parent stops at its width in the stories too', async () => {
    await mount(
      <div style={{ width: 260 }}>
        <Sizes />
      </div>,
    );
    textarea().style.width = '900px';
    expect(box().width).toBe(260);
  });

  test('a parent with no height does not bound the height', async () => {
    await mountDragged({ height: 900 });
    expect(box().height).toBe(900);
  });

  test.each(
    ['default', 'pixel', 'brutalist'].flatMap((skin) =>
      (['sm', 'md', 'lg'] as const).map((size) => [skin, size] as const),
    ),
  )('%s %s: a drag to nothing keeps one full line and 6rem', async (skin, size) => {
    document.documentElement.setAttribute('data-skin', skin);
    await mount(
      <Textarea
        aria-label="Message"
        variantSize={size}
        style={{ width: 0, height: 0 }}
      />,
    );
    expect(box().height).toBeCloseTo(oneLine(), 1);
    expect(box().width).toBe(96);
  });

  test('the one-line minimum follows the padding override', async () => {
    await mountDragged({
      height: 0,
      '--omnia-textarea-padding-y': '30px',
    } as CSSProperties);
    expect(getComputedStyle(textarea()).paddingTop).toBe('30px');
    expect(box().height).toBeCloseTo(oneLine(), 1);
  });

  test('the minimum width never beats a narrower parent', async () => {
    await mountDragged({ width: 0 }, { width: 60 });
    expect(box().width).toBe(60);
  });

  test.each([
    ['sm', 4],
    ['md', 8],
    ['lg', 12],
  ] as const)(
    'pixel %s: scrolled text stops inside the focus ring, at the same box height',
    async (size, padding) => {
      document.documentElement.setAttribute('data-skin', 'pixel');
      await mount(<Textarea aria-label="Message" variantSize={size} rows={2} />);
      textarea().focus();
      const style = getComputedStyle(textarea());
      const ringInnerEdge = -parseFloat(style.outlineOffset);
      for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const)
        expect(parseFloat(style[`border${side}Width`]), side).toBeGreaterThanOrEqual(
          ringInnerEdge,
        );
      expect(ringInnerEdge).toBe(6);
      expect(box().height).toBeCloseTo(
        2 * parseFloat(style.lineHeight) + 2 * (padding + 2),
        1,
      );
    },
  );

  test.each([
    ['0px', 0],
    ['2px', 0],
    ['30px', 26],
  ])('pixel: a %s padding override keeps one full line', async (value, padding) => {
    document.documentElement.setAttribute('data-skin', 'pixel');
    await mountDragged({
      height: 0,
      '--omnia-textarea-padding-y': value,
      '--omnia-textarea-padding-x': value,
    } as CSSProperties);
    const style = getComputedStyle(textarea());
    expect(style.padding).toBe(`${padding}px`);
    expect(box().height).toBeCloseTo(oneLine(), 1);
  });

  test('pixel: the frame takes the border colour override, then the danger colour', async () => {
    document.documentElement.setAttribute('data-skin', 'pixel');
    const style = { '--omnia-textarea-border-color': 'rgb(1, 2, 3)' } as CSSProperties;
    const frame = () => getComputedStyle(textarea()).borderImageSource;
    await mount(<Textarea aria-label="Message" style={style} />);
    expect(frame()).toContain('rgb(1, 2, 3)');
    await mount(<Textarea aria-label="Message" style={style} invalid />);
    expect(frame()).toMatch(/^linear-gradient/);
    expect(frame()).not.toContain('rgb(1, 2, 3)');
  });

  test('pixel: unwrapped text still scrolls sideways', async () => {
    document.documentElement.setAttribute('data-skin', 'pixel');
    await mount(<Textarea aria-label="Message" wrap="off" />);
    expect(getComputedStyle(textarea()).overflowX).toBe('auto');
  });

  test('pixel: a disabled textarea keeps the 2px dashed border', async () => {
    document.documentElement.setAttribute('data-skin', 'pixel');
    await mount(<Textarea aria-label="Message" disabled />);
    const style = getComputedStyle(textarea());
    expect(style.borderTopWidth).toBe('2px');
    expect(style.borderTopStyle).toBe('dashed');
    expect(style.borderImageSource).toBe('none');
  });
});
