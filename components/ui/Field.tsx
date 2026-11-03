import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react'
import Label from './Label'

export type FieldProps = {
  label: string
  // Satu kontrol (Input/textarea/select). Field menyambungkan id, hint, dan error otomatis.
  children: ReactElement<{ id?: string; 'aria-describedby'?: string; hasError?: boolean }>
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  className?: string
}

export default function Field({ label, children, hint, error, required, className = '' }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        ...(error ? { hasError: true } : {}),
      })
    : children

  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {control}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 font-interface text-caption text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 font-interface text-caption text-signal-danger">
          {error}
        </p>
      )}
    </div>
  )
}
