import { type LabelHTMLAttributes, type ReactNode } from 'react'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode
  required?: boolean
}

export default function Label({
  children,
  required,
  className = '',
  ...props
}: LabelProps) {
  return (
    <label
      className={[
        'block font-interface text-sm font-medium text-text-secondary tracking-wide',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
      {required && (
        <span className="text-signal-danger ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}
