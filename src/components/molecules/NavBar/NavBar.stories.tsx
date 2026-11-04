import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { NavBar } from './NavBar';
import './NavBar.overrides.css';

const meta = {
  title: 'Molecules/NavBar',
  component: NavBar,
  subcomponents: { 'NavBar.Link': NavBar.Link },
  args: { children: null },
  render: (args) => (
    <NavBar {...args}>
      <NavBar.Link href="#work" current>
        Work
      </NavBar.Link>
      <NavBar.Link href="#about">About</NavBar.Link>
      <NavBar.Link href="#writing">Writing</NavBar.Link>
      <NavBar.Link href="https://github.com" external>
        GitHub
      </NavBar.Link>
    </NavBar>
  ),
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The current link is announced as the current page and is the only one marked. */
export const Current: Story = {
  tags: ['interaction'],
  play: async ({ canvas, step }) => {
    const nav = canvas.getByRole('navigation', { name: 'Main' });
    await step(
      'the bar is a labelled navigation landmark with a list of links',
      async () => {
        await expect(nav).toBeVisible();
        await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
      },
    );
    await step('only the current link carries aria-current="page"', async () => {
      await expect(canvas.getByRole('link', { name: 'Work' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      await expect(canvas.getByRole('link', { name: 'About' })).not.toHaveAttribute(
        'aria-current',
      );
    });
    await step('Tab moves focus through the links in order', async () => {
      await userEvent.tab();
      await expect(canvas.getByRole('link', { name: 'Work' })).toHaveFocus();
      await userEvent.tab();
      await expect(canvas.getByRole('link', { name: 'About' })).toHaveFocus();
      (document.activeElement as HTMLElement | null)?.blur();
    });
  },
};

/** At 320 CSS px the links wrap onto a second line instead of overflowing. */
export const Narrow: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ inlineSize: '320px', maxInlineSize: '100%' }}>
      <NavBar {...args}>
        <NavBar.Link href="#work" current>
          Work
        </NavBar.Link>
        <NavBar.Link href="#about">About</NavBar.Link>
        <NavBar.Link href="#writing">Writing</NavBar.Link>
        <NavBar.Link href="#projects">Projects</NavBar.Link>
        <NavBar.Link href="#talks">Talks</NavBar.Link>
        <NavBar.Link href="#contact">Contact</NavBar.Link>
      </NavBar>
    </div>
  ),
};

/**
 * Consumer override through the public contract: `.omnia-demo-override-navbar` in
 * `@layer overrides` re-points the gap and current-link variables. See docs/overrides.md.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-navbar' },
};

export const DarkNeutral: Story = { globals: { theme: 'dark' } };

export const PixelLight: Story = { globals: { skin: 'pixel' } };

export const PixelDark: Story = { globals: { theme: 'dark', skin: 'pixel' } };
