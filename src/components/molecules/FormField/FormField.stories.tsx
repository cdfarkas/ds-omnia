import { useActionState, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '../../atoms/Button';
import { Checkbox } from '../../atoms/Checkbox';
import { Input } from '../../atoms/Input';
import { Switch } from '../../atoms/Switch';
import { FormField, useFormField, type FormFieldProps } from './FormField';
import './FormField.overrides.css';

const frame = { maxInlineSize: '24rem' } as const;

const emailCode = `<FormField invalid={invalid} required={required}>
  <FormField.Label>Email</FormField.Label>
  <FormField.Control
    render={(props, { invalid }) => <Input {...props} type="email" invalid={invalid} />}
  />
  <FormField.Description>We send the receipt to this address.</FormField.Description>
  <FormField.Error>Enter an email address like name@example.com.</FormField.Error>
</FormField>`;

const EmailField = (args: FormFieldProps) => (
  <div style={frame}>
    <FormField {...args}>
      <FormField.Label>Email</FormField.Label>
      <FormField.Control
        render={(props, { invalid }) => (
          <Input
            {...props}
            type="email"
            placeholder="name@example.com"
            invalid={invalid}
          />
        )}
      />
      <FormField.Description>We send the receipt to this address.</FormField.Description>
      <FormField.Error>Enter an email address like name@example.com.</FormField.Error>
    </FormField>
  </div>
);

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  args: { invalid: false, required: false },
  argTypes: {
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    validateOn: {
      control: 'select',
      options: ['off', 'submit', 'blur', 'change', 'touched'],
      mapping: { off: undefined },
    },
    validationMessages: { control: false },
    ref: { control: false },
  },
  parameters: { layout: 'padded', docs: { source: { code: emailCode } } },
  render: (args) => <EmailField {...args} />,
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Label, control, description and error wired to one `Input`; toggle `invalid` and `required`. */
export const Playground: Story = {
  tags: ['interaction'],
  play: async ({ args, canvas, canvasElement, step }) => {
    const input = canvas.getByLabelText('Email');
    await step(
      'the description, and the error when invalid, describe the input',
      async () => {
        const ids = [
          canvasElement.querySelector('[data-part="description"]')?.id,
          canvasElement.querySelector('[data-part="error"]')?.id,
        ].filter(Boolean);
        await expect(ids).toHaveLength(args.invalid ? 2 : 1);
        await expect(input).toHaveAttribute('aria-describedby', ids.join(' '));
      },
    );
    await step('the input takes a value and loses focus', async () => {
      await userEvent.type(input, 'ada@example.com');
      await expect(input).toHaveValue('ada@example.com');
      input.blur();
      await expect(input).not.toHaveFocus();
    });
  },
};

/** The error shows, the input is marked `aria-invalid` and draws its danger border. */
export const Invalid: Story = {
  args: { invalid: true },
};

/** The label gains a `*` hidden from assistive technology; the input gets native `required`. */
export const Required: Story = {
  args: { required: true },
};

/** Checkbox renders its own label: no `FormField.Label`, the text goes in its children. */
export const WithCheckbox: Story = {
  args: { invalid: true, required: true },
  parameters: {
    docs: {
      source: {
        code: `<FormField invalid required>
  <FormField.Control
    render={(props, { invalid }) => (
      <Checkbox {...props} invalid={invalid}>I accept the terms</Checkbox>
    )}
  />
  <FormField.Error>Accept the terms to continue.</FormField.Error>
</FormField>`,
      },
    },
  },
  render: (args) => (
    <div style={frame}>
      <FormField {...args}>
        <FormField.Control
          render={(props, { invalid }) => (
            <Checkbox {...props} invalid={invalid}>
              I accept the terms
            </Checkbox>
          )}
        />
        <FormField.Error>Accept the terms to continue.</FormField.Error>
      </FormField>
    </div>
  ),
};

/** Switch also renders its own label; the description still reaches it. */
export const WithSwitch: Story = {
  parameters: {
    docs: {
      source: {
        code: `<FormField>
  <FormField.Control
    render={(props, { invalid }) => (
      <Switch {...props} invalid={invalid}>Email notifications</Switch>
    )}
  />
  <FormField.Description>A weekly digest, never more.</FormField.Description>
</FormField>`,
      },
    },
  },
  render: (args) => (
    <div style={frame}>
      <FormField {...args}>
        <FormField.Control
          render={(props, { invalid }) => (
            <Switch {...props} invalid={invalid}>
              Email notifications
            </Switch>
          )}
        />
        <FormField.Description>A weekly digest, never more.</FormField.Description>
      </FormField>
    </div>
  ),
};

const selectStyle = {
  font: 'inherit',
  padding: 'var(--omnia-palette-space-2)',
  border: 'var(--omnia-border-width-thick) solid var(--omnia-color-border-strong)',
  borderRadius: 'var(--omnia-radius-md)',
  background: 'var(--omnia-color-bg-surface)',
  color: 'var(--omnia-color-text-primary)',
} as const;

function CountrySelect() {
  const { controlProps } = useFormField();
  return (
    <select {...controlProps} defaultValue="" style={selectStyle}>
      <option value="">Choose a country</option>
      <option value="fr">France</option>
      <option value="be">Belgium</option>
      <option value="ch">Switzerland</option>
    </select>
  );
}

/** Any control can take the wiring: a native `<select>` spreads `useFormField().controlProps`. */
export const CustomControl: Story = {
  args: { required: true },
  parameters: {
    docs: {
      source: {
        code: `function CountrySelect() {
  const { controlProps } = useFormField();
  return <select {...controlProps}>…</select>;
}

<FormField required>
  <FormField.Label>Country</FormField.Label>
  <CountrySelect />
  <FormField.Description>Used for tax and shipping.</FormField.Description>
</FormField>`,
      },
    },
  },
  render: (args) => (
    <div style={frame}>
      <FormField {...args}>
        <FormField.Label>Country</FormField.Label>
        <CountrySelect />
        <FormField.Description>Used for tax and shipping.</FormField.Description>
      </FormField>
    </div>
  ),
};

type SignUpState = { email: string; error?: string; registered?: boolean };

async function signUp(_: SignUpState, formData: FormData): Promise<SignUpState> {
  const email = String(formData.get('email') ?? '');
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (email === 'taken@example.com')
    return { email, error: 'This address is already registered.' };
  return { email, registered: true };
}

function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, { email: '' });
  return (
    <form action={action} noValidate style={{ ...frame, display: 'grid', gap: '1rem' }}>
      <FormField invalid={Boolean(state.error)} required>
        <FormField.Label>Email</FormField.Label>
        <FormField.Control
          render={(props, { invalid }) => (
            <Input
              {...props}
              name="email"
              type="email"
              defaultValue={state.email}
              invalid={invalid}
            />
          )}
        />
        <FormField.Description>Try taken@example.com.</FormField.Description>
        <FormField.Error>{state.error}</FormField.Error>
      </FormField>
      <div>
        <Button type="submit" pending={pending}>
          Sign up
        </Button>
      </div>
      <p role="status">{state.registered ? `${state.email} is registered.` : null}</p>
    </form>
  );
}

