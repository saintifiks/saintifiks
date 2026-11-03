import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

// Bentuk tombol (sudut tajam, tanpa kotak kontur, tanpa ikon di dalam tombol):
//  • primary — balok tinta. Hover: tinta melunak menjadi abu hangat. Itu saja.
//  • text    — hanya label bergaris bawah tipis, rata kiri. Hover: garis menjadi penuh.
//  • danger  — sama dengan text, merah. Untuk tindakan yang tak bisa dibatalkan.
//  • link    — tautan sebaris dalam kalimat.
// 'secondary' dan 'ghost' dipertahankan sebagai nama lama dari 'text'.

type ButtonVariant = 'primary' | 'text' | 'danger' | 'link' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const blockSize: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-4 text-caption',
  md: 'min-h-[44px] px-6 text-caption-lg',
  lg: 'min-h-[52px] px-8 text-sm',
}

const textSize: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] text-caption',
  md: 'min-h-[44px] text-caption-lg',
  lg: 'min-h-[52px] text-sm',
}

const base =
  'inline-flex items-center justify-start whitespace-nowrap rounded-none font-interface font-semibold uppercase tracking-widest disabled:cursor-not-allowed'

const primary =
  'justify-center bg-interactive-primary text-text-on-inverse transition-colors duration-fast hover:bg-interactive-primary-hover active:bg-interactive-primary-active disabled:bg-interactive-primary-disabled disabled:text-text-tertiary'

const underline =
  'underline decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast disabled:opacity-40'

const variantClasses = {
  text: `text-text-primary decoration-text-primary/35 hover:decoration-text-primary ${underline}`,
  danger: `text-signal-danger decoration-signal-danger/40 hover:decoration-signal-danger ${underline}`,
} as const

const aliases = { secondary: 'text', ghost: 'text' } as const

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', children, type = 'button', ...props },
  ref
) {
  const resolved = (variant in aliases ? aliases[variant as keyof typeof aliases] : variant) as
    | 'primary'
    | 'text'
    | 'danger'
    | 'link'

  const classes =
    resolved === 'primary'
      ? [base, blockSize[size], primary]
      : resolved === 'link'
        ? [
            'inline font-medium text-text-primary decoration-text-primary/40 hover:decoration-text-primary',
            underline,
          ]
        : [base, textSize[size], variantClasses[resolved]]

  return (
    <button ref={ref} type={type} className={[...classes, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </button>
  )
})

export default Button
