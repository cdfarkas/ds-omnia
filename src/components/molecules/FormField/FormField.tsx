import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { t, type TranslationKey } from '../../../lib/i18n';
import styles from './FormField.module.css';

const validityKeys = [
  'valueMissing',
  'typeMismatch',
  'patternMismatch',
  'tooLong',
  'tooShort',
  'rangeUnderflow',
  'rangeOverflow',
  'stepMismatch',
  'badInput',
  'customError',
] as const satisfies readonly (keyof ValidityState)[];

/** A failing `ValidityState` key, in the order FormField picks the first one. */
export type FormFieldValidityKey = (typeof validityKeys)[number];

/** When the control's native validation message first shows. */
export type FormFieldValidateOn = 'submit' | 'blur' | 'change' | 'touched';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Shows `FormField.Error` and marks the control `aria-invalid`; `true` wins over native validity. */
  invalid?: boolean;
  /** Adds the `*` indicator to the label and native `required` to the control. */
  required?: boolean;
  /**
   * Shows the control's native constraint validation: on a submit attempt, plus on blur, on every
   * change, or on first blur then every change. Omitted, the field only displays `invalid`.
   */
  validateOn?: FormFieldValidateOn;
  /** Replaces the Omnia message for a failing native validity key. */
  validationMessages?: Partial<Record<FormFieldValidityKey, ReactNode>>;
  ref?: Ref<HTMLDivElement>;
}

export interface FormFieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  ref?: Ref<HTMLLabelElement>;
}

export interface FormFieldDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface FormFieldErrorProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/** Native attributes that wire a control to its field; spread them on the control. */
export interface FormFieldControlAttributes {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
  required: true | undefined;
}

export interface FormFieldState {
  invalid: boolean;
  required: boolean;
}

export interface UseFormFieldResult extends FormFieldState {
  controlProps: FormFieldControlAttributes;
}

export interface FormFieldControlProps {
  /** Renders the control: spread `props` on it and pass `state.invalid` to an Omnia atom. */
  render: (props: FormFieldControlAttributes, state: FormFieldState) => ReactNode;
}

type RegisteredPart = 'description' | 'error';

type ValidatedControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface Failing {
  control: ValidatedControl;
  key: FormFieldValidityKey;
}

interface FormFieldContextValue extends UseFormFieldResult {
  ids: Record<'control' | RegisteredPart, string>;
  register: (part: RegisteredPart) => () => void;
  failing: Failing | undefined;
  validationMessages: FormFieldProps['validationMessages'];
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFieldContext(): FormFieldContextValue {
  const context = useContext(FormFieldContext);
  if (!context)
    throw new Error(
      'FormField parts and useFormField() must be used inside a <FormField>.',
    );
  return context;
}

/**
 * Wiring of the enclosing `FormField` for a custom control: spread `controlProps` on it. Throws
 * outside a `FormField`.
 */
export function useFormField(): UseFormFieldResult {
  const { controlProps, invalid, required } = useFieldContext();
  return { controlProps, invalid, required };
}

const join = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

const hasContent = (node: ReactNode) => node != null && node !== false && node !== '';

const isInvalid = (element: Element) =>
  'willValidate' in element &&
  (element as ValidatedControl).willValidate &&
  !(element as ValidatedControl).validity.valid;

function nativeMessage({ control, key }: Failing): string {
  if (key === 'customError') return control.validationMessage;
  const type = control.getAttribute('type');
  const variant =
    key === 'valueMissing'
      ? control.getAttribute('role') === 'switch'
        ? '.switch'
        : type === 'checkbox'
          ? '.checkbox'
          : ''
      : key === 'typeMismatch' && (type === 'email' || type === 'url')
        ? `.${type}`
        : '';
  return t(`formField.${key}${variant}` as TranslationKey).replace(
    /\{(\w+)\}/g,
    (_, name: string) => control.getAttribute(name) ?? '',
  );
}

interface NativeState {
  validateOn: FormFieldValidateOn | undefined;
  touched: boolean;
  failing?: Failing;
}

/**
 * Field wrapper that links a label, a description and an error to one control. The control is
 * rendered through `FormField.Control render` or wired with `useFormField()`: atoms never read the
 * field. Display only by default; with `validateOn` it also shows the control's native constraint
 * validation with an Omnia message, unless the form has `noValidate`.
 */
function FormFieldRoot({
  invalid = false,
  required = false,
  validateOn,
  validationMessages,
  className,
  onBlur,
  onChange,
  onInvalid,
  ref,
  ...rest
}: FormFieldProps) {
  const base = useId();
  const controlId = `${base}control`;
  const [native, setNative] = useState<NativeState>({ validateOn, touched: false });
  if (native.validateOn !== validateOn) setNative({ validateOn, touched: false });
  const { failing } = native;
  const fieldInvalid = invalid || failing !== undefined;

  useEffect(() => {
    const form = (document.getElementById(controlId) as ValidatedControl | null)?.form;
    if (!validateOn || !form) return;
    const clear = () => setNative({ validateOn, touched: false });
    form.addEventListener('reset', clear);
    return () => form.removeEventListener('reset', clear);
  }, [validateOn, controlId]);

  const validated = (event: SyntheticEvent) => {
    const target = event.target as ValidatedControl;
    return validateOn &&
      target.id === controlId &&
      'validity' in target &&
      !target.form?.noValidate
      ? target
      : undefined;
  };
  const check = (control: ValidatedControl, touch = false) => {
    const key = validityKeys.find((name) => control.validity[name]);
    setNative((current) => ({
      ...current,
      touched: current.touched || touch,
      failing: key && { control, key },
    }));
  };

  const handleInvalid = (event: FormEvent<HTMLDivElement>) => {
    onInvalid?.(event);
    const control = validated(event);
    if (!control) return;
    event.preventDefault();
    check(control);
    if (control.form && [...control.form.elements].find(isInvalid) === control)
      control.focus();
  };
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    const control = validated(event);
    if (control && (validateOn === 'blur' || validateOn === 'touched'))
      check(control, true);
  };
  const handleChange = (event: ChangeEvent<HTMLDivElement>) => {
    onChange?.(event);
    const control = validated(event);
    if (
      control &&
      (validateOn === 'change' || (validateOn === 'touched' && native.touched) || failing)
    )
      check(control);
  };
  const [rendered, setRendered] = useState<Record<RegisteredPart, boolean>>({
    description: false,
    error: false,
  });
  const register = useCallback((part: RegisteredPart) => {
    setRendered((current) => ({ ...current, [part]: true }));
    return () => setRendered((current) => ({ ...current, [part]: false }));
  }, []);

