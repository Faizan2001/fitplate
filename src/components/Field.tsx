import type { ReactNode } from 'react'

type FieldProps = { label: string; hint?: string; htmlFor?: string; children: ReactNode }

export function Field({ label, hint, htmlFor, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label}
        {hint && <small>{hint}</small>}
      </label>
      {children}
    </div>
  )
}

type SegmentedProps<T extends string> = {
  label: string
  value: T | ''
  options: { value: T; label: string }[]
  onChange: (value: T | undefined) => void
  hint?: string
}

export function Segmented<T extends string>({ label, value, options, onChange, hint }: SegmentedProps<T>) {
  return (
    <fieldset className="field segmented-field">
      <legend>
        {label}
        {hint && <small>{hint}</small>}
      </legend>
      <div className="segmented" role="group">
        {options.map(option => {
          const selected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              className={selected ? 'selected' : ''}
              onClick={() => onChange(selected ? undefined : option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
