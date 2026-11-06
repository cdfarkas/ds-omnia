import { createRef, type ComponentProps, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test, vi } from 'vitest';
import { userEvent as realUser } from 'vitest/browser';
import { composeStories } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { setLocale } from '../../../lib/i18n';
import { Checkbox } from '../../atoms/Checkbox';
import { Input } from '../../atoms/Input';
import { Switch } from '../../atoms/Switch';
import { FormField, useFormField, type FormFieldProps } from './FormField';
import * as stories from './FormField.stories';

const { Playground, Invalid, Required, WithCheckbox, WithSwitch, CustomControl } =
  composeStories(stories);

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  setLocale('en');
});

async function mount(ui: ReactElement) {
  await act(async () => {
    root.render(ui);
  });
}

const part = (name: string, scope: ParentNode = container) =>
  scope.querySelector(
    `[data-scope="form-field"][data-part="${name}"]`,
  ) as HTMLElement | null;

const control = (selector = 'input') => container.querySelector(selector) as HTMLElement;

describe('FormField edge cases', () => {
  test('aria-describedby lists only the rendered parts, description first', async () => {
    await mount(<Playground />);
    expect(control().getAttribute('aria-describedby')).toBe(part('description')!.id);

    await mount(<Invalid />);
    expect(control().getAttribute('aria-describedby')).toBe(
      `${part('description')!.id} ${part('error')!.id}`,
    );

    await mount(
      <FormField>
        <FormField.Label>Name</FormField.Label>
        <FormField.Control render={(props) => <Input {...props} />} />
      </FormField>,
    );
    expect(control().hasAttribute('aria-describedby')).toBe(false);
  });

  test('the error renders only when the field is invalid and the error has content', async () => {
    await mount(<Playground />);
    expect(part('error')).toBeNull();

    await mount(
      <FormField invalid>
        <FormField.Label>Name</FormField.Label>
        <FormField.Control render={(props) => <Input {...props} />} />
        <FormField.Error>{''}</FormField.Error>
      </FormField>,
    );
    expect(part('error')).toBeNull();
    expect(control().hasAttribute('aria-describedby')).toBe(false);
  });

  test('the error carries no live region by default and forwards one when given', async () => {
    await mount(<Invalid />);
    expect(part('error')!.hasAttribute('role')).toBe(false);
    expect(part('error')!.hasAttribute('aria-live')).toBe(false);

    await mount(
      <FormField invalid>
        <FormField.Label>Name</FormField.Label>
        <FormField.Control render={(props) => <Input {...props} />} />
        <FormField.Error role="alert">Required.</FormField.Error>
      </FormField>,
    );
    expect(part('error')!.getAttribute('role')).toBe('alert');
  });

  test('aria-invalid follows invalid', async () => {
    await mount(<Playground />);
    expect(control().hasAttribute('aria-invalid')).toBe(false);
    await mount(<Invalid />);
    expect(control().getAttribute('aria-invalid')).toBe('true');
  });

  test('required sets native required and an aria-hidden indicator', async () => {
    await mount(<Playground />);
    expect((control() as HTMLInputElement).required).toBe(false);
    expect(part('required-indicator')).toBeNull();

    await mount(<Required />);
    expect((control() as HTMLInputElement).required).toBe(true);
    const indicator = part('required-indicator')!;
    expect(indicator.textContent).toBe('*');
    expect(indicator.getAttribute('aria-hidden')).toBe('true');
    expect(part('label')!.contains(indicator)).toBe(true);
  });

  test.each([
    ['Checkbox', WithCheckbox],
    ['Switch', WithSwitch],
  ])('%s receives the id and the description wiring', async (_, Story) => {
    await mount(<Story />);
    const input = control() as HTMLInputElement;
    expect(input.id).not.toBe('');
    const describedBy = input.getAttribute('aria-describedby')!.split(' ');
    const parts = describedBy.map((id) => document.getElementById(id)?.dataset.part);
    expect(parts.every((name) => name === 'description' || name === 'error')).toBe(true);
    expect(part('label')).toBeNull();
  });

  test('a native control wired by the hook is labelled and required', async () => {
    await mount(<CustomControl />);
    const select = control('select') as HTMLSelectElement;
    expect(part('label')!.getAttribute('for')).toBe(select.id);
    expect(select.required).toBe(true);
    expect(select.getAttribute('aria-describedby')).toBe(part('description')!.id);
  });

  test('two fields get distinct ids', async () => {
    await mount(
      <>
        <Playground />
        <Invalid />
      </>,
    );
    const [first, second] = [...container.querySelectorAll('input')];
    expect(first.id).not.toBe(second.id);
    const descriptions = container.querySelectorAll('[data-part="description"]');
    expect(descriptions[0].id).not.toBe(descriptions[1].id);
  });

  test('useFormField throws outside a FormField', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Probe = () => {
      useFormField();
      return null;
    };
    await expect(mount(<Probe />)).rejects.toThrow(/inside a <FormField>/);
  });

  test('explicit consumer props after the spread win', async () => {
    await mount(
      <FormField invalid>
        <FormField.Control
          render={(props) => <Input {...props} id="mine" aria-describedby="extra" />}
        />
        <FormField.Description>Hint</FormField.Description>
      </FormField>,
    );
    expect(control().id).toBe('mine');
    expect(control().getAttribute('aria-describedby')).toBe('extra');
  });

  test('ref reaches each part', async () => {
    const refs = {
      root: createRef<HTMLDivElement>(),
      label: createRef<HTMLLabelElement>(),
      description: createRef<HTMLDivElement>(),
      error: createRef<HTMLDivElement>(),
    };
    await mount(
      <FormField ref={refs.root} invalid>
        <FormField.Label ref={refs.label}>Name</FormField.Label>
        <FormField.Control render={(props) => <Input {...props} />} />
        <FormField.Description ref={refs.description}>Hint</FormField.Description>
        <FormField.Error ref={refs.error}>Error</FormField.Error>
      </FormField>,
    );
    for (const [name, ref] of Object.entries(refs)) expect(ref.current).toBe(part(name));
  });

  test('native props pass through and className merges with the module class', async () => {
    await mount(
      <FormField id="field" className="custom" data-x="r" invalid>
        <FormField.Label className="custom" data-x="l">
          Name
        </FormField.Label>
        <FormField.Control render={(props) => <Input {...props} />} />
        <FormField.Description className="custom" data-x="d">
          Hint
        </FormField.Description>
        <FormField.Error className="custom" data-x="e">
          Error
        </FormField.Error>
      </FormField>,
    );
    expect(part('root')!.id).toBe('field');
    for (const name of ['root', 'label', 'description', 'error']) {
      const el = part(name)!;
      expect(el.dataset.x).toBe(name[0]);
      expect(el.classList.contains('custom')).toBe(true);
      expect([...el.classList].filter((c) => c !== 'custom').length).toBeGreaterThan(0);
    }
  });

  test('a label with no wired control logs one error in development', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await mount(<Playground />);
    expect(error).not.toHaveBeenCalled();

    await mount(
      <FormField>
        <FormField.Label>Orphan</FormField.Label>
        <Input aria-label="Orphan" />
      </FormField>,
    );
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0][0])).toMatch(/FormField\.Label/);
  });

  test('atoms import nothing from FormField', () => {
    const sources = import.meta.glob('../../atoms/**/*.tsx', {
      query: '?raw',
      import: 'default',
      eager: true,
    });
    expect(Object.keys(sources).length).toBeGreaterThan(0);
    for (const [path, source] of Object.entries(sources))
      expect(String(source), path).not.toMatch(/from '[^']*FormField/);
  });
});

