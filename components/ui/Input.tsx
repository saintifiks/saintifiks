import { forwardRef, type InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', hasError = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={[
        'w-full min-h-[44px] bg-transparent font-interface text-text-primary',
        'border-b-2 border-border-default/30 px-0 py-2',
        'placeholder:text-text-tertiary',
        'transition-[border-color] duration-fast',
        'focus:outline-none focus:border-interactive-primary',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary',
        'disabled:cursor-not-allowed disabled:opacity-60',
        hasError && 'border-signal-danger focus:border-signal-danger',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
})

export default Input
