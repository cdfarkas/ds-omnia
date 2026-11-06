import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import styles from './FormField.module.css';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Shows `FormField.Error` and marks the control `aria-invalid`. */
  invalid?: boolean;
  /** Adds the `*` indicator to the label and native `required` to the control. */
  required?: boolean;
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

interface FormFieldContextValue extends UseFormFieldResult {
  ids: Record<'control' | RegisteredPart, string>;
  register: (part: RegisteredPart) => () => void;
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

/**
 * Field wrapper that links a label, a description and an error to one control. The control is
 * rendered through `FormField.Control render` or wired with `useFormField()`: atoms never read the
 * field. Display only: it shows the `invalid` state it is given and validates nothing.
 */
function FormFieldRoot({
  invalid = false,
  required = false,
  className,
  ref,
  ...rest
}: FormFieldProps) {
  const base = useId();
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
      control: `${base}control`,
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
      invalid,
      required,
      controlProps: {
        id: ids.control,
        'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
        'aria-invalid': invalid || undefined,
        required: required || undefined,
      },
    };
  }, [base, rendered, register, invalid, required]);

  return (
    <FormFieldContext value={value}>
      <div
        ref={ref}
        className={join(styles.root, className)}
        data-scope="form-field"
        data-part="root"
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
  const { ids, invalid, register } = useFieldContext();
  const shown = invalid && children != null && children !== false && children !== '';
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
      {children}
    </div>
  );
}

export const FormField = Object.assign(FormFieldRoot, {
  Label: FormFieldLabel,
  Control: FormFieldControl,
  Description: FormFieldDescription,
  Error: FormFieldError,
});