const EmailField = ({
  input,
  children,
  ...props
}: FormFieldProps & { input?: ComponentProps<typeof Input> }) => (
  <FormField required {...props}>
    <FormField.Label>Email</FormField.Label>
    <FormField.Control
      render={(attributes, { invalid }) => (
        <Input {...attributes} type="email" invalid={invalid} {...input} />
      )}
    />
    <FormField.Error>{children}</FormField.Error>
  </FormField>
);

const InForm = ({ children, ...props }: ComponentProps<'form'>) => (
  <form onSubmit={(event) => event.preventDefault()} {...props}>
    {children}
  </form>
);

const input = (index = 0) => container.querySelectorAll('input')[index];
const errorText = () => part('error')?.textContent ?? null;
const submit = () => act(async () => container.querySelector('form')!.requestSubmit());
const typeIn = (target: HTMLElement, text: string) =>
  act(() => userEvent.type(target, text));
const clear = (target: HTMLElement) => act(() => userEvent.clear(target));
const blur = (target: HTMLElement) => act(async () => target.blur());
const preventedInvalid = (target: HTMLElement) => {
  const seen: boolean[] = [];
  target.addEventListener('invalid', (event) => seen.push(event.defaultPrevented));
  return seen;
};

const missing = 'Fill in this field to continue.';
const badEmail = 'Enter an email address like name@example.com.';

