import { forwardRef, type InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

// Input — garis isian di atas kertas. Tanpa kotak, tanpa warna fokus: saat difokus garis
// menebal dari 1px ke 2px dan berubah penuh tinta. Teks ditulis dengan huruf serif;
// petunjuk (placeholder) miring.
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', hasError = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={[
        'w-full min-h-[48px] rounded-none bg-transparent px-0 py-2',
        'font-display text-base text-text-primary',
        'border-0 border-b border-border-default/40',
        'placeholder:italic placeholder:text-text-tertiary',
        'transition-[border-color,box-shadow] duration-moderate ease-rise',
        'focus:border-border-default focus:shadow-[0_1px_0_0_rgb(var(--color-ink))]',
        'focus:outline-none focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError && 'border-signal-danger focus:border-signal-danger focus:shadow-[0_1px_0_0_rgb(var(--color-signal-danger))]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
})

export default Input
