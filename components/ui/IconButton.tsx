import { forwardRef, type ButtonHTMLAttributes } from 'react'
import Icon, { type IconName, type IconSize } from './Icon'

// Tombol ikon — kotak tajam 44px. Diam: hanya ikon. Hover/fokus: tinta naik dari bawah memenuhi kotak
// dan ikon berbalik warna (gerak yang sama dengan tombol teks). Toggle aktif: ikon terisi.

type IconButtonVariant = 'plain' | 'solid'

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
  plain: 'text-text-primary before:bg-ink hover:text-paper focus-visible:text-paper',
  solid: 'bg-ink text-paper before:bg-night hover:text-paper focus-visible:text-paper',
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
        'relative isolate inline-flex min-h-[44px] min-w-[44px] items-center justify-center overflow-hidden rounded-none',
        "before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:transition-transform before:duration-moderate before:ease-rise before:content-['']",
        'hover:before:scale-y-100 focus-visible:before:scale-y-100',
        'transition-colors duration-moderate ease-rise',
        'active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:before:scale-y-0',
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