/**
 * Server-side error: a React `<form action>` with `useActionState` returns the error, and the field
 * shows it through `invalid` and `FormField.Error`. The input is uncontrolled, read by its `name`.
 */
export const ServerError: Story = {
  tags: ['interaction'],
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `const [state, action, pending] = useActionState(signUp, { email: '' });

<form action={action} noValidate>
  <FormField invalid={Boolean(state.error)} required>
    <FormField.Label>Email</FormField.Label>
    <FormField.Control
      render={(props, { invalid }) => (
        <Input {...props} name="email" defaultValue={state.email} invalid={invalid} />
      )}
    />
    <FormField.Error>{state.error}</FormField.Error>
  </FormField>
  <Button type="submit" pending={pending}>Sign up</Button>
</form>`,
      },
    },
  },
  render: () => <SignUpForm />,
  play: async ({ canvas, step }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await step('submit an address the server rejects', async () => {
      await userEvent.type(input, 'taken@example.com');
      await userEvent.click(canvas.getByRole('button', { name: 'Sign up' }));
    });
    await step('the returned error is shown and wired to the input', async () => {
      const error = await canvas.findByText('This address is already registered.');
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveValue('taken@example.com');
      await expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(
        error.id,
      );
      await waitFor(() =>
        expect(canvas.getByRole('button', { name: 'Sign up' })).not.toBeDisabled(),
      );
      (document.activeElement as HTMLElement | null)?.blur();
    });
  },
};

