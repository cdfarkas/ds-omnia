import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Switch } from './Switch';
import './Switch.overrides.css';

const stack = { display: 'grid', gap: '1rem', justifyItems: 'start' } as const;

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
  args: {
    children: 'Email notifications',
    variantSize: 'md',
    onChange: fn(),
    onBlur: fn(),
  },
  argTypes: {
    children: { control: 'text' },
    variantSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    ref: { control: false },
  },
  parameters: {
    layout: 'padded',
    chromatic: {
      modes: {
        'light-neutral': { theme: 'light', skin: 'default' },
        'dark-neutral': { theme: 'dark', skin: 'default' },
        'light-pixel': { theme: 'light', skin: 'pixel' },
        'dark-pixel': { theme: 'dark', skin: 'pixel' },
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface: every arg except `className`/`style` is spread onto the native input. */
export const Playground: Story = {
  tags: ['interaction'],
  play: async ({ args, canvas, step }) => {
    const control = canvas.getByRole('switch', { name: 'Email notifications' });
    await step('clicking the label turns it on', async () => {
      await userEvent.click(canvas.getByText('Email notifications'));
      await expect(control).toBeChecked();
      await expect(args.onChange).toHaveBeenCalled();
    });
    await step('Space turns it off', async () => {
      control.focus();
      await userEvent.keyboard(' ');
      await expect(control).not.toBeChecked();
    });
    await step('leaving the switch keeps its state', async () => {
      control.blur();
      await expect(control).not.toHaveFocus();
      await expect(control).not.toBeChecked();
    });
  },
};

export const Checked: Story = { args: { defaultChecked: true } };

export const Sizes: Story = {
  parameters: {
    docs: {
      source: { code: '<Switch variantSize="lg">Email notifications</Switch>' },
    },
  },
  render: (args) => (
    <div style={stack}>
      <Switch {...args} variantSize="sm" defaultChecked>
        Small
      </Switch>
      <Switch {...args} variantSize="md" defaultChecked>
        Medium
      </Switch>
      <Switch {...args} variantSize="lg" defaultChecked>
        Large
      </Switch>
    </div>
  ),
};

export const Invalid: Story = { args: { invalid: true } };

export const Disabled: Story = {
  parameters: {
    docs: { source: { code: '<Switch disabled>Email notifications</Switch>' } },
  },
  render: (args) => (
    <div style={stack}>
      <Switch {...args} disabled>
        Disabled
      </Switch>
      <Switch {...args} disabled defaultChecked>
        Disabled, on
      </Switch>
    </div>
  ),
};

/** No children: the accessible name must come from `aria-label` or `aria-labelledby`. */
export const WithoutVisibleLabel: Story = {
  args: { children: undefined, 'aria-label': 'Dark mode' },
};

export const LongLabel: Story = {
  args: {
    children:
      'Send me a weekly summary of account activity by email, including sign-ins from new devices and changes to billing details.',
  },
};

/** Every state in one view; the mode stories below reuse it so axe checks each state per mode. */
export const States: Story = {
  parameters: {
    docs: { source: { code: '<Switch>Email notifications</Switch>' } },
  },
  render: (args) => (
    <div style={stack}>
      <Switch {...args}>Off</Switch>
      <Switch {...args} defaultChecked>
        On
      </Switch>
      <Switch {...args} invalid>
        Invalid
      </Switch>
      <Switch {...args} invalid defaultChecked>
        Invalid, on
      </Switch>
      <Switch {...args} disabled>
        Disabled
      </Switch>
      <Switch {...args} disabled defaultChecked>
        Disabled, on
      </Switch>
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-switch` class in
 * `@layer overrides` re-points `--omnia-switch-radius`/`--omnia-switch-bg`/
 * `--omnia-switch-border-color`/`--omnia-switch-checked-bg` and restyles the
 * `[data-part="label"]` sub-part — no `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  parameters: {
    docs: {
      source: {
        code: '<Switch className="omnia-demo-override-switch">Auto-save drafts</Switch>',
      },
    },
  },
  render: (args) => (
    <div style={stack}>
      <Switch {...args} className="omnia-demo-override-switch" />
      <Switch {...args} className="omnia-demo-override-switch" defaultChecked>
        Auto-save drafts
      </Switch>
    </div>
  ),
};

export const DarkNeutral: Story = { ...States, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...States, globals: { skin: 'pixel' } };

export const PixelDark: Story = { ...States, globals: { theme: 'dark', skin: 'pixel' } };
