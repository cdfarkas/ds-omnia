import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Text } from './Text';
import './Text.overrides.css';

const column = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  alignItems: 'flex-start',
} as const;

const meta = {
  title: 'Atoms/Text',
  component: Text,
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
    as: 'p',
    variantSize: 'md',
    tone: 'default',
  },
  argTypes: {
    as: { control: 'inline-radio', options: ['p', 'span'] },
    variantSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['default', 'muted'] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface, and the catalogue a11y check: the text exposes its content. */
export const Playground: Story = {
  tags: ['interaction'],
  render: (args) => <Text {...args} />,
  play: async ({ canvas, step }) => {
    await step('the text renders its content', async () => {
      await expect(canvas.getByText(/quick brown fox/i)).toBeInTheDocument();
    });
  },
};

export const Scale: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Text variantSize="lg">The quick brown fox…</Text>' } },
  },
  render: () => (
    <div style={column}>
      <Text variantSize="sm">The quick brown fox jumps over the lazy dog</Text>
      <Text variantSize="md">The quick brown fox jumps over the lazy dog</Text>
      <Text variantSize="lg">The quick brown fox jumps over the lazy dog</Text>
    </div>
  ),
};

export const Tones: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Text tone="muted">…</Text>' } },
  },
  render: () => (
    <div style={column}>
      <Text tone="default">The quick brown fox jumps over the lazy dog</Text>
      <Text tone="muted">The quick brown fox jumps over the lazy dog</Text>
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-text` class in
 * `@layer overrides` re-points `--omnia-text-color` — no `!important`, no hashed class names.
 * See docs/overrides.md.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-text', children: 'Overridden' },
};

export const DarkNeutral: Story = { ...Tones, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Tones, globals: { skin: 'pixel' } };

export const PixelDark: Story = {
  ...Tones,
  globals: { theme: 'dark', skin: 'pixel' },
};