const emptyEmail = 'Enter your email address.';

function NewsletterField() {
  const [value, setValue] = useState('');
  const [filled, setFilled] = useState(false);
  const [error, setError] = useState<string>();
  return (
    <div style={frame}>
      <FormField invalid={Boolean(error)} required>
        <FormField.Label>Email</FormField.Label>
        <FormField.Control
          render={(props, { invalid }) => (
            <Input
              {...props}
              type="email"
              value={value}
              invalid={invalid}
              onChange={(event) => {
                setValue(event.target.value);
                if (event.target.value) {
                  setFilled(true);
                  setError(undefined);
                }
              }}
              onBlur={() => {
                if (filled && !value) setError(emptyEmail);
              }}
            />
          )}
        />
        <FormField.Error>{error}</FormField.Error>
      </FormField>
    </div>
  );
}

/**
 * Validation on blur with plain React state: an address typed then erased shows the error when the
 * field loses focus, and typing again clears it.
 */
export const ValidateOnBlur: Story = {
  tags: ['interaction'],
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `const [error, setError] = useState<string>();

<FormField invalid={Boolean(error)} required>
  <FormField.Label>Email</FormField.Label>
  <FormField.Control
    render={(props, { invalid }) => (
      <Input
        {...props}
        value={value}
        invalid={invalid}
        onChange={(event) => {
          setValue(event.target.value);
          if (event.target.value) { setFilled(true); setError(undefined); }
        }}
        onBlur={() => { if (filled && !value) setError('Enter your email address.'); }}
      />
    )}
  />
  <FormField.Error>{error}</FormField.Error>
</FormField>`,
      },
    },
  },
  render: () => <NewsletterField />,
  play: async ({ canvas, step }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await step('an address typed then erased shows the error on blur', async () => {
      await userEvent.type(input, 'ada@example.com');
      await userEvent.clear(input);
      input.blur();
      await expect(await canvas.findByText(emptyEmail)).toBeInTheDocument();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    await step('typing again clears the error', async () => {
      await userEvent.type(input, 'a');
      await expect(canvas.queryByText(emptyEmail)).not.toBeInTheDocument();
      await expect(input).not.toHaveAttribute('aria-invalid');
      input.blur();
    });
  },
};

function AccountForm({ validateOn }: FormFieldProps) {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      style={{ ...frame, display: 'grid', gap: '1rem' }}
    >
      <FormField
        validateOn={validateOn}
        required
        validationMessages={{
          patternMismatch: 'Enter an email address like name@example.com.',
        }}
      >
        <FormField.Label>Email</FormField.Label>
        <FormField.Control
          render={(props, { invalid }) => (
            <Input
              {...props}
              name="email"
              type="email"
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              invalid={invalid}
            />
          )}
        />
        <FormField.Error />
      </FormField>
      <FormField validateOn={validateOn}>
        <FormField.Label>Password</FormField.Label>
        <FormField.Control
          render={(props, { invalid }) => (
            <Input
              {...props}
              name="password"
              type="password"
              minLength={8}
              invalid={invalid}
            />
          )}
        />
        <FormField.Description>At least 8 characters.</FormField.Description>
        <FormField.Error />
      </FormField>
      <FormField validateOn={validateOn} required>
        <FormField.Control
          render={(props, { invalid }) => (
            <Checkbox {...props} name="terms" invalid={invalid}>
              I accept the terms
            </Checkbox>
          )}
        />
        <FormField.Error />
      </FormField>
      <div>
        <Button type="submit">Create account</Button>
      </div>
    </form>
  );
}

