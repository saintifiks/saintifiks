import { type LabelHTMLAttributes, type ReactNode } from 'react'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode
  required?: boolean
}

// Label formulir — huruf kapital kecil berjarak, seperti isian di formulir cetak.
export default function Label({ children, required, className = '', ...props }: LabelProps) {
  return (
    <label
      className={[
        'block font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-text-primary" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}