  const value = useMemo<FormFieldContextValue>(() => {
    const ids = {
      control: controlId,
      description: `${base}description`,
      error: `${base}error`,
    };
    const describedBy = [
      rendered.description && ids.description,
      rendered.error && ids.error,
    ].filter(Boolean);
    return {
      ids,
      register,
      invalid: fieldInvalid,
      required,
      failing,
      validationMessages,
      controlProps: {
        id: ids.control,
        'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
        'aria-invalid': fieldInvalid || undefined,
        required: required || undefined,
      },
    };
  }, [
    base,
    controlId,
    rendered,
    register,
    fieldInvalid,
    required,
    failing,
    validationMessages,
  ]);

  return (
    <FormFieldContext value={value}>
      <div
        ref={ref}
        className={join(styles.root, className)}
        data-scope="form-field"
        data-part="root"
        onBlur={handleBlur}
        onChange={handleChange}
        onInvalid={handleInvalid}
        {...rest}
      />
    </FormFieldContext>
  );
}

function FormFieldLabel({ className, children, ref, ...rest }: FormFieldLabelProps) {
  const { ids, required } = useFieldContext();
  const target = rest.htmlFor ?? ids.control;

  useEffect(() => {
    if (import.meta.env.DEV && !document.getElementById(target))
      console.error(
        `FormField.Label points at "${target}" but no control carries that id: render the control with FormField.Control or spread useFormField().controlProps on it.`,
      );
  }, [target]);

  return (
    <label
      ref={ref}
      htmlFor={ids.control}
      className={join(styles.label, className)}
      data-scope="form-field"
      data-part="label"
      {...rest}
    >
      {children}
      {required && (
        <span
          aria-hidden="true"
          className={styles.indicator}
          data-scope="form-field"
          data-part="required-indicator"
        >
          *
        </span>
      )}
    </label>
  );
}

function FormFieldControl({ render }: FormFieldControlProps) {
  const { controlProps, ...state } = useFormField();
  return render(controlProps, state);
}

function FormFieldDescription({ className, ref, ...rest }: FormFieldDescriptionProps) {
  const { ids, register } = useFieldContext();
  useLayoutEffect(() => register('description'), [register]);

  return (
    <div
      ref={ref}
      id={ids.description}
      className={join(styles.description, className)}
      data-scope="form-field"
      data-part="description"
      {...rest}
    />
  );
}

function FormFieldError({ className, children, ref, ...rest }: FormFieldErrorProps) {
  const { ids, invalid, register, failing, validationMessages } = useFieldContext();
  const content = hasContent(children)
    ? children
    : failing && (validationMessages?.[failing.key] ?? nativeMessage(failing));
  const shown = invalid && hasContent(content);
  useLayoutEffect(() => (shown ? register('error') : undefined), [shown, register]);

  if (!shown) return null;
  return (
    <div
      ref={ref}
      id={ids.error}
      className={join(styles.error, className)}
      data-scope="form-field"
      data-part="error"
      {...rest}
    >
      {content}
    </div>
  );
}

export const FormField = Object.assign(FormFieldRoot, {
  Label: FormFieldLabel,
  Control: FormFieldControl,
  Description: FormFieldDescription,
  Error: FormFieldError,
});