/**
 * Browser validation with Omnia messages: `validateOn` reads each control's native constraints
 * (`required`, `type="email"`, `minLength`) and an empty `FormField.Error` shows the message.
 */
export const NativeValidation: Story = {
  tags: ['interaction'],
  args: { validateOn: 'submit' },
  argTypes: { invalid: { control: false }, required: { control: false } },
  parameters: {
    docs: {
      source: {
        code: `<form onSubmit={save}>
  <FormField
    validateOn="submit"
    required
    validationMessages={{ patternMismatch: 'Enter an email address like name@example.com.' }}
  >
    <FormField.Label>Email</FormField.Label>
    <FormField.Control
      render={(props, { invalid }) => (
        <Input
          {...props}
          name="email"
          type="email"
          pattern="[^@\\s]+@[^@\\s]+\\.[^@\\s]+"
          invalid={invalid}
        />
      )}
    />
    <FormField.Error />
  </FormField>
  <FormField validateOn="submit">
    <FormField.Label>Password</FormField.Label>
    <FormField.Control
      render={(props, { invalid }) => (
        <Input {...props} name="password" type="password" minLength={8} invalid={invalid} />
      )}
    />
    <FormField.Description>At least 8 characters.</FormField.Description>
    <FormField.Error />
  </FormField>
  <FormField validateOn="submit" required>
    <FormField.Control
      render={(props, { invalid }) => (
        <Checkbox {...props} name="terms" invalid={invalid}>I accept the terms</Checkbox>
      )}
    />
    <FormField.Error />
  </FormField>
  <Button type="submit">Create account</Button>
</form>`,
      },
    },
  },
  render: (args) => <AccountForm {...args} />,
  play: async ({ canvas, step }) => {
    const email = canvas.getByRole('textbox', { name: 'Email' });
    await step('submitting empty shows a message on each failing field', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
      await expect(
        await canvas.findByText('Fill in this field to continue.'),
      ).toBeInTheDocument();
      await expect(canvas.getByText('Check this box to continue.')).toBeInTheDocument();
    });
    await step(
      'the first invalid control takes focus and is marked invalid',
      async () => {
        await expect(email).toHaveFocus();
        await expect(email).toHaveAttribute('aria-invalid', 'true');
      },
    );
    await step('fixing the email re-checks it and clears its error', async () => {
      await userEvent.type(email, 'ada');
      await expect(
        await canvas.findByText('Enter an email address like name@example.com.'),
      ).toBeInTheDocument();
      await userEvent.type(email, '@example');
      await expect(
        canvas.getByText('Enter an email address like name@example.com.'),
      ).toBeInTheDocument();
      await userEvent.type(email, '.com');
      await waitFor(() => expect(email).not.toHaveAttribute('aria-invalid'));
      await expect(
        canvas.queryByText('Enter an email address like name@example.com.'),
      ).not.toBeInTheDocument();
      email.blur();
    });
  },
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-form-field` class in
 * `@layer overrides` re-points `--omnia-form-field-label-color`/`--omnia-form-field-gap` — no
 * `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  parameters: { controls: { disable: true } },
  args: { className: 'omnia-demo-override-form-field', invalid: true, required: true },
};

export const DarkNeutral: Story = {
  args: { invalid: true, required: true },
  globals: { theme: 'dark' },
};

export const PixelLight: Story = {
  args: { invalid: true, required: true },
  globals: { skin: 'pixel' },
};

export const PixelDark: Story = {
  args: { invalid: true, required: true },
  globals: { theme: 'dark', skin: 'pixel' },
};
