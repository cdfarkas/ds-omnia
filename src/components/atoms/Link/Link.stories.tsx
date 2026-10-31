import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Link } from './Link';
import './Link.overrides.css';

const meta = {
  title: 'Atoms/Link',
  component: Link,
  args: {
    children: 'Omnia design system',
    href: 'https://example.com',
    variant: 'standalone',
    external: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['inline', 'standalone'] },
    external: { control: 'boolean' },
  },
  parameters: {
    chromatic: {
      modes: {
        'light-neutral': { theme: 'light', skin: 'default' },
        'dark-neutral': { theme: 'dark', skin: 'default' },
        'light-pixel': { theme: 'light', skin: 'pixel' },
        'dark-pixel': { theme: 'dark', skin: 'pixel' },
      },
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface: every arg is spread, so variant/external/children are live. */
export const Playground: Story = {
  render: (args) => <Link {...args} />,
};

export const Standalone: Story = {};

/** Inline links inherit the surrounding paragraph's size and weight. */
export const Inline: Story = {
  args: { variant: 'inline' },
  render: (args) => (
    <p style={{ maxWidth: '32ch', fontSize: '1.125rem' }}>
      Read the <Link {...args}>full documentation</Link> before you start.
    </p>
  ),
};

export const External: Story = {
  tags: ['interaction'],
  args: { external: true },
  play: async ({ canvas, step }) => {
    const link = canvas.getByRole('link', {
      name: /Omnia design system.*opens in new window/i,
    });
    await step('external link opens safely in a new window', async () => {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  },
};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Link {...args} variant="standalone">
        Standalone link
      </Link>
      <p style={{ margin: 0 }}>
        An{' '}
        <Link {...args} variant="inline">
          inline link
        </Link>{' '}
        inside a sentence.
      </p>
      <Link {...args} external>
        External link
      </Link>
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-link` class in
 * `@layer overrides` re-points `--omnia-link-color`/`--omnia-link-color-hover` — no
 * `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  render: (args) => (
    <Link {...args} className="omnia-demo-override-link">
      Overridden
    </Link>
  ),
};

export const DarkNeutral: Story = { ...Variants, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Variants, globals: { skin: 'pixel' } };

export const PixelDark: Story = {
  ...Variants,
  globals: { theme: 'dark', skin: 'pixel' },
};
