import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import Icon from './Icon'

// Tiga bentuk tombol, tanpa kotak kontur:
//  • primary — balok tinta penuh, sudut tajam. Hover: garis tulis di bawah label tergambar, panah bergeser.
//  • text    — hanya label dan garis tipis di dasar. Hover: tinta naik memenuhi tombol (gerak "tinta naik").
//  • danger  — sama dengan text tetapi merah; tintanya merah. Untuk tindakan yang tak bisa dibatalkan.
//  • link    — tautan sebaris dalam kalimat; gerak sama.
// 'secondary' dan 'ghost' dipertahankan sebagai nama lama dari 'text'.

type ButtonVariant = 'primary' | 'text' | 'danger' | 'link' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  // Panah penunjuk arah di ujung label (bergeser saat hover). Untuk aksi yang "melanjutkan".
  arrow?: boolean
  children: ReactNode
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-4 text-caption',
  md: 'min-h-[44px] px-6 text-caption-lg',
  lg: 'min-h-[52px] px-8 text-sm',
}

const base =
  'group inline-flex items-center justify-center gap-3 rounded-none font-interface font-semibold uppercase tracking-widest'

const variantClasses = {
  primary:
    'bg-interactive-primary text-text-on-inverse active:translate-y-px disabled:cursor-not-allowed disabled:bg-interactive-primary-disabled disabled:text-text-tertiary disabled:active:translate-y-0',
  text: 'rise text-text-primary',
  danger: 'rise rise-danger text-signal-danger',
  link: 'rise text-text-primary normal-case tracking-normal font-medium',
} as const

const aliases = { secondary: 'text', ghost: 'text' } as const

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', arrow = false, className = '', children, type = 'button', ...props },
  ref
) {
  const resolved = (variant in aliases ? aliases[variant as keyof typeof aliases] : variant) as keyof typeof variantClasses
  const isLink = resolved === 'link'
  const isPrimary = resolved === 'primary'

  return (
    <button
      ref={ref}
      type={type}
      className={[base, !isLink && sizeClasses[size], variantClasses[resolved], className].filter(Boolean).join(' ')}
      {...props}
    >
      <span className="relative">
        {children}
        {isPrimary && (
          <span
            aria-hidden="true"
            className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-paper transition-transform duration-moderate ease-rise group-hover:scale-x-100 group-focus-visible:scale-x-100 group-disabled:hidden"
          />
        )}
      </span>
      {arrow && (
        <Icon
          name="arrow-right"
          size="sm"
          className="transition-transform duration-moderate ease-rise group-hover:translate-x-1 group-disabled:translate-x-0"
        />
      )}
    </button>
  )
})

export default Button
