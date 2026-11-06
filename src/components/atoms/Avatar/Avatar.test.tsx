import type { ReactElement } from 'react';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Avatar } from './Avatar';
import * as stories from './Avatar.stories';

const { Image, Initials, Placeholder, Sizes, BrokenImage, Decorative } =
  composeStories(stories);

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
  container.querySelector(`[data-scope="avatar"][data-part="${name}"]`);

const broken = 'data:image/png;base64,broken';
const pixel =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

describe('Avatar edge cases', () => {
  test('the accessible name is alt in every state', async () => {
    for (const Story of [Image, Initials, Placeholder]) {
      await mount(<Story />);
      expect(within(container).getByRole('img')).toHaveAccessibleName('Jane Doe');
    }
  });

  test('image mode: the img carries alt and the root has no role', async () => {
    await mount(<Image />);
    expect(part('image')?.getAttribute('alt')).toBe('Jane Doe');
    expect(part('root')?.hasAttribute('role')).toBe(false);
  });

  test('fallback mode: the root is the named img and its content is hidden', async () => {
    await mount(<Initials />);
    expect(within(container).getByRole('img')).toBe(part('root'));
    expect(part('initials')?.getAttribute('aria-hidden')).toBe('true');
    await mount(<Placeholder />);
    expect(part('placeholder')?.getAttribute('aria-hidden')).toBe('true');
  });

  test('a failed image falls back to initials, then to the icon without them', async () => {
    await mount(<BrokenImage />);
    await waitFor(() => expect(part('initials')).not.toBeNull());
    expect(part('image')).toBeNull();
    await mount(<Avatar src={broken} alt="Jane Doe" />);
    await waitFor(() => expect(part('placeholder')).not.toBeNull());
  });

  test('a new src retries the image after a failure', async () => {
    await mount(<Avatar src={broken} alt="Jane Doe" initials="JD" />);
    await waitFor(() => expect(part('initials')).not.toBeNull());
    await mount(<Avatar src={pixel} alt="Jane Doe" initials="JD" />);
    expect(part('image')?.getAttribute('src')).toBe(pixel);
  });

  test('alt="" hides the fallback from assistive technology', async () => {
    await mount(<Decorative />);
    expect(part('root')?.getAttribute('aria-hidden')).toBe('true');
    expect(within(container).queryByRole('img')).toBeNull();
  });

  test('alt="" on an image leaves a decorative img', async () => {
    await mount(<Avatar src={pixel} alt="" />);
    expect(part('image')?.getAttribute('alt')).toBe('');
    expect(within(container).queryByRole('img')).toBeNull();
  });

  test('defaults to md and variantSize reflects data-variant-size', async () => {
    await mount(<Avatar alt="Jane Doe" />);
    expect(part('root')?.getAttribute('data-variant-size')).toBe('md');
    await mount(<Sizes />);
    const sizes = [...container.querySelectorAll('[data-part="root"]')].map((el) =>
      el.getAttribute('data-variant-size'),
    );
    expect(sizes).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
  });

  test('className, ref and rest props reach the root span', async () => {
    const ref = createRef<HTMLSpanElement>();
    await mount(
      <Avatar alt="Jane Doe" className="custom" id="me" title="Jane" ref={ref} />,
    );
    const el = part('root') as HTMLElement;
    expect(ref.current).toBe(el);
    expect(el.tagName).toBe('SPAN');
    expect(el.id).toBe('me');
    expect(el.title).toBe('Jane');
    expect(el.classList.contains('custom')).toBe(true);
    expect([...el.classList].filter((c) => c !== 'custom').length).toBeGreaterThan(0);
  });
});
