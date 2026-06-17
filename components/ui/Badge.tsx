import { type ReactNode } from 'react'

type BadgeVariant = 'default' | 'kicker' | 'category' | 'danger' | 'success'

export type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'text-text-secondary bg-surface-sunken/50',
  kicker:
    'text-text-link font-semibold uppercase tracking-widest text-[11px] bg-transparent',
  category: 'text-text-link font-semibold text-sm bg-transparent',
  danger: 'text-signal-danger bg-signal-danger-surface',
  success: 'text-signal-success bg-signal-success-surface',
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-interface leading-none',
        variant === 'kicker' || variant === 'category' ? 'px-0 py-0' : 'px-2 py-1 rounded-sm text-xs font-medium',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
