import { AlertCircle, Calendar, Check, CheckCircle2, ChevronDown, Minus, Search, X, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Icon } from './Icon';
import { cx, stateClass, type ForcedState } from './util';
import type { ControlSize } from './controls';

export interface FieldProps {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

/** Label + control + help/validation message. Validation always pairs color with an icon and text. */
export function Field({ label, help, error, success, required, htmlFor, className, children }: FieldProps) {
  return (
    <div className={cx('m-field', className)}>
      {label && (
        <label className="m-field__label" htmlFor={htmlFor}>
          {label}
          {required && (
            <span className="m-field__req" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <div className="m-field__help m-field__help--error" role="alert">
          <Icon icon={AlertCircle} size="sm" />
          {error}
        </div>
      ) : success ? (
        <div className="m-field__help m-field__help--success">
          <Icon icon={CheckCircle2} size="sm" />
          {success}
        </div>
      ) : help ? (
        <div className="m-field__help">{help}</div>
      ) : null}
    </div>
  );
}

interface InputShell {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
  size?: ControlSize;
  icon?: LucideIcon;
  suffix?: ReactNode;
  forceState?: ForcedState;
  fieldClassName?: string;
}

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'>, InputShell {
  onChange?: (value: string) => void;
}

export function TextInput({ label, help, error, success, size = 'md', icon, suffix, forceState, fieldClassName, onChange, className, disabled, required, id, ...rest }: TextInputProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const control = (
    <div
      className={cx(
        'm-input',
        size !== 'md' && `m-input--${size}`,
        (error || forceState === 'error') && 'is-error',
        (success || forceState === 'success') && 'is-success',
        (disabled || forceState === 'disabled') && 'is-disabled',
        forceState && ['hover', 'focus'].includes(forceState) && stateClass(forceState),
        className,
      )}
    >
      {icon && <Icon icon={icon} />}
      <input id={inputId} disabled={disabled || forceState === 'disabled'} required={required} aria-invalid={!!error || undefined} onChange={(e) => onChange?.(e.target.value)} {...rest} />
      {suffix}
    </div>
  );
  if (!label && !help && !error && !success) return control;
  return (
    <Field label={label} help={help} error={error} success={success} required={required} htmlFor={inputId} className={fieldClassName}>
      {control}
    </Field>
  );
}

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>, Omit<InputShell, 'icon' | 'suffix' | 'size'> {
  onChange?: (value: string) => void;
}

export function TextArea({ label, help, error, success, forceState, fieldClassName, onChange, className, disabled, required, id, ...rest }: TextAreaProps) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <Field label={label} help={help} error={error} success={success} required={required} htmlFor={inputId} className={fieldClassName}>
      <div className={cx('m-input m-input--area', error && 'is-error', disabled && 'is-disabled', forceState && stateClass(forceState), className)}>
        <textarea id={inputId} disabled={disabled} required={required} onChange={(e) => onChange?.(e.target.value)} {...rest} />
      </div>
    </Field>
  );
}

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  size?: ControlSize;
  forceState?: ForcedState;
}

export function SearchField({ value, onChange, size = 'md', placeholder = 'Search', forceState, className, ...rest }: SearchFieldProps) {
  return (
    <div className={cx('m-input m-input--search', size !== 'md' && `m-input--${size}`, forceState && stateClass(forceState), className)} role="search">
      <Icon icon={Search} />
      <input type="text" value={value} placeholder={placeholder} aria-label={rest['aria-label'] ?? placeholder} onChange={(e) => onChange(e.target.value)} {...rest} />
      {value && (
        <button type="button" className="m-input__clear" aria-label="Clear search" onClick={() => onChange('')}>
          <Icon icon={X} size="sm" />
        </button>
      )}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'>, Omit<InputShell, 'suffix'> {
  options: (SelectOption | string)[];
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function Select({ label, help, error, success, size = 'md', icon, forceState, fieldClassName, options, onChange, placeholder, className, disabled, required, id, ...rest }: SelectProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const control = (
    <div className={cx('m-input m-select', size !== 'md' && `m-input--${size}`, error && 'is-error', (disabled || forceState === 'disabled') && 'is-disabled', forceState && ['hover', 'focus'].includes(forceState) && stateClass(forceState), className)}>
      {icon && <Icon icon={icon} />}
      <select id={inputId} disabled={disabled || forceState === 'disabled'} required={required} onChange={(e) => onChange?.(e.target.value)} {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          );
        })}
      </select>
      <Icon icon={ChevronDown} size="sm" />
    </div>
  );
  if (!label && !help && !error && !success) return control;
  return (
    <Field label={label} help={help} error={error} success={success} required={required} htmlFor={inputId} className={fieldClassName}>
      {control}
    </Field>
  );
}

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  error?: boolean;
  forceState?: ForcedState;
  className?: string;
  'aria-label'?: string;
}

