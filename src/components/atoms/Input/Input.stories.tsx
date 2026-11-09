import { useId } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Input, type InputProps } from './Input';
import './Input.overrides.css';

function Field({ label, ...props }: InputProps & { label: string }) {
  const id = useId();
  return (
    <div style={{ display: 'grid', gap: '0.375rem' }}>
      <label htmlFor={id}>{label}</label>
      <Input id={id} {...props} />
    </div>
  );
}

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="7" cy="7" r="5" />
    <path d="m11 11 4 4" />
  </svg>
);

const meta = {
  title: 'Atoms/Input',
  component: Input,
  args: {
    type: 'email',
    variantSize: 'md',
    placeholder: 'name@example.com',
    onChange: fn(),
    onBlur: fn(),
  },
  argTypes: {
    variantSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    type: {
      control: 'inline-radio',
      options: ['text', 'email', 'url', 'tel', 'password'],
    },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    startAdornment: { control: false },
    endAdornment: { control: false },
    ref: { control: false },
  },
  render: (args) => <Field label="Email" {...args} />,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface: every arg is spread onto the input, inside a labelled field. */
export const Playground: Story = {
  tags: ['interaction'],
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="email">Email</label>\n<Input id="email" type="email" placeholder="name@example.com" />',
      },
    },
  },
  play: async ({ canvas, step }) => {
    const input = canvas.getByLabelText('Email');
    await step('typing fills the field', async () => {
      await userEvent.type(input, 'ada@example.com');
      await expect(input).toHaveValue('ada@example.com');
    });
    await step('leaving the field keeps the value', async () => {
      input.blur();
      await expect(input).not.toHaveFocus();
      await expect(input).toHaveValue('ada@example.com');
    });
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="email">Email</label>\n<Input id="email" variantSize="lg" />',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Field label="Small" {...args} variantSize="sm" />
      <Field label="Medium" {...args} variantSize="md" />
      <Field label="Large" {...args} variantSize="lg" />
    </div>
  ),
};

export const WithAdornments: Story = {
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="website">Website</label>\n<Input id="website" type="url" startAdornment="https://" placeholder="example.com" />',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Field
        {...args}
        label="Website"
        type="url"
        placeholder="example.com"
        startAdornment="https://"
      />
      <Field
        {...args}
        label="Search"
        type="text"
        placeholder="Components"
        startAdornment={<SearchIcon />}
      />
      <Field
        {...args}
        label="Amount"
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        endAdornment="EUR"
      />
    </div>
  ),
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'ada@' },
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="email">Email</label>\n<Input id="email" type="email" invalid defaultValue="ada@" />',
      },
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'ada@example.com' },
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="email">Email</label>\n<Input id="email" type="email" disabled defaultValue="ada@example.com" />',
      },
    },
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'ada@example.com' },
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="email">Email</label>\n<Input id="email" type="email" readOnly defaultValue="ada@example.com" />',
      },
    },
  },
};

/** Every state in one view; the mode stories below reuse it so axe checks each state per mode. */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Field {...args} label="Default" />
      <Field {...args} label="Filled" defaultValue="ada@example.com" />
      <Field {...args} label="Invalid" invalid defaultValue="ada@" />
      <Field {...args} label="Disabled" disabled defaultValue="ada@example.com" />
      <Field {...args} label="Read-only" readOnly defaultValue="ada@example.com" />
      <Field
        {...args}
        label="Website"
        type="url"
        placeholder="example.com"
        startAdornment="https://"
        endAdornment={<SearchIcon />}
      />
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-input` class in
 * `@layer overrides` re-points `--omnia-input-radius`/`--omnia-input-bg`/
 * `--omnia-input-border-color` and restyles the `[data-part="start"]` sub-part — no
 * `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  args: {
    className: 'omnia-demo-override-input',
    type: 'url',
    placeholder: 'example.com',
    startAdornment: 'https://',
  },
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="website">Website</label>\n<Input id="website" type="url" className="omnia-demo-override-input" startAdornment="https://" />',
      },
    },
  },
  render: (args) => <Field label="Website" {...args} />,
};

export const DarkNeutral: Story = { ...States, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...States, globals: { skin: 'pixel' } };

export const PixelDark: Story = { ...States, globals: { theme: 'dark', skin: 'pixel' } };
