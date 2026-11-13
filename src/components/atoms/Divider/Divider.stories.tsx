import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Divider } from './Divider';
import './Divider.overrides.css';

const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  // The centered layout shrink-wraps its root, so a % cap never applies; 2rem is its padding.
  inlineSize: 'min(20rem, 100vw - 2rem)',
} as const;

const row = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  blockSize: '3rem',
} as const;

const meta = {
  title: 'Atoms/Divider',
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface, and the catalogue a11y check: the rule is a semantic separator. */
export const Playground: Story = {
  tags: ['interaction'],
  render: (args) => <Divider {...args} />,
  play: async ({ canvas, step }) => {
    await step('the rule is exposed as a separator by default', async () => {
      await expect(canvas.getByRole('separator')).toBeInTheDocument();
    });
  },
};

export const PlainRule: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Divider />' } },
  },
  render: () => (
    <div style={stack}>
      <span>Account settings</span>
      <Divider />
      <span>Danger zone</span>
    </div>
  ),
};

/**
 * Vertical: a `<div role="separator" aria-orientation="vertical">` that fills a sized container —
 * here a flex row with a fixed height. Same semantic tokens as the horizontal rule.
 */
export const Vertical: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Divider orientation="vertical" />' } },
  },
  render: () => (
    <div style={row}>
      <span>Home</span>
      <Divider orientation="vertical" />
      <span>Profile</span>
      <Divider orientation="vertical" />
      <span>Settings</span>
    </div>
  ),
};

/**
 * Decorative: when the surrounding layout already separates the content visually, pass `role="none"`
 * (or `aria-hidden`) to drop the rule from the accessibility tree.
 */
export const Decorative: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Divider role="none" />' } },
  },
  render: () => (
    <div style={stack}>
      <span>Step one</span>
      <Divider role="none" />
      <span>Step two</span>
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-divider` class in
 * `@layer overrides` re-points `--omnia-divider-color`/`--omnia-divider-thickness` — no
 * `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  parameters: { controls: { disable: true } },
  args: { className: 'omnia-demo-override-divider' },
  render: (args) => (
    <div style={stack}>
      <span>Before</span>
      <Divider {...args} />
      <span>After</span>
    </div>
  ),
};

export const DarkNeutral: Story = { ...PlainRule, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...PlainRule, globals: { skin: 'pixel' } };

export const PixelDark: Story = {
  ...PlainRule,
  globals: { theme: 'dark', skin: 'pixel' },
};
