import { forwardRef, type ButtonHTMLAttributes } from 'react'
import Icon, { type IconName, type IconSize } from './Icon'

type IconButtonVariant = 'plain' | 'outline' | 'solid'

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: IconName
  // Wajib: tombol tanpa teks harus punya nama untuk pembaca layar.
  label: string
  variant?: IconButtonVariant
  size?: IconSize
  // Status toggle (suka, simpan). Mengisi ikon dan mengatur aria-pressed.
  pressed?: boolean
  busy?: boolean
}

const variantClasses: Record<IconButtonVariant, string> = {
  plain: 'text-text-secondary hover:text-text-primary hover:bg-surface-sunken/60',
  outline: 'text-text-secondary border border-border-default/20 hover:text-text-primary hover:border-border-default/50',
  solid: 'bg-interactive-primary text-text-on-inverse hover:bg-interactive-primary-hover',
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = 'plain', size = 'md', pressed, busy = false, className = '', type = 'button', ...props },
  ref
) {
  const isToggle = pressed !== undefined
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      aria-pressed={isToggle ? pressed : undefined}
      aria-busy={busy || undefined}
      disabled={props.disabled || busy}
      className={[
        'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full',
        'transition-[background-color,color,border-color,transform] duration-fast ease-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary',
        'active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-50',
        pressed ? 'text-text-primary' : '',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <Icon name={busy ? 'loader' : icon} size={size} filled={pressed} className={busy ? 'animate-spin' : ''} />
    </button>
  )
})

export default IconButton
