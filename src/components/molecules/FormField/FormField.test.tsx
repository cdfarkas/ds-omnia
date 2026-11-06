import { createRef, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, test, vi } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Input } from '../../atoms/Input';
import { FormField, useFormField } from './FormField';
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
