import { forwardRef, type TextareaHTMLAttributes } from 'react'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean
}

// Textarea — sama dengan Input: garis isian di atas kertas, teks serif, petunjuk miring.
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', hasError = false, rows = 3, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={[
        'w-full resize-none rounded-none bg-transparent px-0 py-2',
        'font-display text-base leading-relaxed text-text-primary',
        'border-0 border-b border-border-default/40',
        'placeholder:italic placeholder:text-text-tertiary',
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
    />
  )
})

export default Textarea
