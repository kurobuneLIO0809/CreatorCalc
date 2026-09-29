import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';

interface FieldProps {
  label: string;
  hint?: ComponentChildren;
  children: ComponentChildren;
  id?: string;
}

export function Field({ label, hint, children, id }: FieldProps) {
  return (
    <div class="field">
      <label class="field__label" for={id}>
        {label}
      </label>
      {children}
      {hint && <p class="field__hint">{hint}</p>}
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  hint?: ComponentChildren;
  onChange: (value: number) => void;
}

export function Slider({ label, value, min, max, step = 1, suffix = '', hint, onChange }: SliderProps) {
  const id = useId();
  return (
    <div class="field">
      <div class="field__row">
        <label class="field__label" for={id}>
          {label}
        </label>
        <output class="field__value" for={id}>
          {value}
          {suffix}
        </output>
      </div>
      <input
        id={id}
        class="slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
      />
      {hint && <p class="field__hint">{hint}</p>}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; disabled?: boolean }>;
  onChange: (value: T) => void;
  hint?: ComponentChildren;
}

/** Radio group styled as a segmented control (keyboard accessible via native radios). */
export function Segmented<T extends string>({ label, value, options, onChange, hint }: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset class="field segmented">
      <legend class="field__label">{label}</legend>
      <div class="segmented__options">
        {options.map((o) => (
          <label class={`segmented__option${o.value === value ? ' is-selected' : ''}${o.disabled ? ' is-disabled' : ''}`} key={o.value}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={o.value === value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {hint && <p class="field__hint">{hint}</p>}
    </fieldset>
  );
}

interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  hint?: ComponentChildren;
}

export function Select<T extends string>({ label, value, options, onChange, hint }: SelectProps<T>) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <select id={id} class="input" value={value} onChange={(e) => onChange((e.target as HTMLSelectElement).value as T)}>
        {options.map((o) => (
          <option value={o.value} key={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

interface CheckboxProps {
  label: ComponentChildren;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: ComponentChildren;
}

export function Checkbox({ label, checked, onChange, hint }: CheckboxProps) {
  const id = useId();
  return (
    <div class="field field--check">
      <input id={id} type="checkbox" class="checkbox" checked={checked} onChange={(e) => onChange((e.target as HTMLInputElement).checked)} />
      <label for={id} class="field__label">
        {label}
      </label>
      {hint && <p class="field__hint">{hint}</p>}
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number | '';
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  suffix?: string;
  onChange: (value: number | '') => void;
  hint?: ComponentChildren;
}

export function NumberField({ label, value, min, max, step, placeholder, suffix, onChange, hint }: NumberFieldProps) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <div class="input-group">
        <input
          id={id}
          class="input"
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          value={value}
          onInput={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            const n = Number(raw);
            onChange(raw === '' || !Number.isFinite(n) ? '' : n);
          }}
        />
        {suffix && <span class="input-group__suffix">{suffix}</span>}
      </div>
    </Field>
  );
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ComponentChildren;
}

const SWATCHES = [
  { value: '#ffffff', label: 'White' },
  { value: '#000000', label: 'Black' },
];

export function ColorField({ label, value, onChange, hint }: ColorFieldProps) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <div class="color-field">
        {SWATCHES.map((s) => (
          <button
            type="button"
            key={s.value}
            class={`swatch${value === s.value ? ' is-selected' : ''}`}
            data-color={s.value === '#ffffff' ? 'white' : 'black'}
            aria-pressed={value === s.value}
            onClick={() => onChange(s.value)}
          >
            {s.label}
          </button>
        ))}
        <input id={id} type="color" class="color-input" value={value} onInput={(e) => onChange((e.target as HTMLInputElement).value)} aria-label="Custom colour" />
      </div>
    </Field>
  );
}