describe('FormField native validation', () => {
  test('without validateOn the field stays display only', async () => {
    await mount(
      <InForm>
        <EmailField />
      </InForm>,
    );
    const seen = preventedInvalid(input());
    await submit();
    expect(seen).toEqual([false]);
    expect(part('error')).toBeNull();
    expect(input().hasAttribute('aria-invalid')).toBe(false);
  });

  test('no aria-invalid before validation runs', async () => {
    await mount(<EmailField validateOn="change" />);
    expect(input().validity.valid).toBe(false);
    expect(input().hasAttribute('aria-invalid')).toBe(false);
    expect(part('error')).toBeNull();
  });

  test('submit: not on blur, shown on submit, re-checked on change until valid', async () => {
    await mount(
      <InForm>
        <EmailField validateOn="submit" />
      </InForm>,
    );
    await typeIn(input(), 'ada');
    await blur(input());
    expect(part('error')).toBeNull();

    await submit();
    expect(errorText()).toBe(badEmail);
    expect(input().getAttribute('aria-invalid')).toBe('true');

    await clear(input());
    expect(errorText()).toBe(missing);
    await typeIn(input(), 'ada@example.com');
    expect(part('error')).toBeNull();
    expect(input().hasAttribute('aria-invalid')).toBe(false);

    await clear(input());
    expect(part('error')).toBeNull();
  });

  test('blur: shown on blur, not on change', async () => {
    await mount(<EmailField validateOn="blur" />);
    await typeIn(input(), 'ada');
    expect(part('error')).toBeNull();
    await blur(input());
    expect(errorText()).toBe(badEmail);
  });

  test('change: shown on every change', async () => {
    await mount(<EmailField validateOn="change" />);
    await typeIn(input(), 'a');
    expect(errorText()).toBe(badEmail);
  });

  test('touched: not on first change, then on change after the first blur', async () => {
    await mount(<EmailField validateOn="touched" />);
    await typeIn(input(), 'a');
    await clear(input());
    expect(part('error')).toBeNull();

    await blur(input());
    expect(errorText()).toBe(missing);
    await typeIn(input(), 'ada@example.com');
    expect(part('error')).toBeNull();
    await clear(input());
    expect(errorText()).toBe(missing);
  });

  test('the invalid event is cancelled and only the first invalid control takes focus', async () => {
    await mount(
      <InForm>
        <EmailField validateOn="submit" />
        <EmailField validateOn="submit" />
        <button type="submit">Send</button>
      </InForm>,
    );
    const seen = [preventedInvalid(input(0)), preventedInvalid(input(1))];
    container.querySelector('button')!.focus();
    await submit();
    expect(seen).toEqual([[true], [true]]);
    expect(document.activeElement).toBe(input(0));

    await act(async () => container.querySelector('button')!.focus());
    await act(async () => void input(1).checkValidity());
    expect(document.activeElement).toBe(container.querySelector('button'));
  });

  test('a noValidate form keeps the field inert', async () => {
    await mount(
      <InForm noValidate>
        <EmailField validateOn="change" />
      </InForm>,
    );
    const seen = preventedInvalid(input());
    await typeIn(input(), 'a');
    await blur(input());
    await act(async () => void input().checkValidity());
    expect(seen).toEqual([false]);
    expect(part('error')).toBeNull();
    expect(input().hasAttribute('aria-invalid')).toBe(false);
  });

  test('invalid true shows the consumer message over the native one', async () => {
    await mount(
      <InForm>
        <EmailField validateOn="submit" invalid>
          This address is already registered.
        </EmailField>
      </InForm>,
    );
    await submit();
    expect(errorText()).toBe('This address is already registered.');
  });

  test('invalid false still lets native validity decide', async () => {
    await mount(
      <InForm>
        <EmailField validateOn="submit" invalid={false} />
      </InForm>,
    );
    await submit();
    expect(errorText()).toBe(missing);
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  test('validationMessages replaces the message of one key', async () => {
    await mount(
      <InForm>
        <EmailField
          validateOn="change"
          validationMessages={{ valueMissing: 'Tell us.' }}
        />
      </InForm>,
    );
    await submit();
    expect(errorText()).toBe('Tell us.');
    await typeIn(input(), 'a');
    expect(errorText()).toBe(badEmail);
  });

  test('a pattern on type=email overrides the dotless-domain address the browser accepts', async () => {
    await mount(
      <InForm>
        <EmailField
          validateOn="submit"
          input={{
            pattern: '[^@\\s]+@[^@\\s]+\\.[^@\\s]+',
            defaultValue: 'sdfsdf@qsdfqsdf',
          }}
          validationMessages={{ patternMismatch: 'Use a domain like example.com.' }}
        />
      </InForm>,
    );
    await submit();
    expect(errorText()).toBe('Use a domain like example.com.');
    expect(errorText()).not.toBe(badEmail);
  });

  test('FormField.Error children win over the native message', async () => {
    await mount(
      <InForm>
        <EmailField validateOn="submit">Your email, please.</EmailField>
      </InForm>,
    );
    await submit();
    expect(errorText()).toBe('Your email, please.');
  });

  test('customError shows the setCustomValidity text', async () => {
    await mount(
      <InForm>
        <EmailField validateOn="submit" required={false} />
      </InForm>,
    );
    input().setCustomValidity('This address is blocked.');
    await submit();
    expect(errorText()).toBe('This address is blocked.');
  });

  test('the constraint value is interpolated into the message', async () => {
    await mount(
      <InForm>
        <EmailField validateOn="submit" input={{ type: 'text', minLength: 8 }} />
      </InForm>,
    );
    await realUser.type(input(), 'abc');
    await submit();
    expect(errorText()).toBe('Use at least 8 characters.');
  });

  test('checkbox and switch get their own valueMissing wording', async () => {
    await mount(
      <InForm>
        <FormField validateOn="submit" required>
          <FormField.Control
            render={(props, { invalid }) => (
              <Checkbox {...props} invalid={invalid}>
                I accept the terms
              </Checkbox>
            )}
          />
          <FormField.Error />
        </FormField>
        <FormField validateOn="submit" required>
          <FormField.Control
            render={(props, { invalid }) => (
              <Switch {...props} invalid={invalid}>
                Share my data
              </Switch>
            )}
          />
          <FormField.Error />
        </FormField>
      </InForm>,
    );
    await submit();
    const messages = [...container.querySelectorAll('[data-part="error"]')].map(
      (el) => el.textContent,
    );
    expect(messages).toEqual([
      'Check this box to continue.',
      'Turn this on to continue.',
    ]);
  });

  test('the message follows the locale at render', async () => {
    setLocale('fr');
    const ui = () => (
      <InForm>
        <EmailField validateOn="submit" />
      </InForm>
    );
    await mount(ui());
    await submit();
    expect(errorText()).toBe('Remplissez ce champ pour continuer.');
    setLocale('en');
    await mount(ui());
    expect(errorText()).toBe(missing);
  });

  test('form reset and a validateOn change clear the native state', async () => {
    const ui = (validateOn: FormFieldProps['validateOn']) => (
      <InForm>
        <EmailField validateOn={validateOn} />
      </InForm>
    );
    await mount(ui('submit'));
    await submit();
    expect(errorText()).toBe(missing);
    await act(async () => container.querySelector('form')!.reset());
    expect(part('error')).toBeNull();
    expect(input().hasAttribute('aria-invalid')).toBe(false);

    await submit();
    expect(errorText()).toBe(missing);
    await mount(ui('blur'));
    expect(part('error')).toBeNull();
  });

  test('consumer handlers on the control and on the root still run', async () => {
    const controlBlur = vi.fn();
    const rootBlur = vi.fn();
    const rootInvalid = vi.fn();
    await mount(
      <InForm>
        <EmailField
          validateOn="blur"
          onBlur={rootBlur}
          onInvalid={rootInvalid}
          input={{ onBlur: controlBlur }}
        />
      </InForm>,
    );
    await typeIn(input(), 'a');
    await blur(input());
    expect(controlBlur).toHaveBeenCalledTimes(1);
    expect(rootBlur).toHaveBeenCalledTimes(1);
    expect(errorText()).toBe(badEmail);
    await submit();
    expect(rootInvalid).toHaveBeenCalledTimes(1);
  });
});
