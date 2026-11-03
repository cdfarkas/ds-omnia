import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Spinner } from './Spinner';
import './Spinner.overrides.css';

const row = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
} as const;

const meta = {
  title: 'Atoms/Spinner',
  component: Spinner,
  args: { variantSize: 'md' },
  argTypes: {
    variantSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
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
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface, and the catalogue a11y check: the status exposes a loading name. */
export const Playground: Story = {
  tags: ['interaction'],
  render: (args) => <Spinner {...args} />,
  play: async ({ canvas, step }) => {
    await step('the spinner is a status with a loading name', async () => {
      const status = canvas.getByRole('status');
      await expect(status).toHaveAccessibleName(/loading|chargement/i);
    });
  },
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Spinner variantSize="lg" />' } },
  },
  render: () => (
    <div style={row}>
      <Spinner variantSize="sm" />
      <Spinner variantSize="md" />
      <Spinner variantSize="lg" />
    </div>
  ),
};

/**
 * Decorative: a caller whose own text already says what is loading passes `aria-hidden` (spread
 * after the defaults), dropping the spinner from the accessibility tree.
 */
export const Decorative: Story = {
  parameters: { docs: { source: { code: '<Spinner aria-hidden="true" />' } } },
  render: (args) => (
    <span style={row}>
      <Spinner {...args} aria-hidden="true" />
      Saving your changes…
    </span>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-spinner` class in
 * `@layer overrides` re-points `--omnia-spinner-color`/`--omnia-spinner-thickness` — no
 * `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  args: { variantSize: 'lg', className: 'omnia-demo-override-spinner' },
};

export const DarkNeutral: Story = { ...Sizes, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Sizes, globals: { skin: 'pixel' } };

export const PixelDark: Story = {
  ...Sizes,
  globals: { theme: 'dark', skin: 'pixel' },
};