export function Checkbox({ checked, defaultChecked, indeterminate, onChange, label, description, disabled, error, forceState, className, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  const isDisabled = disabled || forceState === 'disabled';
  return (
    <label className={cx('m-check', isDisabled && 'is-disabled', (error || forceState === 'error') && 'is-error', forceState && ['hover', 'focus'].includes(forceState) && stateClass(forceState), className)}>
      <input ref={ref} type="checkbox" checked={checked} defaultChecked={defaultChecked} disabled={isDisabled} onChange={(e) => onChange?.(e.target.checked)} aria-label={rest['aria-label']} />
      <span className="m-check__box">{indeterminate ? <Minus /> : <Check />}</span>
      {(label || description) && (
        <span className="m-check__text">
          {label}
          {description && <span className="m-check__desc">{description}</span>}
        </span>
      )}
    </label>
  );
}

export interface RadioProps {
  checked?: boolean;
  onChange?: () => void;
  name?: string;
  value?: string;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  forceState?: ForcedState;
}

export function Radio({ checked, onChange, name, value, label, description, disabled, forceState }: RadioProps) {
  const isDisabled = disabled || forceState === 'disabled';
  return (
    <label className={cx('m-check m-check--radio', isDisabled && 'is-disabled', forceState && ['hover', 'focus'].includes(forceState) && stateClass(forceState))}>
      <input type="radio" name={name} value={value} checked={checked} disabled={isDisabled} onChange={() => onChange?.()} />
      <span className="m-check__box" />
      {(label || description) && (
        <span className="m-check__text">
          {label}
          {description && <span className="m-check__desc">{description}</span>}
        </span>
      )}
    </label>
  );
}

export interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }[];
  label?: ReactNode;
  direction?: 'row' | 'column';
}

export function RadioGroup({ value, onChange, options, label, direction = 'column' }: RadioGroupProps) {
  const name = useId();
  return (
    <div className="m-field" role="radiogroup" aria-label={typeof label === 'string' ? label : undefined}>
      {label && <span className="m-field__label">{label}</span>}
      <div className={direction === 'row' ? 'row row--wrap row--loose' : 'stack'}>
        {options.map((o) => (
          <Radio key={o.value} name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} label={o.label} description={o.description} disabled={o.disabled} />
        ))}
      </div>
    </div>
  );
}

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  forceState?: ForcedState;
  'aria-label'?: string;
}

export function Switch({ checked, defaultChecked, onChange, label, disabled, forceState, ...rest }: SwitchProps) {
  const isDisabled = disabled || forceState === 'disabled';
  return (
    <label className={cx('m-switch', isDisabled && 'is-disabled', forceState === 'focus' && 'is-focus')}>
      <input type="checkbox" role="switch" checked={checked} defaultChecked={defaultChecked} disabled={isDisabled} onChange={(e) => onChange?.(e.target.checked)} aria-label={rest['aria-label']} />
      <span className="m-switch__track">
        <span className="m-switch__thumb" />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Formatted value shown at the right. Pass `false` to hide. */
  format?: ((v: number) => string) | false;
  'aria-label'?: string;
  className?: string;
}

export function Slider({ value, onChange, min = 0, max = 100, step = 1, disabled, format, className, ...rest }: SliderProps) {
  const fill = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <div className={cx('m-slider', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={rest['aria-label']}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ ['--fill' as string]: `${Math.max(0, Math.min(100, fill))}%` }}
      />
      {format !== false && <span className="m-slider__value t-num">{format ? format(value) : value}</span>}
    </div>
  );
}

export interface DateFieldProps extends Omit<TextInputProps, 'type' | 'icon'> {}

/** Native date input in Mercantile dress. Uses the platform's own date picker. */
export function DateField(props: DateFieldProps) {
  return <TextInput type="date" icon={Calendar} {...props} />;
}

export interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode; icon?: LucideIcon }[];
  size?: 'sm' | 'md';
  block?: boolean;
  'aria-label'?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({ value, onChange, options, size = 'md', block, className, ...rest }: SegmentedProps<T>) {
  return (
    <div className={cx('m-seg', size === 'sm' && 'm-seg--sm', block && 'm-seg--block', className)} role="radiogroup" aria-label={rest['aria-label']}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={cx('m-seg__item', value === o.value && 'is-selected')} onClick={() => onChange(o.value)}>
          {o.icon && <Icon icon={o.icon} size="sm" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
