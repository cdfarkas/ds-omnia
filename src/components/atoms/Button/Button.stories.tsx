import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { intents } from '../../../lib/intents';
import { Button } from './Button';
import './Button.overrides.css';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  args: {
    children: 'Button',
    intent: 'primary',
    variantSize: 'md',
    onClick: fn(),
  },
  argTypes: {
    intent: {
      control: 'inline-radio',
      options: [...intents],
    },
    variantSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    pending: { control: 'boolean' },
    disabled: { control: 'boolean' },
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
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface: every arg is spread, so intent/variantSize/pending/disabled are live. */
export const Playground: Story = {
  render: (args) => <Button {...args} />,
};

export const Primary: Story = {
  tags: ['interaction'],
  play: async ({ canvas, args, step }) => {
    const button = canvas.getByRole('button', { name: 'Button' });
    await step('clicking fires onClick', async () => {
      await userEvent.click(button);
      await expect(args.onClick).toHaveBeenCalledOnce();
    });
  },
};

export const Neutral: Story = { args: { intent: 'neutral' } };

export const Danger: Story = { args: { intent: 'danger' } };

export const Intents: Story = {
  parameters: { docs: { source: { code: '<Button intent="danger">Delete</Button>' } } },
  render: (args) => (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}
    >
      {intents.map((intent) => (
        <Button {...args} key={intent} intent={intent}>
          {intent.charAt(0).toUpperCase() + intent.slice(1)}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { docs: { source: { code: '<Button variantSize="lg">Large</Button>' } } },
  render: (args) => (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}
    >
      <Button {...args} variantSize="sm">
        Small
      </Button>
      <Button {...args} variantSize="md">
        Medium
      </Button>
      <Button {...args} variantSize="lg">
        Large
      </Button>
    </div>
  ),
};

export const Loading: Story = { args: { pending: true } };

export const Disabled: Story = { args: { disabled: true } };

/**
 * Consumer override through the public contract: a `.omnia-demo-override` class in
 * `@layer overrides` re-points `--omnia-button-radius`/`--omnia-button-bg` and resizes the
 * `[data-part="spinner"]` sub-part — no `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  parameters: {
    docs: {
      source: { code: '<Button className="omnia-demo-override">Overridden</Button>' },
    },
  },
  render: (args) => (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}
    >
      <Button {...args} className="omnia-demo-override">
        Overridden
      </Button>
      <Button {...args} className="omnia-demo-override" pending>
        Overridden
      </Button>
    </div>
  ),
};

export const DarkNeutral: Story = { ...Intents, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Intents, globals: { skin: 'pixel' } };

export const PixelDark: Story = { ...Intents, globals: { theme: 'dark', skin: 'pixel' } };
