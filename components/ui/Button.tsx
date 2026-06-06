import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-interactive-primary text-text-on-inverse hover:bg-interactive-primary-hover active:bg-interactive-primary-active disabled:bg-interactive-primary-disabled disabled:text-text-tertiary',
  secondary:
    'bg-transparent text-interactive-primary border border-interactive-primary hover:bg-signal-info-surface active:bg-surface-sunken',
  ghost:
    'bg-transparent text-text-primary border border-border-default/30 hover:bg-surface-sunken/50 hover:border-border-strong',
  danger:
    'bg-signal-danger text-text-on-inverse hover:bg-signal-danger/90 active:bg-signal-danger/80',
  link:
    'bg-transparent text-text-link underline-offset-2 hover:underline p-0 min-h-0',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3.5 py-2 text-[13px]',
  md: 'min-h-[44px] px-5 py-3 text-sm',
  lg: 'min-h-[52px] px-7 py-3.5 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', children, type = 'button', ...props },
  ref
) {
  const isLink = variant === 'link'

  return (
    <button
      ref={ref}
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded font-interface font-semibold tracking-wide',
        'transition-[background-color,border-color,color,transform] duration-fast ease-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary',
        'disabled:cursor-not-allowed disabled:opacity-100',
        'active:scale-[0.98]',
        !isLink && sizeClasses[size],
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
