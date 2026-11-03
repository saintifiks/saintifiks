import { forwardRef, type SelectHTMLAttributes } from 'react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean
}

// Select — pilihan bawaan peramban dengan garis isian yang sama dengan Input (satu garis bawah, tanpa kotak).
// Panah bawaan diganti sudut garis tipis (.select-arrow di globals.css) agar tidak tampil sebagai kontrol sistem.
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = '', hasError = false, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={[
        'w-full min-h-[48px] appearance-none rounded-none bg-transparent px-0 py-2 pr-6',
        'font-display text-base text-text-primary',
        'border-0 border-b border-border-default/40',
        'select-arrow',
        'transition-[border-color,box-shadow] duration-moderate ease-rise',
        'focus:border-border-default focus:shadow-[0_1px_0_0_rgb(var(--color-ink))]',
        'focus:outline-none focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError && 'border-signal-danger focus:border-signal-danger',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </select>
  )
})

export default Select
