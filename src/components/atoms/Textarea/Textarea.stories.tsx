import { useId } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Textarea, type TextareaProps } from './Textarea';
import './Textarea.overrides.css';

const longText =
  'Thanks for the update.\n\nThe new layout reads well on a phone, and the search is much faster than before. One thing is still missing: a way to sort the results by date.';

const fieldStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: '0.375rem',
};
const galleryStyle = { ...fieldStyle, gap: '1rem' };

function Field({ label, ...props }: TextareaProps & { label: string }) {
  const id = useId();
  return (
    <div style={fieldStyle}>
      <label htmlFor={id}>{label}</label>
      <Textarea id={id} {...props} />
    </div>
  );
}

const meta = {
  title: 'Atoms/Textarea',
  component: Textarea,
  args: {
    variantSize: 'md',
    rows: 3,
    placeholder: 'Write a message',
    onChange: fn(),
    onBlur: fn(),
  },
  argTypes: {
    variantSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    rows: { control: 'number' },
    maxLength: { control: 'number' },
    minLength: { control: 'number' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    ref: { control: false },
  },
  render: (args) => <Field label="Message" {...args} />,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface: every arg is spread onto the textarea, inside a labelled field. */
export const Playground: Story = {
  tags: ['interaction'],
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="message">Message</label>\n<Textarea id="message" rows={3} placeholder="Write a message" />',
      },
    },
  },
  play: async ({ canvas, step }) => {
    const textarea = canvas.getByLabelText('Message');
    await step('Enter starts a new line', async () => {
      await userEvent.type(textarea, 'Hello,{Enter}see you soon.');
      await expect(textarea).toHaveValue('Hello,\nsee you soon.');
    });
    await step('leaving the field keeps the value', async () => {
      textarea.blur();
      await expect(textarea).not.toHaveFocus();
      await expect(textarea).toHaveValue('Hello,\nsee you soon.');
    });
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="message">Message</label>\n<Textarea id="message" variantSize="lg" />',
      },
    },
  },
  render: (args) => (
    <div style={galleryStyle}>
      <Field label="Small" {...args} variantSize="sm" />
      <Field label="Medium" {...args} variantSize="md" />
      <Field label="Large" {...args} variantSize="lg" />
    </div>
  ),
};

/** `rows` sets the starting height; a longer text scrolls inside, or the user drags the handle. */
export const Rows: Story = {
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="message">Message</label>\n<Textarea id="message" rows={8} />',
      },
    },
  },
  render: (args) => (
    <div style={galleryStyle}>
      <Field {...args} label="Comment" rows={undefined} defaultValue={longText} />
      <Field {...args} label="Message" rows={8} defaultValue={longText} />
    </div>
  ),
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'Hi' },
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="message">Message</label>\n<Textarea id="message" rows={3} invalid defaultValue="Hi" />',
      },
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'See you soon.' },
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="message">Message</label>\n<Textarea id="message" rows={3} disabled defaultValue="See you soon." />',
      },
    },
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'See you soon.' },
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="message">Message</label>\n<Textarea id="message" rows={3} readOnly defaultValue="See you soon." />',
      },
    },
  },
};

/** Every state in one view; the mode stories below reuse it so axe checks each state per mode. */
export const States: Story = {
  render: (args) => (
    <div style={galleryStyle}>
      <Field {...args} label="Default" />
      <Field {...args} label="Filled" defaultValue={longText} />
      <Field {...args} label="Invalid" invalid defaultValue="Hi" />
      <Field {...args} label="Disabled" disabled defaultValue="See you soon." />
      <Field {...args} label="Read-only" readOnly defaultValue="See you soon." />
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-textarea` class in
 * `@layer overrides` re-points `--omnia-textarea-radius`/`--omnia-textarea-bg`/
 * `--omnia-textarea-border-color` — no `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-textarea' },
  parameters: {
    docs: {
      source: {
        code: '<label htmlFor="message">Message</label>\n<Textarea id="message" rows={3} className="omnia-demo-override-textarea" />',
      },
    },
  },
};

export const DarkNeutral: Story = { ...States, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...States, globals: { skin: 'pixel' } };

export const PixelDark: Story = { ...States, globals: { theme: 'dark', skin: 'pixel' } };
