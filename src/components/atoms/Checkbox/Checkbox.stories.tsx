import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Checkbox } from './Checkbox';
import './Checkbox.overrides.css';

const stack = { display: 'grid', gap: '1rem', justifyItems: 'start' } as const;

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  args: {
    children: 'Accept the terms',
    variantSize: 'md',
    onChange: fn(),
    onBlur: fn(),
  },
  argTypes: {
    children: { control: 'text' },
    variantSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
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
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface: every arg except `className`/`style` is spread onto the native input. */
export const Playground: Story = {
  tags: ['interaction'],
  play: async ({ args, canvas, step }) => {
    const box = canvas.getByRole('checkbox', { name: 'Accept the terms' });
    await step('clicking the label checks the box', async () => {
      await userEvent.click(canvas.getByText('Accept the terms'));
      await expect(box).toBeChecked();
      await expect(args.onChange).toHaveBeenCalled();
    });
    await step('Space unchecks it', async () => {
      box.focus();
      await userEvent.keyboard(' ');
      await expect(box).not.toBeChecked();
    });
    await step('leaving the box keeps its state', async () => {
      box.blur();
      await expect(box).not.toHaveFocus();
      await expect(box).not.toBeChecked();
    });
  },
};

export const Checked: Story = { args: { defaultChecked: true } };

/** Mixed state, e.g. a "select all" over a partial selection; the form value stays `checked`. */
export const Indeterminate: Story = {
  args: { indeterminate: true, children: 'Select all' },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: { code: '<Checkbox variantSize="lg">Accept the terms</Checkbox>' },
    },
  },
  render: (args) => (
    <div style={stack}>
      <Checkbox {...args} variantSize="sm" defaultChecked>
        Small
      </Checkbox>
      <Checkbox {...args} variantSize="md" defaultChecked>
        Medium
      </Checkbox>
      <Checkbox {...args} variantSize="lg" defaultChecked>
        Large
      </Checkbox>
    </div>
  ),
};

export const Invalid: Story = { args: { invalid: true } };

export const Disabled: Story = {
  parameters: {
    docs: { source: { code: '<Checkbox disabled>Accept the terms</Checkbox>' } },
  },
  render: (args) => (
    <div style={stack}>
      <Checkbox {...args} disabled>
        Disabled
      </Checkbox>
      <Checkbox {...args} disabled defaultChecked>
        Disabled, checked
      </Checkbox>
    </div>
  ),
};

/** No children: the accessible name must come from `aria-label` or `aria-labelledby`. */
export const WithoutVisibleLabel: Story = {
  args: { children: undefined, 'aria-label': 'Select row 1' },
};

export const LongLabel: Story = {
  args: {
    children:
      'I agree to receive occasional product news by email and understand that I can unsubscribe at any time from the link in each message.',
  },
};

/** Every state in one view; the mode stories below reuse it so axe checks each state per mode. */
export const States: Story = {
  parameters: {
    docs: { source: { code: '<Checkbox>Accept the terms</Checkbox>' } },
  },
  render: (args) => (
    <div style={stack}>
      <Checkbox {...args}>Unchecked</Checkbox>
      <Checkbox {...args} defaultChecked>
        Checked
      </Checkbox>
      <Checkbox {...args} indeterminate>
        Indeterminate
      </Checkbox>
      <Checkbox {...args} invalid>
        Invalid
      </Checkbox>
      <Checkbox {...args} invalid defaultChecked>
        Invalid, checked
      </Checkbox>
      <Checkbox {...args} disabled>
        Disabled
      </Checkbox>
      <Checkbox {...args} disabled defaultChecked>
        Disabled, checked
      </Checkbox>
      <Checkbox {...args} disabled indeterminate>
        Disabled, indeterminate
      </Checkbox>
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-checkbox` class in
 * `@layer overrides` re-points `--omnia-checkbox-radius`/`--omnia-checkbox-bg`/
 * `--omnia-checkbox-border-color`/`--omnia-checkbox-checked-bg` and restyles the
 * `[data-part="label"]` sub-part — no `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  parameters: {
    docs: {
      source: {
        code: '<Checkbox className="omnia-demo-override-checkbox">Keep me signed in</Checkbox>',
      },
    },
  },
  render: (args) => (
    <div style={stack}>
      <Checkbox {...args} className="omnia-demo-override-checkbox" />
      <Checkbox {...args} className="omnia-demo-override-checkbox" defaultChecked>
        Keep me signed in
      </Checkbox>
    </div>
  ),
};

export const DarkNeutral: Story = { ...States, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...States, globals: { skin: 'pixel' } };

export const PixelDark: Story = { ...States, globals: { theme: 'dark', skin: 'pixel' } };
