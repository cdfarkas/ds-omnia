import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { Avatar } from './Avatar';
import './Avatar.overrides.css';

const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" fill="#7c6cd8"/>' +
    '<circle cx="32" cy="25" r="12" fill="#f4e7d3"/>' +
    '<path d="M10 64c2-14 11-22 22-22s20 8 22 22z" fill="#f4e7d3"/>' +
    '</svg>',
)}`;

const brokenSrc = 'data:image/png;base64,broken';

const row = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
} as const;

const meta = {
  title: 'Atoms/Avatar',
  component: Avatar,
  args: { alt: 'Jane Doe', variantSize: 'md' },
  argTypes: {
    variantSize: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface: every arg is spread, so src, alt, initials and size are live. */
export const Playground: Story = {
  args: { src: portrait, initials: 'JD' },
  render: (args) => <Avatar {...args} />,
};

export const Image: Story = { args: { src: portrait } };

export const Initials: Story = { args: { initials: 'JD' } };

/** No `src` and no `initials`: the neutral user icon. */
export const Placeholder: Story = {};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: { code: '<Avatar variantSize="lg" alt="Jane Doe" initials="JD" />' },
    },
  },
  render: () => (
    <div style={row}>
      <Avatar variantSize="xs" alt="Jane Doe" initials="JD" />
      <Avatar variantSize="sm" alt="Jane Doe" initials="JD" />
      <Avatar variantSize="md" alt="Jane Doe" initials="JD" />
      <Avatar variantSize="lg" alt="Jane Doe" initials="JD" />
      <Avatar variantSize="xl" alt="Jane Doe" initials="JD" />
    </div>
  ),
};

/** An image that fails to load falls back to the initials, keeping the same accessible name. */
export const BrokenImage: Story = {
  tags: ['interaction'],
  args: { src: brokenSrc, initials: 'JD' },
  play: async ({ canvas, canvasElement, step }) => {
    await step('the broken image gives way to the initials', async () => {
      await waitFor(() =>
        expect(canvasElement.querySelector('[data-part="initials"]')).not.toBeNull(),
      );
      await expect(canvas.getByRole('img')).toHaveAccessibleName('Jane Doe');
    });
  },
};

/** Decorative: the name is already written next to it, so `alt=""` hides the avatar. */
export const Decorative: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Avatar alt="" initials="JD" />' } },
  },
  render: () => (
    <span style={{ ...row, gap: '0.5rem' }}>
      <Avatar alt="" initials="JD" />
      Jane Doe
    </span>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-avatar` class in
 * `@layer overrides` re-points `--omnia-avatar-radius`/`--omnia-avatar-bg`/`--omnia-avatar-fg`
 * — no `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-avatar', initials: 'JD', variantSize: 'lg' },
};
